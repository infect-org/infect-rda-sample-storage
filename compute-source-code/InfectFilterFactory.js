import FilterFactory from './lib/FilterFactory.js';
import InfectFilter from './InfectFilter.js'


export default class InfectFilterFactory extends FilterFactory {

    async load() {
        await super.load();

        this.FilterConstructor = InfectFilter;

        const mapping = [{
            filterFieldName: 'dataVersionIds',
            modelFieldName: 'dataVersionId',
            comparatorName: 'one-of',
            voidIsTrue: false,
        }, {
            filterFieldName: 'animalIds',
            modelFieldName: 'animalId',
            comparatorName: 'one-of',
            voidIsTrue: false,
        }, {
            filterFieldName: 'countryIds',
            modelFieldName: 'countryId',
            comparatorName: 'one-of',
            voidIsTrue: false,
        }, {
            filterFieldName: 'patientSettingIds',
            modelFieldName: 'patientSettingId',
            comparatorName: 'one-of',
            voidIsTrue: false,
        }, {
            filterFieldName: 'patientSexIds',
            modelFieldName: 'patientSexId',
            comparatorName: 'one-of',
            voidIsTrue: false,
        }, {
            filterFieldName: 'regionIds',
            modelFieldName: 'regionId',
            comparatorName: 'one-of',
            voidIsTrue: false,
        }, {
            filterFieldName: 'dataVersionStatusIdentifier',
            modelFieldName: 'dataVersionStatusIdentifier',
            comparatorName: 'one-of',
            voidIsTrue: false,
        }, {
            filterFieldName: 'ageGroupIntervals',
            comparatorName: 'some-of',
            voidIsTrue: false,
            children: [{
                filterFieldName: '$array-value',
                comparatorName: 'all-of',
                voidIsTrue: false,
                children: [{
                    filterFieldName: 'daysFrom',
                    modelFieldName: 'patientAgeRangeFrom',
                    comparatorName: 'greater-equal-than',
                    voidIsTrue: false,
                }, {
                    filterFieldName: 'daysTo',
                    modelFieldName: 'patientAgeRangeTo',
                    comparatorName: 'smaller-equal-than',
                    voidIsTrue: false,
                }]
            }]
        }].forEach(mapping => this.registerFilterMapping(mapping));
    }
}
