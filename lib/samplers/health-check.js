"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deterministic_sampler_1 = require("./deterministic-sampler");
class HealthCheckRouteSampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(sample_rate = 100) {
        super(sample_rate);
        this.match_bypass = {
            shouldSample: true,
            sampleRate: undefined,
            matched: false
        };
    }
    /**
     *
     * @param event_data
     *
     * If the event is for the `/_ah/health` route, delegate to deterministic sampler for
     * to filter.
     *
     * otherwise, return sampled, but without a rate
     */
    sample(event_data) {
        const route_path = Reflect.get(event_data, 'app.route.path');
        if (route_path === null || route_path === void 0 ? void 0 : route_path.match(/_ah\/health/)) {
            return { ...super.sample(event_data), matched: true };
        }
        return this.match_bypass;
    }
}
exports.HealthCheckRouteSampler = HealthCheckRouteSampler;
class HealthCheckQuerySampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(sample_rate = 100) {
        super(sample_rate);
        this.match_bypass = {
            shouldSample: true,
            sampleRate: undefined,
            matched: false
        };
    }
    /**
     *
     * @param event_data
     *
     * If the event is for the `db.query` route, delegate to deterministic sampler for
     * to filter.
     *
     * otherwise, return sampled, but without a rate
     */
    sample(event_data) {
        const db_query = Reflect.get(event_data, 'db.query');
        if (db_query === 'SELECT 1+1 AS result') {
            return { ...super.sample(event_data), matched: true };
        }
        return this.match_bypass;
    }
}
exports.HealthCheckQuerySampler = HealthCheckQuerySampler;
//# sourceMappingURL=health-check.js.map