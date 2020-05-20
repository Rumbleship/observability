import { v4 } from 'uuid';
import { HealthCheckRouteSampler, HealthCheckQuerySampler } from './../src/samplers/health-check';
import { HoneycombSchema } from './../src';

test('Defaults to samplerate of 1/100', () => {
  expect(Reflect.get(new HealthCheckRouteSampler(), 'sample_rate')).toBe(100);
  expect(Reflect.get(new HealthCheckQuerySampler(), 'sample_rate')).toBe(100);
});

test('HealthCheckRouteSampler only samples events whose path matches', () => {
  const sampler = new HealthCheckRouteSampler(1);
  const matchingEvent = () => ({
    'route.path': '/_ah/health',
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
test('HealthCheckQuerySampler only samples events whose path matches', () => {
  const sampler = new HealthCheckQuerySampler(1);
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
