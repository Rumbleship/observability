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
export declare class RFIBeeline {
    requestId: string;
    private _beelineImplementation;
    constructor(requestId: string, beelineImplementation?: any);
    get beeline(): any;
    withAsyncSpan(this: any, spanData: any, spanFn: Function): Promise<any>;
    bindFunctionToTrace(fn: () => any): any;
}
export interface IHoneycombBeelineFactory {
    make: (requestId: string, beelineImplementation?: any) => RFIBeeline;
}
