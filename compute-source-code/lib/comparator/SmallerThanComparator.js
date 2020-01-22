import Comparator from './Comparator.js';



export default class SmallerThanComparator extends Comparator {
    compare(modelFieldValue) {
        return modelFieldValue < this.filterValue;
    }
}