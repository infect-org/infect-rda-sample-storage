import ConfidenceIntervalCalculator from './lib/ConfidenceIntervalCalculator.js';
import PercentileCalculator from './lib/PercentileCalculator.js';


export default class InfectReducer {




    constructor() {
        this.ciClaculator = new ConfidenceIntervalCalculator();
        this.percentileCaluclator = new PercentileCalculator();

        // slots used for mic values. Each value will put into one of thos slots
        // 0.001 ... 0.512 + 1 ... 512
        this.micSlots = Array.apply(null, {length:10}).map((v, i) => Math.pow(2, i)/1000)
                .concat(Array.apply(null, {length:10}).map((v, i) => Math.pow(2, i)));

        // disc diffusion slots. each value will be assigned to one of the slots
        // 5 ... 50
        this.ddSlots = Array.apply(null, {length:46}).map((v, i) => i + 5);
    }
    

    async compute({ 
        dataSets,
        subRoutines,
        options: {
            sampleCountFilterLowerThreshold,
        } = {}
    }) {
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

        const discDiffusionPercentileSubRoutine = subRoutines.includes('DiscDiffusionPercentile');
        const micPercentileSubRoutine = subRoutines.includes('MICPercentileSubRoutine');


        // combine data
        for (const { shard, mappingResults } of dataSets) {
            for (const matrixPoint of mappingResults.values) {
                const id = `${matrixPoint.microorganismId},${matrixPoint.compoundSubstanceId}`;

                if (!matrix.has(id)) {
                    const data = {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                        modelCount: 0,
                        compoundSubstanceId: matrixPoint.compoundSubstanceId,
                        microorganismId: matrixPoint.microorganismId,
                        resistanceMICCount: 0,
                        resistanceDiscDiffusionCount: 0,
                        resistanceQualitativeCount: 0,
                    };

                    if (discDiffusionPercentileSubRoutine) {
                        data.discDiffusionValues = new Map(this.ddSlots.map(v => ([v, 0])));
                    }
                    if (micPercentileSubRoutine) {
                        data.MICValues = new Map(this.micSlots.map(v => ([v, 0])));
                    }

                    matrix.set(id, data);
                }

                const mapping = matrix.get(id);

                mapping.resistant += matrixPoint.resistant;
                mapping.intermediate += matrixPoint.intermediate;
                mapping.susceptible += matrixPoint.susceptible;
                mapping.modelCount += matrixPoint.modelCount;
                mapping.resistanceMICCount += matrixPoint.resistanceMICCount;
                mapping.resistanceDiscDiffusionCount += matrixPoint.resistanceDiscDiffusionCount;
                mapping.resistanceQualitativeCount += matrixPoint.resistanceQualitativeCount;


                if (discDiffusionPercentileSubRoutine && matrixPoint.discDiffusionValues) {
                    matrixPoint.discDiffusionValues = new Map(matrixPoint.discDiffusionValues);

                    for (const [key, value] of mapping.discDiffusionValues.entries()) {
                        mapping.discDiffusionValues.set(key, value + matrixPoint.discDiffusionValues.get(key));
                    }
                }

                if (micPercentileSubRoutine && matrixPoint.MICValues) {
                    matrixPoint.MICValues = new Map(matrixPoint.MICValues);

                    for (const [key, value] of mapping.MICValues.entries()) {
                        mapping.MICValues.set(key, value + matrixPoint.MICValues.get(key));
                    }
                }
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

            data.counters.resistanceMICCount += mappingResults.counters.resistanceMICCount;
            data.counters.resistanceDiscDiffusionCount += mappingResults.counters.resistanceDiscDiffusionCount;
            data.counters.resistanceQualitativeCount += mappingResults.counters.resistanceQualitativeCount;

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


        // compute ci, percentiles
        for (const matrixPoint of matrix.values()) {
            const ci = this.ciClaculator.compute({
                susceptibleCount: matrixPoint.susceptible,
                resistantCount: matrixPoint.resistant + matrixPoint.intermediate, 
            });

            matrixPoint.resistantPercent = Math.round(100 - matrixPoint.susceptible / (matrixPoint.intermediate + matrixPoint.susceptible + matrixPoint.resistant) * 100),
            matrixPoint.confidenceInterval = {
                upperBound: ci.confidenceIntervalUpperBound,
                lowerBound: ci.confidenceIntervalLowerBound,
            };

            if (matrixPoint.discDiffusionValues) {
                if (discDiffusionPercentileSubRoutine && matrixPoint.discDiffusionValues.size) {
                    matrixPoint.discDiffusionPercentile90 = this.percentileCaluclator.compute({
                        valueMap: matrixPoint.discDiffusionValues,
                    });
                }

                delete matrixPoint.discDiffusionValues;
            }

            if (matrixPoint.MICValues) {
                if (micPercentileSubRoutine && matrixPoint.MICValues.size) {
                    matrixPoint.MICPercentile90 = this.percentileCaluclator.compute({
                        valueMap: matrixPoint.MICValues,
                    });
                }

                delete matrixPoint.MICValues;
            }
        }

        // totals & results
        data.values = Array.from(matrix.values());
        data.timings.filteringPerShard = data.timings.filtering/data.shards.length;
        data.timings.reduction = Number(process.hrtime.bigint()- start)/1000000;
        data.counters.filteredPercent = Math.round(data.counters.filteredModelCount / data.counters.totalModelCount * 100, 2);

        return data;
    }
}