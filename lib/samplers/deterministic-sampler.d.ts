import { SamplerResponse } from '../honeycomb.interfaces';
export interface TargettedSamplerResponse extends SamplerResponse {
    matched: boolean;
}
export interface Sampler {
    sample: (event_data: object) => SamplerResponse;
}
export interface MatchBypass {
    shouldSample: true;
    sampleRate: undefined;
    matched: false;
}
export interface TargettedSampler extends Sampler {
    sample: (event_data: object) => SamplerResponse & {
        matched: boolean;
    };
    match_bypass: MatchBypass;
}
export declare class DeterministicSampler {
    protected sample_rate: number;
    constructor(sample_rate: number);
    sample(event_data: object): SamplerResponse;
}
