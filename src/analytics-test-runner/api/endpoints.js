import { runApiStep } from './runner.js';
import { TEST_API, TEST_CREATOR_ID } from '../config/testCreator.js';

export async function clearCreatorDatabase(creatorId = TEST_CREATOR_ID) {
  return runApiStep({
    name: 'clear-database',
    method: 'POST',
    url: TEST_API.clear,
    body: { creatorId },
  });
}

export async function triggerMasterEvent({ masterEventType, fields }) {
  return runApiStep({
    name: `trigger-${masterEventType}`,
    method: 'POST',
    url: TEST_API.trigger,
    body: {
      masterEventType,
      fields,
    },
  });
}

export async function fetchChartsPayload(creatorId = TEST_CREATOR_ID) {
  const entry = await runApiStep({
    name: 'fetch-charts',
    method: 'GET',
    url: TEST_API.charts(creatorId),
  });
  return entry.response;
}
