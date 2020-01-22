import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import InfectFilterFactory from '../compute-source-code/InfectFilterFactory.js';
import InfectModel from '../compute-source-code/InfectModel.js';


section.continue('Compute Source Code', (section) => {
    section('InfectModel', (section) => {

        section.test('load', async() => {
            const model = new InfectModel();
        });

        section.test('satisifiesFilter', async() => {
            const factory = new InfectFilterFactory();
            await factory.load();

            const filter = factory.createFilter({
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
            });


            const model = new InfectModel({
                animalId: 1,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
                compoundSubstanceId: 888,
                microorganismId: 999,
            });

            assert.equal(model.satisfiesFilter(filter), true);

            const invalidModel = new InfectModel({
                animalId: 100,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
                compoundSubstanceId: 888,
                microorganismId: 999,
            });

            assert.equal(invalidModel.satisfiesFilter(filter), false);
        });
    });
});
