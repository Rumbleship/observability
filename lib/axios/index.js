"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracedErrorResponseInterceptorFactory = void 0;
exports.tracedErrorResponseInterceptorFactory = (sanitizer, beeline) => {
    const interceptor = (response) => {
        const sanitized = sanitizer(response);
        const data = sanitized.response.data;
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
//# sourceMappingURL=index.js.map