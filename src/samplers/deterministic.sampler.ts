import { HoneycombSchema, SamplerResponse } from '../honeycomb.interfaces';
import { createHash } from 'crypto';
export interface TargettedSamplerResponse extends SamplerResponse {
  matched: boolean;
}
export interface Sampler {
  sample: (event_data: Record<string, unknown>) => SamplerResponse;
}
export interface MatchBypass {
  shouldSample: boolean;
  sampleRate: undefined;
  matched: boolean;
}

export interface TargettedSampler extends Sampler {
  sample: (event_data: Record<string, unknown>) => SamplerResponse;
  match_bypass: MatchBypass;
}

export class DeterministicSampler {
  constructor(protected sample_rate: number) {}
  sample(event_data: Record<string, unknown>): SamplerResponse {
    const MAX_UINT32 = Math.pow(2, 32) - 1;
    const sum = createHash('sha1')
      .update(Reflect.get(event_data, HoneycombSchema.TRACE_ID))
      .digest();
    // tslint:disable-next-line: no-bitwise
    const upper_bound = (MAX_UINT32 / this.sample_rate) >>> 0;

    return {
      shouldSample: sum.readUInt32BE(0) <= upper_bound,
      sampleRate: this.sample_rate
    };
  }
}
