import { NextFn, ResolverData, MiddlewareInterface, MiddlewareFn } from 'type-graphql';
export const HoneycombMiddleware: MiddlewareFn = (
  { root, args, context, info }: ResolverData,
  next: NextFn
) => {
  if (context) {
    const { beeline } = context as any;
    // tslint:disable-next-line: only-arrow-functions
    return beeline.bindFunctionToTrace(function() {
      const beelineContext = {
        name: 'resolve',
        'app.gql.operation.query': info.operation.operation,
        'app.gql.parentType.name': info.parentType.name,
        'app.gql.fieldName': info.fieldName
      };

      for (const [arg, argValue] of Object.entries(args)) {
        beeline.addContext({
          [`app.gql.params.${arg}`]: argValue
        });
      }
      // tslint:disable-next-line: only-arrow-functions
      return beeline.withAsyncSpan(beelineContext, async function() {
        const result = await next();
        if (result && result.id) {
          beeline.addContext({
            'app.relay.node.id': result.id.oid || result.id
          });
        }
        return result;
      });
    })();
  } else {
    return next();
  }
};

export class RumbleshipTraceMiddleware implements MiddlewareInterface {
  use({ root, args, context, info }: ResolverData, next: NextFn) {
    if (context) {
      const { beeline } = context as any;
      // tslint:disable-next-line: only-arrow-functions
      return beeline.bindFunctionToTrace(function() {
        return beeline.withAsyncSpan({ name: 'resolve' }, async () => {
          const result = await next();
          return result;
        });
      });
    } else {
      return next();
    }
  }
}
