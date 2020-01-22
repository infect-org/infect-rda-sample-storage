import RDAService from '@infect/rda-service';
import path from 'path';
import logd from 'logd';
import Related from 'related';
import RelatedTimestamps from 'related-timestamps';
import ReferenceCounter from 'related-reference-counter';


const log = logd.module('infect-rda-sample-storage');



// controllers
import DataController from './controller/Data.js';
import DataVersionController from './controller/DataVersion.js';
import ShardController from './controller/Shard.js';
import SourceCodeController from './controller/SourceCode.js';
import SourceCodeLoaderController from './controller/SourceCodeLoader.js';



const appRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '../');




export default class InfectSampleStorageService extends RDAService {



    constructor() {
        super({
            name: 'infect-rda-sample-storage',
            appRoot,
        });
    }




    /**
    * prepare the service
    */
    async load() {
        await this.initialize();

        // load database
        this.related = new Related(this.config.get('database'));
        this.related.use(new RelatedTimestamps());
        this.related.use(new ReferenceCounter());

        await this.related.load();
        this.db = this.related[this.config.get('database').schema];


        const options = {
            db: this.db,
        };

        // register controllers
        this.registerController(new DataController(options));
        this.registerController(new DataVersionController(options));
        this.registerController(new ShardController(options));
        this.registerController(new SourceCodeController(options));
        this.registerController(new SourceCodeLoaderController(options));

        await super.load();


        // tell the service registry where we are
        await this.registerService();
    }





    /**
    * shut down the service
    */
    async end() {
        await super.end();
        await this.related.end();
    }
}