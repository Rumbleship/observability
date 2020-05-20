"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const health_check_1 = require("./samplers/health_check");
class SamplerPipeline {
    constructor(samplers = [new health_check_1.HealthCheckRouteSampler(), new health_check_1.HealthCheckQuerySampler()]) {
        this.samplers = samplers;
        this.sample = this.sample.bind(this);
    }
    /**
     *
     * @param data
     *
     * @returns SamplerResponse: from the first sampler to return { shouldSample:true }
     *  otherwise return {shouldSample: false }
     */
    sample(data) {
        var _a;
        const results = this.samplers.map(sampler => sampler.sample(data));
        return ((_a = results.find(({ shouldSample }) => shouldSample)) !== null && _a !== void 0 ? _a : {
            shouldSample: true,
            sampleRate: 1
        });
    }
}
exports.SamplerPipeline = SamplerPipeline;
//# sourceMappingURL=sampler-pipeline.js.map