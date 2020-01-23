export class HoneycombBeelineFactory {
  private static globalBeeline: any;
  /**
   * @param config Configuration
   * @param config.writeKey The honeycomb API key
   * @param config.dataset Dataset -- [production|staging|sandbox|development-{yourname}]
   * @param config.serviceName Servicename [alpha|banking|mediator|...etc]
   */
  constructor(config: { writeKey: string; dataset: string; serviceName: string }) {
    if (!HoneycombBeelineFactory.globalBeeline) {
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
    return new RFIBeeline(requestId, beelineImplementation);
  }
}

export abstract class Beeline {
  withSpan(...args: any[]) {
    throw new Error('missing implementation');
  }
  withAsyncSpan(...args: any[]) {
    throw new Error('missing implementation');
  }
  withTrace(...args: any[]) {
    throw new Error('missing implementation');
  }
  startTrace(...args: any[]) {
    throw new Error('missing implementation');
  }
  finishTrace(...args: any[]) {
    throw new Error('missing implementation');
  }
  startSpan(...args: any[]) {
    throw new Error('missing implementation');
  }
  finishSpan(...args: any[]) {
    throw new Error('missing implementation');
  }
  startAsyncSpan(...args: any[]) {
    throw new Error('missing implementation');
  }
  bindFunctionToTrace(...args: any[]) {
    throw new Error('missing implementation');
  }
  addContext(context: object) {
    throw new Error('missing implementation');
  }
}
export class RFIBeeline extends Beeline {
  private _beelineImplementation: any;
  constructor(public requestId: string, beelineImplementation?: any) {
    super();
    // `withTraceContextFromRequestId` is added to the Beeline in our fork to enable tracking
    // traces across the internal Hapi request bus. However, it is _functionally_ the same as
    // plain `bindFunctionToTrace`...so just do that.
    // if (!beelineImplementation.withTraceContextFromRequestId) {
    //   beelineImplementation.withTraceContextFromRequestId = (_requestId: any, fn: () => any) => {
    //     return fn();
    //   };
    // }
    this._beelineImplementation = beelineImplementation;
    Object.entries(this._beelineImplementation).forEach(([k, v]) => {
      // We override the native bindFunctionToTrace, + mirror skipping of native
      if (k === 'configure' || k === 'bindFunctionToTrace') {
        return;
      }
      (this as any)[k] = v;
    });
  }

  get beeline() {
    return this._beelineImplementation;
  }

  withSpan(...args: any[]) {
    try {
      return super.withSpan(...args);
    } catch (error) {
      if (error.extensions) {
        for (const [k, v] of Object.entries(error.extensions)) {
          this.addContext({ [`app.gql.error.extensions.${k}`]: v });
        }
      }
    }
  }
  // tslint:disable-next-line: ban-types
  withAsyncSpan(this: RFIBeeline, spanData: any, spanFn: Function): Promise<any> {
    return new Promise((resolve, reject) => {
      const value = (this as any).startAsyncSpan(spanData, (span: any) => {
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

  bindFunctionToTrace(fn: () => any) {
    if (this.beeline.withTraceContextFromRequestId) {
      return this.beeline.withTraceContextFromRequestId(this.requestId, fn);
    }
    return this.beeline.bindFunctionToTrace(fn);
  }
}

// tslint:disable-next-line: interface-name
export interface IHoneycombBeelineFactory {
  make: (requestId: string, beelineImplementation?: any) => RFIBeeline;
}

function isPromise(p: any) {
  return p && typeof p.then === 'function';
}
