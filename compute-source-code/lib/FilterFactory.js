import AllOfComparator from './comparator/AllOfComparator.js';
import GreaterEqualThanComparator from './comparator/GreaterEqualThanComparator.js';
import GreaterThanComparator from './comparator/GreaterThanComparator.js';
import OneOfComparator from './comparator/OneOfComparator.js';
import SmallerEqualThanComparator from './comparator/SmallerEqualThanComparator.js';
import SmallerThanComparator from './comparator/SmallerThanComparator.js';
import SomeOfComparator from './comparator/SomeOfComparator.js';
import Filter from './Filter.js';


export default class FilterFactory {

    constructor() {
        this.comparatorTypes = new Map();
        this.comparators = new Map();
        this.FilterConstructor = Filter;
    }


    async load() {
        this.registerComparator('all-of', AllOfComparator);
        this.registerComparator('greater-equal-than', GreaterEqualThanComparator);
        this.registerComparator('greater-than', GreaterThanComparator);
        this.registerComparator('one-of', OneOfComparator);
        this.registerComparator('smaller-equal-than', SmallerEqualThanComparator);
        this.registerComparator('smaller-than', SmallerThanComparator);
        this.registerComparator('some-of', SomeOfComparator);
    }


    registerComparator(name, Constructor) {
        this.comparatorTypes.set(name, Constructor);
    }


    registerFilterMapping({
        filterFieldName,
        modelFieldName,
        comparatorName,
        voidIsTrue,
        children,
        target = this.comparators,
    }) {
        if (!this.comparatorTypes.has(comparatorName)) {
            throw new Error(`Cannnot register filter mapping, the comparator '${comparatorName}' is not unknown!`);
        }

        let childMap;
        if (children && children.length) {
            childMap = new Map();

            for (const childConfig of children) {
                this.registerFilterMapping({
                    ...childConfig,
                    target: childMap,
                });
            }
        }

        target.set(filterFieldName, {
            ComparatorConstructor: this.comparatorTypes.get(comparatorName),
            modelFieldName,
            voidIsTrue,
            children: childMap
        });
    }



    buildComparators(filterConfig, comparatorsConfig = this.comparators) {
        const comparators = [];

        // if the filter config is a an array, it means that all children filters must be 
        // built for each item in the array
        if (Array.isArray(filterConfig)) {

            if (filterConfig.length === 0) return comparators;


            // by convention, the filter field name is the on below
            const filterFieldName = '$array-value';

            if (!comparatorsConfig.has(filterFieldName)) {
                throw new Error(`Unknown filter '${filterFieldName}'!`);
            }

            const { ComparatorConstructor, modelFieldName, voidIsTrue, children } = comparatorsConfig.get(filterFieldName);
            
            for (const filterConfigItem of filterConfig) {
                const childInstances = this.buildComparators(filterConfigItem, children);

                comparators.push(new ComparatorConstructor({
                    modelFieldName,
                    voidIsTrue,
                    children: childInstances,
                }));
            }

            
        } else {
            for (const [filterFieldName, filterValue] of Object.entries(filterConfig)) {

                // ignore filter that are not set
                if (filterValue === null || filterValue === undefined || Array.isArray(filterValue) && filterValue.length === 0) continue;


                if (!comparatorsConfig.has(filterFieldName)) {
                    throw new Error(`Unknown filter '${filterFieldName}'!`);
                }

                const { ComparatorConstructor, modelFieldName, voidIsTrue, children } = comparatorsConfig.get(filterFieldName);

                if (children) {
                    const childInstances = this.buildComparators(filterValue, children);
                    comparators.push(new ComparatorConstructor({
                        modelFieldName,
                        voidIsTrue,
                        children: childInstances,
                    }));
                } else {
                    comparators.push(new ComparatorConstructor({
                        modelFieldName,
                        voidIsTrue,
                        filterValue,
                    }));
                }
            }
        }

        return comparators;
    }


    createFilter(filterConfig) {
        return new this.FilterConstructor(this.buildComparators(filterConfig));
    }
}
