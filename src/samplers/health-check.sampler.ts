import { RouteSampler } from './route.sampler';

export class HealthCheckRouteSampler extends RouteSampler {
  constructor(sample_rate: number | undefined = 100) {
    super(/^\/_ah\/health/, sample_rate);
  }
}
