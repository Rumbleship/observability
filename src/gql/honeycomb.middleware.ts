import { NextFn, ResolverData, MiddlewareInterface } from 'type-graphql';

export class HoneycombMiddleware implements MiddlewareInterface {
  use({ root, args, context, info }: ResolverData, next: NextFn) {
    if (context) {
      const { rfiBeeline } = context as any;
      // tslint:disable-next-line: only-arrow-functions
      return rfiBeeline.bindFunctionToTrace(function() {
        const span = rfiBeeline.beeline.startSpan({
          name: 'resolve',
          'app.gql.operation.name': info.operation.name,
          'app.gql.fieldName': info.fieldName,
          'app.gql.parentType.name': info.parentType.name
        });
        for (const [arg, argValue] of Object.entries(args)) {
          rfiBeeline.beeline.addContext({
            [`app.gql.params.${arg}`]: argValue
          });
        }

        let result;
        try {
          result = next();
        } catch (error) {
          rfiBeeline.beeline.addContext({ error });
          throw error;
        } finally {
          rfiBeeline.beeline.finishSpan(span);
        }
        return result;
      });
    } else {
      return next();
    }
  }
}
