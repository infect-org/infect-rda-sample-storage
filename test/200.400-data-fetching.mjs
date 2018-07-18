'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import superagent from 'superagent';
import assert from 'assert';
import log from 'ee-log';
import {ServiceManager} from 'rda-service';
import {DataSet} from 'rda-fixtures';



const host = 'http://l.dns.porn';



section('Data Fetching', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');

    });


    section.test('Get Records', async() => {
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
        await superagent.post(`${host}:${service.getPort()}/infect-rda-sample-storage.shard`).ok(res => res.status === 201).send({
            dataSet: dataSetId,
            shards: ['a', 'b', 'c', 'd']
        });



        section.notice('load page');
        const response = await superagent.get(`${host}:${service.getPort()}/infect-rda-sample-storage.data`).ok(res => res.status === 200).query({
            shard: 'a',
            offset: 0,
            limit: 100,
        }).send();

        assert(response.body);
        assert.equal(response.body.length, 100);

        await section.wait(200);
        await service.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});