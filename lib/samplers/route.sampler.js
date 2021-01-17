"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteSampler = void 0;
const deterministic_sampler_1 = require("./deterministic.sampler");
const honeycomb_interfaces_1 = require("./../honeycomb.interfaces");
class RouteSampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(route_regex, sample_rate = 100) {
        super(sample_rate);
        this.route_regex = route_regex;
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
     * If the event is the root span for the matching `route_regex`, delegate to deterministic sampler
     *
     * If the event is a child of the root that matches, force unsampled.
     *
     * Else, return sampled, but without a rate (Hny defaults to rate:1)
     */
    sample(event_data) {
        const route_path = Reflect.get(event_data, 'app.request.path');
        const parent_id = Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.TRACE_PARENT_ID);
        if (route_path === null || route_path === void 0 ? void 0 : route_path.match(this.route_regex)) {
            if (!parent_id) {
                return { ...super.sample(event_data), matched: true };
            }
            return { shouldSample: false, sampleRate: undefined, matched: true };
        }
        return this.match_bypass;
    }
}
exports.RouteSampler = RouteSampler;
//# sourceMappingURL=route.sampler.js.map