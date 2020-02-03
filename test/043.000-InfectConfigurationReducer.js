import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import InfectConfigurationReducer from '../compute-source-code/InfectConfigurationReducer.js';
import InfectConfigurationMapper from '../compute-source-code/InfectConfigurationMapper.js';
import InfectModel from '../compute-source-code/InfectModel.js';



section.continue('Compute Source Code', (section) => {
    section('InfectConfigurationReducer', (section) => {

        section.test('load', async() => {
            const reducer = new InfectConfigurationReducer();
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
                dataVersionStatusIdentifier: 'active',
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
                dataVersionStatusIdentifier: 'active',
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
                dataVersionStatusIdentifier: 'active',
            });


            const mapper = new InfectConfigurationMapper();
            await mapper.load();

            const mappingResult = await mapper.compute({ models: [model, model2, model3], filterConfiguration: {}});
            const mappingResult2 = await mapper.compute({ models: [model, model2, model3], filterConfiguration: {}});

            const reducer = new InfectConfigurationReducer();
            const result = await reducer.compute([{
                shard: [],
                mappingResults: mappingResult,
            }, {
                shard: [],
                mappingResults: mappingResult2,
            }]);

            assert.equal(result.microorganismIds[0], 23);
            assert.equal(result.compoundSubstanceIds[1], 1);
            assert.equal(result.regionIds[0], 5);
            assert.equal(result.animalIds[1], 100);
            assert.equal(result.counters.filteredModelCount, 0);
            assert.equal(result.counters.totalModelCount, 6);
            assert.equal(result.counters.filteredPercent, 0);
        });
    });
});
