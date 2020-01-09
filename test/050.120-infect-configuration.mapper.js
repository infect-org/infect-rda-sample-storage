import vm from 'vm';
import fs from 'fs';
import util from 'util';
import path from 'path';
import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';

const readFile = util.promisify(fs.readFile);



section('Infect Configuration Mapper', (section) => {
    let Constructor;


    section.test('Build Mapper', async() => {
        const filePath = path.resolve('./functions/infect-configuration.mapper.js'); 
        const sourceCode = await readFile(filePath);

        const context = vm.createContext({console});
        const module = new vm.SourceTextModule(sourceCode.toString(), {context});

        // linking is not supported for the moment
        await module.link(async () => {});


        const {result} = await module.evaluate();
        Constructor = result;

    });



    section.test('Use Mapper', async() => {
        const instance = new Constructor();

        const result = await instance.compute({rows: [{
            bacteriumId: 1,
            antibioticId: 1,
            ageGroupId: 1,
            regionId: 1,
        }]});
        

        assert(result);
        assert(result.values);
        assert.equal(result.values.length, 1);
        assert.equal(result.values[0].bacteriumId, 1);
        assert.equal(result.values[0].antibioticId, 1);
        assert.equal(result.values[0].ageGroupId, 1);
        assert.equal(result.values[0].regionId, 1);
    });



    section.test('Filter Mapper', async() => {
        const instance = new Constructor();

        const result = await instance.compute({rows: [{
            bacteriumId: 1,
            antibioticId: 1,
            ageGroupId: 89,
            regionId: 1,
        }, {
            bacteriumId: 2,
            antibioticId: 3,
            ageGroupId: 1,
            regionId: 3,
        }, {
            bacteriumId: 5,
            antibioticId: 6,
            ageGroupId: 1,
            regionId: 2,
        }], params: {
            ageGroupIds: [1]
        }});


        assert(result);
        assert(result.values);
        assert.equal(result.values.length, 2);
        assert.equal(result.values[0].bacteriumId, 2);
        assert.equal(result.values[0].antibioticId, 3);
        assert.equal(result.values[0].ageGroupId, 1);
        assert.equal(result.values[0].regionId, 3);
    });



    section.test('Date Filter Mapper', async() => {
        const instance = new Constructor();

        const result = await instance.compute({rows: [{
            bacteriumId: 1,
            antibioticId: 1,
            ageGroupId: 1,
            regionId: 2,
            sampleDate: 1000,
        }, {
            bacteriumId: 2,
            antibioticId: 3,
            ageGroupId: 2,
            regionId: 3,
            sampleDate: 500,
        }, {
            bacteriumId: 5,
            antibioticId: 6,
            ageGroupId: 4,
            regionId: 5,
            sampleDate: 1000,
        }], params: {
            dateFrom: 800,
            dateTo: 1000,
        }});


        assert(result);
        assert(result.values);
        assert.equal(result.values.length, 2);
        assert.equal(result.values[0].bacteriumId, 1);
        assert.equal(result.values[0].antibioticId, 1);
        assert.equal(result.values[0].ageGroupId, 1);
        assert.equal(result.values[0].regionId, 2);
    });
});

