

class Mapper {

    /**
    * the compute method is called by the vm
    * and gets passed an array of samples and
    * the filters that are sent from the frontend
    * application
    */
    async compute(samples, filters) {
        // samples have the following properties:
        // - bacteriumId (int)
        // - antibioticId (int)
        // - ageGroupId (int)
        // - regionId (int)
        // - sampleDate (timestamp)
        // - resistance (2 = resistant, 1 = intermediate, 0 = susceptible)

        // were' mapping the data to nested maps
        // so that we can count the resistance on them
        const bacteriumMap = new Map();

        samples.forEach((sample) => {
            if (!bacteriumMap.has(sample.bacteriumId)) bacteriumMap.set(sample.bacteriumId, new Map());
            const antibioticMap = bacteriumMap.get(sample.bacteriumId);

            if (!antibioticMap.has(sample.antibioticId)) {
                antibioticMap.set(sample.antibioticId, {
                    resistant: 0,
                    intermediate: 0,
                    susceptible: 0,
                });
            }
            const mapping = antibioticMap.get(sample.antibioticId);

            if (sample.resistance === 2) mapping.resistant++;
            else if (sample.resistance === 1) mapping.intermediate++;
            else if (sample.resistance === 0) mapping.susceptible++;
        });


        // create an array from the data
        const values = [];


        for (const [bacteriumId, antibioticMap] of bacteriumMap.entries()) {
            for (const [antibioticId, resistance] of antibioticMap.entries()) {
                values.push({
                    bacteriumId,
                    antibioticId,
                    resistant: resistance.resistant,
                    intermediate: resistance.intermediate,
                    susceptible: resistance.susceptible,
                });
            }
        }


        return values;
    }
}



// the last statement will be returned to the vm
// executing the code. it must be a class constructor
// there can be no single statement after this, not 
// event a new line
Mapper