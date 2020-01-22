import ConfidenceIntervalCalculator from './lib/ConfidenceIntervalCalculator.js';


export default class InfectReducer {




    constructor() {
        this.ciClaculator = new ConfidenceIntervalCalculator();
    }
    


    async compute(sampleSets) {
        const start = process.hrtime.bigint();
        const mappingMap = new Map();
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

                if (!mappingMap.has(id)) {
                    mappingMap.set(id, {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                        modelCount: 0,
                        compoundSubstanceId: matrixPoint.compoundSubstanceId,
                        microorganismId: matrixPoint.microorganismId,
                    });
                }

                const mapping = mappingMap.get(id);

                mapping.resistant += matrixPoint.resistant;
                mapping.intermediate += matrixPoint.intermediate;
                mapping.susceptible += matrixPoint.susceptible;
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


        // compute ci
        for (const mapping of mappingMap.values()) {
            const ci = this.ciClaculator.compute({
                susceptibleCount: mapping.susceptible,
                resistantCount: mapping.resistant + mapping.intermediate, 
            });

            mapping.resistantPercent = Math.round(100 - mapping.susceptible / (mapping.intermediate + mapping.susceptible + mapping.resistant) * 100),
            mapping.confidenceInterval = {
                upperBound: ci.confidenceIntervalUpperBound,
                lowerBound: ci.confidenceIntervalLowerBound,
            };
        }

        // totals & results
        data.values = Array.from(mappingMap.values());
        data.timings.filteringPerShard = data.timings.filtering/data.shards.length;
        data.timings.reduction = Number(process.hrtime.bigint()- start)/1000000;
        data.counters.filteredPercent = Math.round(data.counters.filteredModelCount / data.counters.totalModelCount * 100, 2);


        // filter samples, that have less than 6 samples
        //data.values = data.values.filter(value => value.modelCount > 5);

        return data;
    }



    /**
    * computes the confidence interval
    */
    getConfidenceInterval(mapping) {
        const susceptibleCount = mapping.susceptible;
        const resistantCount = mapping.resistant + mapping.intermediate;
        const modelCount = susceptibleCount + resistantCount;

        // do some shiny corrections, agresti-coull:
        // https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
        const someVariable = (resistantCount + 2) / (modelCount + 4);

        // standard error value
        const stdandardError = Math.sqrt(someVariable * (1 - someVariable) / (modelCount + 4));

        // lower confidence interval
        const lowerCI = Math.max(Math.round(((someVariable - 1.96 * stdandardError) * 100), 1), 0);

        // upper confidence interval
        const upperCI = Math.min(Math.round(((someVariable + 1.96 * stdandardError) * 100), 1), 100);

        return {
            confidenceIntervalLowerBound: lowerCI,
            confidenceIntervalUpperBound: upperCI,
            modelCount,
        };
    }
}