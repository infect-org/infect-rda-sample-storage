import Comparator from './Comparator.js';


export default class SmallerEqualThanComparator extends Comparator {
    compare(modelFieldValue) {
        return modelFieldValue <= this.filterValue;
    }
}
