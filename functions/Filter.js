

class Comparator {

    constructor({
        voidIsTrue = true,
        sampleFieldName,
        value,
        children,
    } = {}) {
        if (!sampleFieldName && !children) throw new Error(`Missing option 'sampleFieldName'!`);

        this.children = children;
        this.sampleFieldName = sampleFieldName;
        this.voidIsTrue = voidIsTrue;
        this.filterValue = sampleValue;
    }


    match(sample) {
        if (!this.children) {
            const sampleFieldValue = sample[this.sampleFieldName];

            // allow empty values
            if (this.voidIsTrue && (sampleFieldValue === undefined 
                || sampleFieldValue === null 
                || this.children && Array.isArray(sampleFieldValue) && sampleFieldValue.length === 0)) {
                return true;
            }

            return this.compare(sampleFieldValue);
        } else {
            return this.compare(sample);
        }
    }
}





class AllOfComparator {
    compare(sample) {
        return this.children.every((child) => child.match(sample));
    }

}

class SomefComparator {
    compare(sample) {
        return this.children.some((child) => child.match(sample));
    }

}



class InComparator {
    compare(sampleFieldValue) {
        return this.filterValue.includes(sampleFieldValue)
    }
}



class GreaterThanComparator extends Comparator {
    compare(sampleFieldValue) {
        return sampleFieldValue > this.filterValue;
    }
}

class GreaterEqualThanComparator extends Comparator {
    compare(sampleFieldValue) {
        return sampleFieldValue >= this.filterValue;
    }
}

class SmallerThanComparator extends Comparator {
    compare(sampleFieldValue) {
        return sampleFieldValue < this.filterValue;
    }
}

class SmallerEqualThanComparator extends Comparator {
    compare(sampleFieldValue) {
        return sampleFieldValue <= this.filterValue;
    }
}






class FilterFactory {

    constructor() {
        this.comparatorTypes = new Map();
        this.comparators = new Map();
    }



    load() {
        this.registerComparator('allOf', AllOfComparator);
        this.registerComparator('in', InComparator);
        this.registerComparator('greaterThan', GreaterThanComparator);
        this.registerComparator('greaterEqualThan', GreaterEqualThanComparator);
        this.registerComparator('smallerThan', SmallerThanComparator);
        this.registerComparator('smallerEqualThan', SmallerEqualThanComparator);
    }



    registerComparator(name, Constructor) {
        this.comparatorTypes.set(name, Constructor);
    }



    registerFilterMapping({
        filterFieldName,
        sampleFieldName,
        comparatorName,
        voidIsTrue,
        children,
        target = this.comparators,
    }) {
        if (!this.comparatorTypes.has(comparatorName)) {
            throw new Error(`Cannnot register filter mapping, the comparator '${comparatorName}' is not unknown!`);
        }

        if (children && children.length) {
            childMap = new Map();

            for (const childConfig of children) {
                this.registerFilterMapping({
                    ...childConfig
                    target: childMap,
                });
            }
        }

        target.set(filterFieldName, {
            ComparatorConstructor: this.comparatorTypes.get(comparatorName),
            sampleFieldName,
            voidIsTrue,
            children: childMap
        });
    }




    buildComparators(filterConfig) {
        const comparators = [];

        for (const [name, value] of Object.entries(filterConfig)) {
            if (value === null || value === undefined || Array.isArray(value) && value.length === 0) return;

            if (!this.comparators.has(name)) {
                throw new Error(`Unknown filter '${name}'!`);
            }

            const { ComparatorConstructor, sampleFieldName, voidIsTrue, children } = this.comparators.get(name);
            const childInstances = children ? this.buildComparators(children): null;

            comparators.push(new ComparatorConstructor({
                sampleFieldName,
                value,
                voidIsTrue,
                children: childInstances,
            }));
        }

        return comparators;
    }



    createFilter(filterConfig) {
        return new this.FilterConstructor(this.buildComparators(filterConfig));
    }
}





class InfectFilterFactory extends FilterFactory {

    load() {
        super.load();

        this.FilterConstructor = InfectFilter;

        const mapping = [{
            filterFieldName: 'animalIds',
            sampleFieldName: 'animalId',
            comparatorName: 'in',
            voidIsTrue: true,
        }, {
            filterFieldName: 'countryIds',
            sampleFieldName: 'countryId',
            comparatorName: 'in',
            voidIsTrue: true,
        }, {
            filterFieldName: 'patientSettingIds',
            sampleFieldName: 'patientSettingId',
            comparatorName: 'in',
            voidIsTrue: true,
        }, {
            filterFieldName: 'patientSexIds',
            sampleFieldName: 'patientSexId',
            comparatorName: 'in',
            voidIsTrue: true,
        }, {
            filterFieldName: 'regionIds',
            sampleFieldName: 'regionId',
            comparatorName: 'in',
            voidIsTrue: true,
        }, {
            filterFieldName: 'ageGroupIntervals',
            comparatorName: 'allOf',
            voidIsTrue: true,
            children: [{
                filterFieldName: 'daysFrom',
                sampleFieldName: 'patientAgeRangeFrom',
                comparatorName: 'greaterEqualThan',
                voidIsTrue: false,
            }, {
                filterFieldName: 'daysTo',
                sampleFieldName: 'patientAgeRangeTo',
                comparatorName: 'smallerEqualThan',
                voidIsTrue: false,
            }]
        }].forEach(mapping => this.registerFilterMapping(mapping));
    }
}








class Filter {

    constructor(comparators) {
        this.comparators = comparators;
    }



    applyToSample(sample) {
        return this.comparators.every(comparator => comparator.match(sample));
    }
}



class InfectFilter extends Filter {}








// the last statement will be returned to the vm executing the code. it must be a class constructor
// there can be no single statement after this, not event a new line
InfectFilterFactory