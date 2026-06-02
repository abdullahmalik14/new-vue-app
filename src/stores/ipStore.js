import { defineStore } from 'pinia';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from '../utils/common/persistUtils.js';

const IP_PERSIST_VERSION = 1;
const IP_PERSIST_KEY = buildPersistKey('ip');
const ipPersistSerializer = createPersistedStateSerializer({
  version: IP_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: {},
  migrate: (state) => (state && typeof state === 'object' ? state : {}),
});

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
  persist: {
    key: IP_PERSIST_KEY,
    storage: () => resolvePersistStorage(),
    serializer: ipPersistSerializer,
    beforeRestore() {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: IP_PERSIST_KEY,
        legacyKeys: ['ip'],
      });
    },
    afterRestore({ store }) {
      attachStorageQuotaMonitor(store, { key: IP_PERSIST_KEY, label: 'ip' });
    },
  } // Enable persistence if using pinia-plugin-persistedstate
});

