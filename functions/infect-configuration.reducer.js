

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


        const bacteriumIds = new Set();
        const compoundIds = new Set();
        const regionIds = new Set();
        const ageGroupIds = new Set();


        // combine data
        sampleSets.forEach(({shard, results}) => {
            results.bacteriumIds.forEach(id => bacteriumIds.add(id));
            results.compoundIds.forEach(id => compoundIds.add(id));
            results.regionIds.forEach(id => regionIds.add(id));
            results.ageGroupIds.forEach(id => ageGroupIds.add(id));

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


        data.bacteriumIds = Array.from(bacteriumIds.values());
        data.compoundIds = Array.from(compoundIds.values());
        data.regionIds = Array.from(regionIds.values());
        data.ageGroupIds = Array.from(ageGroupIds.values());
        data.animalIds = [];


        // totals & results
        data.timings.filteringPerShard = Math.round(data.timings.filteringTotal/data.shards.length);
        data.timings.reduction = Date.now() - start;
        data.counters.filteredPercent = Math.round(data.counters.filteredSamples / data.counters.totalSamples * 100, 2);
        return data;
    }
}



// the last statement will be returned to the vm
// executing the code. it must be a class constructor
// there can be no single statement after this, not 
// event a new line
Reducer