"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const honeycomb_interfaces_1 = require("../honeycomb.interfaces");
const crypto_1 = require("crypto");
class DeterministicSampler {
    constructor(sample_rate) {
        this.sample_rate = sample_rate;
    }
    sample(event_data) {
        const MAX_UINT32 = Math.pow(2, 32) - 1;
        const sum = crypto_1.createHash('sha1')
            .update(Reflect.get(event_data, honeycomb_interfaces_1.HoneycombSchema.TRACE_ID))
            .digest();
        // tslint:disable-next-line: no-bitwise
        const upper_bound = (MAX_UINT32 / this.sample_rate) >>> 0;
        return {
            shouldSample: sum.readUInt32BE(0) <= upper_bound,
            sampleRate: this.sample_rate
        };
    }
}
exports.DeterministicSampler = DeterministicSampler;
//# sourceMappingURL=deterministic-sampler.js.map