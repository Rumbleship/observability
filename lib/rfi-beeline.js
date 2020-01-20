"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HoneycombBeelineFactory {
    /**
     * @param config Configuration
     * @param config.writeKey The honeycomb API key
     * @param config.dataset Dataset -- [production|staging|sandbox|development-{yourname}]
     * @param config.serviceName Servicename [alpha|banking|mediator|...etc]
     */
    constructor(config) {
        if (!HoneycombBeelineFactory.globalBeeline) {
            HoneycombBeelineFactory.globalBeeline = require('honeycomb-beeline')(Object.assign(Object.assign({}, config), { enabledInstrumentations: ['http', 'https', 'sequelize', 'mysql2', '@hapi/hapi'] }));
        }
    }
    make(requestId, beelineImplementation = HoneycombBeelineFactory.globalBeeline) {
        return new RFIBeeline(requestId, beelineImplementation);
    }
}
exports.HoneycombBeelineFactory = HoneycombBeelineFactory;
class Beeline {
    withSpan(...args) {
        throw new Error('missing implementation');
    }
    withAsyncSpan(...args) {
        throw new Error('missing implementation');
    }
    withTrace(...args) {
        throw new Error('missing implementation');
    }
    startTrace(...args) {
        throw new Error('missing implementation');
    }
    finishTrace(...args) {
        throw new Error('missing implementation');
    }
    startSpan(...args) {
        throw new Error('missing implementation');
    }
    finishSpan(...args) {
        throw new Error('missing implementation');
    }
    startAsyncSpan(...args) {
        throw new Error('missing implementation');
    }
    bindFunctionToTrace(...args) {
        throw new Error('missing implementation');
    }
}
exports.Beeline = Beeline;
class RFIBeeline extends Beeline {
    constructor(requestId, beelineImplementation) {
        super();
        this.requestId = requestId;
        if (!beelineImplementation.withTraceContextFromRequestId) {
            beelineImplementation.withTraceContextFromRequestId = (_requestId, fn) => {
                return fn();
            };
        }
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
    bindFunctionToTrace(fn) {
        if (this.beeline.withTraceContextFromRequestId) {
            return this.beeline.withTraceContextFromRequestId(this.requestId, fn);
        }
        return this.beeline.bindFunctionToTrace(fn);
    }
}
exports.RFIBeeline = RFIBeeline;
function isPromise(p) {
    return p && typeof p.then === 'function';
}
//# sourceMappingURL=rfi-beeline.js.map