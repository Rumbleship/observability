"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HoneycombMiddleware {
    use({ root, args, context, info }, next) {
        if (context) {
            const { rfiBeeline } = context;
            // tslint:disable-next-line: only-arrow-functions
            return rfiBeeline.bindFunctionToTrace(function () {
                const beelineContext = {
                    name: 'resolve',
                    'app.gql.operation.query': info.operation.operation,
                    'app.gql.parentType.name': info.parentType.name,
                    'app.gql.fieldName': info.fieldName
                };
                for (const [arg, argValue] of Object.entries(args)) {
                    rfiBeeline.beeline.addContext({
                        [`app.gql.params.${arg}`]: argValue
                    });
                }
                return rfiBeeline.withAsyncSpan(beelineContext, async () => {
                    const result = await next();
                    if (result && result.id) {
                        rfiBeeline.addContext({
                            'app.relay.node.id': result.id.oid || result.id
                        });
                    }
                    return result;
                });
            });
        }
        else {
            return next();
        }
    }
}
exports.HoneycombMiddleware = HoneycombMiddleware;
class RumbleshipTraceMiddleware {
    use({ root, args, context, info }, next) {
        if (context) {
            const { beeline } = context;
            // tslint:disable-next-line: only-arrow-functions
            return beeline.bindFunctionToTrace(function () {
                return beeline.withAsyncSpan({ name: 'resolve' }, async () => {
                    const result = await next();
                    return result;
                });
            });
        }
        else {
            return next();
        }
    }
}
exports.RumbleshipTraceMiddleware = RumbleshipTraceMiddleware;
//# sourceMappingURL=honeycomb.middleware.js.map