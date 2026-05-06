import { defineStore } from "pinia";

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

  persist: true,
});
