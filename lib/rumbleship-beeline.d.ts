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
     *
     * BUT! it copies across the internal, rumbleship-initialized, samplerHook, that the Hapi
     * instrumentation-configured one does not seem to pick up.
     */
    static shimFromInstrumentation<T>(server_like: T): T;
    /**
     *
     * @param context_id The unique id for the context this beeline is operating in.
     * Likely `service_context_id` or `request_id`
     */
    static make(context_id: string): RumbleshipBeeline;
    static flush(): unknown;
    constructor(context_id: string);
    /**
     *
     * See https://docs.honeycomb.io/working-with-your-data/tracing/send-trace-data/#links
     *
     * tl;dr: very useful for linking an event-loading-spinner to a brand new trace
     * that actually processes the events; so we can view how many promise chains fork off
     * a single spinner
     *
     *
     * @note due to inconsistencies in the `HoneycombSpan` type with reality, this probably doesn't work.
     *  Signature should be more like `({ payload: target }: { payload: HoneycombSpan })`.
     * @chore https://www.pivotaltracker.com/story/show/173409782
     */
    linkToSpan(target: HoneycombSpan): void;
    withSpan<T>(metadataContext: Record<string, unknown>, fn: () => T, rollupKey?: string): T;
    /**
     *
     * @param this
     * @param metadata_context
     * @param fn
     *
     * @NOTE You 99.99% want the fn to be `async` and await its result before returning.
     *  If you don't, the wrapped cb is finished outside of context and trace is lost.
     */
    withAsyncSpan<T>(this: RumbleshipBeeline, metadata_context: Record<string, unknown>, fn: (span: HoneycombSpan) => Promise<T> | T): Promise<T>;
    withTrace<T>(metadataContext: Record<string, unknown>, fn: () => T, withTraceId?: string, withParentSpanId?: string, withDataset?: string): T;
    startTrace(span_data: Record<string, unknown>, traceId?: string, parentSpanId?: string, dataset?: string): HoneycombSpan;
    finishTrace(span: HoneycombSpan): void;
    startSpan(metadataContext: Record<string, unknown>, spanId?: string, parentId?: string): HoneycombSpan;
    finishSpan(span: HoneycombSpan, rollup?: string): void;
    startAsyncSpan<T>(metadataContext: Record<string, unknown>, fn: (span: HoneycombSpan) => T): T;
    /**
     *
     * @param fn A function to bind
     * @param context_id The `context_id` to retreive bind the function to @default this.context_id
     * @returns An executable function whose that ensures the --when executed -- passed fn is called
     * inside the specified trace's context
     */
    static bindFunctionToTrace<T, TA extends any[] = any[], TF = ((...args: TA) => T) | (() => T)>(fn: TF, context_id: string): TF;
    bindFunctionToTrace<T, TA extends any[] = any[], TF = ((...args: TA) => T) | (() => T)>(fn: TF, context_id?: string): TF;
    static runWithoutTrace<T>(fn: () => T): T;
    runWithoutTrace<T>(fn: () => T): T;
    /**
     *
     * @param context Add keys+values of an object to JUST the current span
     * @note you probably want `addTraceContext()` to propagate your metadata to all children.
     */
    addContext(context: Record<string, unknown>): void;
    /**
     *
     * @param context Add keys+values of object to the current span AND ALL CHILD SPANS
     *  Keys are automatically prefixed with `app.`
     */
    addTraceContext(context: Record<string, unknown>): void;
    removeContext(context: Record<string, unknown>): void;
    marshalTraceContext(context: HoneycombSpan): string;
    static marshalTraceContext(context: HoneycombSpan): string;
    /**
     *
     * @param context_string The wrapped beeline expects a string, even if it is empty. We accept
     * undefined because that's more typesafe and cast to the empty string.
     */
    unmarshalTraceContext(context_string?: string): HoneycombSpan | Record<string, unknown>;
    static getTraceContext(context_id: string): HoneycombSpan;
    getTraceContext(): HoneycombSpan;
    static traceActive(context_id: string): boolean;
    traceActive(): boolean;
}
