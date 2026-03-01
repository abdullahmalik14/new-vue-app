/**
 * User ID Utility
 * Checks cookies first, falls back to API fetch
 */

// Helper to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export const userIdUtility = {
    // Main function to get User ID
    async getUserId() {
        // 1. Check cookies
        const cookieId = getCookie('userId') || getCookie('user_id');
        if (cookieId) {
            console.log("👤 [User Utility] Found ID in cookies:", cookieId);
            return cookieId;
        }

        // 2. Fallback: Fetch from server
        console.log("👤 [User Utility] ID not in cookies, fetching...");
        return await this.fetchUserId();
    },

    // Placeholder for the fetch logic the client will send
    async fetchUserId() {
        try {
            // TODO: Replace with client's actual fetch code
            // Simulating a fetch for now
            await new Promise(r => setTimeout(r, 500)); 
            
            // Simulate finding an ID (using a simpler random ID for consistent testing)
            const newId = "user_" + Math.floor(Math.random() * 10000);
            console.log("👤 [User Utility] Fetched new ID:", newId);
            return newId;
        } catch (error) {
            console.error("❌ [User Utility] Failed to fetch ID:", error);
            return null;
        }
    }
};

// Expose globally
window.getUserId = userIdUtility.getUserId.bind(userIdUtility);

