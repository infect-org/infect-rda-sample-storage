import Service from '../index.js';
import section from 'section-tests';
import HTTP2Client from '@distributed-systems/http2-client';
import assert from 'assert';
import log from 'ee-log';
import ServiceManager from '@infect/rda-service-manager';



const host = 'http://l.dns.porn';



section('Data Version', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev.testing --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');
    });


    section.test('Create a data version', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();


        const id = 'id-'+Math.round(Math.random()*10000000);
        

        const response = await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`)
            .expect(201)
            .send({
                identifier: id,
                dataSet: 'test',
            });

        const data = await response.getData();

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);


        await section.wait(200);
        await service.end();
        await client.end();
    });
    


    section.test('Activate a new version', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();


        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice('creating version');
        const response = await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`)
            .expect(201)
            .send({
                identifier: id,
                dataSet: 'test',
                dataSetFields: ['id']
            });

        const data = await response.getData();

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice('updating version');
        await client.patch(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version/${id}`)
            .expect(200)
            .send({
                status: 'active'
            });


        await section.wait(200);
        await service.end();
        await client.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});