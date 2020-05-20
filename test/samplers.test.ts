import { v4 } from 'uuid';
import {
  HealthCheckRouteSampler,
  HealthCheckQuerySampler
} from '../src/samplers/health-check.sampler';
import { RootRouteSampler } from '../src/samplers/root-route.sampler';
import { HoneycombSchema } from './../src';
const MAX_UINT32 = Math.pow(2, 32) - 1;

test('Defaults to samplerate of 1/100', () => {
  expect(Reflect.get(new HealthCheckRouteSampler(), 'sample_rate')).toBe(100);
  expect(Reflect.get(new HealthCheckQuerySampler(), 'sample_rate')).toBe(100);
  expect(Reflect.get(new RootRouteSampler(), 'sample_rate')).toBe(100);
});

describe('Given a sample rate set to reject all events', () => {
  const sample_rate = MAX_UINT32;
  test('HealthCheckRouteSampler only tries to sample events whose path matches', () => {
    const sampler = new HealthCheckRouteSampler(sample_rate);
    const matchingEvent = () => ({
      'app.request.path': '/_ah/health',
      [HoneycombSchema.TRACE_ID]: v4()
    });
    const unmatchingEvent = () => ({
      [HoneycombSchema.TRACE_ID]: v4()
    });
    const n = 50000;
    const rates = {
      sampled: 0,
      ignored: 0
    };

    for (let i = 0; i < n; i++) {
      for (const gen of [matchingEvent, unmatchingEvent]) {
        const resp = sampler.sample(gen());
        rates[resp.shouldSample ? 'sampled' : 'ignored']++;
      }
    }
    expect(rates.sampled).toBe(n);
    expect(rates.ignored).toBe(n);
  });
  test('HealthCheckQuerySampler only tries to sample events whose db.query matches', () => {
    const sampler = new HealthCheckQuerySampler(sample_rate);
    const matchingEvent = () => ({
      'db.query': 'SELECT 1+1 AS result',
      [HoneycombSchema.TRACE_ID]: v4()
    });
    const unmatchingEvent = () => ({
      [HoneycombSchema.TRACE_ID]: v4()
    });
    const n = 50000;
    const rates = {
      sampled: 0,
      ignored: 0
    };

    for (let i = 0; i < n; i++) {
      for (const gen of [matchingEvent, unmatchingEvent]) {
        const resp = sampler.sample(gen());
        rates[resp.shouldSample ? 'sampled' : 'ignored']++;
      }
    }
    expect(rates.sampled).toBe(n);
    expect(rates.ignored).toBe(n);
  });
  test('RootRouteSampler only tries to sample events whose path matches', () => {
    const sampler = new RootRouteSampler(sample_rate);
    const matchingEvent = () => ({
      'app.request.path': '/',
      [HoneycombSchema.TRACE_ID]: v4()
    });
    const unmatchingEvent = () => ({
      [HoneycombSchema.TRACE_ID]: v4()
    });
    const n = 50000;
    const rates = {
      sampled: 0,
      ignored: 0
    };

    for (let i = 0; i < n; i++) {
      for (const gen of [matchingEvent, unmatchingEvent]) {
        const resp = sampler.sample(gen());
        rates[resp.shouldSample ? 'sampled' : 'ignored']++;
      }
    }
    expect(rates.sampled).toBe(n);
    expect(rates.ignored).toBe(n);
  });
});
