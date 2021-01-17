import { HoneycombSchema, SamplerResponse } from '../honeycomb.interfaces';
import { DeterministicSampler, MatchBypass, TargettedSampler } from './deterministic.sampler';

export class SyncQsrsSampler extends DeterministicSampler implements TargettedSampler {
  match_bypass: MatchBypass = {
    shouldSample: true,
    sampleRate: undefined,
    matched: false
  };
  constructor(sample_rate: number | undefined = 100) {
    super(sample_rate);
  }

  /**
   *
   * @usage filter out events like this: https://ui.honeycomb.io/rumbleship-financial/datasets/production/result/9rS7jpoPdpp
   */
  sample(event_data: Record<string, unknown>): SamplerResponse {
    const name = Reflect.get(event_data, 'name');
    const gcloud_topic_name = Reflect.get(event_data, 'app.gcloud_topic_name');
    const gcloud_subscription_name = Reflect.get(event_data, 'app.gcloud_subscription_name');
    const publish_to_topic_name = Reflect.get(event_data, 'app.request.publish_to_topic_name');
    const client_request_id = Reflect.get(event_data, 'app.request.client_request_id');

    const parent_id = Reflect.get(event_data, HoneycombSchema.TRACE_PARENT_ID);
    if (
      name === 'resolve' &&
      gcloud_topic_name?.match(/^[\w-]+_GRAPHQL_REQUEST$/) &&
      gcloud_subscription_name?.match(/^[\w-]+_GRAPHQL_REQUEST_orders$/) &&
      publish_to_topic_name?.match(/^[\w-]+_GRAPHQL_RESPONSE_\w+$/) &&
      client_request_id === 'GetAllQueuedSubscriptionRequests'
    ) {
      if (!parent_id) {
        return { ...super.sample(event_data), matched: true };
      }
      return { shouldSample: false, sampleRate: undefined, matched: true };
    }
    return this.match_bypass;
  }
}
