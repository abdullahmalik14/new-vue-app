import { defineStore } from "pinia";
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  persistStorageAdapter,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from "../utils/common/persistUtils.js";

const DEFAULT_SUMMARY = {
  totalItems: 0,
  subtotal: 0,
  feesTotal: 0,
  planDiscount: 0,
  couponDiscount: 0,
  grandTotal: 0,
};

const DEFAULT_METADATA = {
  lastUpdated: null,
  etag: null,
};

const CART_PERSIST_VERSION = 1;
const CART_PERSIST_KEY = buildPersistKey("cart");
const cartPersistSerializer = createPersistedStateSerializer({
  version: CART_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: {},
  migrate: (state, fromVersion) => {
    if (!state || typeof state !== "object") {
      return {};
    }

    if (fromVersion === 0) {
      return {
        items: Array.isArray(state.items) ? state.items : [],
        summary: state.summary,
        couponCode: state.couponCode ?? null,
        label: state.label,
        cartType: state.cartType,
      };
    }

    return state;
  },
});

function normalizeCartAfterRestore(store) {
  store.items = Array.isArray(store.items) ? store.items : [];
  store.summary = {
    ...DEFAULT_SUMMARY,
    ...(store.summary && typeof store.summary === "object" ? store.summary : {}),
  };
  store.metadata = {
    ...DEFAULT_METADATA,
    ...(store.metadata && typeof store.metadata === "object" ? store.metadata : {}),
  };
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
    label: "My Cart",
    couponCode: null,
    cartType: "standard",
    isDefault: false,
    userId: null,
    summary: {
      totalItems: 0,
      subtotal: 0,
      feesTotal: 0,
      planDiscount: 0,
      couponDiscount: 0,
      grandTotal: 0,
    },
    metadata: {
      lastUpdated: null,
      etag: null,
    },
  }),

  actions: {
    /**
     * Updates the store with fresh cart data from the pipeline.
     */
    setCartAction(payload) {
      const { items, summary, etag, label, couponCode, cartType, isDefault, userId } = payload || {};
      
      this.items = Array.isArray(items) ? items : Object.values(items || {});
      
      if (summary) {
        this.summary = { ...this.summary, ...summary };
      }
      
      if (label !== undefined) this.label = label;
      if (couponCode !== undefined) this.couponCode = couponCode;
      if (cartType !== undefined) this.cartType = cartType;
      if (isDefault !== undefined) this.isDefault = isDefault;
      if (userId !== undefined) this.userId = userId;

      if (etag) {
        this.metadata.etag = etag;
      }
      this.metadata.lastUpdated = new Date().toISOString();
    },

    /**
     * Clears the cart locally.
     */
    clearCart() {
      this.$reset();
    },

    /**
     * Optimistic update for quantity (optional, but good for UX)
     */
    updateItemQuantityLocal({ productId, quantity }) {
      const item = this.items.find(i => i.productId === productId || i.product_id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },

    /**
     * Optimistic remove (optional, but good for UX)
     */
    removeItemLocal(productId) {
      this.items = this.items.filter(i => i.productId !== productId && i.product_id !== productId);
    }
  },

  persist: {
    key: CART_PERSIST_KEY,
    storage: persistStorageAdapter,
    pick: ["items", "summary", "couponCode", "label", "cartType", "metadata"],
    serializer: cartPersistSerializer,
    beforeHydrate({ store }) {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: CART_PERSIST_KEY,
        legacyKeys: ["cart"],
      });
      if (!store.metadata || typeof store.metadata !== "object") {
        store.metadata = { ...DEFAULT_METADATA };
      }
    },
    afterHydrate({ store }) {
      normalizeCartAfterRestore(store);
      attachStorageQuotaMonitor(store, { key: CART_PERSIST_KEY, label: "cart" });
    },
  },
});
