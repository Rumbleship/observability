import { DeterministicSampler, TargettedSampler, MatchBypass } from './deterministic.sampler';
import { HoneycombSchema, SamplerResponse } from './../honeycomb.interfaces';

export class RouteSampler extends DeterministicSampler implements TargettedSampler {
  match_bypass: MatchBypass = {
    shouldSample: true,
    sampleRate: undefined,
    matched: false
  };
  constructor(private route_regex: RegExp, sample_rate: number | undefined = 100) {
    super(sample_rate);
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
  sample(event_data: Record<string, unknown>): SamplerResponse {
    const route_path = Reflect.get(event_data, 'app.request.path');
    const parent_id = Reflect.get(event_data, HoneycombSchema.TRACE_PARENT_ID);
    if (route_path?.match(this.route_regex)) {
      if (!parent_id) {
        return { ...super.sample(event_data), matched: true };
      }
      return { shouldSample: false, sampleRate: undefined, matched: true };
    }
    return this.match_bypass;
  }
}
