import { DeterministicSampler, TargettedSampler, MatchBypass } from './deterministic.sampler';

export class RootRouteSampler extends DeterministicSampler implements TargettedSampler {
  match_bypass: MatchBypass = {
    shouldSample: true,
    sampleRate: undefined,
    matched: false
  };
  constructor(sample_rate: number | undefined = 100) {
    super(sample_rate);
  }
  /**
   *
   * @param event_data
   *
   * If the event is for the `/_ah/health` route, delegate to deterministic sampler for
   * to filter.
   *
   * otherwise, return sampled, but without a rate
   */
  sample(event_data: object) {
    const route_path = Reflect.get(event_data, 'app.route.path');
    if (route_path === '/') {
      return { ...super.sample(event_data), matched: true };
    }
    return this.match_bypass;
  }
}
