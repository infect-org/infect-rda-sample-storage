


export default class ConfidenceIntervalCalculator {


    compute({
        susceptibleCount,
        resistantCount, 
    }) {
        const totalCount = susceptibleCount + resistantCount;

        // do some shiny corrections, agresti-coull:
        // https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
        const someVariable = (resistantCount + 2) / (totalCount + 4);

        // standard error value
        const stdandardError = Math.sqrt(someVariable * (1 - someVariable) / (totalCount + 4));

        // lower confidence interval
        const lowerCI = Math.max(Math.round(((someVariable - 1.96 * stdandardError) * 100), 1), 0);

        // upper confidence interval
        const upperCI = Math.min(Math.round(((someVariable + 1.96 * stdandardError) * 100), 1), 100);

        return {
            confidenceIntervalLowerBound: lowerCI,
            confidenceIntervalUpperBound: upperCI,
            totalCount,
        };
    }
}