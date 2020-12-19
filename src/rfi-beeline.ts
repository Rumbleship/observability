/**
 * THIS VERSION IS DEPRECATED. USE `RumbleshipBeeline` and its associated Factory instead!
 */

import { HoneycombSpan } from './honeycomb.interfaces';

export class HoneycombBeelineFactory {
  private static globalBeeline: any;
  private static ServiceRequestIdBeelineMap = new Map<string, RFIBeeline>();
  // private static tracker: Tracker;
  /**
   * @param config Configuration
   * @param config.writeKey The honeycomb API key
   * @param config.dataset Dataset -- [production|staging|sandbox|development-{yourname}]
   * @param config.serviceName Servicename [alpha|banking|mediator|...etc]
   */
  constructor(config: { writeKey: string; dataset: string; serviceName: string }) {
    if (!HoneycombBeelineFactory.globalBeeline) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      HoneycombBeelineFactory.globalBeeline = require('honeycomb-beeline')({
        ...config,
        enabledInstrumentations: ['http', 'https', 'sequelize', 'mysql2', '@hapi/hapi']
      });
    }
  }
  make(
    requestId: string,
    beelineImplementation: any = HoneycombBeelineFactory.globalBeeline
  ): RFIBeeline {
    const instance =
      HoneycombBeelineFactory.ServiceRequestIdBeelineMap.get(requestId) ??
      new RFIBeeline(requestId, beelineImplementation);
    HoneycombBeelineFactory.ServiceRequestIdBeelineMap.set(requestId, instance);
    return instance;
  }
}
abstract class Beeline {
  withSpan<T>(
    metadataContext: Record<string, unknown>,
    fn: (span: HoneycombSpan) => T,
    rollupKey?: string
  ): T {
    throw new Error('missing implementation');
  }
  withAsyncSpan<T>(
    this: Beeline,
    metadataContext: Record<string, unknown>,
    fn: () => T
  ): Promise<T> {
    throw new Error('missing implementation');
  }
  withTrace<T>(
    metadataContext: Record<string, unknown>,
    fn: () => T,
    withTraceId?: string,
    withParentSpanId?: string,
    withDataset?: string
  ): T {
    throw new Error('missing implementation');
  }
  startTrace(
    metadataContext: Record<string, unknown>,
    traceId?: string,
    parentSpanId?: string,
    dataset?: string
  ): HoneycombSpan {
    throw new Error('missing implementation');
  }
  finishTrace(span: HoneycombSpan): void {
    throw new Error('missing implementation');
  }
  // startAsyncTrace(
  //   this: Beeline,
  //   metadataContext: Record<string, unknown>,
  //   traceId?: string,
  //   parentSpanId?: string,
  //   dataset?: string
  // ): HoneycombSpan {
  //   throw new Error('missing implementation');
  // }
  startSpan(
    metadataContext: Record<string, unknown>,
    spanId?: string,
    parentId?: string
  ): HoneycombSpan {
    throw new Error('missing implementation');
  }
  finishSpan(span: HoneycombSpan, rollup?: string): void {
    throw new Error('missing implementation');
  }
  startAsyncSpan<T>(metadataContext: Record<string, unknown>, fn: (span: HoneycombSpan) => T): T {
    throw new Error('missing implementation');
  }
  bindFunctionToTrace<T>(fn: () => T): T {
    throw new Error('missing implementation');
  }
  runWithoutTrace<T>(fn: () => T): T {
    throw new Error('missing implementation');
  }
  addContext(context: Record<string, unknown>): void {
    throw new Error('missing implementation');
  }
  removeContext(context: Record<string, unknown>): void {
    throw new Error('missing implementation');
  }
  marshalTraceContext(context: HoneycombSpan): string {
    throw new Error('missing implementation');
  }
  unmarshalTraceContext(context_string: string): HoneycombSpan {
    throw new Error('missing implementation');
  }
  getTraceContext(): HoneycombSpan {
    throw new Error('missing implementation');
  }
}

/**
 * @deprecated
 */
export class RFIBeeline extends Beeline {
  private _beelineImplementation: any;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(public requestId: string, beelineImplementation?: any) {
    super();

    this._beelineImplementation = beelineImplementation;
    Object.entries(this._beelineImplementation).forEach(([k, v]) => {
      // We override the native bindFunctionToTrace, + mirror skipping of native
      if (k === 'configure' || k === 'bindFunctionToTrace') {
        return;
      }
      (this as any)[k] = v;
    });
  }

  get beeline(): any {
    return this._beelineImplementation;
  }

  withSpan<T>(metadataContext: Record<string, unknown>, fn: (span: HoneycombSpan) => T): T {
    try {
      return super.withSpan<T>(metadataContext, fn);
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
  // tslint:disable-next-line: ban-types
  withAsyncSpan(
    this: RFIBeeline,
    spanData: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    spanFn: Function
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const value = this.startAsyncSpan(spanData, (span: any) => {
        let innerValue;
        try {
          innerValue = spanFn(span);
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
          innerValue
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
        value.then(resolve).catch(reject);
      } else {
        resolve(value);
      }
    });
  }
  // `withTraceContextFromRequestId` is added to the Beeline in our fork's **HAPI INSTRUMENTATION**
  // to enable tracking traces across the internal Hapi request bus.
  // However, it is _functionally_ the same as
  // plain `bindFunctionToTrace`...so just do that.
  bindFunctionToTrace<T>(fn: () => T): T {
    if (this.beeline.withTraceContextFromRequestId) {
      return this.beeline.withTraceContextFromRequestId(this.requestId, fn);
    }
    return this.beeline.bindFunctionToTrace(fn)();
  }
}

export interface IHoneycombBeelineFactory {
  make: (requestId: string, beelineImplementation?: any) => RFIBeeline;
}

function isPromise(p: any) {
  return p && typeof p.then === 'function';
}
