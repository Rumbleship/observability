import { HoneycombSpan, HoneycombConfiguration, HoneycombSchema } from './honeycomb.interfaces';
export class RumbleshipBeeline {
  private static beeline: any; // The wrapped beeline from `require('honeycomb-beeline')`;
  private static FinishersByContextId: Map<string, () => any> = new Map();
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
    this.beeline = configureBeeline(config);
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
  withSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T, rollupKey?: string): T {
    try {
      return RumbleshipBeeline.beeline.withSpan(metadataContext, fn, rollupKey);
    } catch (error) {
      if (error.extensions) {
        for (const [k, v] of Object.entries(error.extensions)) {
          this.addContext({ [`app.gql.error.extensions.${k}`]: v });
        }
      }
      // Is this right?
      throw error;
    }
  }
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
              this.addContext({
                error: `${error}`,
                'error.message': error.message,
                'error.stack': error.stack
              });
              if ((error as any).extensions) {
                for (const [k, v] of Object.entries((error as any).extensions)) {
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
  finishRumbleshipContextTrace() {
    return RumbleshipBeeline.FinishersByContextId.get(this.context_id)!();
  }
  startTrace(
    span_data: object,
    traceId?: string,
    parentSpanId?: string,
    dataset?: string
  ): HoneycombSpan {
    const trace = RumbleshipBeeline.beeline.startTrace(span_data, traceId, parentSpanId, dataset);
    const boundFinisher = RumbleshipBeeline.beeline.bindFunctionToTrace(() =>
      this.finishTrace(trace)
    );
    RumbleshipBeeline.FinishersByContextId.set(this.context_id, boundFinisher);
    return trace;
  }
  finishTrace(span: HoneycombSpan): void {
    return RumbleshipBeeline.beeline.finishTrace(span);
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
  bindFunctionToTrace<T>(fn: () => T): T {
    if (RumbleshipBeeline.beeline.withTraceContextFromRequestId) {
      return RumbleshipBeeline.beeline.withTraceContextFromRequestId(this.context_id, fn);
    }
    return RumbleshipBeeline.beeline.bindFunctionToTrace(fn);
  }
  runWithoutTrace<T>(fn: () => T): T {
    return RumbleshipBeeline.beeline.runWithoutTrace(fn);
  }
  addContext(context: object): void {
    return RumbleshipBeeline.beeline.addContext(context);
  }
  removeContext(context: object): void {
    return RumbleshipBeeline.beeline.removeContext(context);
  }
  marshalTraceContext(context: HoneycombSpan): string {
    return RumbleshipBeeline.beeline.marshalTraceContext(context);
  }
  unmarshalTraceContext(context_string: string): HoneycombSpan {
    return RumbleshipBeeline.beeline.unmarshalTraceContext(context_string);
  }
  getTraceContext(): HoneycombSpan {
    return RumbleshipBeeline.beeline.getTraceContext();
  }
  traceActive(): boolean {
    return RumbleshipBeeline.beeline.traceActive();
  }
}

function isPromise(p: any) {
  return p && typeof p.then === 'function';
}
