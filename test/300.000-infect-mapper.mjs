
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
        const filePath = path.resolve('./functions/infect.mapper.mjs'); 
        const sourceCode = await readFile(filePath);

        const context = vm.createContext({});
        const module = new vm.Module(sourceCode.toString(), {context});

        // linking is not supported for the moment
        await module.link(async () => {});


        module.instantiate();

        const {result} = await module.evaluate();
        Constructor = result;

    });



    section.test('Use Mapper', async() => {
        const instance = new Constructor();

        const result = await instance.compute([{
            bacteriumId: 1,
            antibioticId: 1,
            resistance: 1,
        }]);

        assert(result);
        assert.equal(result.length, 1);
        assert.equal(result[0].bacteriumId, 1);
        assert.equal(result[0].antibioticId, 1);
        assert.equal(result[0].resistant, 0);
        assert.equal(result[0].intermediate, 1);
    });
});

