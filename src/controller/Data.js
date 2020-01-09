import { Controller } from '@infect/rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class DataController extends Controller {


    constructor({db}) {
        super('data');

        this.db = db;

        this.enableAction('create');
        this.enableAction('list');


        // the number of records that gets assigned to a group. 
        this.groupSize = 1000;
    }





    /**
    * returns data fro a given filter
    */
    async list(request) {
        const query = request.query();


        if (query.shard) {
            // return the data for one given shard

            if (!type.string(query.offset)) request.response().status(400).send(`Missing offset query parameter!`);
            else if (!type.string(query.limit)) request.response().status(400).send(`Missing limit query parameter!`);
            else {


                // get the viable data versions. do this in two steps,
                // postgres has difficulties optimizing this if we're
                // getting everything in one query
                const dataGroups = await this.db.dataGroup().getShard({
                    identifier: query.shard
                }).raw().find();


                // get the actual data
                const data = await this.db.data('data', {
                    id_dataGroup: this.db.getORM().in(dataGroups.map(g => g.id))
                }).order('id').offset(parseInt(query.offset, 10)).limit(parseInt(query.limit, 10)).raw().find();

                return data;
            }
        } else throw new Error('not implemented (missing filter)');
    }









    /**
    * write data to the db
    */
    async create(request) {
        const data = await request.getData();

        if (!data) request.response().status(400).send(`Missing request body!`);
        else if (!type.object(data)) request.response().status(400).send(`Request body must be a json object!`);
        else if (!type.array(data.records)) request.response().status(400).send(`Missing records array on the request body!`);
        else if (!type.number(data.dataVersionId)) request.response().status(400).send(`Missing the property 'dataVersionId' on the request body!`);
        else {
            
            // basic schema validation for the data
            for (const record of data.records) {
                if (!type.object(record)) {
                    return request.response()
                        .status(400)
                        .send(`Got records that don't contain obecjts as data!`);
                }

                if (!type.string(record.uniqueIdentifier)) {
                    return request.response()
                        .status(400)
                        .send(`Missing the field uniqueIdentifier on a record!`);
                }
            }
            

            // load all records that have a uniqueIdentifier we're trying to import in order to
            // prevent duplicate key errors
            const existingRecords = await this.db.data('uniqueIdentifier', {
                uniqueIdentifier: this.db.getORM().in(data.records.map(r => r.uniqueIdentifier)),
            }).getDataVersion().getDataSet().getDataVersion({
                id: data.dataVersionId,
            }).raw().find();

            const existingMap = new Set(existingRecords.map(record => record.uniqueIdentifier));
            const recordCount = data.records.length - existingMap.size;

            let importedRecordCount = 0;
            let duplicateRecordCount = 0;


            if (recordCount > 0) {

                // get data groups for adding records to
                const groups = await this.getDataGroups({
                    dataVersionId: data.dataVersionId,
                    recordCount: data.records.length - existingMap.size,
                });


                const transaction = this.db.createTransaction();
                const dataVersion = await this.db.dataVersion({
                    id: data.dataVersionId
                }).findOne();


                let currentGroup = groups.shift();

                // store data
                for (const record of data.records) {
                    if (!existingMap.has(record.sampleId)) {
                        existingMap.add(record.sampleId);

                        const row = {
                            dataVersion: dataVersion,
                            id_dataGroup: currentGroup.groupId,
                            data: record,
                            uniqueIdentifier: record.uniqueIdentifier,
                        };
                        
                        await new transaction.data(row).save();

                        // switch group if required
                        currentGroup.recordCount--;
                        if (currentGroup.recordCount <= 0) currentGroup = groups.shift();

                        if (!currentGroup) throw new Error(`Failed to get group for recrods, created not enough groups!`);

                        importedRecordCount++;
                    } else duplicateRecordCount++;
                }

                // persist changes
                await transaction.commit();
            }

            return {
                importedRecordCount,
                duplicateRecordCount,
            }
        }
    }





    /**
    * since we're grouping records in groups we need
    * create data groups that can be assigned to the 
    * records. currently groups have a fixed size of 
    * not more than this.grougSize items. this method 
    * gets a group that is not full yet or creates a 
    * new one. it may also return multiple groups if 
    * one will not be enough for the records currently
    * added.
    */
    async getDataGroups({
        dataVersionId,
        recordCount,
    }) {
        const Related = this.db.getORM();
        const groups = [];

        // get the one dataset that has the least records
        // for the given data group
        const dataGroup = await this.db.dataGroup([
            Related.select('recordCount').referenceCount('data.id')
        ]).order('recordCount').getDataVersion({
            id: dataVersionId
        }).raw().findOne();



        // check if we can use the existing data group
        if (dataGroup) {
            const leftSlots = this.grougSize - dataGroup.recordCount;

            if (leftSlots > 0) {
                groups.push({
                    groupId: dataGroup.id,
                    recordCount: leftSlots,
                });

                recordCount -= leftSlots;
            }
        }


        while(recordCount > 0) {
            const group = await new this.db.dataGroup({
                id_dataVersion: dataVersionId
            }).save();

            groups.push({
                groupId: group.id,
                recordCount: this.groupSize,
            });

            recordCount -= this.groupSize;
        }

        return groups;
    }
}