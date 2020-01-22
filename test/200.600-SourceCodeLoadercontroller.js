import Service from '../index.js';
import section from 'section-tests';
import HTTP2Client from '@distributed-systems/http2-client';
import assert from 'assert';
import log from 'ee-log';
import ServiceManager from '@infect/rda-service-manager';


const host = 'http://l.dns.porn';



section('Source Code Loader', (section) => {
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

        const response = await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code-loader`)
            .expect(201)
            .send();

        const data = await response.getData();

        await section.wait(200);
        await service.end();
        await client.end();
    });




    section.test('Link Code', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`)
            .expect(201)
            .send({
                identifier: id,
                dataSet: id,
            });

        const response = await client.patch(`${host}:${service.getPort()}/infect-rda-sample-storage.source-code-loader/${id}`)
            .expect(200)
            .send();

        const data = await response.getData();

        await section.wait(200);
        await service.end();
        await client.end();
    });


    section.destroy(async() => {
        await sm.stopServices();
    });
});