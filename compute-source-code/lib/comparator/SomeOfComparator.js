import Comparator from './Comparator.js';



export default class SomeOfComparator extends Comparator {

    static name = 'some-of';

    compare(model, debug) {
        return this.children.some((child) => child.match(model, debug));
    }

}
