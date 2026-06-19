export function getContributorsListForPeriod(source, periodKey) {
  if (!source) return []
  if (Array.isArray(source)) return source 
  return source[periodKey] || [] 
}

export function mapContributorToPreviewRow(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((c, index) => {
    if (!c) return null;
    return {
      ...c,
      id: index + 1,
      rank: index + 1,
      name: c.name || 'Unknown',
      handle: c.handle || `@${(c.name || '').replace(/\s+/g, '').toLowerCase()}`,
      avatar: c.avatar || null,
      total: c.usdSpent || c.totalSpent || c.totalUSD || c.tokens || 0,
      rawTotal: c.usdSpent || c.totalSpent || c.totalUSD || c.tokens || 0
    };
  }).filter(Boolean);
}
