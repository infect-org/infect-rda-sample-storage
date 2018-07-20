
import vm from 'vm';
import fs from 'fs';
import util from 'util';
import path from 'path';
import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';

const readFile = util.promisify(fs.readFile);



section('Infect Reducer', (section) => {
    let Constructor;


    section.test('Build Reducer', async() => {
        const filePath = path.resolve('./functions/infect.reducer.mjs'); 
        const sourceCode = await readFile(filePath);

        const context = vm.createContext({});
        const module = new vm.Module(sourceCode.toString(), {context});

        // linking is not supported for the moment
        await module.link(async () => {});


        module.instantiate();

        const {result} = await module.evaluate();
        Constructor = result;

    });



    section.test('Use Reducer', async() => {
        const instance = new Constructor();

        const result = await instance.compute([[{
            bacteriumId: 1,
            antibioticId: 2,
            resistant: 100,
            intermediate: 200,
            susceptible: 300,
        }], [{
            bacteriumId: 15,
            antibioticId: 250,
            resistant: 45,
            intermediate: 34,
            susceptible: 23,
        }, {
            bacteriumId: 1,
            antibioticId: 2,
            resistant: 10,
            intermediate: 10,
            susceptible: 10,
        }]]);



        assert(result);
        assert.equal(result.values.length, 2);
        assert.equal(result.sampleCount, 732);
        assert.equal(result.values[0].bacteriumId, 1);
        assert.equal(result.values[0].antibioticId, 2);
        assert.equal(result.values[0].resistant, 110);
        assert.equal(result.values[0].intermediate, 210);
    });
});

