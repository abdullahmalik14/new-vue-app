/**
 * ordersMapper.js
 * 
 * Transforms raw API order data into the format expected by the Dashboard Table.
 */

export const mapOrdersFromResponse = (response) => {
  if (!response || !Array.isArray(response.items)) {
    return { items: [], totalCount: 0, pagination: {} };
  }

  const items = response.items.map((order) => {
    // Format Date: "Nov 14, 2023"
    const dateObj = new Date(order.created_at || Date.now());
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: order.order_id,
      orderNum: `#ORD-${order.order_id.toString().slice(-6).toUpperCase()}`,
      date: formattedDate,
      type: order.type || "Merch",
      customer: order.customer_name || "Guest User",
      from: order.customer_name || "Guest User", // For the "From" column
      fromAvatar: `https://i.pravatar.cc/150?u=${order.customer_id || order.order_id}`, // Dynamic avatar
      total: `$${(order.total || 0).toFixed(2)}`,
      status: (order.status || "Processing").charAt(0).toUpperCase() + (order.status || "processing").slice(1),
      icon: order.type === "subscription" ? "/images/cartIcon.png" : "/images/merchIcon.png",
      iconBg: order.type === "subscription" ? "#07F468" : "#000",
      // Raw data for details popup
      raw: order,
    };
  });

  return {
    items,
    totalCount: response.totalCount || items.length,
    pagination: response.pagination || {
      currentPage: 1,
      totalPages: 1,
    },
    meta: {
      etag: response.etag,
    }
  };
};

export const mapOrderToRequest = (payload) => {
  return {
    // Transform frontend filters to backend query params
    status: payload.status?.toLowerCase(),
    type: payload.type?.toLowerCase(),
    search: payload.search,
    page: payload.page || 1,
    per_page: payload.perPage || 10,
    owner_id: payload.ownerId, // For "Orders Received"
    customer_id: payload.customerId, // For "Items Purchased"
  };
};
