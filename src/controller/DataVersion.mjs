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
    * register a new service
    */
    async create(request, response) {
        const data = request.body;

        if (!data) response.status(400).send(`Missing request body!`);
        else if (!type.object(data)) response.status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.dataSet)) response.status(400).send(`Missing parameter 'dataSet' in request body!`);
        else {
            // make sure the data set exists
            let dataSet = await this.db.dataSet('*', {
                identifier: data.dataSet
            }).findOne();

            if (!dataSet) {
                dataSet = await new this.db.dataSet({
                    identifier: data.dataSet
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
}