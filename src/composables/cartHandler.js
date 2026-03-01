// composables/cartHandler.js
export class CartHandler {
  constructor(store) {
    this.store = store;
    this._bind();
  }

  _bind() {
    window.addEventListener('cart:add', (e) => this._onAdd(e.detail));
    window.addEventListener('cart:removeItem', (e) => this._onRemove(e.detail));
    window.addEventListener('cart:updateQty', (e) => this._onUpdateQty(e.detail));
    window.addEventListener('cart:clear', () => this._onClear());
  }

  _onAdd({ item }) {
    if (!item) return;

    const existing = this.store.items.find(i => i.productId === item.productId);

    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      this.store.items.push({
        title: item.title ?? 'Unnamed Product',
        productId: item.productId ?? Math.random().toString(36).slice(2),
        qty: item.qty || 1,
        price: item.price ?? 0,
        originalPrice: item.originalPrice,
        shipping: item.shipping ?? 0,
        seller: item.seller ?? 'Princess Carrot Pop',
        image: item.image ?? '/images/featured-media-bg.webp',
        promoCodes: item.promoCodes ?? []
      });
    }
  }

  _onRemove({ productId }) {
    this.store.items = this.store.items.filter(i => i.productId !== productId);
  }

  _onUpdateQty({ productId, qty }) {
    const item = this.store.items.find(i => i.productId === productId);
    if (item) {
      item.qty = Math.max(1, qty);
    }
  }

  _onClear() {
    this.store.items = [];
  }

  destroy() {
    window.removeEventListener('cart:add', this._onAdd);
    window.removeEventListener('cart:removeItem', this._onRemove);
    window.removeEventListener('cart:updateQty', this._onUpdateQty);
    window.removeEventListener('cart:clear', this._onClear);
  }
}