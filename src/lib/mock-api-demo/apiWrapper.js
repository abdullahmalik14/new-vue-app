import { apiConfig } from './apiConfig.js';
import MockApi from './MockApi.js';
import mockApiConfig from './mockApi.config.js';
import { APIHandler } from './apiHandler.js'; // Import APIHandler directly
import PerfTracker from '../../utils/common/performanceTracker.js';

/**
 * Unified API Wrapper
 * Routes requests to APIHandler or MockApi based on configuration
 */
class ApiWrapper {
    constructor() {
        this.mockApi = new MockApi(mockApiConfig);
        // APIHandler is imported directly now
    }

    /**
     * Determine if we should use real API or Mock
     */
    _shouldUseRealApi() {
        if (apiConfig.mode === 'online') return true;
        if (apiConfig.mode === 'offline') return false;
        // Auto mode
        return navigator.onLine;
    }

    async call(endpoint, method = 'GET', data = {}, options = {}) {
        const pt = new PerfTracker(`API:${method}:${endpoint}`, { enabled: true });
        pt.start();

        const useRealApi = this._shouldUseRealApi();
        const isDebug = apiConfig.debug;

        if (isDebug) {
            console.log(`🔌 [ApiWrapper] Request: ${method} ${endpoint}`, {
                mode: useRealApi ? 'ONLINE (Real API)' : 'OFFLINE (MockApi via APIHandler)',
                data
            });
        }

        // ALWAYS use APIHandler - it will route to MockApi internally when offline
        // This ensures all requests go through APIHandler's processing pipeline
        const APIHandlerClass = APIHandler; // Use imported class

        const handler = new APIHandlerClass({
            apiBaseUrl: apiConfig.apiHandler.defaultBaseUrl,
            // Pass MockApi instance to APIHandler so it can use it when offline
            mockApi: this.mockApi,
            useMockApi: !useRealApi
        });

        // Map generic args to APIHandler's expected params
        const apiParams = {
            // For offline mode, we pass the endpoint directly (MockApi uses route keys)
            // For online mode, we append to baseUrl
            apiBaseUrl: useRealApi
                ? `${apiConfig.apiHandler.defaultBaseUrl}${endpoint}`
                : endpoint, // MockApi uses endpoint as route key
            httpMethod: method,
            requestData: data,
            queryParams: options.query || {},
            // Pass through other options like callbacks/containers
            ...options
        };

        pt.step({ step: 'beforeRequest', purpose: 'Preparing to call APIHandler' });
        const result = await handler.handleRequest(apiParams);
        pt.step({ step: 'afterRequest', purpose: 'APIHandler returned' });

        return result;
    }

    // Convenience helpers
    get(endpoint, query = {}, options = {}) {
        return this.call(endpoint, 'GET', null, { query, ...options });
    }

    post(endpoint, data = {}, options = {}) {
        return this.call(endpoint, 'POST', data, options);
    }

    delete(endpoint, options = {}) {
        return this.call(endpoint, 'DELETE', null, options);
    }
}

// Expose globally
window.apiWrapper = new ApiWrapper();
export default window.apiWrapper;

