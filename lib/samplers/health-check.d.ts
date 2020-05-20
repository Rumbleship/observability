import { DeterministicSampler } from './deterministic-sampler';
export declare class HealthCheckRouteSampler extends DeterministicSampler {
    constructor(sample_rate?: number | undefined);
    /**
     *
     * @param event_data
     *
     * If the event is for the `/_ah/health` route, delegate to deterministic sampler for
     * to filter.
     *
     * otherwise, return unsampled
     */
    sample(event_data: object): {
        matched: boolean;
        shouldSample: boolean;
        sampleRate: number;
    };
}
export declare class HealthCheckQuerySampler extends DeterministicSampler {
    constructor(sample_rate?: number | undefined);
    /**
     *
     * @param event_data
     *
     * If the event is for the `db.query` route, delegate to deterministic sampler for
     * to filter.
     *
     * otherwise, return unsampled
     */
    sample(event_data: object): {
        matched: boolean;
        shouldSample: boolean;
        sampleRate: number;
    };
}
