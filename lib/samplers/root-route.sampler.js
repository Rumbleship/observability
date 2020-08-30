"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootRouteSampler = void 0;
const route_sampler_1 = require("./route.sampler");
class RootRouteSampler extends route_sampler_1.RouteSampler {
    constructor(sample_rate = 100) {
        super(/^\/$/, sample_rate);
    }
}
exports.RootRouteSampler = RootRouteSampler;
//# sourceMappingURL=root-route.sampler.js.map