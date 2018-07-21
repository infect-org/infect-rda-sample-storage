

class Mapper {

    /**
    * the compute method is called by the vm
    * and gets passed an array of samples and
    * the filters that are sent from the frontend
    * application
    */
    async compute({rows, params}) {
        // samples have the following properties:
        // - bacteriumId (int)
        // - antibioticId (int)
        // - ageGroupId (int)
        // - regionId (int)
        // - sampleDate (timestamp)
        // - resistance (2 = resistant, 1 = intermediate, 0 = susceptible)


        // prepare filters
        const prapareStart = Date.now();
        const filters = this.prepareFilters(params);
        const preparationDuration = Date.now()-prapareStart;



        // were' mapping the data to nested maps
        // so that we can count the resistance on them
        const mappingMap = new Map();
        const filterStart = Date.now();
        rows.forEach((sample) => {
            if (this.satisfiesFilter(sample, filters)) {
                const id = `${sample.bacteriumId},${sample.antibioticId}`;

                if (!mappingMap.has(id)) {
                    mappingMap.set(id,  {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                        bacteriumId: sample.bacteriumId,
                        antibioticId: sample.antibioticId,
                    });
                }
                const mapping = mappingMap.get(id);
                if (sample.resistance === 2) mapping.resistant++;
                else if (sample.resistance === 1) mapping.intermediate++;
                else if (sample.resistance === 0) mapping.susceptible++;
            }
        });


        const filterDuration = Date.now()-filterStart;
        return {
            values: Array.from(mappingMap.values()),
            counters: {
                filteredSamples: mappingMap.size,
                totalSamples: rows.length,
                filteredPercentage: 100 - (mappingMap.size/rows.length*100),
            },
            timings: {
                preparation: preparationDuration,
                filtering: filterDuration,
            },
        }
    }






    /**
    * prepare filters
    */
    prepareFilters(filters) {
        return {
            ageGroupIds: new Set(filters && filters.ageGroupIds),
            regionIds: new Set(filters && filters.regionIds),
            hasAgeGroupFilter: !!(filters && filters.ageGroupIds && filters.ageGroupIds.length),
            hasRegionFilter: !!(filters && filters.regionIds && filters.regionIds.length),
            hasDateFilter: !!(filters && filters.dateFrom && filters.dateTo),
            dateFrom: filters && filters.dateFrom,
            dateTo: filters && filters.dateTo,
        }
    }





    /**
    * filter the samples
    */
    satisfiesFilter(sample, filters) {
        return (!filters.hasAgeGroupFilter || filters.ageGroupIds.has(sample.ageGroupId)) && 
            (!filters.hasRegionFilter || filters.hasRegionFilter.has(sample.regionId)) && 
            (!filters.hasDateFilter || sample.sampleDate >= filters.dateFrom && sample.sampleDate <= filters.dateTo)
    }
}



// the last statement will be returned to the vm
// executing the code. it must be a class constructor
// there can be no single statement after this, not 
// event a new line
Mapper