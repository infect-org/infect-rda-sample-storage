import ConfidenceIntervalCalculator from './lib/ConfidenceIntervalCalculator.js';


export default class InfectConfigurationReducer {




    constructor() {
        this.ciClaculator = new ConfidenceIntervalCalculator();
    }
    


    async compute(sampleSets, {
        sampleCountFilterLowerThreshold,
    } = {}) {
        const start = process.hrtime.bigint();
        const matrix = new Map();
        const data = {
            counters: {
                filteredModelCount: 0,
                totalModelCount: 0,
                invalidModelCount: 0,
            },
            timings: {
                preparation: 0,
                filtering: 0,
            },
            shards: [],
        };



        // combine data
        for (const { shard, mappingResults } of sampleSets) {
            for (const matrixPoint of mappingResults.values) {
                const id = `${matrixPoint.microorganismId},${matrixPoint.compoundSubstanceId}`;

                if (!matrix.has(id)) {
                    matrix.set(id, {
                        animalIds: new Set(),
                        regionIds: new Set(),
                        modelCount: 0,
                        compoundSubstanceId: matrixPoint.compoundSubstanceId,
                        microorganismId: matrixPoint.microorganismId,
                    });
                }

                const mapping = matrix.get(id);

                for (const id of matrixPoint.animalIds) {
                    mapping.animalIds.add(id);
                }

                for (const id of matrixPoint.regionIds) {
                    mapping.regionIds.add(id);
                }

                mapping.modelCount += matrixPoint.modelCount;
            };

            // also store shard specific state
            data.shards.push({
                ...shard,
                timings: mappingResults.timings,
                counters: mappingResults.counters,
            });

            // stats
            data.counters.filteredModelCount += mappingResults.counters.filteredModelCount;
            data.counters.totalModelCount += mappingResults.counters.totalModelCount;
            data.counters.invalidModelCount += mappingResults.counters.invalidModelCount;
            data.timings.preparation += mappingResults.timings.preparation;
            data.timings.filtering += mappingResults.timings.filtering;
        };


        // remove points by a given threshold for N
        if (sampleCountFilterLowerThreshold !== undefined) {
            for (const [ key, matrixPoint ] of matrix.entries()) {
                if (matrixPoint.modelCount <= sampleCountFilterLowerThreshold) {
                    matrix.delete(key);
                }
            }
        }

        const microorganismIds = new Set();
        const compoundSubstanceIds = new Set();
        const regionIds = new Set();
        const animalIds = new Set();


        for (const [ key, matrixPoint ] of matrix.entries()) {
            microorganismIds.add(matrixPoint.microorganismId);
            compoundSubstanceIds.add(matrixPoint.compoundSubstanceId);

            for (const id of matrixPoint.animalIds.values()) {
                animalIds.add(id);
            }

            for (const id of matrixPoint.regionIds.values()) {
                regionIds.add(id);
            }
        }


        data.microorganismIds = Array.from(microorganismIds.values());
        data.compoundSubstanceIds = Array.from(compoundSubstanceIds.values());
        data.regionIds = Array.from(regionIds.values());
        data.animalIds = Array.from(animalIds.values());


        // totals & results
        data.timings.filteringPerShard = data.timings.filtering/data.shards.length;
        data.timings.reduction = Number(process.hrtime.bigint()- start)/1000000;
        data.counters.filteredPercent = Math.round(data.counters.filteredModelCount / data.counters.totalModelCount * 100, 2);


        // filter samples, that have less than 6 samples
        //data.values = data.values.filter(value => value.modelCount > 5);

        return data;
    }
}