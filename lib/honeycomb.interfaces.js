"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoneycombInstrumentations = exports.HoneycombSchema = void 0;
// Extracted from `beeline-nodejs/lib/schema.js`
var HoneycombSchema;
(function (HoneycombSchema) {
    HoneycombSchema["EVENT_TYPE"] = "meta.type";
    HoneycombSchema["NODE_VERSION"] = "meta.node_version";
    HoneycombSchema["BEELINE_VERSION"] = "meta.beeline_version";
    HoneycombSchema["PACKAGE"] = "meta.package";
    HoneycombSchema["PACKAGE_VERSION"] = "meta.package_version";
    HoneycombSchema["INSTRUMENTATIONS"] = "meta.instrumentations";
    HoneycombSchema["INSTRUMENTATION_COUNT"] = "meta.instrumentation_count";
    HoneycombSchema["HOSTNAME"] = "meta.local_hostname";
    HoneycombSchema["DURATION_MS"] = "duration_ms";
    HoneycombSchema["TRACE_ID"] = "trace.trace_id";
    HoneycombSchema["TRACE_ID_SOURCE"] = "trace.trace_id_source";
    HoneycombSchema["TRACE_PARENT_ID"] = "trace.parent_id";
    HoneycombSchema["TRACE_SPAN_ID"] = "trace.span_id";
    HoneycombSchema["TRACE_SERVICE_NAME"] = "service_name";
    HoneycombSchema["TRACE_SPAN_NAME"] = "name";
    HoneycombSchema["TRACE_LINK_SPAN_ID"] = "trace.link.span_id";
    HoneycombSchema["TRACE_LINK_TRACE_ID"] = "trace.link.trace_id";
    HoneycombSchema["TRACE_LINK_META"] = "meta.span_type";
})(HoneycombSchema = exports.HoneycombSchema || (exports.HoneycombSchema = {}));
var HoneycombInstrumentations;
(function (HoneycombInstrumentations) {
    HoneycombInstrumentations["http"] = "http";
    HoneycombInstrumentations["https"] = "https";
    HoneycombInstrumentations["sequelize"] = "sequelize";
    HoneycombInstrumentations["bluebird"] = "bluebird";
    HoneycombInstrumentations["mysql2"] = "mysql2";
    HoneycombInstrumentations["@hapi/hapi"] = "@hapi/hapi";
})(HoneycombInstrumentations = exports.HoneycombInstrumentations || (exports.HoneycombInstrumentations = {}));
//# sourceMappingURL=honeycomb.interfaces.js.map