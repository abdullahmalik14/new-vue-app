export const DASHBOARD_ANALYTICS_PERIODS = {
  YEARLY: 'yearly',
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  DAILY: 'daily',
  ALL_TIME: 'all-time'
}

export const dashboardAnalyticsTrendPeriodTabs = [
  { id: DASHBOARD_ANALYTICS_PERIODS.DAILY, labelKey: 'dashboard.analytics.periods.daily' },
  { id: DASHBOARD_ANALYTICS_PERIODS.WEEKLY, labelKey: 'dashboard.analytics.periods.weekly' },
  { id: DASHBOARD_ANALYTICS_PERIODS.MONTHLY, labelKey: 'dashboard.analytics.periods.monthly' },
  { id: DASHBOARD_ANALYTICS_PERIODS.YEARLY, labelKey: 'dashboard.analytics.periods.yearly' }
]

/** UI popup period ids → analytics contract keys used in data-analytics-period */
const UI_PERIOD_TO_CONTRACT = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
  'all-time': 'alltime',
  alltime: 'alltime',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
}

/** @param {string|undefined|null} period UI period id or contract key */
export function toAnalyticsContractPeriod(period) {
  const key = String(period ?? '').toLowerCase().trim()
  return UI_PERIOD_TO_CONTRACT[key] || key
}
