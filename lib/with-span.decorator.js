"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const rumbleship_beeline_1 = require("./rumbleship-beeline");
function WithSpan(context = {}) {
    // tslint:disable-next-line: no-console
    console.warn('@rumbleship/o11y.WithSpan is now deprecated. Update to @rumbleship/o11y.WithAsyncSpan');
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
            })();
        };
    };
}
exports.WithSpan = WithSpan;
/**
 *
 * @param span_metadata?: {}  metadata to add to the Honeycomb trace context.
 * @default context {
 *                    name: `${class.constructor.name}.${wrappedMethod.name}`
 *                    class: `${class.constructor.name}`,
 *                    method: `${wrappedMethod.name}`
 *                  }
 */
function AddToTrace(span_metadata = {}) {
    return (target, propertyName, descriptor) => {
        if (!span_metadata.name) {
            Reflect.set(span_metadata, 'name', `${target.constructor.name}.${propertyName.toString()}`);
        }
        Reflect.set(span_metadata, 'class', target.constructor.name);
        Reflect.set(span_metadata, 'method', propertyName.toString());
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            var _a, _b;
            const { beeline, id } = this.ctx || // if this is a service
             ((_b = (_a = this) === null || _a === void 0 ? void 0 : _a._service) === null || _b === void 0 ? void 0 : _b.getContext()) || // if this is a relay
                findContextWithBeelineFrom(args) || // if this is a resolver, with @Ctx injected
                {}; // Fallback through
            if (beeline) {
                if (beeline.traceActive()) {
                    const spanContext = {
                        'origin.type': 'decorator',
                        ...span_metadata
                    };
                    const wrapped = () => originalMethod.apply(this, args);
                    const context = rumbleship_beeline_1.RumbleshipBeeline.TrackedContextbyContextId.get(id);
                    rumbleship_beeline_1.RumbleshipBeeline.HnyTracker.setTracked(context);
                    try {
                        return beeline.bindFunctionToTrace(async () => {
                            const res = await beeline.withAsyncSpan(spanContext, wrapped);
                            return res;
                        })();
                    }
                    finally {
                        rumbleship_beeline_1.RumbleshipBeeline.HnyTracker.deleteTracked();
                    }
                }
                // tslint:disable-next-line: no-console
                console.warn(`'AddToTrace' invoked without an active span:\n ${new Error().stack}`);
                return originalMethod.apply(this, args);
            }
            else {
                throw new Error(`Cannot find a Beeline from RumbleshipContext. Two solutions: 
            1. Pass it as an argument,
            2. Decorate a method of a RumbleshipService that has \`.ctx\` property already assigned`);
            }
        };
    };
}
exports.AddToTrace = AddToTrace;
// I don't want to introduce a cyclic dependency to `@rumbleship/gql` to be able
// do this check with a plain `instanceof RumbleshipContext` -- so we check for a feature we know
// and very much _need_ to be present: the beeline.
function findContextWithBeelineFrom(args) {
    return args.find(arg => !!(arg.beeline instanceof rumbleship_beeline_1.RumbleshipBeeline));
}
//# sourceMappingURL=with-span.decorator.js.map