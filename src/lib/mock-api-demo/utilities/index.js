import { userIdUtility } from './userId.js';
import { ipUtility } from './ipHelper.js';
import { networkUtility } from './onlineOffline.js';
import { useIpStore } from '@/stores/ipStore.js'; // Use real Pinia store
import { browserUtility } from './browserHelper.js';

// Initialize utilities function
export const initUtilities = () => {
    console.log("🚀 Starting Utilities...");

    // 1. Initialize Network Monitor (this sets up listeners)
    networkUtility.init();

    // 2. Fetch User ID (async)
    userIdUtility.getUserId().then(id => {
        console.log("🏁 [Init] User ID ready:", id);
    });

    // 3. Fetch IP (async)
    ipUtility.fetchIP().then(ip => {
        console.log("🏁 [Init] IP ready:", ip);
    });

    // 4. Browser Info (sync)
    console.log("🏁 [Init] Browser Info:", browserUtility.getBrowserInfo());

    // Expose for debugging
    window.appUtilities = {
        user: userIdUtility,
        ip: ipUtility,
        network: networkUtility,
        store: useIpStore,
        browser: browserUtility
    };
};
