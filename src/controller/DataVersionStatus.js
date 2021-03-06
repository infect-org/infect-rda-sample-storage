import { Controller } from '@infect/rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class DataVersionStatusController extends Controller {


    constructor({db}) {
        super('dataVersionStatus');

        this.db = db;
        this.enableAction('update');
    }









    /**
    * update data version status
    */
    async update(request) {
        const data = await request.getData();
        const identifier = request.parameter('id');

        if (!data) request.response().status(400).send(`Missing request body!`);
        else if (!type.object(data)) request.response().status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.action)) request.response().status(400).send(`Missing the property 'action' on the request body!`);
        else {
            const version = await this.db.dataVersion('*', {
                identifier,
            }).findOne();

            if (!version) {
                return request.response()
                    .status(404)
                    .send(`Dataversion with the id ${identifier} was not found!`);
            }

            if (data.action === 'activate') {
                version.dataVersionStatus = this.db.dataVersionStatus({
                    identifier: 'active',
                });
            } else if (data.action === 'deactivate') {
                version.dataVersionStatus = this.db.dataVersionStatus({
                    identifier: 'preview',
                });
            } else if (data.action === 'delete') {
                version.dataVersionStatus = this.db.dataVersionStatus({
                    identifier: 'deleted',
                });
            }

            await version.save();

            return request.response()
                .status(200)
                .send({
                    activated: data.action === 'activate',
                });
        }
    }
}