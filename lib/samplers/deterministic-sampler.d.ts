import { SamplerResponse } from '../honeycomb.interfaces';
export interface Sampler {
    sample: (event_data: object) => SamplerResponse;
}
export interface TargettedSamplerResponse extends SamplerResponse {
    matched: boolean;
}
export interface TargettedSampler extends Sampler {
    sample: (event_data: object) => SamplerResponse & {
        matched: boolean;
    };
}
export declare class DeterministicSampler {
    protected sample_rate: number;
    constructor(sample_rate: number);
    sample(event_data: object): {
        shouldSample: boolean;
        sampleRate: number;
    };
}
