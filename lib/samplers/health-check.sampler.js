"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_sampler_1 = require("./route.sampler");
class HealthCheckRouteSampler extends route_sampler_1.RouteSampler {
    constructor(sample_rate = 100) {
        super(/^\/_ah\/health$/, sample_rate);
    }
}
exports.HealthCheckRouteSampler = HealthCheckRouteSampler;
//# sourceMappingURL=health-check.sampler.js.map