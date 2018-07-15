'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import request from 'superagent';
import assert from 'assert';
import log from 'ee-log';
import {ServiceManager} from 'rda-service';



const host = 'http://l.dns.porn';



section('Data Version', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');
    });


    section.test('Create a data version', async() => {
        const service = new Service();
        await service.load();


        const id = 'id-'+Math.round(Math.random()*10000000);
        

        const response = await request.post(`${host}:${service.getPort()}/infect-sample-storage.data-version`).ok(res => res.status === 201).send({
            identifier: id,
            dataSet: 'test',
            dataSetFields: ['id']
        });
        const data = response.body;

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);


        await section.wait(200);
        await service.end();
    });
    


    section.test('Activate a new version', async() => {
        const service = new Service();
        await service.load();


        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice('creating version');
        const response = await request.post(`${host}:${service.getPort()}/infect-sample-storage.data-version`).ok(res => res.status === 201).send({
            identifier: id,
            dataSet: 'test',
            dataSetFields: ['id']
        });
        const data = response.body;

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice('updating version');
        await request.patch(`${host}:${service.getPort()}/infect-sample-storage.data-version/${id}`).ok(res => res.status === 200).send({
            status: 'active'
        });


        await section.wait(200);
        await service.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});