/**
 * THIS VERSION IS DEPRECATED. USE `RumbleshipBeeline` and its associated Factory instead!
 */
import { HoneycombSpan } from './honeycomb.interfaces';
export declare class HoneycombBeelineFactory {
    private static globalBeeline;
    private static ServiceRequestIdBeelineMap;
    /**
     * @param config Configuration
     * @param config.writeKey The honeycomb API key
     * @param config.dataset Dataset -- [production|staging|sandbox|development-{yourname}]
     * @param config.serviceName Servicename [alpha|banking|mediator|...etc]
     */
    constructor(config: {
        writeKey: string;
        dataset: string;
        serviceName: string;
    });
    make(requestId: string, beelineImplementation?: any): RFIBeeline;
}
declare abstract class Beeline {
    withSpan<T>(metadataContext: Record<string, unknown>, fn: (span: HoneycombSpan) => T, rollupKey?: string): T;
    withAsyncSpan<T>(this: Beeline, metadataContext: Record<string, unknown>, fn: () => T): Promise<T>;
    withTrace<T>(metadataContext: Record<string, unknown>, fn: () => T, withTraceId?: string, withParentSpanId?: string, withDataset?: string): T;
    startTrace(metadataContext: Record<string, unknown>, traceId?: string, parentSpanId?: string, dataset?: string): HoneycombSpan;
    finishTrace(span: HoneycombSpan): void;
    startSpan(metadataContext: Record<string, unknown>, spanId?: string, parentId?: string): HoneycombSpan;
    finishSpan(span: HoneycombSpan, rollup?: string): void;
    startAsyncSpan<T>(metadataContext: Record<string, unknown>, fn: (span: HoneycombSpan) => T): T;
    bindFunctionToTrace<T>(fn: () => T): T;
    runWithoutTrace<T>(fn: () => T): T;
    addContext(context: Record<string, unknown>): void;
    removeContext(context: Record<string, unknown>): void;
    marshalTraceContext(context: HoneycombSpan): string;
    unmarshalTraceContext(context_string: string): HoneycombSpan;
    getTraceContext(): HoneycombSpan;
}
/**
 * @deprecated
 */
export declare class RFIBeeline extends Beeline {
    requestId: string;
    private _beelineImplementation;
    constructor(requestId: string, beelineImplementation?: any);
    get beeline(): any;
    withSpan<T>(metadataContext: Record<string, unknown>, fn: (span: HoneycombSpan) => T): T;
    withAsyncSpan(this: RFIBeeline, spanData: Record<string, unknown>, spanFn: Function): Promise<any>;
    bindFunctionToTrace<T>(fn: () => T): T;
}
export interface IHoneycombBeelineFactory {
    make: (requestId: string, beelineImplementation?: any) => RFIBeeline;
}
export {};
