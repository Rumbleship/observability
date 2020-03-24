"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RumbleshipBeelineFactory {
    make(request_id) {
        return new RumbleshipBeeline(request_id, RumbleshipBeelineFactory.beeline, RumbleshipBeelineFactory.finishersByContextId);
    }
}
exports.RumbleshipBeelineFactory = RumbleshipBeelineFactory;
RumbleshipBeelineFactory.finishersByContextId = new Map();
class RumbleshipBeeline {
    constructor(context_id, beeline, finishersByContextId) {
        this.context_id = context_id;
        this.beeline = beeline;
        this.finishersByContextId = finishersByContextId;
    }
    withSpan(metadataContext, fn, rollupKey) {
        try {
            return this.beeline.withSpan(metadataContext, fn, rollupKey);
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
    withAsyncSpan(metadata_context, fn) {
        return new Promise((resolve, reject) => {
            const value = this.startAsyncSpan(metadata_context, (span) => {
                let innerValue;
                try {
                    innerValue = fn(span);
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
                    // tslint:disable-next-line: no-floating-promises
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
    withTrace(metadataContext, fn, withTraceId, withParentSpanId, withDataset) {
        return this.beeline.withTrace(metadataContext, fn, withTraceId, withParentSpanId, withDataset);
    }
    finishServiceContextTrace() {
        return this.finishersByContextId.get(this.context_id)();
    }
    startTrace(span_data, traceId, parentSpanId, dataset) {
        const trace = this.beeline.startTrace(span_data, traceId, parentSpanId, dataset);
        const boundFinisher = this.beeline.bindFunctionToTrace(() => this.finishTrace(trace));
        this.finishersByContextId.set(this.context_id, boundFinisher);
        return trace;
    }
    finishTrace(span) {
        return this.beeline.finishTrace(span);
    }
    startSpan(metadataContext, spanId, parentId) {
        return this.beeline.startSpan(metadataContext, spanId, parentId);
    }
    finishSpan(span, rollup) {
        return this.beeline.finishSpan(span, rollup);
    }
    startAsyncSpan(metadataContext, fn) {
        return this.beeline.startAsyncSpan(metadataContext, fn);
    }
    bindFunctionToTrace(fn) {
        if (this.beeline.withTraceContextFromRequestId) {
            return this.beeline.withTraceContextFromRequestId(this.context_id, fn);
        }
        return this.beeline.bindFunctionToTrace(fn)();
    }
    runWithoutTrace(fn) {
        return this.beeline.runWithoutTrace(fn);
    }
    addContext(context) {
        return this.beeline.addContext(context);
    }
    removeContext(context) {
        return this.beeline.removeContext(context);
    }
    marshalTraceContext(context) {
        return this.beeline.marshalTraceContext(context);
    }
    unmarshalTraceContext(context_string) {
        return this.beeline.unmarshalTraceContext(context_string);
    }
    getTraceContext() {
        return this.beeline.getTraceContext();
    }
}
exports.RumbleshipBeeline = RumbleshipBeeline;
function isPromise(p) {
    return p && typeof p.then === 'function';
}
//# sourceMappingURL=rumbleship-beeline.js.map