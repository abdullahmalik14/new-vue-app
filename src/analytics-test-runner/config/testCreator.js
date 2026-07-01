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
  recurringFan: 88008,
  switchSubFan: 88009,
  followFan: 88010,
  unfollowFan: 88011,
  profileVisitFan: 88012,
  mediaLikeFan: 88013,
  profileLikeFan: 88014,
  merchLikeFan: 88015,
  feedLikeFan: 88016,
  tagFan: 88017,
  mediaWatchFan: 88018,
};

/** Matches dom_chart_test_scanner_runner_build_instructions.md resetEndpoint (live server path). */
export const TEST_API = {
  /** Dev proxy → Node API on 15.235.59.191 (see server-access-guide.pdf). Never use Vercel. */
  baseUrl: '',
  reset: '/api/events/clear',
  clear: '/api/events/clear',
  trigger: '/api/events/trigger',
  charts: (creatorId) => `/api/charts/${creatorId}?nocache=1`,
};

/**
 * Tests always run against TEST_CREATOR_ID. Warn if the page URL uses a different creator.
 */
export function resolveTestCreatorId() {
  if (typeof window === 'undefined') return TEST_CREATOR_ID;

  const params = new URLSearchParams(window.location.search);
  const fromUrl = Number(
    params.get('creator') || params.get('creator_id') || params.get('creatorId') || TEST_CREATOR_ID,
  );

  if (Number.isFinite(fromUrl) && fromUrl !== TEST_CREATOR_ID) {
    console.warn(
      `[AnalyticsTestRunner] Page creator=${fromUrl} — tests always clear/trigger/fetch creator ${TEST_CREATOR_ID} only`,
    );
  }

  return TEST_CREATOR_ID;
}
