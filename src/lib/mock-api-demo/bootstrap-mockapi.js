/**
 * Bootstrap MockApi for APIHandler
 * Makes MockApi and config available globally so APIHandler can use them
 */
import MockApi from './MockApi.js';
import mockApiConfig from './mockApi.config.js';
import { apiConfig } from './apiConfig.js';

// Expose globally for APIHandler
window.MockApi = MockApi;
window.mockApiConfig = mockApiConfig;
window.apiConfig = apiConfig;

console.log("🚀 MockApi bootstrapped for APIHandler");

