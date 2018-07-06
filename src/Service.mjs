'use strict';


import RDAService from 'rda-service';
import path from 'path';
import logd from 'logd';
import Related from 'related';
import RelatedTimestamps from 'related-timestamps';

const log = logd.module('infect-rda-sample-storage');



// controllers
import DataController from './controller/Data';
import DataVersionController from './controller/DataVersion';







export default class InfectSampleStorageService extends RDAService {


    constructor() {
        super('infect-sample-storage');
    }




    /**
    * prepare the service
    */
    async load() {

        // get the configuration file
        this.loadConfig(this.dirname());


        // load database
        this.related = new Related(this.config.db);
        this.related.use(new RelatedTimestamps());

        await this.related.load();
        this.db = this.related[this.config.db.schema];


        const options = {
            db: this.db,
        };

        // register controllers
        this.registerController(new DataController(options));
        this.registerController(new DataVersionController(options));


        await super.load();
    }





    /**
    * shut down the service
    */
    async end() {
        await super.end();
        await this.related.end();
    }






    /**
    * returns the current directory for this class
    */
    dirname() {
        return path.join(path.dirname(new URL(import.meta.url).pathname), '../');
    }
}