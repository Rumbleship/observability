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
        const route_path = Reflect.get(event_data, 'route.path');
        const status_code = Reflect.get(event_data, 'response.status_code');
        if (route_path === '/_ah/health' && status_code < 400) {
            return { ...super.sample(event_data), matched: true };
        }
        return {
            shouldSample: false,
            sampleRate: 0,
            matched: false
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
        const db_query = Reflect.get(event_data, 'db.query');
        if (db_query === 'SELECT 1+1 AS result') {
            return { ...super.sample(event_data), matched: true };
        }
        return {
            shouldSample: false,
            sampleRate: 0,
            matched: false
        };
    }
}
exports.HealthCheckQuerySampler = HealthCheckQuerySampler;
//# sourceMappingURL=health-check.js.map