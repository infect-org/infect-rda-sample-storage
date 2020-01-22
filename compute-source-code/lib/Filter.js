



export default class Filter {

    constructor(comparators) {
        this.comparators = comparators;
    }


    debug() {
        this.debugMode = true;
    }


    applyToModel(model) {
        return this.comparators.every(comparator => comparator.match(model, this.debugMode));
    }
}
