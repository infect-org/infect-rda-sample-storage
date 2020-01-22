

export default class Model {


    constructor(values) {
        for (const [key, value] of Object.entries(values)) {
            this[key] = value;
        }

        this.modelIsValid = true;
    }


    satisfiesFilter(filter) {
        return filter.applyToModel(this);
    }



    isValid() {
        return !!this.modelIsValid;
    }


    setInValid() {
        this.modelIsValid = false;
    }



    getValue(valueName) {
        if (!this.isValid) {
            throw new Error(`Cannot return value '${valueName}' for model with the unique identifier '${this.uniqueIdentifier}'. The model is invalid!`);
        }
        
        return this[valueName];
    }
}