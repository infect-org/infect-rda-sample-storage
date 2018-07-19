'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import superagent from 'superagent';
import assert from 'assert';
import log from 'ee-log';
import {ServiceManager} from 'rda-service';



const host = 'http://l.dns.porn';





const createRow = () => {
    return {
        bacteriumId: Math.round(Math.random()*10000000),
        antibioticId: Math.round(Math.random()*10000000),
        ageGroupId: Math.round(Math.random()*10000000),
        regionId: Math.round(Math.random()*10000000),
        sampleDate: new Date().toISOString(),
        resistance: Math.round(Math.random()*2),
        sampleId: 'sample-id-'+Math.round(Math.random()*1000000),
    };
}



const createRows = (length) => {
    return Array.apply(null, {length}).map(x => createRow());
};



section('Data Set Info', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');
    });


    section.test('Get Info', async() => {
        section.setTimeout(5000);
        const service = new Service();
        await service.load();


        section.notice('create data version');
        const id = 'id-'+Math.round(Math.random()*10000000);
        const response = await superagent.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`).ok(res => res.status === 201).send({
            identifier: id,
            dataSet: id,
            dataSetFields: ['bacteriumId', 'antibioticId', 'ageGroupId', 'regionId', 'sampleDate', 'resistance', 'sampleId']
        });
        const data = response.body;

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);


        section.notice('import records');
        await superagent.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data`).ok(res => res.status === 201).send({
            dataVersionId: data.id,
            records: createRows(500),
        });



        section.notice('updating version');
        await superagent.patch(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version/${id}`).ok(res => res.status === 200).send({
            status: 'active'
        });



        section.info('getting info');
        const info = await superagent.get(`${host}:${service.getPort()}/infect-rda-sample-storage.dataset-info/${id}`).ok(res => res.status === 200).send();


        assert.equal(info.body.recordCount, 500);
        assert(info.body.memoryPerRow > 100);

        await section.wait(200);
        await service.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});