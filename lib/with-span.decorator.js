"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function WithSpan(context = { name: 'resolve' }) {
    return (target, propertyName, descriptor) => {
        // const originalMethod = descriptor.value;
        Reflect.defineMetadata(Symbol.for('gql.resolve.metadata'), context, target, propertyName);
        // NOTE: because the ctx is defined in the framework, this should probably be defined in the framework too
        // The framework should dependn on `@rumbleship/o11y` and then export WithSpan? That seems...ugly.
        // But better than making `@rumbleship/o11y` depend on the framework to get Context type?
        // descriptor.value = function(...args: any[]) {
        //   const [{ rfiBeeline }] = args;
        //   return rfiBeeline.withAsyncSpan(
        //     {
        //       'app.gql.resolve': originalMethod.name,
        //       ...context
        //     },
        //     () => originalMethod.apply(this, args)
        //   );
        // };
    };
}
exports.WithSpan = WithSpan;
// export function WithSpan(context: SpanData = { name: 'resolve' }): MethodDecorator {
//   return (target: any, propertyName: string | symbol, descriptor: any) => {
//     const originalMethod = descriptor.value;
//     // NOTE: because the ctx is defined in the framework, this should probably be defined in the framework too
//     // The framework should dependn on `@rumbleship/o11y` and then export WithSpan? That seems...ugly.
//     // But better than making `@rumbleship/o11y` depend on the framework to get Context type?
//     descriptor.value = function(...args: any[]) {
//       const [{ rfiBeeline }] = args;
//       return rfiBeeline.withAsyncSpan(
//         {
//           'app.gql.resolve': originalMethod.name,
//           ...context
//         },
//         () => originalMethod.apply(this, args)
//       );
//     };
//   };
// }
//# sourceMappingURL=with-span.decorator.js.map