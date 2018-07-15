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


            const transaction = this.db.createTransaction();
            const dataVersion = await this.db.dataVersion({
                id: data.dataVersionId
            }).findOne();


            // store data
            for (const record of data.records) {
                const row = {
                    dataVersion: dataVersion
                };

                for (const property of this.requiredFields.keys()) row[property] = record[property];
                
                await new transaction.data(row).save();
            }

            // persist changes
            await transaction.commit();
        }
    }
}