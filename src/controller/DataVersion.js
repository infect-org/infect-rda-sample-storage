import { Controller } from '@infect/rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class DataVersionController extends Controller {


    constructor({db}) {
        super('data-version');

        this.db = db;

        this.enableAction('update');
        this.enableAction('create');
        this.enableAction('listOne');
    }






    /**
     * returns on edata evrsion
     *
     * @return     {Promise}  data version
     */
    async listOne(request) {
        const version = await this.db.dataVersion('*', {
            sourceHash: request.getParameter('id'),
        }).findOne();

        if (version) request.response().status(200).send();
        else request.response().status(404).send();
    }





    /**
    * register a new version
    */
    async create(request) {
        const data = await request.getData();

        if (!data) request.response().status(400).send(`Missing request body!`);
        else if (!type.object(data)) request.response().status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.dataSet)) request.response().status(400).send(`Missing parameter 'dataSet' in request body!`);
        else {

            // make sure the data set exists
            let dataSet = await this.db.dataSet('*', {
                identifier: data.dataSet
            }).findOne();

            if (!dataSet) {
                dataSet = await new this.db.dataSet({
                    identifier: data.dataSet,
                }).save();
            }


             // create a new data version
            return new this.db.dataVersion({
                identifier: data.identifier || null,
                description: data.description || null,
                dataVersionStatus: this.db.dataVersionStatus('*', {
                    identifier: 'building'
                }),
                dataSet: dataSet,
                sourceHash: data.sourceHash,
            }).save();
        }
    }






    /**
    *set status on data version
    */
    async update(request) {
        const data = await request.getData();
        const dataVersionIdentifier = request.parameter('id');

        if (!data) request.response().status(400).send(`Missing request body!`);
        else if (!type.object(data)) request.response().status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.status)) request.response().status(400).send(`Missing parameter 'status' in request body!`);
        else {
            const filter = {};

            // let the user filter by identifier and id
            if (!/^[0-9]/.test(dataVersionIdentifier)) filter.identifier = dataVersionIdentifier;
            else filter.id = dataVersionIdentifier;

            // load the data version to update
            let dataVersion = await this.db.dataVersion('*', filter).findOne();

            if (dataVersion) {

                // get status
                const dataVersionStatus = await this.db.dataVersionStatus({
                    identifier: data.status
                }).findOne();

                if (dataVersionStatus) {
                    dataVersion.dataVersionStatus = dataVersionStatus;
                    return await dataVersion.save();
                } else request.response().status(404).send(`The data version status '${dataVersionIdentifier}' was not found!`);
            } else request.response().status(404).send(`The data version '${dataVersionIdentifier}' was not found!`);
        }
    }
}