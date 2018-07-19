'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import request from 'superagent';
import assert from 'assert';
import log from 'ee-log';
import {ServiceManager} from 'rda-service';



const host = 'http://l.dns.porn';



section('Duplicate Data', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');
    });


    section.test('Import duplicate data', async() => {
        const service = new Service();
        await service.load();


        section.notice('create data version');
        const id = 'id-'+Math.round(Math.random()*10000000);
        const response = await request.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`).ok(res => res.status === 201).send({
            identifier: id,
            dataSet: id,
            dataSetFields: ['bacteriumId', 'antibioticId', 'ageGroupId', 'regionId', 'sampleDate', 'resistance']
        });
        const data = response.body;

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);


        const records = [{
            bacteriumId: Math.round(Math.random()*10000000),
            antibioticId: Math.round(Math.random()*10000000),
            ageGroupId: Math.round(Math.random()*10000000),
            regionId: Math.round(Math.random()*10000000),
            sampleDate: new Date().toISOString(),
            resistance: Math.round(Math.random()*2),
            sampleId: 'sample-id-'+Math.round(Math.random()*1000000),
        }];


        section.notice('import records');
        await request.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data`).ok(res => res.status === 201).send({
            dataVersionId: data.id,
            records: records,
        });



        section.notice('import duplicate records');
        await request.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data`).ok(res => res.status === 201).send({
            dataVersionId: data.id,
            records: records,
        });



        section.notice('updating version');
        await request.patch(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version/${id}`).ok(res => res.status === 200).send({
            status: 'active'
        });


        await section.wait(200);
        await service.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});