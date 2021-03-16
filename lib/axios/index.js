"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beelineResponseInterceptorFactory = void 0;
exports.beelineResponseInterceptorFactory = (sanitizer, beeline) => {
    const interceptor = (response) => {
        if (response.status && response.status >= 400) {
            const sanitized = sanitizer(response);
            const data = sanitized.response.data;
            if (data && response) {
                beeline.addContext({
                    'meta.source': 'axios.error',
                    axios: { response: { data, status: sanitized.status } }
                });
            }
            return Promise.reject(sanitized);
        }
        else {
            return response;
        }
    };
    return beeline.bindFunctionToTrace(interceptor);
};
//# sourceMappingURL=index.js.map