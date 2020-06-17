import {
  HoneycombSpan,
  HoneycombConfiguration,
  HoneycombSchema,
  IAsyncTracker
} from './honeycomb.interfaces';
import { SamplerPipeline } from './sampler-pipeline';
export class RumbleshipBeeline {
  private static beeline: any; // The wrapped beeline from `require('honeycomb-beeline')`;
  static TrackedContextbyContextId: Map<string, any> = new Map();
  static HnyTracker?: IAsyncTracker; // the async_tracker from deep inside honeycomb-beeline
  private static initialized: boolean = false;
  /**
   * @param configureBeeline `require('honeycomb-beeline')`
   * @param config configuration to pass directly to the native honeycomb config function
   */
  static initialize(
    configureBeeline: (config: HoneycombConfiguration) => any,
    config: HoneycombConfiguration
  ) {
    if (this.initialized) {
      throw new Error('RumbleshipBeeline already initialized as a singleton. Cannot reinitialize');
    }
    const sampler = new SamplerPipeline();
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
  static shimFromInstrumentation<T>(server_like: T): T {
    if ((server_like as any).beeline) {
      this.beeline = (server_like as any).beeline;
    }
    if ((server_like as any).app.hny) {
      this.HnyTracker = (server_like as any).app.hny.tracker;
    }
    return server_like;
  }
  /**
   *
   * @param context_id The unique id for the context this beeline is operating in.
   * Likely `service_context_id` or `request_id`
   */
  static make(context_id: string): RumbleshipBeeline {
    if (!this.initialized) {
      throw new Error(
        'Cannot make a RumbleshipBeeline instance without initializing the singleton first'
      );
    }
    return new RumbleshipBeeline(context_id);
  }
  static flush() {
    return RumbleshipBeeline.beeline.flush();
  }
  constructor(private context_id: string) {}
  /**
   *
   * See https://docs.honeycomb.io/working-with-your-data/tracing/send-trace-data/#links
   *
   * tl;dr: very useful for linking an event-loading-spinner to a brand new trace
   * that actually processes the events; so we can view how many promise chains fork off
   * a single spinner
   */
  linkToSpan(target: HoneycombSpan) {
    this.finishSpan(
      this.startSpan({
        [HoneycombSchema.TRACE_LINK_TRACE_ID]: target[HoneycombSchema.TRACE_ID],
        [HoneycombSchema.TRACE_LINK_SPAN_ID]: target[HoneycombSchema.TRACE_SPAN_ID],
        [HoneycombSchema.TRACE_LINK_META]: 'link'
      })
    );
  }
  withSpan<T>(metadataContext: object, fn: () => T, rollupKey?: string): T {
    try {
      return RumbleshipBeeline.beeline.withSpan(metadataContext, fn, rollupKey);
    } catch (error) {
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
  withAsyncSpan<T>(
    this: RumbleshipBeeline,
    metadata_context: object,
    fn: (span: HoneycombSpan) => Promise<T> | T
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const value = this.startAsyncSpan(metadata_context, (span: any) => {
        let innerValue;
        try {
          innerValue = fn(span);
        } catch (error) {
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
        } finally {
          // If it's not a promise and the spanFn throws
          // this is our only chance to finish the span!
          if (!isPromise(innerValue)) {
            this.finishSpan(span);
          }
        }

        if (isPromise(innerValue)) {
          // tslint:disable-next-line: no-floating-promises
          (innerValue as Promise<T>)
            .catch((error: Error) => {
              // catch errors here and update the span
              this.addTraceContext({
                error: `${error}`,
                'error.message': error.message,
                'error.stack': error.stack
              });
              if ((error as any).extensions) {
                for (const [k, v] of Object.entries((error as any).extensions)) {
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
        (value as Promise<T>).then(resolve).catch(reject);
      } else {
        resolve(value);
      }
    });
  }
  withTrace<T>(
    metadataContext: object,
    fn: () => T,
    withTraceId?: string,
    withParentSpanId?: string,
    withDataset?: string
  ): T {
    return RumbleshipBeeline.beeline.withTrace(
      metadataContext,
      fn,
      withTraceId,
      withParentSpanId,
      withDataset
    );
  }

  startTrace(
    span_data: object,
    traceId?: string,
    parentSpanId?: string,
    dataset?: string
  ): HoneycombSpan {
    const trace = RumbleshipBeeline.beeline.startTrace(
      {
        ...span_data,
        'meta.o11y.hnytracker.size.start': RumbleshipBeeline?.HnyTracker?.tracked.size,
        'meta.o11y.trackedbycontextid.size.start': RumbleshipBeeline.TrackedContextbyContextId.size
      },
      traceId,
      parentSpanId,
      dataset
    );
    this.addTraceContext({
      'gae.env.GAE_APPLICATION': process.env.GAE_APPLICATION,
      'gae.env.GAE_DEPLOYMENT_ID': process.env.GAE_DEPLOYMENT_ID,
      'gae.env.GAE_ENV': process.env.GAE_ENV,
      'gae.env.GAE_INSTANCE': process.env.GAE_INSTANCE,
      'gae.env.GAE_MEMORY_MB': process.env.GAE_MEMORY_MB,
      'gae.env.GAE_RUNTIME': process.env.GAE_RUNTIME,
      'gae.env.GAE_SERVICE': process.env.GAE_SERVICE,
      'gae.env.GAE_VERSION': process.env.GAE_VERSION,
      'gae.env.GOOGLE_CLOUD_PROJECT': process.env.GOOGLE_CLOUD_PROJECT
    });
    RumbleshipBeeline.TrackedContextbyContextId.set(
      this.context_id,
      RumbleshipBeeline.HnyTracker?.getTracked()
    );
    return trace;
  }
  finishTrace(span: HoneycombSpan): void {
    const tracked = RumbleshipBeeline.TrackedContextbyContextId.get(this.context_id);
    if (tracked) {
      RumbleshipBeeline.HnyTracker?.setTracked(tracked);
    }
    RumbleshipBeeline.beeline.addContext({
      'meta.o11y.hnytracker.size.finish': RumbleshipBeeline?.HnyTracker?.tracked.size,
      'meta.o11y.trackedbycontextid.size.finish': RumbleshipBeeline.TrackedContextbyContextId.size
    });
    RumbleshipBeeline.beeline.finishTrace(span);
    // beeline.finishTrace() takes care of deleting its own map, but we have to delete from ours.
    RumbleshipBeeline.TrackedContextbyContextId.delete(this.context_id);
  }
  startSpan(metadataContext: object, spanId?: string, parentId?: string): HoneycombSpan {
    return RumbleshipBeeline.beeline.startSpan(metadataContext, spanId, parentId);
  }
  finishSpan(span: HoneycombSpan, rollup?: string): void {
    return RumbleshipBeeline.beeline.finishSpan(span, rollup);
  }
  startAsyncSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T): T {
    return RumbleshipBeeline.beeline.startAsyncSpan(metadataContext, fn);
  }

  /**
   *
   * @param fn A function to bind
   * @param context_id The `context_id` to retreive bind the function to @default this.context_id
   * @returns An executable function whose that ensures the --when executed -- passed fn is called
   * inside the specified trace's context
   */
  static bindFunctionToTrace<T, TA extends any[] = any[], TF = ((...args: TA) => T) | (() => T)>(
    fn: TF,
    context_id: string
  ): TF {
    const tracked = RumbleshipBeeline.TrackedContextbyContextId.get(context_id);
    if (tracked) {
      RumbleshipBeeline.HnyTracker?.setTracked(tracked);
      return RumbleshipBeeline.beeline.bindFunctionToTrace(fn);
      // RumbleshipBeeline.HnyTracker.deleteTracked() is not required as bindFunctionToTrace()
      // takes care of that for us.
    }
    // I think this case is not actually needed; we completely separate Hapi RequestContext tracking
    // from RumbleshipContext tracking.
    else if (RumbleshipBeeline.beeline.withTraceContextFromRequestId) {
      return RumbleshipBeeline.beeline.withTraceContextFromRequestId(context_id, fn);
    } else {
      return RumbleshipBeeline.beeline.bindFunctionToTrace(fn);
    }
  }

  bindFunctionToTrace<T, TA extends any[] = any[], TF = ((...args: TA) => T) | (() => T)>(
    fn: TF,
    context_id: string = this.context_id
  ): TF {
    const tracked = RumbleshipBeeline.TrackedContextbyContextId.get(context_id);
    if (tracked) {
      RumbleshipBeeline.HnyTracker?.setTracked(tracked);
      return RumbleshipBeeline.beeline.bindFunctionToTrace(fn);
      // RumbleshipBeeline.HnyTracker.deleteTracked() is not required as bindFunctionToTrace()
      // takes care of that for us.
    }
    // I think this case is not actually needed; we completely separate Hapi RequestContext tracking
    // from RumbleshipContext tracking.
    else if (RumbleshipBeeline.beeline.withTraceContextFromRequestId) {
      return RumbleshipBeeline.beeline.withTraceContextFromRequestId(this.context_id, fn);
    } else {
      return RumbleshipBeeline.beeline.bindFunctionToTrace(fn);
    }
  }

  static runWithoutTrace<T, TA extends any[] = any[], TF = ((...args: TA) => T) | (() => T)>(
    fn: () => T
  ): TF {
    return RumbleshipBeeline.beeline.runWithoutTrace(fn);
  }
  runWithoutTrace<T, TA extends any[] = any[], TF = ((...args: TA) => T) | (() => T)>(
    fn: () => T
  ): TF {
    return RumbleshipBeeline.beeline.runWithoutTrace(fn);
  }
  /**
   *
   * @param context Add keys+values of an object to JUST the current span
   * @note you probably want `addTraceContext()` to propagate your metadata to all children.
   */
  addContext(context: object): void {
    return RumbleshipBeeline.beeline.addContext(context);
  }
  /**
   *
   * @param context Add keys+values of object to the current span AND ALL CHILD SPANS
   *  Keys are automatically prefixed with `app.`
   */
  addTraceContext(context: object): void {
    return RumbleshipBeeline.beeline.addTraceContext(context);
  }
  removeContext(context: object): void {
    return RumbleshipBeeline.beeline.removeContext(context);
  }

  marshalTraceContext(context: HoneycombSpan): string {
    return RumbleshipBeeline.marshalTraceContext(context);
  }
  static marshalTraceContext(context: HoneycombSpan): string {
    return RumbleshipBeeline.beeline.marshalTraceContext(context);
  }
  /**
   *
   * @param context_string The wrapped beeline expects a string, even if it is empty. We accept
   * undefined because that's more typesafe and cast to the empty string.
   */
  unmarshalTraceContext(context_string?: string): HoneycombSpan | object {
    return RumbleshipBeeline.beeline.unmarshalTraceContext(context_string ?? '') ?? {};
  }
  static getTraceContext(context_id: string): HoneycombSpan {
    if (RumbleshipBeeline.beeline.traceActive()) {
      return RumbleshipBeeline.beeline.getTraceContext();
    }
    return this.bindFunctionToTrace(
      () => RumbleshipBeeline.beeline.getTraceContext(),
      context_id
    )();
  }
  getTraceContext(): HoneycombSpan {
    if (RumbleshipBeeline.beeline.traceActive()) {
      return RumbleshipBeeline.beeline.getTraceContext();
    }
    return this.bindFunctionToTrace(
      () => RumbleshipBeeline.beeline.getTraceContext(),
      this.context_id
    )();
  }

  static traceActive(context_id: string): boolean {
    return (
      RumbleshipBeeline.beeline.traceActive() ??
      this.bindFunctionToTrace(() => RumbleshipBeeline.beeline.traceActive(), context_id)()
    );
  }
  traceActive(): boolean {
    return (
      RumbleshipBeeline.beeline.traceActive() ??
      this.bindFunctionToTrace(() => RumbleshipBeeline.beeline.traceActive())()
    );
    // return this.bindFunctionToTrace(() => RumbleshipBeeline.beeline.traceActive())();
    return RumbleshipBeeline.beeline.traceActive();
  }
}

function isPromise(p: any) {
  return p && typeof p.then === 'function';
}
