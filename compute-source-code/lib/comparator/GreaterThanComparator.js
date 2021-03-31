import Comparator from './Comparator.js';




export default class GreaterThanComparator extends Comparator {

    static name = 'greater-than';

    compare(modelFieldValue) {
        return modelFieldValue > this.filterValue;
    }
}