'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import superagent from 'superagent';
import assert from 'assert';
import log from 'ee-log';
import {ServiceManager} from 'rda-service';


const host = 'http://l.dns.porn';



section('Source Code', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');

    });



    section.test('Create Code', async() => {
        const service = new Service();
        await service.load();


        await superagent.post(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`).ok(res => res.status === 201).send({
            sourceCode: 'console.log("map");',
            identifier: 'source-identifier-'+Math.round(Math.random()*100000),
            type: 'mapper',
        });

        await section.wait(200);
        await service.end();
    });


    section.test('List Code', async() => {
        const service = new Service();
        await service.load();

        await superagent.post(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`).ok(res => res.status === 201).send({
            sourceCode: 'console.log("reduce");',
            identifier: 'source-identifier-'+Math.round(Math.random()*100000),
            type: 'reducer',
        });

        const response = await superagent.get(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`).ok(res => res.status === 200).send();

        assert(response.body);
        assert(response.body.length);

        await section.wait(200);
        await service.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});