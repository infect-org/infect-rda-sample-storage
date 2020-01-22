import Comparator from './Comparator.js';




export default class GreaterThanComparator extends Comparator {
    compare(modelFieldValue) {
        return modelFieldValue > this.filterValue;
    }
}