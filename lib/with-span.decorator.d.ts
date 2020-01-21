import 'reflect-metadata';
export interface SpanData {
    name: string;
    [index: string]: string;
}
export declare function WithSpan(context?: SpanData): MethodDecorator;
