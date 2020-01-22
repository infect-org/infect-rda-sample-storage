import Comparator from './Comparator.js';



export default class OneOfComparator extends Comparator  {
    compare(modelFieldValue) {
        return this.filterValue.includes(modelFieldValue);
    }
}
