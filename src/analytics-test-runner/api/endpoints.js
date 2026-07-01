import { runApiStep } from './runner.js';
import { TEST_API, TEST_CREATOR_ID, resolveTestCreatorId } from '../config/testCreator.js';

/**
 * Step 3 in dom_chart_test_scanner_runner_build_instructions.md — always runs before any event.
 * @param {number} [creatorId]
 */
export async function resetTestDatabase(creatorId = resolveTestCreatorId()) {
  return clearCreatorDatabase(creatorId);
}

export async function clearCreatorDatabase(creatorId = resolveTestCreatorId()) {
  return runApiStep({
    name: 'clear-database',
    method: 'POST',
    url: TEST_API.reset,
    body: { creatorId },
  });
}

export async function triggerMasterEvent({ masterEventType, fields, data }) {
  const eventData = fields ?? data;
  if (!masterEventType || eventData == null) {
    throw new Error('triggerMasterEvent requires masterEventType and fields (or data)');
  }

  return runApiStep({
    name: `trigger-${masterEventType}`,
    method: 'POST',
    url: TEST_API.trigger,
    body: {
      masterEventType,
      data: eventData,
    },
  });
}

export async function fetchChartsPayload(creatorId = resolveTestCreatorId()) {
  const entry = await runApiStep({
    name: 'fetch-charts',
    method: 'GET',
    url: TEST_API.charts(creatorId),
  });
  return entry.response;
}
