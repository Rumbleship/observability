"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RidiculouslyShortOnRequestSampler = void 0;
const honeycomb_interfaces_1 = require("../honeycomb.interfaces");
const deterministic_sampler_1 = require("./deterministic.sampler");
class RidiculouslyShortOnRequestSampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(sample_rate = 100) {
        super(sample_rate);
        this.match_bypass = {
            shouldSample: true,
            sampleRate: undefined,
            matched: false
        };
    }
    sample(event_data) {
        const duration = Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.DURATION_MS);
        const name = Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.TRACE_SPAN_NAME);
        const parent_id = Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.TRACE_PARENT_ID);
        if (name === 'onRequest' && duration < 1) {
            if (!parent_id) {
                return { ...super.sample(event_data), matched: true };
            }
            return { shouldSample: false, sampleRate: undefined, matched: true };
        }
        return this.match_bypass;
    }
}
exports.RidiculouslyShortOnRequestSampler = RidiculouslyShortOnRequestSampler;
//# sourceMappingURL=ridiculously-short-on-request.sampler.js.map