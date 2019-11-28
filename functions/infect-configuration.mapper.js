

class Mapper {

    /**
     * the compute method is called by the vm and gets passed an array of samples and the filters
     * that are sent from the frontend application. the resulting data must reflect all variations 
     * of bacteria and other properties do that the frontend application is aware which of them to
     * display for which data set
     *
     * @param      {Object}   arg1         The argument 1
     * @param      {array}    arg1.rows    array containing the records
     * @param      {object}   arg1.params  filter parameters
     */
    async compute({rows, params}) {
        // samples have the following properties:
        // - bacteriumId (int)
        // - antibioticId (int)
        // - ageGroupId (int)
        // - regionId (int)
        // - sampleDate (timestamp)
        // - resistance (2 = resistant, 1 = intermediate, 0 = susceptible)
        // - hospitalStatus (int)


        // prepare filters
        const prapareStart = Date.now();
        const filters = this.prepareFilters(params);
        const preparationDuration = Date.now()-prapareStart;



        const mappingMap = new Map();
        const filterStart = Date.now();
        let filteredSampleCount = 0;

        const bacteriumIds = new Set();
        const compoundIds = new Set();
        const regionIds = new Set();
        const ageGroupIds = new Set();


        rows.forEach((sample) => {
            if (this.satisfiesFilter(sample, filters)) {
                filteredSampleCount++;

                bacteriumIds.add(sample.bacteriumId);
                compoundIds.add(sample.antibioticId);
                regionIds.add(sample.regionId);
                ageGroupIds.add(sample.ageGroupId);
            }
        });


        return {
            bacteriumIds: Array.from(bacteriumIds.values()),
            compoundIds: Array.from(compoundIds.values()),
            regionIds: Array.from(regionIds.values()),
            ageGroupIds: Array.from(ageGroupIds.values()),
            counters: {
                filteredSamples: filteredSampleCount,
                totalSamples: rows.length,
                filteredPercentage: 100 - (filteredSampleCount/rows.length*100),
            },
            timings: {
                preparation: preparationDuration,
                filtering: Date.now()-filterStart,
            },
        }
    }






    /**
    * prepare filters
    */
    prepareFilters(filters) {
        return {
            ageGroupIds: new Set(filters && filters.ageGroupIds),
            dateFrom: filters && filters.dateFrom,
            dateTo: filters && filters.dateTo,
            hasAgeGroupFilter: !!(filters && filters.ageGroupIds && filters.ageGroupIds.length),
            hasDateFilter: !!(filters && filters.dateFrom && filters.dateTo),
            hasHospitalStatusFilter: !!(filters && filters.hospitalStatusIds && filters.hospitalStatusIds.length),
            hasRegionFilter: !!(filters && filters.regionIds && filters.regionIds.length),
            hospitalStatusIds: new Set(filters && filters.hospitalStatusIds),
            regionIds: new Set(filters && filters.regionIds),
        }
    }





    /**
    * filter the samples
    */
    satisfiesFilter(sample, filters) {
        return (!filters.hasAgeGroupFilter || filters.ageGroupIds.has(sample.ageGroupId)) && 
            (!filters.hasHospitalStatusFilter || filters.hospitalStatusIds.has(sample.hospitalStatusId)) && 
            (!filters.hasRegionFilter || filters.regionIds.has(sample.regionId)) && 
            (!filters.hasDateFilter || sample.sampleDate >= filters.dateFrom && sample.sampleDate <= filters.dateTo)
    }
}



// the last statement will be returned to the vm executing the code. it must be a class constructor
// there can be no single statement after this, not event a new line
Mapper