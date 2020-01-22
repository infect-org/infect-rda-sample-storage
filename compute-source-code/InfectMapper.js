import InfectFilterFactory from './InfectFilterFactory.js';



export default class InfectMapper {
    

    constructor() {
        this.filterFactory = new InfectFilterFactory();
    }



    async load() {
        await this.filterFactory.load();
    }


    async compute({ models, filterConfiguration }) {
        const prapareStart = process.hrtime.bigint();
        const filter = this.filterFactory.createFilter(filterConfiguration);
        const preparationDuration = process.hrtime.bigint()-prapareStart;


        // were' mapping the data to nested maps
        // so that we can count the resistance on them
        const mappingMap = new Map();
        const filterStart = process.hrtime.bigint();
        let filteredModelCount = 0;
        let invalidModelCount = 0;

        for (const model of models) {
            if (!model.isValid()) {
                invalidModelCount++;
            } else if (model.satisfiesFilter(filter)) {
                const id = `${model.microorganismId},${model.compoundSubstanceId}`;

                if (!mappingMap.has(id)) {
                    mappingMap.set(id,  {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                        microorganismId: model.microorganismId,
                        compoundSubstanceId: model.compoundSubstanceId,
                        modelCount: 0,
                    });
                }
                const mapping = mappingMap.get(id);
                
                if (model.resistanceQualitative === 'r') mapping.resistant++;
                else if (model.resistanceQualitative === 'i') mapping.intermediate++;
                else if (model.resistanceQualitative === 's') mapping.susceptible++;

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
            },
            timings: {
                preparation: Number(preparationDuration)/1000000,
                filtering: Number(filterDuration)/1000000,
            },
        }
    }
}