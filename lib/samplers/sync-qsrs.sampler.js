"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncQsrsSampler = void 0;
const honeycomb_interfaces_1 = require("../honeycomb.interfaces");
const deterministic_sampler_1 = require("./deterministic.sampler");
class SyncQsrsSampler extends deterministic_sampler_1.DeterministicSampler {
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
     * @usage filter out events like this: https://ui.honeycomb.io/rumbleship-financial/datasets/production/result/9rS7jpoPdpp
     */
    sample(event_data) {
        const name = Reflect.get(event_data, 'name');
        const gcloud_topic_name = Reflect.get(event_data, 'app.gcloud_topic_name');
        const gcloud_subscription_name = Reflect.get(event_data, 'app.gcloud_subscription_name');
        const publish_to_topic_name = Reflect.get(event_data, 'app.request.publish_to_topic_name');
        const client_request_id = Reflect.get(event_data, 'app.request.client_request_id');
        const parent_id = Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.TRACE_PARENT_ID);
        if (name === 'resolve' &&
            gcloud_topic_name.match(/^[\w-]+_GRAPHQL_REQUEST$/) &&
            gcloud_subscription_name.match(/^[\w-]+_GRAPHQL_REQUEST_orders$/) &&
            publish_to_topic_name.match(/^[\w-]+_GRAPHQL_RESPONSE_\w+$/) &&
            client_request_id === 'GetAllQueuedSubscriptionRequests') {
            if (!parent_id) {
                return { ...super.sample(event_data), matched: true };
            }
            return { shouldSample: false, sampleRate: undefined, matched: true };
        }
        return this.match_bypass;
    }
}
exports.SyncQsrsSampler = SyncQsrsSampler;
//# sourceMappingURL=sync-qsrs.sampler.js.map