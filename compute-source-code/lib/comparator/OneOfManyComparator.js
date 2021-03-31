import Comparator from './Comparator.js';



export default class OneOfManyComparator extends Comparator  {

    static name = 'one-of-many';

    compare(modelFieldValue) {
        return this.filterValue.some(value => modelFieldValue.includes(value));
    }
}
