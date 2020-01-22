import Comparator from './Comparator.js';



export default class GreaterEqualThanComparator extends Comparator {
    compare(modelFieldValue) {
        return modelFieldValue >= this.filterValue;
    }
}