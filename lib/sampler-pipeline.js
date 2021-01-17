"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamplerPipeline = void 0;
const health_check_sampler_1 = require("./samplers/health-check.sampler");
const root_route_sampler_1 = require("./samplers/root-route.sampler");
const query_timestamp_sampler_1 = require("./samplers/query-timestamp.sampler");
const ridiculously_short_on_request_sampler_1 = require("./samplers/ridiculously-short-on-request.sampler");
const sync_qsrs_sampler_1 = require("./samplers/sync-qsrs.sampler");
class SamplerPipeline {
    constructor(targetted_samplers = [
        new health_check_sampler_1.HealthCheckRouteSampler(),
        new root_route_sampler_1.RootRouteSampler(),
        new query_timestamp_sampler_1.QueryTimestampSampler(),
        new ridiculously_short_on_request_sampler_1.RidiculouslyShortOnRequestSampler(),
        new sync_qsrs_sampler_1.SyncQsrsSampler()
    ], global_sampler) {
        this.targetted_samplers = targetted_samplers;
        this.global_sampler = global_sampler;
        this.sample = this.sample.bind(this);
    }
    /**
     *
     * @param data
     *
     * @returns SamplerResponse: from the first matched sampler to return { shouldSample:true }
     *  otherwise return {shouldSample: false }
     */
    sample(data) {
        var _a, _b;
        const targetted_sampler_results = this.targetted_samplers
            .map(sampler => sampler.sample(data))
            .filter(res => res.matched);
        // one of our targetted samplers matched the event, so just return the first.
        // If sampler match conditions do not intersect at all, this won't be an issue.
        // Todo: Figure out a schema for describing the sampler conditions, and forcing
        //   exclusivity. Chore: https://www.pivotaltracker.com/story/show/172929222
        if (targetted_sampler_results.length) {
            return targetted_sampler_results[0];
        }
        else {
            return (_b = (_a = this.global_sampler) === null || _a === void 0 ? void 0 : _a.sample(data)) !== null && _b !== void 0 ? _b : { shouldSample: true };
        }
    }
}
exports.SamplerPipeline = SamplerPipeline;
//# sourceMappingURL=sampler-pipeline.js.map