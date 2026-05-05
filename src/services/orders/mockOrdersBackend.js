/**
 * mockOrdersBackend.js
 *
 * Intercepts order-related API calls and simulates a real backend with
 * ETag caching, pagination, and filtering.
 */

const STORAGE_KEY = "mock_orders_data";

// Initial Seed Data
const INITIAL_ORDERS = [
  {
    order_id: "1001",
    customer_id: "user_1",
    customer_name: "Alex Thompson",
    total: 120.5,
    status: "processing",
    type: "merch",
    owner_id: "creator_1",
    created_at: Date.now() - 86400000,
  },
  {
    order_id: "1002",
    customer_id: "user_2",
    customer_name: "Sarah Chen",
    total: 45.0,
    status: "shipped",
    type: "subscription",
    owner_id: "creator_1",
    created_at: Date.now() - 172800000,
  },
  {
    order_id: "1003",
    customer_id: "user_3",
    customer_name: "Michael Ross",
    total: 299.99,
    status: "completed",
    type: "p2v",
    owner_id: "creator_1",
    created_at: Date.now() - 259200000,
  },
  {
    order_id: "1004",
    customer_id: "user_1",
    customer_name: "Alex Thompson",
    total: 15.0,
    status: "cancelled",
    type: "merch",
    owner_id: "creator_1",
    created_at: Date.now() - 345600000,
  },
  {
    order_id: "1005",
    customer_id: "user_4",
    customer_name: "Emma Wilson",
    total: 89.0,
    status: "processing",
    type: "mix",
    owner_id: "creator_1",
    created_at: Date.now() - 432000000,
  },
  {
    order_id: "1006",
    customer_id: "user_5",
    customer_name: "James Bond",
    total: 700.0,
    status: "shipped",
    type: "subscription",
    owner_id: "creator_1",
    created_at: Date.now() - 518400000,
  },
  {
    order_id: "1007",
    customer_id: "user_6",
    customer_name: "Diana Prince",
    total: 12.5,
    status: "completed",
    type: "merch",
    owner_id: "creator_1",
    created_at: Date.now() - 604800000,
  },
  {
    order_id: "1008",
    customer_id: "user_7",
    customer_name: "Bruce Wayne",
    total: 5000.0,
    status: "processing",
    type: "p2v",
    owner_id: "creator_1",
    created_at: Date.now() - 691200000,
  },
  {
    order_id: "1009",
    customer_id: "user_8",
    customer_name: "Selina Kyle",
    total: 0.0,
    status: "cancelled",
    type: "mix",
    owner_id: "creator_1",
    created_at: Date.now() - 777600000,
  },
  {
    order_id: "1010",
    customer_id: "user_9",
    customer_name: "Peter Parker",
    total: 5.0,
    status: "completed",
    type: "subscription",
    owner_id: "creator_1",
    created_at: Date.now() - 864000000,
  },
  // More data to ensure each tab has some coverage
  ...Array.from({ length: 40 }, (_, i) => ({
    order_id: (1011 + i).toString(),
    customer_id: `user_${10 + i}`,
    customer_name: `Demo User ${i + 1}`,
    total: Math.floor(Math.random() * 200) + 10,
    status: ["processing", "shipped", "completed", "cancelled"][
      Math.floor(Math.random() * 4)
    ],
    type: ["merch", "p2v", "subscription", "mix"][
      Math.floor(Math.random() * 4)
    ],
    owner_id: "creator_1",
    created_at: Date.now() - 86400000 * (10 + i),
  })),
];

const getStoredOrders = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Force refresh if the user still has the old short array of 8 items, 
    // ensuring the new diverse 50 items load.
    if (parsed.length >= 50) return parsed;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
  return INITIAL_ORDERS;
};

const generateETag = (data) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `W/"${hash.toString(16)}"`;
};

export const initMockOrdersApi = () => {
  const originalFetch = window.fetch;

  window.fetch = async (url, options = {}) => {
    const urlStr = url.toString();

    // Only intercept order endpoints
    if (!urlStr.includes("/orders/")) return originalFetch(url, options);

    const method = options.method || "GET";
    const urlObj = new URL(urlStr, window.location.origin);
    const params = Object.fromEntries(urlObj.searchParams.entries());

    console.group(
      `%c📦 [MockOrdersAPI] ${method} ${urlStr}`,
      "color: #3b82f6; font-weight: bold;",
    );

    if (method === "GET") {
      const allOrders = getStoredOrders();
      let filtered = [...allOrders];

      // Filtering logic (Case-Insensitive)
      if (params.ownerId)
        filtered = filtered.filter((o) => o.owner_id === params.ownerId);

      // Status filtering (Normalize UI status to Backend status)
      const paramStatus = params.status?.toLowerCase();
      if (paramStatus && paramStatus !== "all") {
        if (paramStatus === "progress" || paramStatus === "in progress") {
          filtered = filtered.filter((o) =>
            ["processing"].includes(o.status.toLowerCase()),
          );
        } else {
          // Normalize "Canceled" (UI) to "cancelled" (Backend)
          const targetStatus =
            paramStatus === "canceled" ? "cancelled" : paramStatus;
          filtered = filtered.filter(
            (o) => o.status.toLowerCase() === targetStatus,
          );
        }
      }

      // Type filtering
      const paramType = params.type?.toLowerCase();
      if (paramType && paramType !== "all types" && paramType !== "all") {
        filtered = filtered.filter((o) => o.type.toLowerCase() === paramType);
      }

      // Search
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.order_id.toLowerCase().includes(s) ||
            o.customer_name.toLowerCase().includes(s),
        );
      }

      // Pagination
      const page = parseInt(params.page) || 1;
      const perPage = parseInt(params.per_page) || 10;
      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / perPage);
      const items = filtered.slice((page - 1) * perPage, page * perPage);

      const etag = generateETag(filtered);
      const ifNoneMatch = options.headers?.["If-None-Match"];

      if (ifNoneMatch === etag) {
        console.log(
          `%c[ETag Match] Status: 304 Not Modified`,
          "color: #D8AF0D;",
        );
        console.groupEnd();
        return new Response(null, { status: 304, headers: { ETag: etag } });
      }

      const responseData = {
        items,
        totalCount,
        pagination: {
          currentPage: page,
          perPage,
          totalPages,
        },
        ok: true,
      };

      console.log(`Status: 200 OK | Found: ${totalCount} | ETag: ${etag}`);
      console.groupEnd();

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json", ETag: etag },
      });
    }

    console.groupEnd();
    return originalFetch(url, options);
  };
};
