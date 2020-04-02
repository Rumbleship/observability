"use strict";
/**
 * THIS VERSION IS DEPRECATED. USE `RumbleshipBeeline` and its associated Factory instead!
 */
Object.defineProperty(exports, "__esModule", { value: true });
class HoneycombBeelineFactory {
    // private static tracker: Tracker;
    /**
     * @param config Configuration
     * @param config.writeKey The honeycomb API key
     * @param config.dataset Dataset -- [production|staging|sandbox|development-{yourname}]
     * @param config.serviceName Servicename [alpha|banking|mediator|...etc]
     */
    constructor(config) {
        if (!HoneycombBeelineFactory.globalBeeline) {
            HoneycombBeelineFactory.globalBeeline = require('honeycomb-beeline')({
                ...config,
                enabledInstrumentations: ['http', 'https', 'sequelize', 'mysql2', '@hapi/hapi']
            });
        }
    }
    make(requestId, beelineImplementation = HoneycombBeelineFactory.globalBeeline) {
        var _a;
        const instance = (_a = HoneycombBeelineFactory.ServiceRequestIdBeelineMap.get(requestId)) !== null && _a !== void 0 ? _a : new RFIBeeline(requestId, beelineImplementation);
        HoneycombBeelineFactory.ServiceRequestIdBeelineMap.set(requestId, instance);
        return instance;
    }
}
exports.HoneycombBeelineFactory = HoneycombBeelineFactory;
HoneycombBeelineFactory.ServiceRequestIdBeelineMap = new Map();
class Beeline {
    withSpan(metadataContext, fn, rollupKey) {
        throw new Error('missing implementation');
    }
    withAsyncSpan(metadataContext, fn) {
        throw new Error('missing implementation');
    }
    withTrace(metadataContext, fn, withTraceId, withParentSpanId, withDataset) {
        throw new Error('missing implementation');
    }
    startTrace(metadataContext, traceId, parentSpanId, dataset) {
        throw new Error('missing implementation');
    }
    finishTrace(span) {
        throw new Error('missing implementation');
    }
    // startAsyncTrace(
    //   this: Beeline,
    //   metadataContext: object,
    //   traceId?: string,
    //   parentSpanId?: string,
    //   dataset?: string
    // ): HoneycombSpan {
    //   throw new Error('missing implementation');
    // }
    startSpan(metadataContext, spanId, parentId) {
        throw new Error('missing implementation');
    }
    finishSpan(span, rollup) {
        throw new Error('missing implementation');
    }
    startAsyncSpan(metadataContext, fn) {
        throw new Error('missing implementation');
    }
    bindFunctionToTrace(fn) {
        throw new Error('missing implementation');
    }
    runWithoutTrace(fn) {
        throw new Error('missing implementation');
    }
    addContext(context) {
        throw new Error('missing implementation');
    }
    removeContext(context) {
        throw new Error('missing implementation');
    }
    marshalTraceContext(context) {
        throw new Error('missing implementation');
    }
    unmarshalTraceContext(context_string) {
        throw new Error('missing implementation');
    }
    getTraceContext() {
        throw new Error('missing implementation');
    }
}
class RFIBeeline extends Beeline {
    constructor(requestId, beelineImplementation) {
        super();
        this.requestId = requestId;
        this._beelineImplementation = beelineImplementation;
        Object.entries(this._beelineImplementation).forEach(([k, v]) => {
            // We override the native bindFunctionToTrace, + mirror skipping of native
            if (k === 'configure' || k === 'bindFunctionToTrace') {
                return;
            }
            this[k] = v;
        });
    }
    get beeline() {
        return this._beelineImplementation;
    }
    withSpan(metadataContext, fn) {
        try {
            return super.withSpan(metadataContext, fn);
        }
        catch (error) {
            if (error.extensions) {
                for (const [k, v] of Object.entries(error.extensions)) {
                    this.addContext({ [`app.gql.error.extensions.${k}`]: v });
                }
            }
            // Is this right?
            throw error;
        }
    }
    // tslint:disable-next-line: ban-types
    withAsyncSpan(spanData, spanFn) {
        return new Promise((resolve, reject) => {
            const value = this.startAsyncSpan(spanData, (span) => {
                let innerValue;
                try {
                    innerValue = spanFn(span);
                }
                catch (error) {
                    // catch errors here and update the span
                    this.addContext({
                        error: `${error}`,
                        'error.message': error.message,
                        'error.stack': error.stack
                    });
                    if (error.extensions) {
                        for (const [k, v] of Object.entries(error.extensions)) {
                            this.addContext({ [`app.gql.error.extensions.${k}`]: v });
                        }
                    }
                    // re-throw here so the calling function can
                    // decide to do something about the error
                    throw error;
                }
                finally {
                    // If it's not a promise and the spanFn throws
                    // this is our only chance to finish the span!
                    if (!isPromise(innerValue)) {
                        this.finishSpan(span);
                    }
                }
                if (isPromise(innerValue)) {
                    innerValue
                        .catch((error) => {
                        // catch errors here and update the span
                        this.addContext({
                            error: `${error}`,
                            'error.message': error.message,
                            'error.stack': error.stack
                        });
                        if (error.extensions) {
                            for (const [k, v] of Object.entries(error.extensions)) {
                                this.addContext({ [`app.gql.error.extensions.${k}`]: v });
                            }
                        }
                        throw error;
                    })
                        .finally(() => {
                        this.finishSpan(span);
                    });
                }
                return innerValue;
            });
            // Now that we have the return value we just forward it
            if (isPromise(value)) {
                value.then(resolve).catch(reject);
            }
            else {
                resolve(value);
            }
        });
    }
    // `withTraceContextFromRequestId` is added to the Beeline in our fork's **HAPI INSTRUMENTATION**
    // to enable tracking traces across the internal Hapi request bus.
    // However, it is _functionally_ the same as
    // plain `bindFunctionToTrace`...so just do that.
    bindFunctionToTrace(fn) {
        if (this.beeline.withTraceContextFromRequestId) {
            return this.beeline.withTraceContextFromRequestId(this.requestId, fn);
        }
        return this.beeline.bindFunctionToTrace(fn)();
    }
}
exports.RFIBeeline = RFIBeeline;
function isPromise(p) {
    return p && typeof p.then === 'function';
}
//# sourceMappingURL=rfi-beeline.js.map