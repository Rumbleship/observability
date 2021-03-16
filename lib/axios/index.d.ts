import { AxiosResponse } from 'axios';
import { RumbleshipBeeline } from '../rumbleship-beeline';
export declare type ResponseSanitizer = (_0: AxiosResponse) => AxiosResponse;
export declare const beelineResponseInterceptorFactory: (_0: ResponseSanitizer, _1: RumbleshipBeeline) => (_1: AxiosResponse) => Promise<AxiosResponse>;
