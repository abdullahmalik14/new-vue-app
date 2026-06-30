/** Test-runner period keys → Vue popup period ids */
export const PERIOD_TO_UI_ID = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
  alltime: 'all-time',
};

/** Aliases used to match dropdown option labels (Daily, Weekly, …) */
export const PERIOD_LABEL_ALIASES = {
  day: ['daily', 'day'],
  week: ['weekly', 'week'],
  month: ['monthly', 'month'],
  year: ['yearly', 'year'],
  alltime: ['all time', 'all-time', 'alltime'],
};

export const POPUP_SCAN_PERIODS = ['day', 'week', 'month', 'year'];

/** Popups that expose an All Time period toggle in the Vue UI */
export const POPUP_SCAN_PERIODS_WITH_ALLTIME = [...POPUP_SCAN_PERIODS, 'alltime'];

export function toUiPeriodId(period) {
  return PERIOD_TO_UI_ID[period?.toLowerCase()] || period;
}

export function periodMatchesLabel(period, labelText) {
  const normalized = String(labelText).trim().toLowerCase();
  const aliases = PERIOD_LABEL_ALIASES[period?.toLowerCase()] || [period];
  return aliases.some((alias) => normalized.includes(alias));
}
