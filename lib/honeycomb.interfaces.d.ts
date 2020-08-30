export interface SamplerResponse {
    shouldSample: boolean;
    sampleRate?: number;
    matched?: boolean;
}
export declare type SamplerFn = (event: Record<string, unknown>) => SamplerResponse;
export declare enum HoneycombSchema {
    EVENT_TYPE = "meta.type",
    NODE_VERSION = "meta.node_version",
    BEELINE_VERSION = "meta.beeline_version",
    PACKAGE = "meta.package",
    PACKAGE_VERSION = "meta.package_version",
    INSTRUMENTATIONS = "meta.instrumentations",
    INSTRUMENTATION_COUNT = "meta.instrumentation_count",
    HOSTNAME = "meta.local_hostname",
    DURATION_MS = "duration_ms",
    TRACE_ID = "trace.trace_id",
    TRACE_ID_SOURCE = "trace.trace_id_source",
    TRACE_PARENT_ID = "trace.parent_id",
    TRACE_SPAN_ID = "trace.span_id",
    TRACE_SERVICE_NAME = "service_name",
    TRACE_SPAN_NAME = "name",
    TRACE_LINK_SPAN_ID = "trace.link.span_id",
    TRACE_LINK_TRACE_ID = "trace.link.trace_id",
    TRACE_LINK_META = "meta.span_type"
}
export interface HoneycombSpan {
    id: string;
    customContext?: Record<string, unknown>;
    stack: HoneycombSpan[];
    dataset: string;
    traceId: string;
    parentSpanId?: string;
    startTime: number;
    startTimeHR: number[];
    [HoneycombSchema.TRACE_ID]: string;
    [HoneycombSchema.TRACE_SPAN_ID]: string;
}
export declare enum HoneycombInstrumentations {
    'http' = "http",
    'https' = "https",
    'sequelize' = "sequelize",
    'bluebird' = "bluebird",
    'mysql2' = "mysql2",
    '@hapi/hapi' = "@hapi/hapi"
}
export interface HoneycombConfiguration {
    impl: 'libhoney-event' | 'mock';
    writeKey: string;
    dataset: string;
    serviceName: string;
    samplerHook?: (data: Record<string, unknown>) => SamplerResponse;
    enabledInstrumentations: Array<keyof HoneycombInstrumentations>;
}
export interface IAsyncTracker {
    tracked: Map<any, any>;
    setTracked: (value: HoneycombSpan) => void;
    getTracked: () => HoneycombSpan;
    deleteTracked: () => void;
    runWithoutTracking<T>(arg0: () => T): T;
    bindFunction<T>(arg0: () => T): T;
    callWithContext<T>(arg0: () => T, context: HoneycombSpan): T;
    init(asyncId: number, type: string, triggerAsyncId: number, resource: Record<string, unknown>): void;
    destroy(asyncId: number): void;
}
