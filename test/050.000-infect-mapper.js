import vm from 'vm';
import fs from 'fs';
import util from 'util';
import path from 'path';
import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';

const readFile = util.promisify(fs.readFile);



section('Infect Mapper', (section) => {
    let Constructor;


    section.test('Build Mapper', async() => {
        const filePath = path.resolve('./functions/infect.mapper.js'); 
        const sourceCode = await readFile(filePath);

        const context = vm.createContext({console});
        const module = new vm.SourceTextModule(sourceCode.toString(), {context});

        // linking is not supported for the moment
        await module.link(async () => {});


        module.instantiate();

        const {result} = await module.evaluate();
        Constructor = result;

    });



    section.test('Use Mapper', async() => {
        const instance = new Constructor();

        const result = await instance.compute({rows: [{
            bacteriumId: 1,
            antibioticId: 1,
            resistance: 1,
        }]});
        


        assert(result);
        assert(result.values);
        assert.equal(result.values.length, 1);
        assert.equal(result.values[0].bacteriumId, 1);
        assert.equal(result.values[0].antibioticId, 1);
        assert.equal(result.values[0].resistant, 0);
        assert.equal(result.values[0].intermediate, 1);
    });



    section.test('Filter Mapper', async() => {
        const instance = new Constructor();

        const result = await instance.compute({rows: [{
            bacteriumId: 1,
            antibioticId: 1,
            resistance: 1,
            ageGroupId: 89,
        }, {
            bacteriumId: 2,
            antibioticId: 3,
            resistance: 1,
            ageGroupId: 1,
        }, {
            bacteriumId: 5,
            antibioticId: 6,
            resistance: 2,
            ageGroupId: 1,
        }], params: {
            ageGroupIds: [1]
        }});



        // do some counting
        let sampleCount = 0;

        result.values.forEach((value) => {
            sampleCount += value.resistant;
            sampleCount += value.intermediate;
            sampleCount += value.susceptible;
        });


        assert(result);
        assert(result.values);
        assert.equal(result.values.length, 2);
        assert.equal(result.values[0].bacteriumId, 2);
        assert.equal(result.values[0].antibioticId, 3);
        assert.equal(result.values[0].resistant, 0);
        assert.equal(result.values[0].intermediate, 1);
        assert.equal(sampleCount, 2);
    });



    section.test('Date Filter Mapper', async() => {
        const instance = new Constructor();

        const result = await instance.compute({rows: [{
            bacteriumId: 1,
            antibioticId: 1,
            resistance: 1,
            sampleDate: 1000,
        }, {
            bacteriumId: 2,
            antibioticId: 3,
            resistance: 1,
            sampleDate: 500,
        }, {
            bacteriumId: 5,
            antibioticId: 6,
            resistance: 2,
            sampleDate: 1000,
        }], params: {
            dateFrom: 800,
            dateTo: 1000,
        }});



        // do some counting
        let sampleCount = 0;

        result.values.forEach((value) => {
            sampleCount += value.resistant;
            sampleCount += value.intermediate;
            sampleCount += value.susceptible;
        });


        assert(result);
        assert(result.values);
        assert.equal(result.values.length, 2);
        assert.equal(result.values[0].bacteriumId, 1);
        assert.equal(result.values[0].antibioticId, 1);
        assert.equal(result.values[0].resistant, 0);
        assert.equal(result.values[0].intermediate, 1);
        assert.equal(sampleCount, 2);
    });
});

