import 'reflect-metadata';
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
