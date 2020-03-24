import 'reflect-metadata';
export declare function WithSpan(context?: object): MethodDecorator;
/**
 *
 * @param context Optional metadata to add to the Honeycomb trace context.
 * @default context {
 *                    name: `${class.constructor.name}.${wrappedMethod.name}`
 *                    parent: `${class.constructor.name}`,
 *                    method: `${wrappedMethod.name}`
 *                  }
 */
export declare function AddToTrace(context?: object): MethodDecorator;
