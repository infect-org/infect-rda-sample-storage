import Model from './lib/Model.js';


export default class InfectModel extends Model {


    constructor({
        animalId,
        compoundSubstanceId,
        countryId,
        isScreening,
        microorganismId,
        patientAgeRangeFrom,
        patientAgeRangeTo,
        patientSettingId,
        patientSexId,
        regionId,
        resistanceQualitative,
        sampleCollectionDate,
        sampleSourceBlood,
        sampleSourceOther,
        sampleSourceUrine,
        uniqueIdentifier,
        dataVersionId,
        dataSetId,
        datasetIdentifier,
    } = {}) {
        super({
            animalId,
            compoundSubstanceId,
            countryId,
            isScreening,
            microorganismId,
            patientAgeRangeFrom,
            patientAgeRangeTo,
            patientSettingId,
            patientSexId,
            regionId,
            resistanceQualitative,
            sampleCollectionDate,
            sampleSourceBlood,
            sampleSourceOther,
            sampleSourceUrine,
            uniqueIdentifier,
        });

        if (!Number.isInteger(compoundSubstanceId) || !Number.isInteger(microorganismId)) {
            this.setInValid();
        }
    }
}