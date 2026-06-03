import { defineStore } from 'pinia';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  persistStorageAdapter,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from '../utils/common/persistUtils.js';

const IP_PERSIST_VERSION = 1;
const IP_PERSIST_KEY = buildPersistKey('ip');
const IP_PERSIST_FALLBACK = { ip: null, details: null };

const ipPersistSerializer = createPersistedStateSerializer({
  version: IP_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: IP_PERSIST_FALLBACK,
  migrate: (state, fromVersion) => {
    if (!state || typeof state !== 'object') {
      return { ...IP_PERSIST_FALLBACK };
    }

    if (fromVersion === 0) {
      return {
        ip: state.ip ?? null,
        details: state.details ?? null,
      };
    }

    return {
      ip: state.ip ?? null,
      details: state.details ?? null,
    };
  },
});

function normalizeIpAfterRestore(store) {
  if (store.ip !== null && typeof store.ip !== 'string') {
    store.ip = null;
  }
  if (store.details !== null && typeof store.details !== 'object') {
    store.details = null;
  }
}

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
    storage: persistStorageAdapter,
    pick: ['ip', 'details'],
    serializer: ipPersistSerializer,
    beforeHydrate() {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: IP_PERSIST_KEY,
        legacyKeys: ['ip'],
        baseKey: 'ip',
      });
    },
    afterHydrate({ store }) {
      normalizeIpAfterRestore(store);
      attachStorageQuotaMonitor(store, { key: IP_PERSIST_KEY, label: 'ip' });
    },
  },
});

