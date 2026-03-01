/**
 * Mock Pinia Store for IP Address
 * Mimics Pinia's state management for vanilla JS
 */
const createIpStore = () => {
    // State
    let state = {
        ip: null,
        details: null
    };

    return {
        // Getters
        get ip() {
            return state.ip;
        },
        get details() {
            return state.details;
        },

        // Actions
        setIp(ip, details = null) {
            state.ip = ip;
            state.details = details;
            console.log("📍 [Pinia Store] IP updated:", ip);
        },
        
        removeIp() {
            console.log("📍 [Pinia Store] Removing IP:", state.ip);
            state.ip = null;
            state.details = null;
        }
    };
};

// Export as a singleton to mimic useStore()
export const useIpStore = createIpStore();

