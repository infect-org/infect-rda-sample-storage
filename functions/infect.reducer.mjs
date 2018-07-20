

class Reducer {

    /**
    * the compute method is called by the vm
    * and gets passed an array of samples and
    * the filters that are sent from the frontend
    * application
    */
    async compute(sampleSets, filters) {
        const bacteriumMap = new Map();


        // combine data
        sampleSets.forEach((set) => {
            set.forEach((item) => {
                if (!bacteriumMap.has(item.bacteriumId)) bacteriumMap.set(item.bacteriumId, new Map());
                const antibioticMap = bacteriumMap.get(item.bacteriumId);

                if (!antibioticMap.has(item.antibioticId)) {
                    antibioticMap.set(item.antibioticId, {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                    });
                }
                const mapping = antibioticMap.get(item.antibioticId);

                mapping.resistant += item.resistant;
                mapping.intermediate += item.intermediate;
                mapping.susceptible += item.susceptible;
            });
        });
        


        // flatten data
        const values = [];

        for (const [bacteriumId, antibioticMap] of bacteriumMap.entries()) {
            for (const [antibioticId, resistance] of antibioticMap.entries()) {
                values.push({
                    bacteriumId,
                    antibioticId,
                    resistant: resistance.resistant,
                    intermediate: resistance.intermediate,
                    susceptible: resistance.susceptible,
                    resistantPercent: Math.round(100 - resistance.susceptible / (resistance.intermediate + resistance.susceptible + resistance.resistant) * 100),
                    ...this.getConfidenceInterval(resistance)
                });
            }
        }



        // do some counting
        let sampleCount = 0;

        values.forEach((value) => {
            sampleCount += value.resistant;
            sampleCount += value.intermediate;
            sampleCount += value.susceptible;
        });


        return {
            values,
            sampleCount,
        };
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
        const someVariable = (resistantCount + 2) / (sampleCount + 4);

        // standard error value
        const stdandardError = Math.sqrt(someVariable * (1 - someVariable) / someVariable);

        // lower confidence interval
        const lowerCI = Math.max(Math.round(((someVariable - 1.96 * stdandardError) * 100), 1), 0);

        // upper confidence interval
        const upperCI = Math.min(Math.round(((someVariable + 1.96 * stdandardError) * 100), 1), 100);

        return {
            confidenceIntervalLowerBound: lowerCI,
            confidenceIntervalHigherBound: upperCI,
            sampleCount: sampleCount,
        };
    }
}



// the last statement will be returned to the vm
// executing the code. it must be a class constructor
// there can be no single statement after this, not 
// event a new line
Reducer