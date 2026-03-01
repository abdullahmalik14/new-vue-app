/**
 * API Configuration
 * Controls the mode of operation: 'online', 'offline', or 'auto'
 */
export const apiConfig = {
    // Mode: 'auto' | 'online' | 'offline'
    // 'auto' = checks navigator.onLine
    // 'offline' = forces MockApi
    // 'online' = forces APIHandler
    mode: 'offline', 

    // APIHandler settings (for online mode)
    apiHandler: {
        defaultBaseUrl: 'https://jsonplaceholder.typicode.com', // Replace with real API base
    },

    // MockApi settings
    mockApi: {
        delayMs: 500 // Global delay simulation
    },

    // Backend status
    backendReady: false, // Set to true when backend is ready

    // Debugging
    debug: true
};

