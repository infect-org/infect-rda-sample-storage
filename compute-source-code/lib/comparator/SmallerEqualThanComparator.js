import Comparator from './Comparator.js';


export default class SmallerEqualThanComparator extends Comparator {

    static name = 'smaller-equal-than';

    compare(modelFieldValue) {
        return modelFieldValue <= this.filterValue;
    }
}
