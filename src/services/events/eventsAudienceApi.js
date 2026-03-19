const AUDIENCE_API_BASE_URL = import.meta.env.VITE_WEB_BASE_URL + "/wp-json/api/users";
const SUBSCRIPTIONS_API_BASE_URL = import.meta.env.VITE_WEB_BASE_URL + "/wp-json/api/subscriptions";


function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeId(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

export async function fetchActiveSubscriptionTiers({ creatorId, signal } = {}) {
  const safeCreatorId = normalizeId(creatorId);
  if (safeCreatorId == null || safeCreatorId === "") return [];

  const url = `${SUBSCRIPTIONS_API_BASE_URL}/plans/list?creator_id=${encodeURIComponent(safeCreatorId)}&count=20`;
  const response = await fetch(url, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch active tiers (HTTP ${response.status}).`);
  }

  const payload = await response.json();
  const rows = asArray(payload?.results);

  return rows
    // .filter((row) => String(row?.status || "").toLowerCase() === "publish")
    .map((row) => ({
      id: normalizeId(row?.id),
      label: String(row?.title || row?.name || `Tier ${row?.id || ""}`).trim(),
      raw: row,
    }))
    .filter((row) => row.id !== null && row.id !== undefined);
}

export async function searchInvitableUsers({ query, signal } = {}) {
  const safeQuery = String(query || "").trim();
  if (safeQuery.length === 0) return [];

  const url = `${AUDIENCE_API_BASE_URL}/search?query=${encodeURIComponent(safeQuery)}`;
  const response = await fetch(url, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to search users (HTTP ${response.status}).`);
  }

  const payload = await response.json();
  const rows = asArray(payload?.results);

  return rows
    .map((row) => {
      const username = String(row?.username || "").trim();
      const displayName = String(row?.display_name || "").trim();
      const label = displayName || username || `User ${row?.id || ""}`;
      return {
        id: normalizeId(row?.id),
        username,
        displayName,
        label,
        avatar: row?.avatar || null,
        raw: row,
      };
    })
    .filter((row) => row.id !== null && row.id !== undefined);
}
