'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import superagent from 'superagent';
import assert from 'assert';
import log from 'ee-log';
import {ServiceManager} from 'rda-service';
import {DataSet} from 'rda-fixtures';



const host = 'http://l.dns.porn';



section('Shard', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');

    });


    section.test('Create shards', async() => {
        section.setTimeout(5000);
        
        const service = new Service();
        await service.load();




        
        // add fixtures
        section.notice('create fixtures');
        const dataSet = new DataSet();
        const dataSetId = await dataSet.create({
            length: 2500
        });



        section.notice('create shards');
        const response = await superagent.post(`${host}:${service.getPort()}/infect-rda-sample-storage.shard`).ok(res => res.status === 201).send({
            dataSet: dataSetId,
            shards: ['a', 'b', 'c', 'd']
        });

        assert(response.body);
        assert.equal(response.body.groupCount, 3);

        await section.wait(200);
        await service.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});