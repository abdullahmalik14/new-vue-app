import { describe, expect, it } from 'vitest';

import {
  validateCreateEventPayload,
  validateFetchCreatorEventsPayload,
} from '@/services/events/validators/eventFlowValidators.js';

describe('event flow validators creatorId handling', () => {
  it('treats creatorId as non-empty string', () => {
    const asString = validateFetchCreatorEventsPayload({ creatorId: '90071992547409930' });
    const asNumber = validateFetchCreatorEventsPayload({ creatorId: 90071992547409930 });

    expect(asString.ok).toBe(true);
    expect(asNumber.ok).toBe(false);
  });

  it('requires non-empty string creatorId for create payload', () => {
    const good = validateCreateEventPayload({ creatorId: 'creator-1', title: 'Event', type: 'oneOnOne' });
    const bad = validateCreateEventPayload({ creatorId: 123, title: 'Event', type: 'oneOnOne' });

    expect(good.ok).toBe(true);
    expect(bad.ok).toBe(false);
    expect(bad.errors).toContain('creatorId is required.');
  });
});
