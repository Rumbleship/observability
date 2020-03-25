import 'reflect-metadata';
import { RumbleshipBeeline } from './rumbleship-beeline';
export function WithSpan(context: object = {}): MethodDecorator {
  // tslint:disable-next-line: no-console
  console.warn(
    '@rumbleship/o11y.WithSpan is now deprecated. Update to @rumbleship/o11y.WithAsyncSpan'
  );
  return (target: any, propertyName: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    // NOTE: because the ctx is defined in the framework, this should probably be defined in the framework too
    // The framework should dependn on `@rumbleship/o11y` and then export WithSpan? That seems...ugly.
    // But better than making `@rumbleship/o11y` depend on the framework to get Context type?
    descriptor.value = function(...args: any[]) {
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
      });
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
export function AddToTrace(span_metadata: object = {}): MethodDecorator {
  return (target: any, propertyName: string | symbol, descriptor: PropertyDescriptor) => {
    if (!(span_metadata as any).name) {
      Reflect.set(span_metadata, 'name', `${target.constructor.name}.${propertyName.toString()}`);
    }
    Reflect.set(span_metadata, 'class', target.constructor.name);
    Reflect.set(span_metadata, 'method', propertyName.toString());
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      const { beeline } = (this as any).ctx || findContextWithBeelineFrom(args) || {};
      if (beeline) {
        const return_type = Reflect.getMetadata('design:returntype', target, propertyName);
        const spanContext = {
          'origin.type': 'decorator',
          ...span_metadata
        };

        const wrapped = () => originalMethod.apply(this, args);

        return beeline.bindFunctionToTrace(() => {
          return beeline[return_type.name === 'Promise' ? 'withAsyncSpan' : 'withSpan'](
            spanContext,
            wrapped
          );
        });
      } else {
        throw new Error(
          `Cannot find an RumbleshipContext. Two solutions: 
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
  return args.find(arg => !!(arg.beeline instanceof RumbleshipBeeline));
}
