"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RumbleshipBeeline {
    constructor(context_id) {
        this.context_id = context_id;
    }
    /**
     * @param configureBeeline `require('honeycomb-beeline')`
     * @param config configuration to pass directly to the native honeycomb config function
     */
    static initialize(configureBeeline, config) {
        if (this.initialized) {
            throw new Error('RumbleshipBeeline already initialized as a singleton. Cannot reinitialize');
        }
        this.beeline = configureBeeline(config);
        this.initialized = true;
    }
    /**
     *
     * @param context_id The unique id for the context this beeline is operating in.
     * Likely `service_context_id` or `request_id`
     */
    static make(context_id) {
        if (!this.initialized) {
            throw new Error('Cannot make a RumbleshipBeeline instance without initializing the singleton first');
        }
        return new RumbleshipBeeline(context_id);
    }
    withSpan(metadataContext, fn, rollupKey) {
        try {
            return RumbleshipBeeline.beeline.withSpan(metadataContext, fn, rollupKey);
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
        return RumbleshipBeeline.beeline.withTrace(metadataContext, fn, withTraceId, withParentSpanId, withDataset);
    }
    finishServiceContextTrace() {
        return RumbleshipBeeline.FinishersByContextId.get(this.context_id)();
    }
    startTrace(span_data, traceId, parentSpanId, dataset) {
        const trace = RumbleshipBeeline.beeline.startTrace(span_data, traceId, parentSpanId, dataset);
        const boundFinisher = RumbleshipBeeline.beeline.bindFunctionToTrace(() => this.finishTrace(trace));
        RumbleshipBeeline.FinishersByContextId.set(this.context_id, boundFinisher);
        return trace;
    }
    finishTrace(span) {
        return RumbleshipBeeline.beeline.finishTrace(span);
    }
    startSpan(metadataContext, spanId, parentId) {
        return RumbleshipBeeline.beeline.startSpan(metadataContext, spanId, parentId);
    }
    finishSpan(span, rollup) {
        return RumbleshipBeeline.beeline.finishSpan(span, rollup);
    }
    startAsyncSpan(metadataContext, fn) {
        return RumbleshipBeeline.beeline.startAsyncSpan(metadataContext, fn);
    }
    bindFunctionToTrace(fn) {
        if (RumbleshipBeeline.beeline.withTraceContextFromRequestId) {
            return RumbleshipBeeline.beeline.withTraceContextFromRequestId(this.context_id, fn);
        }
        return RumbleshipBeeline.beeline.bindFunctionToTrace(fn)();
    }
    runWithoutTrace(fn) {
        return RumbleshipBeeline.beeline.runWithoutTrace(fn);
    }
    addContext(context) {
        return RumbleshipBeeline.beeline.addContext(context);
    }
    removeContext(context) {
        return RumbleshipBeeline.beeline.removeContext(context);
    }
    marshalTraceContext(context) {
        return RumbleshipBeeline.beeline.marshalTraceContext(context);
    }
    unmarshalTraceContext(context_string) {
        return RumbleshipBeeline.beeline.unmarshalTraceContext(context_string);
    }
    getTraceContext() {
        return RumbleshipBeeline.beeline.getTraceContext();
    }
}
exports.RumbleshipBeeline = RumbleshipBeeline;
RumbleshipBeeline.FinishersByContextId = new Map();
RumbleshipBeeline.initialized = false;
function isPromise(p) {
    return p && typeof p.then === 'function';
}
//# sourceMappingURL=rumbleship-beeline.js.map