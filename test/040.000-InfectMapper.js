import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import InfectMapper from '../compute-source-code/InfectMapper.js';
import InfectModel from '../compute-source-code/InfectModel.js';


section.continue('Compute Source Code', (section) => {
    section('InfectMapper', (section) => {

        section.test('load', async() => {
            const mapper = new InfectMapper();
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
                dataVersionStatusIdentifier: 'active',
            });


            const mapper = new InfectMapper();
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

            assert.equal(result.values.length, 1);
            assert.equal(result.values[0].intermediate, 1);
            assert.equal(result.values[0].susceptible, 0);
            assert.equal(result.values[0].resistant, 0);
            assert.equal(result.counters.filteredModelCount, 1);
            assert.equal(result.counters.totalModelCount, 2);
        });

        section.test('map. remove previews', async() => {
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
                dataVersionStatusIdentifier: 'preview',
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
                dataVersionStatusIdentifier: 'active',
            });


            const mapper = new InfectMapper();
            await mapper.load();

            const result = await mapper.compute({ models: [model, finteredModel], filterConfiguration: {
                dataVersionStatusIdentifier: ['active', 'preview'],
            }});


            assert.equal(result.counters.filteredModelCount, 0);

            const result2 = await mapper.compute({ models: [model, finteredModel], filterConfiguration: {
                dataVersionStatusIdentifier: ['active'],
            }});

            assert.equal(result2.counters.filteredModelCount, 1);
        });
    });
});
