import { NextFn, ResolverData, MiddlewareInterface } from 'type-graphql';
export declare class HoneycombMiddleware implements MiddlewareInterface {
    use({ root, args, context, info }: ResolverData, next: NextFn): any;
}
