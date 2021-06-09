import InfectFilterFactory from './InfectFilterFactory.js';



export default class InfectMapper {
    

    constructor() {
        this.filterFactory = new InfectFilterFactory();

        // slots used for mic values. Each value will put into one of thos slots
        // 0.001 ... 0.512 + 1 ... 512
        this.micSlots = Array.apply(null, {length:10}).map((v, i) => Math.pow(2, i)/1000)
                .concat(Array.apply(null, {length:10}).map((v, i) => Math.pow(2, i)));

        // disc diffusion slots. each value will be assigned to one of the slots
        // 5 ... 50
        this.ddSlots = Array.apply(null, {length:46}).map((v, i) => i + 5);
    }




    async load() {
        await this.filterFactory.load();
    }


    async compute({ models, filterConfiguration, subRoutines = [] }) {
        const prapareStart = process.hrtime.bigint();
        const filter = this.filterFactory.createFilter(filterConfiguration);
        const preparationDuration = process.hrtime.bigint()-prapareStart;


        // were' mapping the data to nested maps
        // so that we can count the resistance on them
        const mappingMap = new Map();
        const filterStart = process.hrtime.bigint();

        let filteredModelCount = 0;
        let invalidModelCount = 0;
        let resistanceMICCount = 0;
        let resistanceDiscDiffusionCount = 0;
        let resistanceQualitativeCount = 0;

        // flags
        const discDiffusionPercentileSubRoutine = subRoutines.includes('DiscDiffusionPercentile');
        const micPercentileSubRoutine = subRoutines.includes('MICPercentileSubRoutine');

        for (const model of models) {
            if (!model.isValid()) {
                invalidModelCount++;
            } else if (model.satisfiesFilter(filter)) {
                const id = `${model.microorganismId},${model.compoundSubstanceId}`;

                if (!mappingMap.has(id)) {
                    const data = {
                        resistant: 0,
                        intermediate: 0,
                        susceptible: 0,
                        microorganismId: model.microorganismId,
                        compoundSubstanceId: model.compoundSubstanceId,
                        modelCount: 0,
                        resistanceMICCount: 0,
                        resistanceDiscDiffusionCount: 0,
                        resistanceQualitativeCount: 0,
                    };

                    if (discDiffusionPercentileSubRoutine) {
                        data.discDiffusionValues = new Map(this.ddSlots.map(v => ([v, 0])));
                    }
                    if (micPercentileSubRoutine) {
                        data.MICValues = new Map(this.micSlots.map(v => ([v, 0])));
                    }


                    mappingMap.set(id, data);
                }

                const mapping = mappingMap.get(id);


                if (model.hasValue('resistanceQualitative')) {
                    mapping.resistanceQualitativeCount++;
                    resistanceQualitativeCount++;

                    if (model.resistanceQualitative === 'r') mapping.resistant++;
                    else if (model.resistanceQualitative === 'i') mapping.intermediate++;
                    else if (model.resistanceQualitative === 's') mapping.susceptible++;
                }


                if (model.hasValue('resistanceQuantitativeMic')) {
                    resistanceMICCount++;
                    mapping.resistanceMICCount++;

                    if (micPercentileSubRoutine) {
                        this.addValueToSlot(this.micSlots, mapping.MICValues, model.getValue('resistanceQuantitativeMic'), true);
                    }
                }
                

                if (model.hasValue('resistanceQuantitativeDiscDiffusion')) {
                    resistanceDiscDiffusionCount++;
                    mapping.resistanceDiscDiffusionCount++;

                    if (discDiffusionPercentileSubRoutine) {
                        this.addValueToSlot(this.ddSlots, mapping.discDiffusionValues, model.getValue('resistanceQuantitativeDiscDiffusion'), false);
                    }
                }

                mapping.modelCount++;
            } else {
                filteredModelCount++;
            }
        };


        const filterDuration = process.hrtime.bigint()-filterStart;
        const divider = BigInt(1000000);
        return {
            values: Array.from(mappingMap.values()),
            counters: {
                filteredModelCount,
                invalidModelCount,
                totalModelCount: models.length,
                filteredPercentage: ((filteredModelCount + invalidModelCount)/models.length*100),
                resistanceMICCount,
                resistanceDiscDiffusionCount,
                resistanceQualitativeCount,
            },
            timings: {
                preparation: Number(preparationDuration)/1000000,
                filtering: Number(filterDuration)/1000000,
            },
        }
    }



    /**
     * assigns a value to a given slot by mathicng it and rounding it up or down
     * if it doesn't match to a slot
     *
     * @param      {array}    slots           predefined array of slots that
     *                                        exist
     * @param      {map}      sampleSlots     the slots that store the counters
     *                                        on the matrix points
     * @param      {number}   sampleValue     the current value
     * @param      {boolean}  [roundUp=true]  round up or down?
     */
    addValueToSlot(slots, sampleSlots, sampleValue, roundUp = true) {

        // set to first of the slots
        let previousSlotKey = slots[0];
        let lastSlotKey = slots[slots.length -1];

        // find the correct slot for the value
        for (const slotKey of slots) {
            if (sampleValue === slotKey) {

                // value matches slot, put it there
                sampleSlots.set(slotKey, sampleSlots.get(slotKey) + 1);
            } else if (sampleValue < slotKey) {

                // value is smaller than that before, put it in the current
                // slot if rounding up or the previous if rounding down
                const key = roundUp ? slotKey : previousSlotKey;
                sampleSlots.set(key, sampleSlots.get(key) + 1);
            } else if (slotKey === lastSlotKey) {

                // put the last value in the last slot
                sampleSlots.set(slotKey, sampleSlots.get(slotKey) + 1);
            } else {
                previousSlotKey = slotKey;
                continue;
            }

            // isn't encountered when the els statement is executed
            break;
        }
    }
}