import { HealthCheckRouteSampler, HealthCheckQuerySampler } from './samplers/health_check';
import { SamplerResponse } from './honeycomb.interfaces';
export declare class SamplerPipeline {
    protected samplers: (HealthCheckRouteSampler | HealthCheckQuerySampler)[];
    constructor(samplers?: (HealthCheckRouteSampler | HealthCheckQuerySampler)[]);
    /**
     *
     * @param data
     *
     * @returns SamplerResponse: from the first sampler to return { shouldSample:true }
     *  otherwise return {shouldSample: false }
     */
    sample(data: object): SamplerResponse;
}
