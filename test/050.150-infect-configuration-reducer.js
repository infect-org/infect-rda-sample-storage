import vm from 'vm';
import fs from 'fs';
import util from 'util';
import path from 'path';
import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';

const readFile = util.promisify(fs.readFile);



section('Infect Configuration Reducer', (section) => {
    let Constructor;


    section.test('Build Reducer', async() => {
        const filePath = path.resolve('./functions/infect-configuration.reducer.js'); 
        const sourceCode = await readFile(filePath);

        const context = vm.createContext({});
        const module = new vm.SourceTextModule(sourceCode.toString(), {context});

        // linking is not supported for the moment
        await module.link(async () => {});

        const {result} = await module.evaluate();
        Constructor = result;

    });



    section.test('Use Reducer', async() => {
        const instance = new Constructor();

        const result = await instance.compute([{
            shard: [],
            results: {
                values:[{
                    bacteriumId: 1,
                    antibioticId: 2,
                    resistant: 100,
                    intermediate: 200,
                    susceptible: 300,
                    regionId: 1,
                    ageGroupId: 2,
                    animalId: 0,
                    sampleCount: 9,
                }],
                counters: {
                    filteredSamples: 10,
                    totalSamples: 100,
                    filteredPercentage: 90,
                },
                timings: {
                    preparation: 4,
                    filtering: 32,
                },
            },
        }, {
            shard: [],
            results: {
                values: [{
                    bacteriumId: 15,
                    antibioticId: 250,
                    resistant: 45,
                    intermediate: 34,
                    susceptible: 23,
                    sampleCount: 78,
                    regionId: 1,
                    ageGroupId: 2,
                    animalId: 0,
                }, {
                    bacteriumId: 1,
                    antibioticId: 2,
                    resistant: 10,
                    intermediate: 10,
                    susceptible: 10,
                    sampleCount: 99,
                    regionId: 1,
                    ageGroupId: 2,
                    animalId: 0,
                }],
                counters: {
                    filteredSamples: 50,
                    totalSamples: 100,
                    filteredPercentage: 50,
                },
                timings: {
                    preparation: 2,
                    filtering: 21,
                },
            }
        }]);

        assert(result);
        assert.equal(result.bacteriumIds.length, 2);
        assert.equal(result.compoundIds.length, 2);
        assert.equal(result.regionIds.length, 1);
        assert.equal(result.ageGroupIds.length, 1);
        assert.equal(result.animalIds.length, 0);
    });
});

