
export default class Comparator {

    constructor({
        voidIsTrue = false,
        modelFieldName,
        filterValue,
        children,
    } = {}) {
        if (!modelFieldName && !children) throw new Error(`Missing option 'modelFieldName'! or 'children'`);

        if (children && children.length) this.children = children;
        if (modelFieldName !== undefined) this.modelFieldName = modelFieldName;
        if (filterValue !== undefined) this.filterValue = filterValue;
        this.voidIsTrue = voidIsTrue;
    }


    match(model, debug) {
        if (!this.children) {
            const modelValue = model.getValue(this.modelFieldName);

            // allow empty values
            if (this.voidIsTrue && (modelValue === undefined || modelValue === null)) {
                return true;
            }

            const match = !!this.compare(modelValue);;
            if (debug) console.log(`[${this.constructor.name}] Match for ${this.modelFieldName} and modelValue ${modelValue} and filterValue ${this.filterValue} is ${match}`);
            return match;
        } else {
            return this.compare(model, debug);
        }
    }
}
