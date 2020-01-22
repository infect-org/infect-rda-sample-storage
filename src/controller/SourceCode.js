import { Controller } from '@infect/rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class SourceCodeController extends Controller {


    constructor({db}) {
        super('source-code');

        this.db = db;
        this.enableAction('list');
        this.enableAction('create');
        this.enableAction('delete');
    }





    /**
    * add source code to the db
    */
    async create(request) {
        const data = await request.getData();

        if (!data) request.response().status(400).send(`Missing request body!`);
        else if (!type.object(data)) request.response().status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.sourceText)) request.response().status(400).send(`Missing parameter 'sourceText' in request body!`);
        else if (!type.string(data.specifier)) request.response().status(400).send(`Missing parameter 'specifier' in request body!`);
        else if (!type.string(data.dataSetIdentifier)) request.response().status(400).send(`Missing parameter 'dataSetIdentifier' in request body!`);
        else {
            const dataSet = await this.db.dataSet({
                identifier: data.dataSetIdentifier
            }).findOne();

            if (!dataSet) {
                return await request.response().status(400).send(`Dataset '${data.dataSetIdentifier}' does not exist!`);
            }

            await new this.db.sourceCode({
                sourceText: data.sourceText,
                specifier: data.specifier,
                dataSet,
            }).save();
        }
    }







    async delete(request) {
        const specifier = decodeURIComponent(request.getParameter('id'));

        const item = await this.db.sourceCode('*', {
            specifier,
        }).findOne();

        if (item) {
            await item.delete();
        } else {
            return await request.response().status(404).send(`Source Code ${specifier} not found!`);
        }
    }






    /**
    * return source code for the compute service
    */
    async list(request) {
        const filter = {};

        if (request.hasQueryParameter('specifier')) {
            filter.specifier = request.getQueryParameter('specifier');
        }

        const query = this.db.sourceCode('*', filter);

        if (request.hasQueryParameter('dataSetIdentifier')) {
            query.getDataSet({
                identifier: request.getQueryParameter('dataSetIdentifier')
            });
        }

        return query.raw().find();
    }
}