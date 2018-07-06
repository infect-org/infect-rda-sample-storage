'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import request from 'superagent';
import assert from 'assert';
import log from 'ee-log';



const host = 'http://l.dns.porn:8020';



section('INFECT Sample Storage for RDA', (section) => {

    section.test('Create a data version', async() => {
        const service = new Service();
        await service.load();


        const id = 'id-'+Math.round(Math.random()*10000000);
        

        const response = await request.post(`${host}/infect-sample-storage.data-version`).ok(res => res.status === 201).send({
            identifier: id,
            dataSet: 'test',
        });
        const data = response.body;

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);


        await section.wait(200);
        await service.end();
    });
});