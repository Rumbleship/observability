import { RouteSampler } from './route.sampler';

export class RootRouteSampler extends RouteSampler {
  constructor(sample_rate: number | undefined = 100) {
    super(/^\/$/, sample_rate);
  }
}
