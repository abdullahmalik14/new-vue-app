import { useIpStore } from '@/stores/ipStore.js';
import PerfTracker from '@/utils/common/performanceTracker.js';

/**
 * IP Address Utility
 * Fetches IP and manages Pinia store state
 */
export const ipUtility = {
    // Validation regex from your reference file
    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    },

    // Main fetch function
    async fetchIP() {
        const pt = new PerfTracker('IP:Fetch', { enabled: true });
        pt.start();

        console.log("🌐 [IP Utility] Fetching IP...");
        try {
            pt.step({ step: 'beforeFetch', purpose: 'Calling ipinfo.io' });
            const response = await fetch('https://ipinfo.io/json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            pt.step({ step: 'afterFetch', purpose: 'Received IP data' });

            if (data.error) {
                throw new Error(data.error.title || 'Failed to fetch IP information');
            }

            // Store in Pinia
            const ipStore = useIpStore();
            ipStore.setIp(data.ip, data);
            return data.ip;

        } catch (error) {
            console.error("❌ [IP Utility] Error:", error.message);
            return null;
        }
    },

    // Get current IP from store
    getCurrentIp() {
        const ipStore = useIpStore();
        return ipStore.ip;
    },

    // Force remove IP (e.g., when offline)
    clearIp() {
        const ipStore = useIpStore();
        ipStore.removeIp();
    }
};

// Expose globally
window.getIPAddress = ipUtility.fetchIP;

