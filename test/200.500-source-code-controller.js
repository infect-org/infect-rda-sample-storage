import Service from '../index.js';
import section from 'section-tests';
import HTTP2Client from '@distributed-systems/http2-client';
import assert from 'assert';
import log from 'ee-log';
import ServiceManager from '@infect/rda-service-manager';


const host = 'http://l.dns.porn';



section('Source Code', (section) => {
    let sm;
    

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev.testing --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');
    });



    section.test('Create Code', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();

        // ensure the infect-test dataset
        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`)
            .expect(201)
            .send({
                identifier: 'id-'+Math.round(Math.random()*10000000),
                dataSet: 'infect-test',
            });

        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`)
            .expect(201)
            .send({
                sourceText: 'console.log("map");',
                specifier: 'source-specifier-'+Math.round(Math.random()*100000),
                dataSetIdentifier: 'infect-test',
            });

        await section.wait(200);
        await service.end();
        await client.end();
    });


    section.test('List Code', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();

        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`)
            .expect(201)
            .send({
                sourceText: 'console.log("reduce");',
                specifier: 'source-specifier-'+Math.round(Math.random()*100000),
                dataSetIdentifier: 'infect-test',
            });

        const response = await client.get(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`)
            .expect(200)
            .send();

        const data = await response.getData();

        assert(data);
        assert(data.length);

        await section.wait(200);
        await service.end();
        await client.end();
    });






    section.test('List Code: Filter', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();

        const specifier = 'source-specifier-'+Math.round(Math.random()*100000);

        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`)
            .expect(201)
            .send({
                sourceText: 'console.log("reduce");',
                specifier,
                dataSetIdentifier: 'infect-test',
            });

        const response = await client.get(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`)
            .query({
                specifier,
            })
            .expect(200)
            .send();

        const data = await response.getData();
        assert(data);
        assert.equal(data.length, 1);

        await section.wait(200);
        await service.end();
        await client.end();
    });






    section.test('List Code: Filter dataset', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();

        const specifier = 'source-specifier-'+Math.round(Math.random()*100000);

         // ensure the infect-test dataset
        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`)
            .expect(201)
            .send({
                identifier: 'id-'+Math.round(Math.random()*10000000),
                dataSet: specifier,
            });

        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`)
            .expect(201)
            .send({
                sourceText: specifier,
                specifier,
                dataSetIdentifier: specifier,
            });

        const response = await client.get(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code`)
            .query({
                dataSetIdentifier: specifier,
            })
            .expect(200)
            .send();

        const data = await response.getData();
        assert(data);
        assert.equal(data.length, 1);
        assert.equal(data[0].sourceText, specifier);

        await section.wait(200);
        await service.end();
        await client.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});