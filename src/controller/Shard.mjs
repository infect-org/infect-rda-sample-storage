'use strict';


import {Controller} from 'rda-service';
import type from 'ee-types';
import log from 'ee-log';
import {createHash} from 'crypto';




export default class ShardController extends Controller {


    constructor({db}) {
        super('shard');

        this.db = db;

        this.enableAction('create');
    }






    /**
    * create data shards for the data groups of a data set
    */
    async create(request, response) {
        const data = request.body;

        if (!data) response.status(400).send(`Missing request body!`);
        else if (!type.object(data)) response.status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.dataSet)) response.status(400).send(`Missing parameter 'dataSet' in request body!`);
        else if (!type.array(data.shards)) response.status(400).send(`Missing parameter 'shards' in request body!`);
        else {


            // get the shards from the db
            const shards = await Promise.all(data.shards.map(shardIdentifier => this.getShard(shardIdentifier)));


            if (!shards.length) throw new Error(`Canont create clsuter with 0 shards!`);


            // load he data groups for the given data set
            const groups = await this.db.dataGroup('id').getDataVersion().fetchDataVersionStatus({
                identifier: 'active'
            }).getDataSet({
                identifier: data.dataSet
            }).raw().find();



            // rendezvous hash the groups so that they can
            // be assigned to shards
            const mappings = [];
            
            for (const {id} of groups) {
                mappings.push({
                    id_shard: this.getShardForGroup(id, shards),
                    id_dataGroup: id,
                });
            }


            // save to db
            await Promise.all(mappings.map((mapping) => {
                return new this.db.dataGroup_shard(mapping).save();
            }));


            return {
                groupCount: groups.length
            };
        }
    }








    /**
    * apply rendezvous hashing to the group and a set of shards
    */
    getShardForGroup(groupId, shards) {
        let smallest;
        let shard;

        for (const shardId of shards) {
            const hash = createHash('sha1').update(`${groupId}/${shardId}`).digest('hex');
            
            if (!smallest || hash < smallest) {
                smallest = hash;
                shard = shardId;
            }
        }

        return shard;
    }








    /**
    * create or load the shard from the db
    */
    async getShard(shardIdentifier) {
        const shard = await this.db.shard({
            identifier: shardIdentifier
        }).raw().findOne();


        if (shard) return shard.id;
        else {
            const shard = await new this.db.shard({
                identifier: shardIdentifier
            }).save();

            return shard.id;
        }
    }
}