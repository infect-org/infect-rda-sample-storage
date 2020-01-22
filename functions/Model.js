

class Sample {


    constructor({
        animal,
        country,
        isScreening,
        microorganismId,
        patientAgeRangeFrom,
        patientAgeRangeTo,
        patientSettingId,
        patientSex,
        region,
        sampleCollectionDate,
        sampleSourceBlood,
        sampleSourceOther,
        sampleSourceUrine,
        compoundSubstanceId,
        uniqueIdentifier,
        resistanceQualitative,
    }) {
        this.uniqueIdentifier = uniqueIdentifier;

        // filterable int values
        this.animalId = animal;
        this.countryId = country;
        this.patientSettingId = patientSettingId;
        this.patientSexId = patientSex;
        this.regionId = region;

        // other filterable value
        this.patientAgeRangeFrom = patientAgeRangeFrom;
        this.patientAgeRangeTo = patientAgeRangeTo;

        this.isScreening = isScreening;
        this.sampleCollectionDate = sampleCollectionDate;

        this.sampleSourceBlood = sampleSourceBlood;
        this.sampleSourceOther = sampleSourceOther;
        this.sampleSourceUrine = sampleSourceUrine;

        // actual values to be collected by rda
        this.microorganismId = microorganismId;
        this.compoundSubstanceId = compoundSubstanceId;
        this.resistanceQualitative = resistanceQualitative;
    }



    satisfiesFilter(filter) {
        return filter.applyToSample(this);
    }
}




// the last statement will be returned to the vm executing the code. it must be a class constructor
// there can be no single statement after this, not event a new line
Sample