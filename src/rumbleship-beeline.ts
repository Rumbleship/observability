import { HoneycombSpan, Tracker } from './honeycomb.interfaces';
export class RumbleshipBeelineFactory {
  static beeline: any;
  static tracker?: Tracker;
  static api?: any;
  static finishersByContextId: Map<string, () => any> = new Map();
  make(request_id: string) {
    return new RumbleshipBeeline(
      request_id,
      RumbleshipBeelineFactory.beeline,
      RumbleshipBeelineFactory.finishersByContextId,
      RumbleshipBeelineFactory.api,
      RumbleshipBeelineFactory.tracker
    );
  }
}

export class RumbleshipBeeline {
  constructor(
    private context_id: string,
    private beeline: any,
    private finishersByContextId: Map<string, () => any>,
    private _api?: any,
    private _tracker?: Tracker
  ) {}
  get api() {
    return this._api;
  }
  get tracker() {
    return this._tracker;
  }
  withSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T, rollupKey?: string): T {
    try {
      return this.beeline.withSpan(metadataContext, fn, rollupKey);
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
    return this.beeline.withTrace(metadataContext, fn, withTraceId, withParentSpanId, withDataset);
  }
  startOrResumeServiceContextTrace(
    service_context_id: string,
    span_data: object,
    traceId?: string,
    parentSpanId?: string,
    dataset?: string
  ) {
    const trace = this.startTrace(span_data, traceId, parentSpanId, dataset);
    this.finishersByContextId.set(service_context_id, () => this.finishTrace(trace));
    return trace;
  }

  finishServiceContextTrace(service_context_id: string, span: HoneycombSpan) {
    return this.finishersByContextId.get(service_context_id)!();
  }
  startTrace(
    metadataContext: object,
    traceId?: string,
    parentSpanId?: string,
    dataset?: string
  ): HoneycombSpan {
    return this.beeline.startTrace(metadataContext, traceId, parentSpanId, dataset);
  }
  finishTrace(span: HoneycombSpan): void {
    return this.beeline.finishTrace(span);
  }
  startSpan(metadataContext: object, spanId?: string, parentId?: string): HoneycombSpan {
    return this.beeline.startSpan(metadataContext, spanId, parentId);
  }
  finishSpan(span: HoneycombSpan, rollup?: string): void {
    return this.beeline.finishSpan(span, rollup);
  }
  startAsyncSpan<T>(metadataContext: object, fn: (span: HoneycombSpan) => T): T {
    return this.beeline.startAsyncSpan(metadataContext, fn);
  }
  bindFunctionToTrace<T>(fn: () => T): T {
    if (this.beeline.withTraceContextFromRequestId) {
      return this.beeline.withTraceContextFromRequestId(this.context_id, fn);
    }
    return this.beeline.bindFunctionToTrace(fn)();
  }
  runWithoutTrace<T>(fn: () => T): T {
    return this.beeline.runWithoutTrace(fn);
  }
  addContext(context: object): void {
    return this.beeline.addContext(context);
  }
  removeContext(context: object): void {
    return this.beeline.removeContext(context);
  }
  marshalTraceContext(context: HoneycombSpan): string {
    return this.beeline.marshalTraceContext(context);
  }
  unmarshalTraceContext(context_string: string): HoneycombSpan {
    return this.beeline.unmarshalTraceContext(context_string);
  }
  getTraceContext(): HoneycombSpan {
    return this.beeline.getTraceContext();
  }
}

function isPromise(p: any) {
  return p && typeof p.then === 'function';
}
