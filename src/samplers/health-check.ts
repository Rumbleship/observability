import { DeterministicSampler } from './deterministic-sampler';

export class HealthCheckRouteSampler extends DeterministicSampler {
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
   * otherwise, return unsampled
   */
  sample(event_data: object) {
    const route_path = Reflect.get(event_data, 'route.path');
    const status_code = Reflect.get(event_data, 'response.status_code');
    if (route_path === '/_ah/health' && status_code < 400) {
      return { ...super.sample(event_data), matched: true };
    }
    return {
      shouldSample: false,
      sampleRate: 0,
      matched: false
    };
  }
}
export class HealthCheckQuerySampler extends DeterministicSampler {
  constructor(sample_rate: number | undefined = 100) {
    super(sample_rate);
  }
  /**
   *
   * @param event_data
   *
   * If the event is for the `db.query` route, delegate to deterministic sampler for
   * to filter.
   *
   * otherwise, return unsampled
   */
  sample(event_data: object) {
    const db_query = Reflect.get(event_data, 'db.query');
    if (db_query === 'SELECT 1+1 AS result') {
      return { ...super.sample(event_data), matched: true };
    }
    return {
      shouldSample: false,
      sampleRate: 0,
      matched: false
    };
  }
}
