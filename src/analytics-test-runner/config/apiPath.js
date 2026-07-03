export const PERIOD_API_KEY = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
  alltime: 'alltime',
};

export function getApiPathValue(payload, path) {
  return String(path || '').split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    if (key === '-1' && Array.isArray(acc)) return acc[acc.length - 1];
    return acc[key];
  }, payload);
}

