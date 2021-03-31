import Comparator from './Comparator.js';



export default class OneOfComparator extends Comparator  {

    static name = 'one-of';

    compare(modelFieldValue) {
        return this.filterValue.includes(modelFieldValue);
    }
}
