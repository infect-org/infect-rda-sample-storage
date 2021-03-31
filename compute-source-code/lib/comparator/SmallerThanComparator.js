import Comparator from './Comparator.js';



export default class SmallerThanComparator extends Comparator {

    static name = 'smaller-than';

    compare(modelFieldValue) {
        return modelFieldValue < this.filterValue;
    }
}