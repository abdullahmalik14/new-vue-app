export function getContributorsListForPeriod(source, periodKey) {
  if (!source) return []
  if (Array.isArray(source)) return source 
  return source[periodKey]?.length ? source[periodKey] : (source['alltime'] || [])
}

function formatContributorDisplayName(c) {
  const raw = c.name ?? c.fanId
  if (raw == null || raw === '') return 'Unknown'
  const str = String(raw).trim()
  if (/^fan\s+/i.test(str)) return str
  if (/^\d+$/.test(str)) return `Fan ${str}`
  return str
}

export function mapContributorToPreviewRow(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((c, index) => {
    if (!c) return null;
    const name = formatContributorDisplayName(c)
    return {
      ...c,
      id: index + 1,
      rank: index + 1,
      name,
      handle: c.handle || `@${name.replace(/^Fan\s+/i, '').replace(/\s+/g, '').toLowerCase()}`,
      avatar: c.avatar || null,
      total: c.usdSpent || c.totalSpent || c.totalUSD || c.tokens || 0,
      rawTotal: c.usdSpent || c.totalSpent || c.totalUSD || c.tokens || 0
    };
  }).filter(Boolean);
}
