

class Reducer {

    /**
    * the compute method is called by the vm
    * and gets passed an array of samples and
    * the filters that are sent from the frontend
    * application
    */
    async compute(sampleSets, filters) {
        const bacteriumMap = new Map();

        sampleSets.forEach((set) => {
            if (!bacteriumMap.has(set.bacteriumId)) bacteriumMap.set(set.bacteriumId, new Map());
            const antibioticMap = bacteriumMap.get(set.bacteriumId);

            if (!antibioticMap.has(set.antibioticId)) {
                antibioticMap.set(set.antibioticId, {
                    resistant: 0,
                    intermediate: 0,
                    susceptible: 0,
                });
            }
            const mapping = antibioticMap.get(set.antibioticId);

            mapping.resistant += set.resistant;
            mapping.intermediate += set.intermediate;
            mapping.susceptible += set.susceptible;
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
Reducer