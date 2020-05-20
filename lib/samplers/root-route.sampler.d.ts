import { DeterministicSampler, TargettedSampler, MatchBypass } from './deterministic.sampler';
export declare class RootRouteSampler extends DeterministicSampler implements TargettedSampler {
    match_bypass: MatchBypass;
    constructor(sample_rate?: number | undefined);
    /**
     *
     * @param event_data
     *
     * If the event is for the `/_ah/health` route, delegate to deterministic sampler for
     * to filter.
     *
     * otherwise, return sampled, but without a rate
     */
    sample(event_data: object): {
        matched: boolean;
        shouldSample: boolean;
        sampleRate?: number | undefined;
    };
}
