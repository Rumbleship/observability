import { HealthCheckRouteSampler } from './samplers/health-check.sampler';
import { RootRouteSampler } from './samplers/root-route.sampler';
import { SamplerResponse } from './honeycomb.interfaces';
import { TargettedSampler, Sampler } from './samplers/deterministic.sampler';

export class SamplerPipeline {
  constructor(
    protected targetted_samplers: TargettedSampler[] = [
      new HealthCheckRouteSampler(),
      new RootRouteSampler()
    ],
    protected global_sampler?: Sampler
  ) {
    this.sample = this.sample.bind(this);
  }
  /**
   *
   * @param data
   *
   * @returns SamplerResponse: from the first matched sampler to return { shouldSample:true }
   *  otherwise return {shouldSample: false }
   */
  sample(data: Record<string, unknown>): SamplerResponse {
    const targetted_sampler_results = this.targetted_samplers
      .map(sampler => sampler.sample(data))
      .filter(res => res.matched);
    // one of our targetted samplers matched the event, so just return the first.
    // If sampler match conditions do not intersect at all, this won't be an issue.
    // Todo: Figure out a schema for describing the sampler conditions, and forcing
    //   exclusivity. Chore: https://www.pivotaltracker.com/story/show/172929222
    if (targetted_sampler_results.length) {
      return targetted_sampler_results[0];
    } else {
      return this.global_sampler?.sample(data) ?? { shouldSample: true };
    }
  }
}
