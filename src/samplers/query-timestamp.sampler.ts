import { HoneycombSchema, SamplerResponse } from '../honeycomb.interfaces';
import { DeterministicSampler, MatchBypass, TargettedSampler } from './deterministic.sampler';

export class QueryTimestampSampler extends DeterministicSampler implements TargettedSampler {
  match_bypass: MatchBypass = {
    shouldSample: true,
    sampleRate: undefined,
    matched: false
  };
  constructor(sample_rate: number | undefined = 100) {
    super(sample_rate);
  }

  sample(event_data: Record<string, unknown>): SamplerResponse {
    const db_query = Reflect.get(event_data, 'db.query');
    const parent_id = Reflect.get(event_data, HoneycombSchema.TRACE_PARENT_ID);
    if (db_query === "SET time_zone = '+00:00'") {
      if (!parent_id) {
        return { ...super.sample(event_data), matched: true };
      }
      return { shouldSample: false, sampleRate: undefined, matched: true };
    }
    return this.match_bypass;
  }
}
