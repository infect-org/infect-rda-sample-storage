

class Reducer {

    /**
    * the compute method is called by the vm
    * and gets passed an array of samples and
    * the filters that are sent from the frontend
    * application
    */
    async compute(sampleSets) {
        const start = Date.now();
        const mappingMap = new Map();
        const data = {
            counters: {
                filteredSamples: 0,
                totalSamples: 0,
            },
            timings: {
                preparation: 0,
                filteringTotal: 0,
            },
            shards: [],
        };


        // combine data
        sampleSets.forEach(({shard, results}) => {
            results.values.forEach((item) => {
                const id = `${item.bacteriumId},${item.antibioticId}`;
                if (!mappingMap.has(id)) {
                    mappingMap.set(id, {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                        sampleCount: 0,
                        compoundId: item.antibioticId,
                        bacteriumId: item.bacteriumId,
                    });
                }
                const mapping = mappingMap.get(id);

                mapping.resistant += item.resistant;
                mapping.intermediate += item.intermediate;
                mapping.susceptible += item.susceptible;
                mapping.sampleCount += item.sampleCount;
            });

            // also store shard specific state
            data.shards.push({
                ...shard,
                timings: results.timings,
                counters: results.counters,
            });

            // stats
            data.counters.filteredSamples += results.counters.filteredSamples;
            data.counters.totalSamples += results.counters.totalSamples;
            data.timings.preparation += results.timings.preparation;
            data.timings.filteringTotal += results.timings.filtering;
        });





        // compute ci
        for (const mapping of mappingMap.values()) {
            const ci = this.getConfidenceInterval(mapping);

            mapping.resistantPercent = Math.round(100 - mapping.susceptible / (mapping.intermediate + mapping.susceptible + mapping.resistant) * 100),
            mapping.confidenceInterval = {
                upperBound: ci.confidenceIntervalUpperBound,
                lowerBound: ci.confidenceIntervalLowerBound,
            };
        }

        // totals & results
        data.values = Array.from(mappingMap.values());
        data.timings.filteringPerShard = Math.round(data.timings.filteringTotal/data.shards.length);
        data.timings.reduction = Date.now() - start;
        data.counters.filteredPercent = Math.round(data.counters.filteredSamples / data.counters.totalSamples * 100, 2);
        return data;
    }




    /**
    * computes the confidence interval
    */
    getConfidenceInterval(mapping) {
        const susceptibleCount = mapping.susceptible;
        const resistantCount = mapping.resistant + mapping.intermediate;
        const sampleCount = susceptibleCount + resistantCount;

        // do some shiny corrections, agresti-coull:
        // https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
        const proportionResistant = (resistantCount + 2) / (sampleCount + 4);

        // standard error value
        const stdandardError = Math.sqrt(proportionResistant * (1 - proportionResistant) / (sampleCount + 4));

        // lower confidence interval
        const lowerCI = Math.max(Math.round(((proportionResistant - 1.96 * stdandardError) * 100), 1), 0);

        // upper confidence interval
        const upperCI = Math.min(Math.round(((proportionResistant + 1.96 * stdandardError) * 100), 1), 100);

        return {
            confidenceIntervalLowerBound: lowerCI,
            confidenceIntervalUpperBound: upperCI,
            sampleCount: sampleCount,
        };
    }
}



// the last statement will be returned to the vm
// executing the code. it must be a class constructor
// there can be no single statement after this, not 
// event a new line
Reducer
