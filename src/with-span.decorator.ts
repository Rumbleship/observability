import 'reflect-metadata';
import { RumbleshipBeeline } from './rumbleship-beeline';
export function WithSpan(context: object = {}): MethodDecorator {
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

export function WithAsyncSpan(context: object = {}): MethodDecorator {
  return (target: any, propertyName: string | symbol, descriptor: PropertyDescriptor) => {
    if (!(context as any).name) {
      Reflect.set(context, 'name', `${target.constructor.name}.${propertyName.toString()}`);
    }
    Reflect.set(context, 'parent', target.constructor.name);
    Reflect.set(context, 'method', propertyName.toString());
    const originalMethod = descriptor.value;
    // NOTE: because the ctx is defined in the framework, this should probably be defined in the framework too
    // The framework should dependn on `@rumbleship/o11y` and then export WithSpan? That seems...ugly.
    // But better than making `@rumbleship/o11y` depend on the framework to get Context type?
    descriptor.value = function(...args: any[]) {
      // If we're in a SequelizeBaseService vs a RelayService (?)
      const { beeline } = (this as any).ctx || findContextWithBeelineFrom(args) || {};
      if (beeline) {
        const return_type = Reflect.getMetadata('design:returntype', target, propertyName);
        const spanContext = {
          'origin.type': 'decorator',
          name: originalMethod.name,
          ...context
        };

        const wrapped = () => originalMethod.apply(this, args);

        return beeline.bindFunctionToTrace(() => {
          return beeline[return_type.name === 'Promise' ? 'withAsyncSpan' : 'withSpan'](
            spanContext,
            wrapped
          );
        });
      } else {
        throw new Error('Cannot find GQL service context in the arguments. Make sure to pass it.');
      }
    };
  };
}

// export function AddResultToContext(metadata: object = {}): MethodDecorator {}

function findContextWithBeelineFrom(args: any[]): { beeline: RumbleshipBeeline } | undefined {
  return args.find(arg => !!arg.beeline);
}
