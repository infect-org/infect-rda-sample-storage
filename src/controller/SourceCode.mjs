'use strict';


import {Controller} from 'rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class SourceCodeController extends Controller {


    constructor({db}) {
        super('source-code');

        this.db = db;
        this.enableAction('list');
        this.enableAction('create');
    }





    /**
    * add source code to the db
    */
    async create(request, response) {
         const data = request.body;

        if (!data) response.status(400).send(`Missing request body!`);
        else if (!type.object(data)) response.status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.sourceCode)) response.status(400).send(`Missing parameter 'sourceCode' in request body!`);
        else if (!type.string(data.identifier)) response.status(400).send(`Missing parameter 'identifier' in request body!`);
        else if (!type.string(data.type)) response.status(400).send(`Missing parameter 'type' in request body!`);
        else {

            await new this.db.sourceCode({
                sourceCode: data.sourceCode,
                identifier: data.identifier,
                sourceCodeType: this.db.sourceCodeType({
                    identifier: data.type,
                })
            }).save();
        }
    }






    /**
    * return source code for the compute service
    */
    async list(request, response) {
        const source = await this.db.sourceCode('*').getSourceCodeType('*').raw().find();

        return source.map(item => ({
            sourceCode: item.sourceCode,
            identifier: item.identifier,
            type: item.sourceCodeType.identifier,
        }));
    }
}