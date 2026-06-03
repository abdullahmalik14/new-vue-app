import { apiConfig } from './apiConfig.js';
import MockApi from './MockApi.js';
import mockApiConfig from './mockApi.config.js';
import { APIHandler } from './apiHandler.js'; // Import APIHandler directly
import PerfTracker from '../../utils/common/performanceTracker.js';

const inFlightHttpRequests = new Map();

function stableSerialize(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return String(value);
  }
}

function buildHttpDedupeKey(method, endpoint, data, query) {
  return `${method}:${endpoint}:${stableSerialize({ data, query })}`;
}

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
        const query = options.query || {};
        const dedupeEnabled = options.dedupeHttp !== false;
        const dedupeKey = options.dedupeKey || buildHttpDedupeKey(method, endpoint, data, query);

        if (dedupeEnabled && inFlightHttpRequests.has(dedupeKey)) {
            return inFlightHttpRequests.get(dedupeKey);
        }

        const executeRequest = async () => {
            if (isDebug) {
                console.log(`🔌 [ApiWrapper] Request: ${method} ${endpoint}`, {
                    mode: useRealApi ? 'ONLINE (Real API)' : 'OFFLINE (MockApi via APIHandler)',
                    data,
                });
            }

            const APIHandlerClass = APIHandler;
            const handler = new APIHandlerClass({
                apiBaseUrl: apiConfig.apiHandler.defaultBaseUrl,
                mockApi: this.mockApi,
                useMockApi: !useRealApi,
            });

            const apiParams = {
                apiBaseUrl: useRealApi
                    ? (endpoint.startsWith('http') ? endpoint : `${apiConfig.apiHandler.defaultBaseUrl}${endpoint}`)
                    : endpoint,
                httpMethod: method,
                requestData: data,
                queryParams: query,
                ...options,
            };

            pt.step({ step: 'beforeRequest', purpose: 'Preparing to call APIHandler' });
            const result = await handler.handleRequest(apiParams);
            pt.step({ step: 'afterRequest', purpose: 'APIHandler returned' });
            return result;
        };

        const requestPromise = executeRequest();
        if (dedupeEnabled) {
            inFlightHttpRequests.set(dedupeKey, requestPromise);
        }

        try {
            return await requestPromise;
        } finally {
            if (dedupeEnabled && inFlightHttpRequests.get(dedupeKey) === requestPromise) {
                inFlightHttpRequests.delete(dedupeKey);
            }
        }
    }

    // Convenience helpers
    get(endpoint, query = {}, options = {}) {
        return this.call(endpoint, 'GET', null, { query, ...options });
    }

    post(endpoint, data = {}, options = {}) {
        return this.call(endpoint, 'POST', data, options);
    }

    put(endpoint, data = {}, options = {}) {
        return this.call(endpoint, 'PUT', data, options);
    }

    patch(endpoint, data = {}, options = {}) {
        return this.call(endpoint, 'PATCH', data, options);
    }

    delete(endpoint, options = {}) {
        return this.call(endpoint, 'DELETE', null, options);
    }
}

// Expose globally
window.apiWrapper = new ApiWrapper();
export default window.apiWrapper;

