

export default class PercentileCalculator {



    compute({
        values,
        min,
        percentile = 90,
        slotCount = 25,
        logScale = false,
    }) {
        const sortedValues = values.slice();
        sortedValues.sort((a, b) => a - b);

        let index = sortedValues.length * (percentile / 100);
        const result = { percentile, slotCount };

        if (Number.isInteger(index)) {
            if (index + 1 === values.length) {
                result.percentileValue = sortedValues[index -1];
            } else {
                result.percentileValue = (sortedValues[index -1] + sortedValues[index]) / 2;
            }
        } else {
            index = Math.ceil(index);
            result.percentileValue = sortedValues[index -1];
        }

        // create slots
        const slots = [];
        result.slots = slots;

        if (min === undefined) min = sortedValues[0];
        const max = sortedValues[sortedValues.length - 1];

        result.rangeMin = min;
        result.rangeMax = max;


        if (logScale) {
            let currentIndex = sortedValues.length -1;
            let currentMin;
            let currentMax = max;
            let currentSlotIndex = slotCount -1;

            while (currentSlotIndex >= 0) {
                currentMin = currentSlotIndex === 0 ? 0 : Math.floor(currentMax/2*100)/100;

                slots[currentSlotIndex] = {
                    fromValue: currentMin,
                    toValue: currentMax,
                    sampleCount: 0,
                };

                while (currentIndex >= 0 && sortedValues[currentIndex] >= currentMin) {
                    slots[currentSlotIndex].sampleCount++;
                    currentIndex--;
                }

                currentMax = currentMin;
                currentSlotIndex--;
            }
        } else {
            const slotSize = (max - min) / slotCount;
            result.slotSize = slotSize;

            let valueIndex = 0;

            for (let i = 0; i < slotCount; i++) {
                const currentMin = min + i * slotSize;
                const currentMax = min + (i + 1) * slotSize;

                slots[i] = {
                    fromValue: currentMin,
                    toValue:currentMax,
                    sampleCount: 0,
                };

                while(sortedValues.length > valueIndex && 
                      sortedValues[valueIndex] > currentMin && 
                      sortedValues[valueIndex] <= currentMax) {

                    slots[i].sampleCount++;
                    valueIndex++;
                }
            }
        }
        

        return result;
    }
}