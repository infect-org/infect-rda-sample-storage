import Service from '../index.mjs';
import section from 'section-tests';
import HTTP2Client from '@distributed-systems/http2-client';
import assert from 'assert';
import log from 'ee-log';
import ServiceManager from '@infect/rda-service-manager';



const host = 'http://l.dns.porn';





const createRow = () => {
    return {
        bacteriumId: Math.round(Math.random()*10000000),
        antibioticId: Math.round(Math.random()*10000000),
        ageGroupId: Math.round(Math.random()*10000000),
        regionId: Math.round(Math.random()*10000000),
        hospitalStatusId: Math.round(Math.random()*10000000),
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
        const client = new HTTP2Client();
        await service.load();


        section.notice('create data version');
        const id = 'id-'+Math.round(Math.random()*10000000);
        const response = await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version`)
            .expect(201)
            .send({
                identifier: id,
                dataSet: id,
                dataSetFields: ['bacteriumId', 'antibioticId', 'ageGroupId', 'regionId', 'sampleDate', 'resistance', 'sampleId']
            });

        const data = await response.getData();

        assert(data, 'missing response data');
        assert.equal(data.identifier, id);


        section.notice('import records');
        await client.post(`${host}:${service.getPort()}/infect-rda-sample-storage.data`)
            .expect(201)
            .send({
                dataVersionId: data.id,
                records: createRows(500),
            });



        section.notice('updating version');
        await client.patch(`${host}:${service.getPort()}/infect-rda-sample-storage.data-version/${id}`)
            .expect(200)
            .send({
                status: 'active'
            });



        section.info('getting info');
        const info = await client.get(`${host}:${service.getPort()}/infect-rda-sample-storage.dataset-info/${id}`)
            .expect(200)
            .send();

        const infoData = await info.getData();

        assert.equal(infoData.recordCount, 500);
        assert(infoData.memoryPerRow > 100);

        await section.wait(200);
        await service.end();
        await client.end();
    });



    section.destroy(async() => {
        await sm.stopServices();
    });
});