import { HoneycombSpan, HoneycombConfiguration } from './honeycomb.interfaces';
export declare class RumbleshipBeeline {
    private context_id;
    private static beeline;
    private static FinishersByContextId;
    private static initialized;
    /**
     * @param configureBeeline `require('honeycomb-beeline')`
     * @param config configuration to pass directly to the native honeycomb config function
     */
    static initialize(configureBeeline: (config: HoneycombConfiguration) => any, config: HoneycombConfiguration): void;
    /**
     *
     * @param context_id The unique id for the context this beeline is operating in.
     * Likely `service_context_id` or `request_id`
     */
    static make(context_id: string): RumbleshipBeeline;
    constructor(context_id: string);
    withSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T, rollupKey?: string): T;
    withAsyncSpan<T>(this: RumbleshipBeeline, metadata_context: object, fn: (span: HoneycombSpan) => Promise<T> | T): Promise<T>;
    withTrace<T>(metadataContext: object, fn: () => T, withTraceId?: string, withParentSpanId?: string, withDataset?: string): T;
    finishServiceContextTrace(): any;
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
}
