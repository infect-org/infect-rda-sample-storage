'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import request from 'superagent';
import assert from 'assert';
import log from 'ee-log';



const host = 'http://l.dns.porn:8020';



section('INFECT Sample Storage for RDA', (section) => {

    section.test('Import data', async() => {
        const service = new Service();
        await service.load();


        section.notice('create data version');
        const id = 'id-'+Math.round(Math.random()*10000000);
        const response = await request.post(`${host}/infect-sample-storage.data-version`).ok(res => res.status === 201).send({
            identifier: id,
            dataSet: id,
        });
        const data = response.body;

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);




        section.notice('import records');
        await request.post(`${host}/infect-sample-storage.data`).ok(res => res.status === 201).send({
            dataVersionId: data.id,
            records: [{
                bacteriumId: Math.round(Math.random()*10000000),
                antibioticId: Math.round(Math.random()*10000000),
                ageGroupId: Math.round(Math.random()*10000000),
                regionId: Math.round(Math.random()*10000000),
                sampleDate: new Date().toISOString(),
                resistance: Math.round(Math.random()*2),
                sampleId: 'sample-id-'+Math.round(Math.random()*1000000),
            }],
        });

        await section.wait(200);
        await service.end();
    });
});