import InfectFilterFactory from './InfectFilterFactory.js';



export default class InfectMapper {
    

    constructor() {
        this.filterFactory = new InfectFilterFactory();
    }



    async load() {
        await this.filterFactory.load();
    }


    async compute({ models, filterConfiguration, subRoutines = [] }) {
        const prapareStart = process.hrtime.bigint();
        const filter = this.filterFactory.createFilter(filterConfiguration);
        const preparationDuration = process.hrtime.bigint()-prapareStart;


        // were' mapping the data to nested maps
        // so that we can count the resistance on them
        const mappingMap = new Map();
        const filterStart = process.hrtime.bigint();

        let filteredModelCount = 0;
        let invalidModelCount = 0;
        let resistanceMICCount = 0;
        let resistanceDiscDiffusionCount = 0;
        let resistanceQualitativeCount = 0;

        // flags
        const discDiffusionPercentileSubRoutine = subRoutines.includes('DiscDiffusionPercentile');
        const micPercentileSubRoutine = subRoutines.includes('MICPercentileSubRoutine');

        for (const model of models) {
            if (!model.isValid()) {
                invalidModelCount++;
            } else if (model.satisfiesFilter(filter)) {
                const id = `${model.microorganismId},${model.compoundSubstanceId}`;

                if (!mappingMap.has(id)) {
                    const data = {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                        microorganismId: model.microorganismId,
                        compoundSubstanceId: model.compoundSubstanceId,
                        modelCount: 0,
                        resistanceMICCount: 0,
                        resistanceDiscDiffusionCount: 0,
                        resistanceQualitativeCount: 0,
                    };

                    if (discDiffusionPercentileSubRoutine) data.discDiffusionValues = [];
                    if (micPercentileSubRoutine) data.MICValues = [];

                    mappingMap.set(id, data);
                }

                const mapping = mappingMap.get(id);


                if (model.hasValue('resistanceQualitative')) {
                    mapping.resistanceQualitativeCount++;
                    resistanceQualitativeCount++;

                    if (model.resistanceQualitative === 'r') mapping.resistant++;
                    else if (model.resistanceQualitative === 'i') mapping.intermediate++;
                    else if (model.resistanceQualitative === 's') mapping.susceptible++;
                }


                if (model.hasValue('resistanceQuantitativeMic')) {
                    resistanceMICCount++;
                    mapping.resistanceMICCount++;

                    if (micPercentileSubRoutine) {
                        mapping.MICValues.push(model.getValue('resistanceQuantitativeMic'));
                    }
                }
                

                if (model.hasValue('resistanceQuantitativeDiscDiffusion')) {
                    resistanceDiscDiffusionCount++;
                    mapping.resistanceDiscDiffusionCount++;

                    if (discDiffusionPercentileSubRoutine) {
                        mapping.discDiffusionValues.push(model.getValue('resistanceQuantitativeDiscDiffusion'));
                    }
                }

                mapping.modelCount++;
            } else {
                filteredModelCount++;
            }
        };


        const filterDuration = process.hrtime.bigint()-filterStart;
        const divider = BigInt(1000000);
        return {
            values: Array.from(mappingMap.values()),
            counters: {
                filteredModelCount,
                invalidModelCount,
                totalModelCount: models.length,
                filteredPercentage: ((filteredModelCount + invalidModelCount)/models.length*100),
                resistanceMICCount,
                resistanceDiscDiffusionCount,
                resistanceQualitativeCount,
            },
            timings: {
                preparation: Number(preparationDuration)/1000000,
                filtering: Number(filterDuration)/1000000,
            },
        }
    }
}