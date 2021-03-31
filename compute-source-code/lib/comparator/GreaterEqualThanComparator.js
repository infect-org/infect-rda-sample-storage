import Comparator from './Comparator.js';



export default class GreaterEqualThanComparator extends Comparator {

    static name = 'greater-equal-than';

    compare(modelFieldValue) {
        return modelFieldValue >= this.filterValue;
    }
}