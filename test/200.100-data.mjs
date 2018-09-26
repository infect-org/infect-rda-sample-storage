import Service from '../index.mjs';
import section from 'section-tests';
import HTTP2Client from '@distributed-systems/http2-client';
import log from 'ee-log';
import ServiceManager from '@infect/rda-service-manager';
import assert from 'assert';



const host = 'http://l.dns.porn';



section('Data', (section) => {
    let sm;

    section.setup(async() => {
        sm = new ServiceManager({
            args: '--dev --log-level=error+ --log-module=*'.split(' ')
        });
        
        await sm.startServices('rda-service-registry');
    });


    section.test('Import data', async() => {
        const service = new Service();
        const client = new HTTP2Client();
        await service.load();


        section.notice('create data version');
        const id = 'id-'+Math.round(Math.random()*10000000);
        const response = await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`)
            .expect(201)
            .send({
                identifier: id,
                dataSet: id,
                dataSetFields: ['bacteriumId', 'antibioticId', 'ageGroupId', 'regionId', 'sampleDate', 'resistance']
            });
        
        const data = await response.getData();

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);




        section.notice('import records');
        const r = await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data`)
            .expect(201)
            .send({
                dataVersionId: data.id,
                records: [{
                    bacteriumId: Math.round(Math.random()*10000000),
                    antibioticId: Math.round(Math.random()*10000000),
                    ageGroupId: Math.round(Math.random()*10000000),
                    regionId: Math.round(Math.random()*10000000),
                    hospitalStatusId: Math.round(Math.random()*10000000),
                    sampleDate: new Date().toISOString(),
                    resistance: Math.round(Math.random()*2),
                    sampleId: 'sample-id-'+Math.round(Math.random()*1000000),
                }],
            });




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