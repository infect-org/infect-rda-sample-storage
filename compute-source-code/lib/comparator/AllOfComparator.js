import Comparator from './Comparator.js';



export default class AllOfComparator extends Comparator {
    compare(model, debug) {
        return this.children.every((child) => child.match(model, debug));
    }

}