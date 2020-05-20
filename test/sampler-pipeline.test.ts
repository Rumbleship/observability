import { v4 } from 'uuid';
import { SamplerPipeline } from '../src/sampler-pipeline';
import { DeterministicSampler, MatchBypass } from '../src/samplers/deterministic-sampler';
import { HoneycombSchema } from '../src';

class DeterministicMatchedSampler extends DeterministicSampler {
  match_bypass: MatchBypass = {
    shouldSample: true,
    sampleRate: undefined,
    matched: false
  };
  constructor(protected sample_rate: number, protected match_against: string) {
    super(sample_rate);
  }
  sample(data: object) {
    return {
      ...super.sample(data),
      matched: Reflect.get(data, 'match_against') === this.match_against
    };
  }
}

const MAX_UINT32 = Math.pow(2, 32) - 1;
// one of every MAX_UINT32 events gets sent
const send_nothing = new DeterministicMatchedSampler(MAX_UINT32, 'nothing');
// one of every one events gets sent
const send_everything = new DeterministicMatchedSampler(1, 'everything');
// one of every two events gets sent
const send_some = new DeterministicMatchedSampler(2, 'some');

const event_data = (extra: string) => ({
  [HoneycombSchema.TRACE_ID]: v4(),
  match_against: extra
});
test('prove send_nothing removes all events; send_everything removes none', () => {
  const n = 50000;
  const send_everything_rates = {
    true: 0,
    false: 0
  };
  const send_nothing_rates = {
    true: 0,
    false: 0
  };
  for (let i = 0; i < n; i++) {
    const send_everything_resp = send_everything.sample(event_data('everything'));
    send_everything_rates[send_everything_resp.shouldSample ? 'true' : 'false']++;
    const send_nothing_resp = send_nothing.sample(event_data('nothing'));
    send_nothing_rates[send_nothing_resp.shouldSample ? 'true' : 'false']++;
  }
  expect(send_everything_rates.true).toBe(50000);
  expect(send_everything_rates.false).toBe(0);
  expect(send_nothing_rates.true).toBe(0);
  expect(send_nothing_rates.false).toBe(50000);
});

test('A sampler pipeline returns the first matched', () => {
  const sampler = new SamplerPipeline([send_nothing, send_everything, send_some, send_some]);
  const response = sampler.sample(event_data('everything'));
  expect(response.shouldSample).toBe(true);
  expect(response.sampleRate).toBe(1);
});

describe('Given: a pipeline where every TargettedSampler returns shouldSample:false', () => {
  describe('And: no generic sampler', () => {
    describe('When: none of the members matched', () => {
      const sampler = new SamplerPipeline([send_nothing, send_nothing]);
      test('Then: the event is sent', () => {
        const response = sampler.sample(event_data('no_match'));
        expect(response.shouldSample).toBe(true);
        expect(response.sampleRate).toBe(undefined);
      });
    });
  });
  describe('And: a generic sampler that always samples', () => {
    const sampler = new SamplerPipeline([send_nothing, send_nothing], send_everything);
    test('Then: an event is sent', () => {
      const response = sampler.sample(event_data('everything'));
      expect(response.shouldSample).toBe(true);
      expect(response.sampleRate).toBe(1);
    });
  });
});
