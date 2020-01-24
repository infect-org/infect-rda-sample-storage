import InfectFilterFactory from './InfectFilterFactory.js';



export default class InfectConfigurationMapper {
    

    constructor() {
        this.filterFactory = new InfectFilterFactory();
    }



    async load() {
        await this.filterFactory.load();
    }


    async compute({ models, filterConfiguration }) {
        const prapareStart = process.hrtime.bigint();
        const filter = this.filterFactory.createFilter(filterConfiguration);
        const preparationDuration = process.hrtime.bigint()-prapareStart;


        const filterStart = process.hrtime.bigint();
        const matrixMap = new Map();
        let filteredModelCount = 0;
        let invalidModelCount = 0;

        for (const model of models) {
            if (!model.isValid()) {
                invalidModelCount++;
            } else if (model.satisfiesFilter(filter)) {
                const id = `${model.microorganismId},${model.compoundSubstanceId}`;

                if (!matrixMap.has(id)) {
                    matrixMap.set(id,  {
                        animalIds: new Set(),
                        regionIds: new Set(),
                        microorganismId: model.microorganismId,
                        compoundSubstanceId: model.compoundSubstanceId,
                        modelCount: 0,
                    });
                }

                const matrixPoint = matrixMap.get(id);

                if (model.hasValue('animalId')) matrixPoint.animalIds.add(model.getValue('animalId'));
                if (model.hasValue('regionId')) matrixPoint.regionIds.add(model.getValue('regionId'));
                matrixPoint.modelCount++;
            } else {
                filteredModelCount++;
            }
        };

        for (const matrixPoint of matrixMap.values()) {
            matrixPoint.animalIds = [...matrixPoint.animalIds.values()];
            matrixPoint.regionIds = [...matrixPoint.regionIds.values()];
        }

        const filterDuration = process.hrtime.bigint()-filterStart;
        const divider = BigInt(1000000);
        return {
            values: [...matrixMap.values()],
            counters: {
                filteredModelCount,
                invalidModelCount,
                totalModelCount: models.length,
                filteredPercentage: ((filteredModelCount + invalidModelCount)/models.length*100),
            },
            timings: {
                preparation: Number(preparationDuration)/1000000,
                filtering: Number(filterDuration)/1000000,
            },
        }
    }
}