

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
                        sampleCount: 0,
                        compoundId: item.antibioticId,
                        bacteriumId: item.bacteriumId,
                        regionId: item.regionId,
                        ageGroupId: item.ageGroupId,
                    });
                }
                const mapping = mappingMap.get(id);
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


        // totals & results
        let values = Array.from(mappingMap.values());
        data.timings.filteringPerShard = Math.round(data.timings.filteringTotal/data.shards.length);
        data.counters.filteredPercent = Math.round(data.counters.filteredSamples / data.counters.totalSamples * 100, 2);


        // filter samples, that have less than 6 samples
        values = values.filter(value => value.sampleCount > 5);


        const bacteriumIds = new Set();
        const compoundIds = new Set();
        const regionIds = new Set();
        const ageGroupIds = new Set();


        // combine data
        values.forEach((value) => {
            bacteriumIds.add(value.bacteriumId);
            compoundIds.add(value.compoundId);
            regionIds.add(value.regionId);
            ageGroupIds.add(value.ageGroupId);
        });


        data.bacteriumIds = Array.from(bacteriumIds.values());
        data.compoundIds = Array.from(compoundIds.values());
        data.regionIds = Array.from(regionIds.values());
        data.ageGroupIds = Array.from(ageGroupIds.values());
        data.animalIds = [];


        data.timings.reduction = Date.now() - start;

        return data;
    }
}



// the last statement will be returned to the vm
// executing the code. it must be a class constructor
// there can be no single statement after this, not 
// event a new line
Reducer