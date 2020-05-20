"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const honeycomb_interfaces_1 = require("./honeycomb.interfaces");
const sampler_pipeline_1 = require("./sampler-pipeline");
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
        const sampler = new sampler_pipeline_1.SamplerPipeline();
        this.beeline = configureBeeline({ samplerHook: sampler.sample, ...config });
        this.initialized = true;
    }
    /**
     *
     * @param server_like A Hapi.Server that has been instrumented.
     *
     * Replaces initial `RumbleshipBeeline` with  the beeline that has been
     * reconfigured and extended by the `@hapi/hapi` instrumentation so `bindFunctionToTrace()`
     * picks up the Hapi request context
     */
    static shimFromInstrumentation(server_like) {
        if (server_like.beeline) {
            this.beeline = server_like.beeline;
        }
        if (server_like.app.hny) {
            this.HnyTracker = server_like.app.hny.tracker;
        }
        return server_like;
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
    static flush() {
        return RumbleshipBeeline.beeline.flush();
    }
    /**
     *
     * See https://docs.honeycomb.io/working-with-your-data/tracing/send-trace-data/#links
     *
     * tl;dr: very useful for linking an event-loading-spinner to a brand new trace
     * that actually processes the events; so we can view how many promise chains fork off
     * a single spinner
     */
    linkToSpan(target) {
        this.finishSpan(this.startSpan({
            [honeycomb_interfaces_1.HoneycombSchema.TRACE_LINK_TRACE_ID]: target[honeycomb_interfaces_1.HoneycombSchema.TRACE_ID],
            [honeycomb_interfaces_1.HoneycombSchema.TRACE_LINK_SPAN_ID]: target[honeycomb_interfaces_1.HoneycombSchema.TRACE_SPAN_ID],
            [honeycomb_interfaces_1.HoneycombSchema.TRACE_LINK_META]: 'link'
        }));
    }
    withSpan(metadataContext, fn, rollupKey) {
        try {
            return RumbleshipBeeline.beeline.withSpan(metadataContext, fn, rollupKey);
        }
        catch (error) {
            if (error.extensions) {
                for (const [k, v] of Object.entries(error.extensions)) {
                    this.addTraceContext({ [`gql.error.extensions.${k}`]: v });
                }
            }
            // Is this right?
            throw error;
        }
    }
    /**
     *
     * @param this
     * @param metadata_context
     * @param fn
     *
     * @NOTE You 99.99% want the fn to be `async` and await its result before returning.
     *  If you don't, the wrapped cb is finished outside of context and trace is lost.
     */
    withAsyncSpan(metadata_context, fn) {
        return new Promise((resolve, reject) => {
            const value = this.startAsyncSpan(metadata_context, (span) => {
                let innerValue;
                try {
                    innerValue = fn(span);
                }
                catch (error) {
                    // catch errors here and update the span
                    this.addTraceContext({
                        error: `${error}`,
                        'error.message': error.message,
                        'error.stack': error.stack
                    });
                    if (error.extensions) {
                        for (const [k, v] of Object.entries(error.extensions)) {
                            this.addTraceContext({ [`gql.error.extensions.${k}`]: v });
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
                        this.addTraceContext({
                            error: `${error}`,
                            'error.message': error.message,
                            'error.stack': error.stack
                        });
                        if (error.extensions) {
                            for (const [k, v] of Object.entries(error.extensions)) {
                                this.addTraceContext({
                                    [`gql.error.extensions.${k}`]: v
                                });
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
    startTrace(span_data, traceId, parentSpanId, dataset) {
        var _a, _b;
        const trace = RumbleshipBeeline.beeline.startTrace({
            ...span_data,
            'meta.o11y.hnytracker.size.start': (_a = RumbleshipBeeline === null || RumbleshipBeeline === void 0 ? void 0 : RumbleshipBeeline.HnyTracker) === null || _a === void 0 ? void 0 : _a.tracked.size,
            'meta.o11y.trackedbycontextid.size.start': RumbleshipBeeline.TrackedContextbyContextId.size
        }, traceId, parentSpanId, dataset);
        this.addContext({ gae_version: process.env.GAE_VERSION });
        RumbleshipBeeline.TrackedContextbyContextId.set(this.context_id, (_b = RumbleshipBeeline.HnyTracker) === null || _b === void 0 ? void 0 : _b.getTracked());
        return trace;
    }
    finishTrace(span) {
        var _a, _b;
        const tracked = RumbleshipBeeline.TrackedContextbyContextId.get(this.context_id);
        if (tracked) {
            (_a = RumbleshipBeeline.HnyTracker) === null || _a === void 0 ? void 0 : _a.setTracked(tracked);
        }
        RumbleshipBeeline.beeline.addContext({
            'meta.o11y.hnytracker.size.finish': (_b = RumbleshipBeeline === null || RumbleshipBeeline === void 0 ? void 0 : RumbleshipBeeline.HnyTracker) === null || _b === void 0 ? void 0 : _b.tracked.size,
            'meta.o11y.trackedbycontextid.size.finish': RumbleshipBeeline.TrackedContextbyContextId.size
        });
        RumbleshipBeeline.beeline.finishTrace(span);
        // beeline.finishTrace() takes care of deleting its own map, but we have to delete from ours.
        RumbleshipBeeline.TrackedContextbyContextId.delete(this.context_id);
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
        var _a;
        const tracked = RumbleshipBeeline.TrackedContextbyContextId.get(this.context_id);
        if (tracked) {
            (_a = RumbleshipBeeline.HnyTracker) === null || _a === void 0 ? void 0 : _a.setTracked(tracked);
            return RumbleshipBeeline.beeline.bindFunctionToTrace(fn);
            // RumbleshipBeeline.HnyTracker.deleteTracked() is not required as bindFunctionToTrace()
            // takes care of that for us.
        }
        // I think this case is not actually needed; we completely separate Hapi RequestContext tracking
        // from RumbleshipContext tracking.
        else if (RumbleshipBeeline.beeline.withTraceContextFromRequestId) {
            return RumbleshipBeeline.beeline.withTraceContextFromRequestId(this.context_id, fn);
        }
        else {
            return RumbleshipBeeline.beeline.bindFunctionToTrace(fn);
        }
    }
    runWithoutTrace(fn) {
        return RumbleshipBeeline.beeline.runWithoutTrace(fn);
    }
    /**
     *
     * @param context Add keys+values of an object to JUST the current span
     * @note you probably want `addTraceContext()` to propagate your metadata to all children.
     */
    addContext(context) {
        return RumbleshipBeeline.beeline.addContext(context);
    }
    /**
     *
     * @param context Add keys+values of object to the current span AND ALL CHILD SPANS
     *  Keys are automatically prefixed with `app.`
     */
    addTraceContext(context) {
        return RumbleshipBeeline.beeline.addTraceContext(context);
    }
    removeContext(context) {
        return RumbleshipBeeline.beeline.removeContext(context);
    }
    marshalTraceContext(context) {
        return RumbleshipBeeline.beeline.marshalTraceContext(context);
    }
    /**
     *
     * @param context_string The wrapped beeline expects a string, even if it is empty. We accept
     * undefined because that's more typesafe and cast to the empty string.
     */
    unmarshalTraceContext(context_string) {
        var _a;
        return (_a = RumbleshipBeeline.beeline.unmarshalTraceContext(context_string !== null && context_string !== void 0 ? context_string : '')) !== null && _a !== void 0 ? _a : {};
    }
    getTraceContext() {
        return RumbleshipBeeline.beeline.getTraceContext();
    }
    traceActive() {
        return RumbleshipBeeline.beeline.traceActive();
    }
}
exports.RumbleshipBeeline = RumbleshipBeeline;
RumbleshipBeeline.TrackedContextbyContextId = new Map();
RumbleshipBeeline.initialized = false;
function isPromise(p) {
    return p && typeof p.then === 'function';
}
//# sourceMappingURL=rumbleship-beeline.js.map