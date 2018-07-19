'use strict';


import {Controller} from 'rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class DataController extends Controller {


    constructor({db}) {
        super('data');

        this.db = db;

        this.enableAction('create');
        this.enableAction('list');


        // the number of records that get assigned to a group
        this.groupSize = 1000;


        this.requiredFields = new Map([
            ['bacteriumId', 'number'],
            ['antibioticId', 'number'],
            ['ageGroupId', 'number'],
            ['regionId', 'number'],
            ['sampleDate', 'string'],
            ['resistance', 'number'],
            ['sampleId', 'string'],
        ]);
    }





    /**
    * returns data fro a given filter
    */
    async list(request, response) {
        const query = request.query;


        if (query.shard) {
            // return the data for one given shard

            if (!type.string(query.offset)) response.status(400).send(`Missing offset query parameter!`);
            else if (!type.string(query.limit)) response.status(400).send(`Missing limit query parameter!`);
            else {

                // get the fields to return for the given data aversion
                const dbFields = await this.db.dataSetField('*')
                    .getDataSet()
                    .getDataVersion()
                    .getDataGroup()
                    .getShard({
                        identifier: query.shard
                    }).raw().find();

                // get an array of unique values
                const fields = [...(new Set(dbFields.map(f => f.fieldName)))];


                // get the actual data
                const data = await this.db.data(fields)
                    .order('id')
                    .offset(parseInt(query.offset, 10))
                    .limit(parseInt(query.limit, 10))
                    .getDataVersion()
                    .getDataGroup().getShard({
                        identifier: query.shard
                    }).raw().find();


                // convert date fields to timestamps they
                // occupy 8 instead of 120 bytes of memory!
                data.forEach((row) => {
                    row.sampleDate = Math.round(row.sampleDate.getTime()/1000);
                });

                return data;
            }
        } else throw new Error('not implemented (missing filter)');
    }









    /**
    * write data to the db
    */
    async create(request, response) {
        const data = request.body;
        
        if (!data) response.status(400).send(`Missing request body!`);
        else if (!type.object(data)) response.status(400).send(`Request body must be a json object!`);
        else if (!type.array(data.records)) response.status(400).send(`Missing records array on the request body!`);
        else if (!type.number(data.dataVersionId)) response.status(400).send(`Missing the property 'dataVersionId' on the request body!`);
        else {
            
            // validate input
            for (const record of data.records) {
                for (const [property, typeName] of this.requiredFields.entries()) {
                    if (!type[typeName](record[property])) {
                        response.status(400).send(`Missing or invalid property '${property}', expected '${typeName}', got '${type(record[property])}'`);
                        return;
                    }
                }
            }



            // load all records that have a sampleId we're trying 
            // to import in order to prevent duplicate key errors
            const existingRecords = await this.db.data('sampleId', {
                sampleId: this.db.getORM().in(data.records.map(r => r.sampleId)),
            }).getDataVersion().getDataSet().getDataVersion({
                id: data.dataVersionId,
            }).raw().find();

            const existingMap = new Set(existingRecords.map(record => record.sampleId));



            // get data groups for adding records to
            const groups = await this.getDataGroups({
                dataVersionId: data.dataVersionId,
                recordCount: data.records.length - existingRecords.length,
            });


            const transaction = this.db.createTransaction();
            const dataVersion = await this.db.dataVersion({
                id: data.dataVersionId
            }).findOne();


            let currentGroup = groups.shift();
            let importedRecordCount = 0;
            let duplicateRecordCount = 0;

            // store data
            for (const record of data.records) {
                if (!existingMap.has(record.sampleId)) {
                    existingMap.add(record.sampleId);

                    const row = {
                        dataVersion: dataVersion,
                        id_dataGroup: currentGroup.groupId,
                    };

                    for (const property of this.requiredFields.keys()) row[property] = record[property];
                    
                    await new transaction.data(row).save();

                    // switch group if required
                    currentGroup.recordCount--;
                    if (currentGroup.recordCount <= 0) currentGroup = groups.shift();

                    importedRecordCount++;
                } else duplicateRecordCount++;
            }

            // persist changes
            await transaction.commit();

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

            groups.push({
                groupId: dataGroup.id,
                recordCount: leftSlots,
            });

            recordCount -= leftSlots;
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