/**
 * Browser Utility
 * Detects browser name, version, OS, and device type
 */
export const browserUtility = {
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browserName = "Unknown";
        let browserVersion = "Unknown";
        let os = "Unknown";
        
        // Detect Browser
        if (ua.indexOf("Firefox") > -1) {
            browserName = "Firefox";
            browserVersion = ua.match(/Firefox\/([0-9.]+)/)[1];
        } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
            browserName = "Opera";
            browserVersion = ua.match(/(?:Opera|OPR)\/([0-9.]+)/)[1];
        } else if (ua.indexOf("Trident") > -1) {
            browserName = "Internet Explorer";
            browserVersion = ua.match(/rv:([0-9.]+)/)[1];
        } else if (ua.indexOf("Edge") > -1) {
            browserName = "Edge";
            browserVersion = ua.match(/Edge\/([0-9.]+)/)[1];
        } else if (ua.indexOf("Chrome") > -1) {
            browserName = "Chrome";
            browserVersion = ua.match(/Chrome\/([0-9.]+)/)[1];
        } else if (ua.indexOf("Safari") > -1) {
            browserName = "Safari";
            browserVersion = ua.match(/Version\/([0-9.]+)/)[1];
        }

        // Detect OS
        if (ua.indexOf("Win") > -1) os = "Windows";
        else if (ua.indexOf("Mac") > -1) os = "MacOS";
        else if (ua.indexOf("Linux") > -1) os = "Linux";
        else if (ua.indexOf("Android") > -1) os = "Android";
        else if (ua.indexOf("like Mac") > -1) os = "iOS";

        return {
            browser: browserName,
            version: browserVersion,
            os: os,
            userAgent: ua,
            language: navigator.language,
            screenSize: `${window.screen.width}x${window.screen.height}`
        };
    }
};

// Expose globally
window.getBrowserInfo = browserUtility.getBrowserInfo;

