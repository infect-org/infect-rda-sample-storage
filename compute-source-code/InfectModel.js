import Model from './lib/Model.js';


export default class InfectModel extends Model {


    constructor({
        animalId,
        compoundSubstanceId,
        countryId,
        dataSetId,
        datasetIdentifier,
        dataVersionId,
        dataVersionStatusIdentifier,
        isScreening,
        microorganismId,
        patientAgeRangeFrom,
        patientAgeRangeTo,
        patientSettingId,
        patientSexId,
        regionId,
        resistanceQualitative,
        resistanceQuantitativeDiscDiffusion,
        resistanceQuantitativeMic,
        sampleCollectionDate,
        sampleSourceBlood,
        sampleSourceIds,
        sampleSourceOther,
        sampleSourceUrine,
        uniqueIdentifier,
    } = {}) {
        super({
            animalId,
            compoundSubstanceId,
            countryId,
            dataVersionStatusIdentifier,
            isScreening,
            microorganismId,
            patientAgeRangeFrom,
            patientAgeRangeTo,
            patientSettingId,
            patientSexId,
            regionId,
            resistanceQualitative,
            resistanceQuantitativeDiscDiffusion,
            resistanceQuantitativeMic,
            sampleCollectionDate,
            sampleSourceBlood,
            sampleSourceIds,
            sampleSourceOther,
            sampleSourceUrine,
            uniqueIdentifier,
        });

        if (!resistanceQualitative) {
            this.setInValid();
        }

        if (!Number.isInteger(compoundSubstanceId) || !Number.isInteger(microorganismId)) {
            this.setInValid();
        }
    }
}