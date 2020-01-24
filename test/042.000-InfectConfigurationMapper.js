import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import InfectConfigurationMapper from '../compute-source-code/InfectConfigurationMapper.js';
import InfectModel from '../compute-source-code/InfectModel.js';


section.continue('Compute Source Code', (section) => {
    section('InfectConfigurationMapper', (section) => {

        section.test('load', async() => {
            const mapper = new InfectConfigurationMapper();
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

            const finteredModel = new InfectModel({
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


            const mapper = new InfectConfigurationMapper();
            await mapper.load();

            const result = await mapper.compute({ models: [model, finteredModel], filterConfiguration: {
                animalIds: [ 1 ],
                countryIds: [ 2 ],
                patientSettingIds: [ 3 ],
                patientSexIds: [ 4 ],
                regionIds: [ 5 ],
                ageGroupIntervals: [{
                    daysFrom: 0,
                    daysTo: 100,
                }, {
                    daysFrom: 1000,
                    daysTo: 2000,
                }],
            }});


            assert.equal(result.values[0].animalIds[0], 1);
            assert.equal(result.values[0].regionIds[0], 5);
            assert.equal(result.values[0].compoundSubstanceId, 25);
            assert.equal(result.values[0].microorganismId, 23);
            assert.equal(result.counters.filteredModelCount, 1);
            assert.equal(result.counters.totalModelCount, 2);
        });
    });
});
