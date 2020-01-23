import { NextFn, ResolverData, MiddlewareInterface } from 'type-graphql';
export declare class HoneycombMiddleware implements MiddlewareInterface {
    use({ root, args, context, info }: ResolverData, next: NextFn): any;
}
/**
 * check root for span
 * create span with parentid from root span
 * set span on current root
 */
