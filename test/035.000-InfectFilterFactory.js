import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import InfectFilterFactory from '../compute-source-code/InfectFilterFactory.js';
import Model from '../compute-source-code/lib/Model.js';

import util from 'util';

section.continue('Compute Source Code', (section) => {
    section('InfectFilterFactory', (section) => {

        section.test('load', async() => {
            const factory = new InfectFilterFactory();
            await factory.load();
        });

        section.test('createFilter', async() => {
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


            //console.log(util.inspect(filter, {depth: 20}));

            assert.equal(filter.applyToModel(new Model({})), false);


            //filter.debug();
            assert.equal(filter.applyToModel(new Model({
                animalId: 1,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
            })), true);

            assert.equal(filter.applyToModel(new Model({
                animalId: 1,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 1500,
            })), false);

            assert.equal(filter.applyToModel(new Model({
                animalId: 100,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
            })), false);
        });




        section.test('empty filter arrays', async() => {
            const factory = new InfectFilterFactory();
            await factory.load();

            const filter = factory.createFilter({
                regionIds: [],
                hospitalStatusIds: [],
                animalIds: [4, 5],
                ageGroupIntervals: [],
            });


            //console.log(util.inspect(filter, {depth: 20}));

            assert.equal(filter.applyToModel(new Model({})), false);


            //filter.debug();
            assert.equal(filter.applyToModel(new Model({
                animalId: 1,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
            })), false);

            assert.equal(filter.applyToModel(new Model({
                animalId: 1,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 1500,
            })), false);

            assert.equal(filter.applyToModel(new Model({
                animalId: 5,
                countryId: 2,
                patientSettingId: 3,
                patientSexId: 4,
                regionId: 5,
                patientAgeRangeFrom: 10,
                patientAgeRangeTo: 20,
            })), true);
        });
    });
});
