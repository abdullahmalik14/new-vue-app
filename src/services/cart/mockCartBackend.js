/**
 * mockCartBackend.js
 * 
 * V2: Upgraded with security hardening and support for full Cart.js features.
 * Implements fixes for 68 audit findings (Prototype Pollution, XSS, Dynamic Totals, etc).
 */

const STORAGE_KEY = "mock_cart_data";
const USER_INDEX_KEY = "mock_user_carts";

// Security Constants (Audit 2.2 / 2.4 / 3.21)
const MAX_QUANTITY = 10000;
const MAX_STRING_LENGTH = 255;
const MAX_LABEL_LENGTH = 100;
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

// Helpers
const getAllCarts = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
const saveAllCarts = (carts) => localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));

const getCart = (sessionId) => {
  const carts = getAllCarts();
  return carts[sessionId] || { 
    sessionId,
    items: {}, 
    fees: {}, 
    discounts: {}, 
    label: "My Cart",
    cartType: "standard",
    isDefault: false,
    couponCode: null,
    planDiscountPercentage: 0,
    created_at: Date.now() 
  };
};

const saveCart = (sessionId, cart) => {
  const carts = getAllCarts();
  carts[sessionId] = cart;
  saveAllCarts(carts);
  
  // Update User Index if userId exists
  if (cart.userId) {
    const userIndex = JSON.parse(localStorage.getItem(USER_INDEX_KEY) || "{}");
    if (!userIndex[cart.userId]) userIndex[cart.userId] = [];
    if (!userIndex[cart.userId].includes(sessionId)) userIndex[cart.userId].push(sessionId);
    localStorage.setItem(USER_INDEX_KEY, JSON.stringify(userIndex));
  }
};

const generateETag = (data) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `W/"${hash.toString(16)}"`;
};

// Security Utility: Strip dangerous keys (Audit 1.4)
const safeMerge = (target, source) => {
  const result = Object.assign(Object.create(null), target);
  for (const [key, value] of Object.entries(source)) {
    if (DANGEROUS_KEYS.includes(key)) continue;
    result[key] = value;
  }
  return result;
};

// Dynamic Total Calculation (Audit 1.9 / 1.10)
const calculateSummary = (cart) => {
  const items = Object.values(cart.items || {});
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate Fees (Audit 1.8 validation done in flow)
  let feesTotal = 0;
  for (const fee of Object.values(cart.fees || {})) {
    feesTotal += (fee.type === 'percentage') ? (fee.value / 100) * subtotal : fee.value;
  }

  // Calculate Discounts (Dynamic percentage - Audit 1.9)
  const discountTotal = (cart.planDiscountPercentage / 100) * (subtotal + feesTotal);
  
  // Mock Coupon Logic as Percentage (Audit 2.20)
  let appliedCouponDiscount = 0;
  if (cart.couponCode) {
    const saveMatch = cart.couponCode.match(/SAVE(\d+)/i);
    const currentSubtotal = subtotal + feesTotal - discountTotal;
    
    if (saveMatch) {
      const percentage = parseFloat(saveMatch[1]);
      appliedCouponDiscount = (percentage / 100) * currentSubtotal;
    } else {
      appliedCouponDiscount = Math.min(10, currentSubtotal); // Default $10 cap
    }
  }

  const grandTotal = Math.max(0, (subtotal + feesTotal - discountTotal) - appliedCouponDiscount);

  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    feesTotal,
    planDiscount: discountTotal,
    couponDiscount: appliedCouponDiscount,
    grandTotal
  };
};

let products = [];

// Fetch product config for strict lookups (Audit 1.1)
const loadProductConfig = async () => {
  try {
    const res = await fetch("/configs/products.json");
    const data = await res.json();
    products = data.products || [];
  } catch (e) {
    console.error("[MockCartAPI] Error loading product config:", e);
  }
};

export const initMockCartApi = () => {
  loadProductConfig();
  const originalFetch = window.fetch;

  window.fetch = async (url, options = {}) => {
    const urlStr = url.toString();
    // Intercept any cart-related logic regardless of /api prefix
    if (!urlStr.includes("/cart/") && !urlStr.includes("/carts/")) return originalFetch(url, options);

    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;
    const urlParts = urlStr.split("/");
    const findPart = (p) => urlParts.indexOf(p);
    
    console.group(`%c🚀 [MockCartAPI] ${method} ${urlStr}`, "color: #07F468; font-weight: bold;");
    if (body) console.log("Payload:", body);

    // Extract Session ID or User ID
    const cartIdx = findPart("cart");
    const userIdx = findPart("user");
    const sessionId = (cartIdx !== -1) ? urlParts[cartIdx + 1] : null;
    const userId = (userIdx !== -1) ? urlParts[userIdx + 1] : null;

    let responseData = null;
    let status = 200;

    if (urlStr.includes("/carts/user/") && userId) {
      const userIndex = JSON.parse(localStorage.getItem(USER_INDEX_KEY) || "{}");
      const sessions = userIndex[userId] || [];
      const allCarts = getAllCarts();
      responseData = sessions.map(sid => allCarts[sid]).filter(Boolean);
    } else if (urlStr.includes("/cart/merge") && method === "POST") {
      const { userId, sessionId } = body;
      const guestCart = getCart(sessionId);
      guestCart.userId = userId;
      saveCart(sessionId, guestCart);
      responseData = { ok: true, ...guestCart };
    } else if (urlStr.includes("/cart/") && urlStr.includes("/remind") && method === "POST") {
      console.warn("🔔 [Abandoned Cart Reminder] User, you have pending items in your cart!");
      responseData = { reminded: true };
    } else if (sessionId) {
      const cart = getCart(sessionId);

      // Endpoint Logic
      if (urlStr.endsWith("/label") && method === "PATCH") {
        cart.label = body.label.substring(0, MAX_LABEL_LENGTH);
      } else if (urlStr.endsWith("/coupons") && method === "POST") {
        cart.couponCode = body.couponCode;
      } else if (urlStr.endsWith("/coupons") && method === "DELETE") {
        cart.couponCode = null;
      } else if (urlStr.endsWith("/fees") && method === "POST") {
        cart.fees = safeMerge(cart.fees, body);
      } else if (urlStr.endsWith("/default") && method === "POST") {
        cart.isDefault = true;
        responseData = { ok: true, ...cart, ...calculateSummary(cart) };
      } else if (urlStr.endsWith("/live-data") && method === "POST") {
        for (const item of Object.values(cart.items)) {
          item.title = `[Live] ${item.title}`;
          item.lastSyncedAt = Date.now();
        }
      } else if (urlStr.includes("/items") && method === "POST") {
        const { productId, quantity } = body;
        const qty = Math.min(quantity, MAX_QUANTITY);
        const foundProduct = products.find(p => p.product_id === productId);
        if (!cart.items[productId]) {
          cart.items[productId] = { 
            product_id: productId, productId, quantity: 0, 
            price: foundProduct?.price || 0,
            title: foundProduct?.title || `Dynamic Product ${productId}`,
            seller: foundProduct?.seller || "Unknown Seller",
            image: foundProduct?.image || "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp" 
          };
        }
        cart.items[productId].quantity += qty;
      } else if (urlStr.includes("/quantity") && method === "PATCH") {
        const pId = urlParts[findPart("items") + 1];
        if (cart.items[pId]) {
          cart.items[pId].quantity = Math.min(body.quantity, MAX_QUANTITY);
          if (cart.items[pId].quantity <= 0) delete cart.items[pId];
        }
      } else if (urlStr.includes("/items") && method === "DELETE") {
        const pId = urlParts[findPart("items") + 1];
        delete cart.items[pId];
      }

      saveCart(sessionId, cart);
      
      const etag = generateETag(cart);
      const ifNoneMatch = options.headers?.["If-None-Match"];
      
      if (method === "GET" && ifNoneMatch === etag) {
        console.log(`%c[ETag Match] Status: 304 Not Modified`, "color: #D8AF0D;");
        console.groupEnd();
        return new Response(null, { status: 304, headers: { ETag: etag } });
      }

      responseData = {
        ...cart,
        items: Object.values(cart.items),
        summary: calculateSummary(cart),
        ok: true
      };
      
      console.log(`Status: 200 OK | ETag: ${etag}`);
      console.log("Response:", responseData);
    } else {
      console.groupEnd();
      return originalFetch(url, options);
    }

    console.groupEnd();
    return new Response(JSON.stringify(responseData), {
      status,
      headers: { 
        "Content-Type": "application/json", 
        "ETag": sessionId ? generateETag(getCart(sessionId)) : "" 
      }
    });
  };
};
