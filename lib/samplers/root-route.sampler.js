"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deterministic_sampler_1 = require("./deterministic.sampler");
class RootRouteSampler extends deterministic_sampler_1.DeterministicSampler {
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
        if (route_path === '/') {
            return { ...super.sample(event_data), matched: true };
        }
        return this.match_bypass;
    }
}
exports.RootRouteSampler = RootRouteSampler;
//# sourceMappingURL=root-route.sampler.js.map