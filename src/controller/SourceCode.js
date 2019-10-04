import { Controller } from '@infect/rda-service';
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
    async create(request) {
         const data = await request.getData();

        if (!data) request.response().status(400).send(`Missing request body!`);
        else if (!type.object(data)) request.response().status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.sourceCode)) request.response().status(400).send(`Missing parameter 'sourceCode' in request body!`);
        else if (!type.string(data.identifier)) request.response().status(400).send(`Missing parameter 'identifier' in request body!`);
        else if (!type.string(data.type)) request.response().status(400).send(`Missing parameter 'type' in request body!`);
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
    async list() {
        const source = await this.db.sourceCode('*').getSourceCodeType('*').raw().find();

        return source.map(item => ({
            sourceCode: item.sourceCode,
            identifier: item.identifier,
            type: item.sourceCodeType.identifier,
        }));
    }
}