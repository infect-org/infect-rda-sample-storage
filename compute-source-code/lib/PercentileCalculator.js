

export default class PercentileCalculator {



    compute({
        valueMap,
        percentile = 90,
    }) {
        const values = this.flattenArrayMap(valueMap);

        let index = values.length * (percentile / 100);
        const result = {
            percentile,
            slotCount: valueMap.size,
            rangeMin: values[0],
            rangeMax: values[values.length - 1],
            slots: Array.from(valueMap.entries()).map(([value, sampleCount]) => ({
                value,
                sampleCount,
            })),
        };

        if (Number.isInteger(index)) {
            if (index + 1 === values.length) {
                result.percentileValue = values[index -1];
            } else {
                result.percentileValue = (values[index -1] + values[index]) / 2;
            }
        } else {
            index = Math.ceil(index);
            result.percentileValue = values[index -1];
        }

        return result;
    }



    flattenArrayMap(map) {
        return Array.from(map.entries())
            .map(([value, occurences]) => Array.apply(null, { length: occurences })
                .map(() => value))
            .reduce((prev, current) => prev.concat(current), []);
    }
}