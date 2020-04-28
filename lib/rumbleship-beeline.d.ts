import { HoneycombSpan, HoneycombConfiguration } from './honeycomb.interfaces';
export declare class RumbleshipBeeline {
    private context_id;
    private static beeline;
    static FinishersByContextId: Map<string, () => any>;
    private static initialized;
    /**
     * @param configureBeeline `require('honeycomb-beeline')`
     * @param config configuration to pass directly to the native honeycomb config function
     */
    static initialize(configureBeeline: (config: HoneycombConfiguration) => any, config: HoneycombConfiguration): void;
    /**
     *
     * @param server_like A Hapi.Server that has been instrumented.
     *
     * Replaces initial `RumbleshipBeeline` with  the beeline that has been
     * reconfigured and extended by the `@hapi/hapi` instrumentation so `bindFunctionToTrace()`
     * picks up the Hapi request context
     */
    static shimFromInstrumentation<T>(server_like: T): T;
    /**
     *
     * @param context_id The unique id for the context this beeline is operating in.
     * Likely `service_context_id` or `request_id`
     */
    static make(context_id: string): RumbleshipBeeline;
    static flush(): any;
    constructor(context_id: string);
    /**
     *
     * See https://docs.honeycomb.io/working-with-your-data/tracing/send-trace-data/#links
     *
     * tl;dr: very useful for linking an event-loading-spinner to a brand new trace
     * that actually processes the events; so we can view how many promise chains fork off
     * a single spinner
     */
    linkToSpan(target: HoneycombSpan): void;
    withSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T, rollupKey?: string): T;
    withAsyncSpan<T>(this: RumbleshipBeeline, metadata_context: object, fn: (span: HoneycombSpan) => Promise<T> | T): Promise<T>;
    withTrace<T>(metadataContext: object, fn: () => T, withTraceId?: string, withParentSpanId?: string, withDataset?: string): T;
    finishRumbleshipContextTrace(): void;
    startTrace(span_data: object, traceId?: string, parentSpanId?: string, dataset?: string): HoneycombSpan;
    finishTrace(span: HoneycombSpan): void;
    startSpan(metadataContext: object, spanId?: string, parentId?: string): HoneycombSpan;
    finishSpan(span: HoneycombSpan, rollup?: string): void;
    startAsyncSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T): T;
    bindFunctionToTrace<T>(fn: () => T): T;
    runWithoutTrace<T>(fn: () => T): T;
    addContext(context: object): void;
    removeContext(context: object): void;
    marshalTraceContext(context: HoneycombSpan): string;
    unmarshalTraceContext(context_string: string): HoneycombSpan;
    getTraceContext(): HoneycombSpan;
    traceActive(): boolean;
}
