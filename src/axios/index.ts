import { AxiosResponse } from 'axios';
import { RumbleshipBeeline } from '../rumbleship-beeline';

export type ResponseSanitizer = (_0: AxiosResponse) => AxiosResponse;
export const tracedErrorResponseInterceptorFactory: (
  _0: ResponseSanitizer,
  _1: RumbleshipBeeline
) => (_1: AxiosResponse) => AxiosResponse | Promise<AxiosResponse> = (
  sanitizer: ResponseSanitizer,
  beeline: RumbleshipBeeline
) => {
  const interceptor = (response: AxiosResponse) => {
    const sanitized = sanitizer(response);
    const data = (sanitized as any).response.data;
    if (data && response) {
      beeline.addContext({
        'meta.source': 'axios.error',
        axios: { response: { data, status: sanitized.status } }
      });
    }
    return Promise.reject(sanitized);
  };
  return beeline.bindFunctionToTrace(interceptor);
};
