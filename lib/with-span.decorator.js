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
            const [{ rfiBeeline }] = args;
            // tslint:disable-next-line: no-console
            console.log('withspan', context);
            return rfiBeeline.withAsyncSpan(Object.assign(Object.assign({}, context), { 'origin.type': 'decorator', 'app.gql.resolve': originalMethod.name }), () => originalMethod.apply(this, args));
        };
    };
}
exports.WithSpan = WithSpan;
//# sourceMappingURL=with-span.decorator.js.map