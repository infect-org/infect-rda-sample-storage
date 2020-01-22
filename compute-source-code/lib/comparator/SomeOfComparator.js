import Comparator from './Comparator.js';



export default class SomeOfComparator extends Comparator {
    compare(model, debug) {
        return this.children.some((child) => child.match(model, debug));
    }

}
