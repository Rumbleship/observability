import { SamplerResponse } from '../honeycomb.interfaces';
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
export declare class DeterministicSampler {
    protected sample_rate: number;
    constructor(sample_rate: number);
    sample(event_data: Record<string, unknown>): SamplerResponse;
}
