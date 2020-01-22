import section from 'section-tests';
import log from 'ee-log';
import assert from 'assert';
import Comparator from '../compute-source-code/lib/comparator/Comparator.js';
import AllOfComparator from '../compute-source-code/lib/comparator/AllOfComparator.js';
import SomeOfComparator from '../compute-source-code/lib/comparator/SomeOfComparator.js';
import GreaterEqualThanComparator from '../compute-source-code/lib/comparator/GreaterEqualThanComparator.js';
import GreaterThanComparator from '../compute-source-code/lib/comparator/GreaterThanComparator.js';
import OneOfComparator from '../compute-source-code/lib/comparator/OneOfComparator.js';
import SmallerEqualThanComparator from '../compute-source-code/lib/comparator/SmallerEqualThanComparator.js';
import SmallerThanComparator from '../compute-source-code/lib/comparator/SmallerThanComparator.js';
import Model from '../compute-source-code/lib/Model.js';



 class ComparatorImplementation extends Comparator {
    compare(value) {
        return value === this.filterValue;
    }
}

class ChildrenComparatorImplementation extends Comparator {
    compare(model) {
        return this.children.every(child => child.match(model));
    }
}



section('Compute Source Code', (section) => {
    section('Comparator', (section) => {

        section.test('match, void true', async() => {
            const instance = new ComparatorImplementation({
                voidIsTrue: true,
                modelFieldName: 'test',
                filterValue: 'value',
            });

            assert.equal(instance.match(new Model({ test: 'value' })), true);
            assert.equal(instance.match(new Model({})), true);
            assert.equal(instance.match(new Model({ test: 'nope' })), false);
        });

        section.test('match, void false', async() => {
            const instance = new ComparatorImplementation({
                voidIsTrue: false,
                modelFieldName: 'test',
                filterValue: 'value',
            });

            assert.equal(instance.match(new Model({ test: 'value' })), true);
            assert.equal(instance.match(new Model({})), false);
            assert.equal(instance.match(new Model({ test: 'nope' })), false);
        });



        section.test('match children', async() => {
            const instance = new ChildrenComparatorImplementation({
                children: [new ComparatorImplementation({
                    voidIsTrue: true,
                    modelFieldName: 'test',
                    filterValue: 'value',
                })]
            });

            assert.equal(instance.match(new Model({ test: 'value' })), true);
            assert.equal(instance.match(new Model({})), true);
            assert.equal(instance.match(new Model({ test: 'nope' })), false);
        });
    });




    section('AllOfComparator', (section) => {
        section.test('match', async() => {
            const instance = new AllOfComparator({
                children: [new ComparatorImplementation({
                    voidIsTrue: false,
                    modelFieldName: 'test',
                    filterValue: 'value',
                }), new ComparatorImplementation({
                    voidIsTrue: false,
                    modelFieldName: 'test1',
                    filterValue: 'value',
                })]
            });

            assert.equal(instance.match(new Model({ test: 'value', test1: 'value' })), true);
            assert.equal(instance.match(new Model({})), false);
            assert.equal(instance.match(new Model({ test: 'nope' })), false);
            assert.equal(instance.match(new Model({ test: 'value', test1: 'nope' })), false);
        });
    });

    section('SomeOfComparator', (section) => {
        section.test('match', async() => {
            const instance = new SomeOfComparator({
                children: [new ComparatorImplementation({
                    voidIsTrue: false,
                    modelFieldName: 'test',
                    filterValue: 'value',
                }), new ComparatorImplementation({
                    voidIsTrue: false,
                    modelFieldName: 'test1',
                    filterValue: 'value',
                })]
            });

            assert.equal(instance.match(new Model({ test: 'value', test1: 'value' })), true);
            assert.equal(instance.match(new Model({})), false);
            assert.equal(instance.match(new Model({ test: 'nope' })), false);
            assert.equal(instance.match(new Model({ test: 'value', test1: 'nope' })), true);
            assert.equal(instance.match(new Model({ test: 'nope', test1: 'nope' })), false);
        });
    });



    section('GreaterEqualThanComparator', (section) => {
        section.test('match', async() => {
            const instance = new GreaterEqualThanComparator({
                voidIsTrue: false,
                modelFieldName: 'test',
                filterValue: 5,
            });

            assert.equal(instance.match(new Model({ test: 6 })), true);
            assert.equal(instance.match(new Model({ test: 5 })), true);
            assert.equal(instance.match(new Model({ test: 4 })), false);
            assert.equal(instance.match(new Model({})), false);
        });
    });

    section('GreaterThanComparator', (section) => {
        section.test('match', async() => {
            const instance = new GreaterThanComparator({
                voidIsTrue: false,
                modelFieldName: 'test',
                filterValue: 5,
            });

            assert.equal(instance.match(new Model({ test: 6 })), true);
            assert.equal(instance.match(new Model({ test: 5 })), false);
            assert.equal(instance.match(new Model({ test: 4 })), false);
            assert.equal(instance.match(new Model({})), false);
        });
    });

    section('OneOfComparator', (section) => {
        section.test('match', async() => {
            const instance = new OneOfComparator({
                voidIsTrue: false,
                modelFieldName: 'test',
                filterValue: [5, 6, 8],
            });

            assert.equal(instance.match(new Model({ test: 6 })), true);
            assert.equal(instance.match(new Model({ test: 5 })), true);
            assert.equal(instance.match(new Model({ test: 4 })), false);
            assert.equal(instance.match(new Model({})), false);
        });
    });

    section('SmallerEqualThanComparator', (section) => {
        section.test('match', async() => {
            const instance = new SmallerEqualThanComparator({
                voidIsTrue: false,
                modelFieldName: 'test',
                filterValue: 6,
            });

            assert.equal(instance.match(new Model({ test: 6 })), true);
            assert.equal(instance.match(new Model({ test: 5 })), true);
            assert.equal(instance.match(new Model({ test: 8 })), false);
            assert.equal(instance.match(new Model({})), false);
        });
    });

    section('SmallerThanComparator', (section) => {
        section.test('match', async() => {
            const instance = new SmallerThanComparator({
                voidIsTrue: false,
                modelFieldName: 'test',
                filterValue: 6,
            });

            assert.equal(instance.match(new Model({ test: 6 })), false);
            assert.equal(instance.match(new Model({ test: 5 })), true);
            assert.equal(instance.match(new Model({ test: 8 })), false);
            assert.equal(instance.match(new Model({})), false);
        });
    });
});

