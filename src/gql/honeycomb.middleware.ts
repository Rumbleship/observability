import { NextFn, ResolverData, MiddlewareInterface } from 'type-graphql';
export class HoneycombMiddleware implements MiddlewareInterface {
  use({ root, args, context, info }: ResolverData, next: NextFn) {
    if (context) {
      const { rfiBeeline } = context as any;
      // tslint:disable-next-line: only-arrow-functions
      return rfiBeeline.bindFunctionToTrace(function() {
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
    } else {
      return next();
    }
  }
}

/**
 * check root for span
 * create span with parentid from root span
 * set span on current root
 */
