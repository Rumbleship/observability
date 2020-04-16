import { NextFn, ResolverData, MiddlewareInterface, MiddlewareFn } from 'type-graphql';
export declare const HoneycombMiddleware: MiddlewareFn;
export declare class RumbleshipTraceMiddleware implements MiddlewareInterface {
    use({ root, args, context, info }: ResolverData, next: NextFn): any;
}
