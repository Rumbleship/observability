import 'reflect-metadata';
import { RumbleshipBeeline } from './rumbleship-beeline';
export function WithSpan(context: Record<string, unknown> = {}): MethodDecorator {
  // tslint:disable-next-line: no-console
  console.warn(
    '@rumbleship/o11y.WithSpan is now deprecated. Update to @rumbleship/o11y.WithAsyncSpan'
  );
  return (target: any, propertyName: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    // NOTE: because the ctx is defined in the framework, this should probably be defined in the framework too
    // The framework should dependn on `@rumbleship/o11y` and then export WithSpan? That seems...ugly.
    // But better than making `@rumbleship/o11y` depend on the framework to get Context type?
    descriptor.value = function (...args: any[]) {
      // If we're in a SequelizeBaseService vs a RelayService (?)
      const { rfiBeeline } = (this as any).ctx || args[0];
      // tslint:disable-next-line: no-console
      const return_type = Reflect.getMetadata('design:returntype', target, propertyName);
      const spanContext = {
        'origin.type': 'decorator',
        name: originalMethod.name,
        ...context
      };

      const wrapped = () => originalMethod.apply(this, args);

      return rfiBeeline.bindFunctionToTrace(() => {
        return rfiBeeline[return_type.name === 'Promise' ? 'withAsyncSpan' : 'withSpan'](
          spanContext,
          wrapped
        );
      })();
    };
  };
}

/**
 *
 * @param span_metadata?: {}  metadata to add to the Honeycomb trace context.
 * @default context {
 *                    name: `${class.constructor.name}.${wrappedMethod.name}`
 *                    class: `${class.constructor.name}`,
 *                    method: `${wrappedMethod.name}`
 *                  }
 */
export function AddToTrace(span_metadata: Record<string, unknown> = {}): MethodDecorator {
  return (target: any, propertyName: string | symbol, descriptor: PropertyDescriptor) => {
    if (!(span_metadata as any).name) {
      Reflect.set(span_metadata, 'name', `${target.constructor.name}.${propertyName.toString()}`);
    }
    Reflect.set(span_metadata, 'class', target.constructor.name);
    Reflect.set(span_metadata, 'method', propertyName.toString());
    const originalMethod = descriptor.value;
    descriptor.value = function (this: any, ...args: any[]) {
      const { beeline, id, logger } =
        findContextWithBeelineFrom(args ?? []) || // if this is a resolver, with @Ctx injected
        (this as any).ctx || // if this is a service
        (this as any)?._service?.getContext() || // if this is a relay
        {}; // Fallback through
      if (beeline) {
        const spanContext = {
          'origin.type': 'decorator',
          ...span_metadata
        };
        if (beeline.traceActive()) {
          const wrapped = () => originalMethod.apply(this, args);
          return beeline.withAsyncSpan(spanContext, wrapped);
        } else {
          const context = RumbleshipBeeline.TrackedContextbyContextId.get(id);
          if (context) {
            RumbleshipBeeline.HnyTracker?.setTracked(context);
            // We don't need to manually delete this setTracked() since bindFunction...does that.
            const wrapped = () => originalMethod.apply(this, args);
            return beeline.bindFunctionToTrace(async () => {
              const res = await beeline.withAsyncSpan(spanContext, wrapped);
              return res;
            })();
          }
          // tslint:disable-next-line: no-console
          if (logger) {
            logger.warn(`'AddToTrace' invoked without an active span:\n ${new Error().stack}`);
          }
          return originalMethod.apply(this, args);
        }
      } else {
        throw new Error(
          `Cannot find a Beeline from RumbleshipContext. Two solutions: 
            1. Pass it as an argument,
            2. Decorate a method of a RumbleshipService that has \`.ctx\` property already assigned`
        );
      }
    };
  };
}

// I don't want to introduce a cyclic dependency to `@rumbleship/gql` to be able
// do this check with a plain `instanceof RumbleshipContext` -- so we check for a feature we know
// and very much _need_ to be present: the beeline.
function findContextWithBeelineFrom(args: any[]): { beeline: RumbleshipBeeline } | undefined {
  return args.find(arg => !!(arg && arg.beeline instanceof RumbleshipBeeline));
}
