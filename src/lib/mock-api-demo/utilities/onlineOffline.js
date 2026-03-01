import { ipUtility } from './ipHelper.js';

/**
 * Online/Offline Status Utility
 * Monitors network state and alerts user
 */
export const networkUtility = {
    init() {
        console.log("🔌 [Network] Initializing monitor...");
        
        // Check initial state
        this.handleStatusChange(navigator.onLine);

        // Add listeners
        window.addEventListener("online", () => {
            console.log("✅ [Network] You are online");
            this.handleStatusChange(true);
        });

        window.addEventListener("offline", () => {
            console.log("❌ [Network] You are offline");
            alert("You are offline! Some features may be unavailable.");
            this.handleStatusChange(false);
        });
    },

    handleStatusChange(isOnline) {
        if (isOnline) {
            // Optionally re-fetch IP when back online
            if (!ipUtility.getCurrentIp()) {
                ipUtility.fetchIP();
            }
        } else {
            // Client req: "IP will be removed when we are offline"
            ipUtility.clearIp();
        }
    }
};

// Expose globally
window.onlineStatus = {
    init: networkUtility.init.bind(networkUtility),
    isOnline: () => navigator.onLine
};

