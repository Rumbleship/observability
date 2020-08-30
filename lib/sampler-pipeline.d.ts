import { SamplerResponse } from './honeycomb.interfaces';
import { TargettedSampler, Sampler } from './samplers/deterministic.sampler';
export declare class SamplerPipeline {
    protected targetted_samplers: TargettedSampler[];
    protected global_sampler?: Sampler | undefined;
    constructor(targetted_samplers?: TargettedSampler[], global_sampler?: Sampler | undefined);
    /**
     *
     * @param data
     *
     * @returns SamplerResponse: from the first matched sampler to return { shouldSample:true }
     *  otherwise return {shouldSample: false }
     */
    sample(data: Record<string, unknown>): SamplerResponse;
}
