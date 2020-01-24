import Service from '../index.js';
import section from 'section-tests';
import HTTP2Client from '@distributed-systems/http2-client';
import assert from 'assert';
import log from 'ee-log';
import ServiceManager from '@infect/rda-service-manager';
import {DataSet} from '@infect/rda-fixtures';



const host = 'http://l.dns.porn';



section('Data Fetching', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev.testing --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('@infect/rda-service-registry');

    });


    section.test('Get Records', async() => {
        section.setTimeout(5000);
        
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();


        
        // add fixtures
        section.notice('create fixtures');
        const dataSet = new DataSet();
        const dataSetId = await dataSet.create({
            length: 2500
        });


        section.notice('create shards');
        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.shard`)
            .expect(201)
            .send({
                dataSet: dataSetId,
                shards: ['a', 'b', 'c', 'd'],
            });



        section.notice('load page');
        const response = await client.get(`${host}:${service.getPort()}/infect-rda-sample-storage.data`)
            .expect(200)
            .query({
                shard: 'a',
                offset: 0,
                limit: 100,
            })
            .send();

        const data = await response.getData();

        assert(data);
        assert.equal(data.length, 100);

        await section.wait(200);
        await service.end();
        await client.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});