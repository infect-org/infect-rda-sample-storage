import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import FilterFactory from '../compute-source-code/lib/FilterFactory.js';
import Model from '../compute-source-code/lib/Model.js';

import util from 'util';

section.continue('Compute Source Code', (section) => {
    section('FilterFactory', (section) => {

        section.test('load', async() => {
            const factory = new FilterFactory();
            await factory.load();
        });

        section.test('createFilter', async() => {
            const factory = new FilterFactory();
            await factory.load();

            factory.registerFilterMapping({
                filterFieldName: 'testFilter',
                modelFieldName: 'testValue',
                comparatorName: 'greater-than',
                voidIsTrue: false,
            });

            const filter = factory.createFilter({
                testFilter: 6
            });

            assert.equal(filter.applyToModel(new Model({})), false);
            assert.equal(filter.applyToModel(new Model({testValue: 4})), false);
            assert.equal(filter.applyToModel(new Model({testValue: 7})), true);
        });



        section.test('createFilter: one-of', async() => {
            const factory = new FilterFactory();
            await factory.load();

            factory.registerFilterMapping({
                filterFieldName: 'testFilter',
                modelFieldName: 'testValue',
                comparatorName: 'one-of',
                voidIsTrue: false,
            });

            const filter = factory.createFilter({
                testFilter: [ 6, 7 ]
            });

            assert.equal(filter.applyToModel(new Model({})), false);
            assert.equal(filter.applyToModel(new Model({testValue: 4})), false);
            assert.equal(filter.applyToModel(new Model({testValue: 7})), true);
        });


        section.test('createFilter: children', async() => {
            const factory = new FilterFactory();
            await factory.load();

            factory.registerFilterMapping({
                comparatorName: 'some-of',
                filterFieldName: 'filter',
                children: [{
                    comparatorName: 'all-of',
                    filterFieldName: '$array-value',
                    children: [{
                        filterFieldName: 'min',
                        modelFieldName: 'min',
                        comparatorName: 'greater-equal-than',
                        voidIsTrue: false,
                    }, {
                        filterFieldName: 'max',
                        modelFieldName: 'max',
                        comparatorName: 'smaller-equal-than',
                        voidIsTrue: false,
                    }]
                }],
            });

            const filter = factory.createFilter({
                filter: [{
                    min: 1,
                    max: 3,
                }, {
                    min: 10,
                    max: 30,
                }]
            });

            // console.log(util.inspect(filter, {depth: 20}));

            assert.equal(filter.applyToModel(new Model({})), false);
            assert.equal(filter.applyToModel(new Model({min: 2})), false);
            assert.equal(filter.applyToModel(new Model({max: 1})), false);
            assert.equal(filter.applyToModel(new Model({min: 1, max: 3})), true);
            assert.equal(filter.applyToModel(new Model({min: 1, max: 4})), false);
            assert.equal(filter.applyToModel(new Model({min: 1, max: 25})), false);
            assert.equal(filter.applyToModel(new Model({min: 21, max: 25})), true);
            assert.equal(filter.applyToModel(new Model({min: 0, max: 25})), false);
        });
    });
});

