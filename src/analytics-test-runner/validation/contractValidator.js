const REQUIRED_ROOT_KEYS = [
  'subscriptions',
  'earnings',
  'contributors',
  'trendingCountries',
];

export function validateChartsPayloadContract(payload) {
  const results = [];

  REQUIRED_ROOT_KEYS.forEach((key) => {
    if (payload?.[key] == null) {
      results.push({ severity: 'FAIL', path: key, message: 'Missing required root key' });
    }
  });

  if (!payload?.recentOrders) {
    results.push({ severity: 'FAIL', path: 'recentOrders', message: 'Missing recentOrders branch' });
  }

  ['daily', 'weekly', 'monthly', 'yearly'].forEach((period) => {
    const merch = payload?.trendingMerch?.[period];
    if (Array.isArray(merch) && merch.length === 0) {
      results.push({ severity: 'WARN', path: `trendingMerch.${period}`, message: 'Empty array' });
    }
  });

  const fail = results.filter((r) => r.severity === 'FAIL').length;
  const warn = results.filter((r) => r.severity === 'WARN').length;

  return {
    summary: { total: results.length, fail, warn },
    results,
  };
}
