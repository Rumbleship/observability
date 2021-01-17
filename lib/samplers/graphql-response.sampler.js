"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlResponseSampler = void 0;
const honeycomb_interfaces_1 = require("../honeycomb.interfaces");
const deterministic_sampler_1 = require("./deterministic.sampler");
class GraphqlResponseSampler extends deterministic_sampler_1.DeterministicSampler {
    constructor(sample_rate = 100) {
        super(sample_rate);
        this.match_bypass = {
            shouldSample: true,
            sampleRate: undefined,
            matched: false
        };
    }
    sample(event_data) {
        const name = Reflect.get(event_data, 'name');
        const publish_to_topic_name = Reflect.get(event_data, 'app.request.publish_to_topic_name');
        const parent_id = Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.TRACE_PARENT_ID);
        if (name === 'resolve' && publish_to_topic_name.match(/^\w+_GRAPHQL_RESPONSE_\w+$/)) {
            if (!parent_id) {
                return { ...super.sample(event_data), matched: true };
            }
            return { shouldSample: false, sampleRate: undefined, matched: true };
        }
        return this.match_bypass;
    }
}
exports.GraphqlResponseSampler = GraphqlResponseSampler;
//# sourceMappingURL=graphql-response.sampler.js.map