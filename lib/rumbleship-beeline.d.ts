import { HoneycombSpan, HoneycombConfiguration, IAsyncTracker } from './honeycomb.interfaces';
export declare class RumbleshipBeeline {
    private context_id;
    private static beeline;
    static TrackedContextbyContextId: Map<string, any>;
    static HnyTracker?: IAsyncTracker;
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
    /**
     *
     * @param this
     * @param metadata_context
     * @param fn
     *
     * @NOTE You 99.99% want the fn to be `async` and await its result before returning.
     *  If you don't, the wrapped cb is finished outside of context and trace is lost.
     */
    withAsyncSpan<T>(this: RumbleshipBeeline, metadata_context: object, fn: (span: HoneycombSpan) => Promise<T> | T): Promise<T>;
    withTrace<T>(metadataContext: object, fn: () => T, withTraceId?: string, withParentSpanId?: string, withDataset?: string): T;
    startTrace(span_data: object, traceId?: string, parentSpanId?: string, dataset?: string): HoneycombSpan;
    finishTrace(span: HoneycombSpan): void;
    startSpan(metadataContext: object, spanId?: string, parentId?: string): HoneycombSpan;
    finishSpan(span: HoneycombSpan, rollup?: string): void;
    startAsyncSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T): T;
    /**
     *
     * @param fn A function to bind
     * @param context_id The `context_id` to retreive bind the function to @default this.context_id
     * @returns An executable function whose that ensures the --when executed -- passed fn is called
     * inside the specified trace's context
     */
    static bindFunctionToTrace<T>(fn: () => T, context_id: string): () => T;
    bindFunctionToTrace<T>(fn: () => T, context_id?: string): () => T;
    runWithoutTrace<T>(fn: () => T): T;
    /**
     *
     * @param context Add keys+values of an object to JUST the current span
     * @note you probably want `addTraceContext()` to propagate your metadata to all children.
     */
    addContext(context: object): void;
    /**
     *
     * @param context Add keys+values of object to the current span AND ALL CHILD SPANS
     *  Keys are automatically prefixed with `app.`
     */
    addTraceContext(context: object): void;
    removeContext(context: object): void;
    static marshalTraceContext(context: HoneycombSpan): string;
    /**
     *
     * @param context_string The wrapped beeline expects a string, even if it is empty. We accept
     * undefined because that's more typesafe and cast to the empty string.
     */
    unmarshalTraceContext(context_string?: string): HoneycombSpan | object;
    static getTraceContext(): HoneycombSpan;
    traceActive(): boolean;
}
