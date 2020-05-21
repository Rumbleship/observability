import { DeterministicSampler, TargettedSampler, MatchBypass } from './deterministic.sampler';
export declare class RouteSampler extends DeterministicSampler implements TargettedSampler {
    private route_regex;
    match_bypass: MatchBypass;
    constructor(route_regex: RegExp, sample_rate?: number | undefined);
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
    sample(event_data: object): {
        matched: boolean;
        shouldSample: boolean;
        sampleRate?: number | undefined;
    };
}
