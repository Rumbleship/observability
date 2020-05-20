"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deterministic_sampler_1 = require("./deterministic-sampler");
class HealthCheckRouteSampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(sample_rate = 100) {
        super(sample_rate);
    }
    /**
     *
     * @param event_data
     *
     * If the event is for the `/_ah/health` route, delegate to deterministic sampler for
     * to filter.
     *
     * otherwise, return unsampled
     */
    sample(event_data) {
        const datapoint = Reflect.get(event_data, 'route.path');
        if (datapoint === '/_ah/health') {
            return super.sample(event_data);
        }
        return {
            shouldSample: false,
            sampleRate: 0
        };
    }
}
exports.HealthCheckRouteSampler = HealthCheckRouteSampler;
class HealthCheckQuerySampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(sample_rate = 100) {
        super(sample_rate);
    }
    /**
     *
     * @param event_data
     *
     * If the event is for the `db.query` route, delegate to deterministic sampler for
     * to filter.
     *
     * otherwise, return unsampled
     */
    sample(event_data) {
        const datapoint = Reflect.get(event_data, 'db.query');
        if (datapoint === 'SELECT 1+1 AS result') {
            return super.sample(event_data);
        }
        return {
            shouldSample: false,
            sampleRate: 0
        };
    }
}
exports.HealthCheckQuerySampler = HealthCheckQuerySampler;
//# sourceMappingURL=health_check.js.map