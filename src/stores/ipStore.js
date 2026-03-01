import { defineStore } from 'pinia';

export const useIpStore = defineStore('ip', {
  state: () => ({
    ip: null,
    details: null
  }),

  getters: {
    getIp: (state) => state.ip,
    getDetails: (state) => state.details
  },

  actions: {
    setIp(ip, details = null) {
      this.ip = ip;
      this.details = details;
      console.log("📍 [Pinia Store] IP updated:", ip);
    },

    removeIp() {
      console.log("📍 [Pinia Store] Removing IP:", this.ip);
      this.ip = null;
      this.details = null;
    }
  },
  persist: true // Enable persistence if using pinia-plugin-persistedstate
});

