import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import InfectReducer from '../compute-source-code/InfectReducer.js';
import InfectMapper from '../compute-source-code/InfectMapper.js';
import InfectModel from '../compute-source-code/InfectModel.js';



section.continue('Compute Source Code', (section) => {
    section('InfectReducer', (section) => {

        section.test('load', async() => {
            const reducer = new InfectReducer();
        });

        section.test('map', async() => {
            const model = new InfectModel({
                animalId: 1,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
                microorganismId: 23,
                compoundSubstanceId: 25,
                resistanceQualitative: 'i',
            });

            const model2 = new InfectModel({
                animalId: 100,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
                microorganismId: 23,
                compoundSubstanceId: 25,
                resistanceQualitative: 'r',
            });

            const model3 = new InfectModel({
                animalId: 100,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
                microorganismId: 23,
                compoundSubstanceId: 1,
                resistanceQualitative: 's',
            });


            const mapper = new InfectMapper();
            await mapper.load();

            const mappingResult = await mapper.compute({ models: [model, model2, model3], filterConfiguration: {}});
            const mappingResult2 = await mapper.compute({ models: [model, model2, model3], filterConfiguration: {}});

            const reducer = new InfectReducer();
            const result = await reducer.compute([{
                shard: [],
                mappingResults: mappingResult,
            }, {
                shard: [],
                mappingResults: mappingResult2,
            }]);
            
            assert.equal(result.values.length, 2);
            assert.equal(result.values[0].intermediate, 2);
            assert.equal(result.values[0].susceptible, 0);
            assert.equal(result.values[0].resistant, 2);
            assert.equal(result.counters.filteredModelCount, 0);
            assert.equal(result.counters.totalModelCount, 6);
            assert.equal(result.counters.filteredPercent, 0);
        });
    });
});
