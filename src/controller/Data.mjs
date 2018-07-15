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
    * list service that are online of a certain type
    */
    async list(request, response) {
        const serviceType = request.query.serviceType;


        if (!type.string(serviceType)) response.status(400).send(`Missing parameter 'serviceType' in the requests query!`);
        else {
            const thirtySecondsAgo = new Date();
            thirtySecondsAgo.setSeconds(thirtySecondsAgo.getSeconds()-this.serviceTTL);


            return await this.db.serviceInstance('*', {
                updated: this.db.getORM().gt(thirtySecondsAgo)
            }).getServiceType({
                identifier: serviceType
            }).find();
        }  
    }










    /**
    * register a new service
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


            // get data groups for adding records to
            const groups = await this.getDataGroups({
                dataVersionId: data.dataVersionId,
                recordCount: data.records.length,
            });


            const transaction = this.db.createTransaction();
            const dataVersion = await this.db.dataVersion({
                id: data.dataVersionId
            }).findOne();


            let currentGroup = groups.shift();

            // store data
            for (const record of data.records) {
                const row = {
                    dataVersion: dataVersion,
                    id_dataGroup: currentGroup.groupId
                };

                for (const property of this.requiredFields.keys()) row[property] = record[property];
                
                await new transaction.data(row).save();

                // switch group if required
                currentGroup.recordCount--;
                if (currentGroup.recordCount <= 0) currentGroup = groups.shift();
            }

            // persist changes
            await transaction.commit();
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