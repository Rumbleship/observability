import { v4 } from 'uuid';
import { HealthCheckRouteSampler } from '../src/samplers/health-check.sampler';
import { RootRouteSampler } from '../src/samplers/root-route.sampler';
import { RouteSampler } from './../src/samplers/route.sampler';
import { HoneycombSchema } from './../src';
const MAX_UINT32 = Math.pow(2, 32) - 1;

test('Defaults to samplerate of 1/100', () => {
  expect(Reflect.get(new HealthCheckRouteSampler(), 'sample_rate')).toBe(100);
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

describe('RouteSampler only sends the root event', () => {
  const sampler = new RouteSampler(/^\/foo/, 100);
  const rootEvent = () => ({
    'app.request.path': '/foo',
    [HoneycombSchema.TRACE_ID]: v4()
  });
  const childEvent = () => ({
    'app.request.path': '/foo',
    [HoneycombSchema.TRACE_PARENT_ID]: v4(),
    [HoneycombSchema.TRACE_ID]: v4()
  });
  test('When receiving an event that is root', () => {
    const n = 50000;
    const rates = {
      sampled: 0,
      ignored: 0,
      skipped: 0
    };

    for (let i = 0; i < n; i++) {
      for (const gen of [rootEvent, childEvent]) {
        const resp = sampler.sample(gen());
        if (resp.sampleRate) {
          rates[resp.shouldSample ? 'sampled' : 'ignored']++;
        } else {
          rates['skipped']++;
        }
      }
    }
    expect(rates.skipped).toBe(n);
    // Don't need to repeat the statistics of deterministic sampler test
    expect(rates.ignored + rates.sampled).toBe(n);
    expect(rates.ignored).toBeGreaterThan(rates.sampled);
  });
});

test('RootRoute sampler is anchored to only exact match', () => {
  const sampler = new RootRouteSampler();
  expect(
    sampler.sample({
      'app.request.path': '/',
      [HoneycombSchema.TRACE_ID]: v4()
    }).matched
  ).toBeTruthy();
  expect(
    sampler.sample({
      'app.request.path': '/foo',
      [HoneycombSchema.TRACE_ID]: v4()
    }).matched
  ).toBeFalsy();
});

test('HealthCheck sampler is anchored to only exact match', () => {
  const sampler = new HealthCheckRouteSampler();
  expect(
    sampler.sample({
      'app.request.path': '/_ah/health',
      [HoneycombSchema.TRACE_ID]: v4()
    }).matched
  ).toBeTruthy();
  expect(
    sampler.sample({
      'app.request.path': '/_ah/health/foo',
      [HoneycombSchema.TRACE_ID]: v4()
    }).matched
  ).toBeFalsy();
});
