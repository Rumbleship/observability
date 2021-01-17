"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryTimestampSampler = void 0;
const honeycomb_interfaces_1 = require("../honeycomb.interfaces");
const deterministic_sampler_1 = require("./deterministic.sampler");
class QueryTimestampSampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(sample_rate = 100) {
        super(sample_rate);
        this.match_bypass = {
            shouldSample: true,
            sampleRate: undefined,
            matched: false
        };
    }
    sample(event_data) {
        const db_query = Reflect.get(event_data, 'db.query');
        const parent_id = Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.TRACE_PARENT_ID);
        if (db_query === "SET time_zone = '+00:00'") {
            if (!parent_id) {
                return { ...super.sample(event_data), matched: true };
            }
            return { shouldSample: false, sampleRate: undefined, matched: true };
        }
        return this.match_bypass;
    }
}
exports.QueryTimestampSampler = QueryTimestampSampler;
//# sourceMappingURL=query-timestamp.sampler.js.map