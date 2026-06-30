export function normalizeNumber(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}
