import { SamplerResponse } from '../honeycomb.interfaces';
import { DeterministicSampler, MatchBypass, TargettedSampler } from './deterministic.sampler';
export declare class RidiculouslyShortOnRequestSampler extends DeterministicSampler implements TargettedSampler {
    match_bypass: MatchBypass;
    constructor(sample_rate?: number | undefined);
    sample(event_data: Record<string, unknown>): SamplerResponse;
}
