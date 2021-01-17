import 'reflect-metadata';
export declare function WithSpan(context?: Record<string, unknown>): MethodDecorator;
/**
 *
 * @param span_metadata?: {}  metadata to add to the Honeycomb trace context.
 * @default context {
 *                    name: `${class.constructor.name}.${wrappedMethod.name}`
 *                    class: `${class.constructor.name}`,
 *                    method: `${wrappedMethod.name}`
 *                  }
 */
export declare function AddToTrace(span_metadata?: Record<string, unknown>): MethodDecorator;
