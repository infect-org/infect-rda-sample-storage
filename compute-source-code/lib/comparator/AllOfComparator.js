import Comparator from './Comparator.js';



export default class AllOfComparator extends Comparator {

    static name = 'all-of';

    compare(model, debug) {
        return this.children.every((child) => child.match(model, debug));
    }

}