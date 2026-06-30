/**
 * Isolated creator used by the analytics DOM/chart test runner.
 * Do not use 566 — that ID is shared with manual QA and has polluted history.
 */
export const TEST_CREATOR_ID = 99999;

export const TEST_FAN_IDS = {
  primary: 88001,
  secondary: 88002,
  switchFan: 88003,
  cancelFan: 88004,
  merchFan: 88005,
  p2vFan: 88006,
  tokenFan: 88007,
};

export const TEST_API = {
  baseUrl: '', // same origin; dev proxy → admin.uy4sdjn4f7.com
  clear: '/api/events/clear',
  trigger: '/api/events/trigger',
  charts: (creatorId) => `/api/charts/${creatorId}?nocache=1`,
};
