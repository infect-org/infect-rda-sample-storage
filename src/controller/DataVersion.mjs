'use strict';


import {Controller} from 'rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class DataVersionController extends Controller {


    constructor({db}) {
        super('data-version');

        this.db = db;

        this.enableAction('update');
        this.enableAction('create');
    }






    /**
    * register a new version
    */
    async create(request, response) {
        const data = request.body;

        if (!data) response.status(400).send(`Missing request body!`);
        else if (!type.object(data)) response.status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.dataSet)) response.status(400).send(`Missing parameter 'dataSet' in request body!`);
        else if (!type.array(data.dataSetFields)) response.status(400).send(`Missing parameter 'dataSetFields' in request body!`);
        else {

            // make sure the data set exists
            let dataSet = await this.db.dataSet('*', {
                identifier: data.dataSet
            }).findOne();

            if (!dataSet) {
                dataSet = await new this.db.dataSet({
                    identifier: data.dataSet,
                    dataSetField: data.dataSetFields.map(fieldName => new this.db.dataSetField({fieldName})),
                }).save();
            }


             // create a new data version
            return new this.db.dataVersion({
                identifier: data.identifier || null,
                description: data.description || null,
                dataVersionStatus: this.db.dataVersionStatus('*', {
                    identifier: 'building'
                }),
                dataSet: dataSet
            }).save();
        }
    }






    /**
    *set status on data version
    */
    async update(request, response) {
        const data = request.body;
        const dataVersionIdentifier = request.params.id;

        if (!data) response.status(400).send(`Missing request body!`);
        else if (!type.object(data)) response.status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.status)) response.status(400).send(`Missing parameter 'status' in request body!`);
        else {

            // load the data version to update
            let dataVersion = await this.db.dataVersion('*', {
                identifier: dataVersionIdentifier
            }).findOne();

            if (dataVersion) {

                // get status
                const dataVersionStatus = await this.db.dataVersionStatus({
                    identifier: data.status
                }).findOne();

                if (dataVersionStatus) {
                    dataVersion.dataVersionStatus = dataVersionStatus;
                    return await dataVersion.save();
                } else response.status(404).send(`The data version '${dataVersionIdentifier}' was not found!`);
            } else response.status(404).send(`The data version '${dataVersionIdentifier}' was not found!`);
        }
    }
}