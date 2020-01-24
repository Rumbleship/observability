"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function WithSpan(context = {}) {
    return (target, propertyName, descriptor) => {
        const originalMethod = descriptor.value;
        // NOTE: because the ctx is defined in the framework, this should probably be defined in the framework too
        // The framework should dependn on `@rumbleship/o11y` and then export WithSpan? That seems...ugly.
        // But better than making `@rumbleship/o11y` depend on the framework to get Context type?
        descriptor.value = function (...args) {
            // If we're in a SequelizeBaseService vs a RelayService (?)
            const { rfiBeeline } = this.ctx || args[0];
            // tslint:disable-next-line: no-console
            const return_type = Reflect.getMetadata('design:returntype', target, propertyName);
            const spanContext = {
                'origin.type': 'decorator',
                name: originalMethod.name,
                ...context
            };
            const wrapped = () => originalMethod.apply(this, args);
            return rfiBeeline.bindFunctionToTrace(() => {
                return rfiBeeline[return_type.name === 'Promise' ? 'withAsyncSpan' : 'withSpan'](spanContext, wrapped);
            });
        };
    };
}
exports.WithSpan = WithSpan;
//# sourceMappingURL=with-span.decorator.js.map