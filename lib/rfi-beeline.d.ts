export declare class HoneycombBeelineFactory {
    private static globalBeeline;
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
export declare abstract class Beeline {
    withSpan(...args: any[]): void;
    withAsyncSpan(...args: any[]): void;
    withTrace(...args: any[]): void;
    startTrace(...args: any[]): void;
    finishTrace(...args: any[]): void;
    startSpan(...args: any[]): void;
    finishSpan(...args: any[]): void;
    startAsyncSpan(...args: any[]): void;
    bindFunctionToTrace(...args: any[]): void;
    addContext(context: object): void;
}
export declare class RFIBeeline extends Beeline {
    requestId: string;
    private _beelineImplementation;
    constructor(requestId: string, beelineImplementation?: any);
    get beeline(): any;
    withSpan(...args: any[]): void;
    withAsyncSpan(spanData: any, spanFn: Function): Promise<any>;
    bindFunctionToTrace(fn: () => any): any;
}
export interface IHoneycombBeelineFactory {
    make: (requestId: string, beelineImplementation?: any) => RFIBeeline;
}
