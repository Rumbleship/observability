import { HoneycombSpan } from './honeycomb.interfaces';
export declare class RumbleshipBeelineFactory {
    static beeline: any;
    static finishersByContextId: Map<string, () => any>;
    make(request_id: string): RumbleshipBeeline;
}
export declare class RumbleshipBeeline {
    private context_id;
    private beeline;
    private finishersByContextId;
    constructor(context_id: string, beeline: any, finishersByContextId: Map<string, () => any>);
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
