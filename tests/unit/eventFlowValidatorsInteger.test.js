import { describe, expect, it } from 'vitest';

import {
  validateFetchCreatorEventsPayload,
  validateCreateEventPayload,
} from '@/services/events/validators/eventFlowValidators.js';

describe('eventFlowValidators integer constraints (L-13)', () => {
  it('rejects fractional limit in fetch payload', () => {
    const result = validateFetchCreatorEventsPayload({
      creatorId: 'creator-1',
      limit: 12.7,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((message) => message.includes('limit must be an integer'))).toBe(true);
  });

  it('accepts integer limit in range', () => {
    const result = validateFetchCreatorEventsPayload({
      creatorId: 'creator-1',
      limit: 50,
    });

    expect(result.ok).toBe(true);
  });

  it('rejects numeric creatorId (must be non-empty string)', () => {
    const result = validateCreateEventPayload({
      creatorId: 1.5,
      title: 'Event',
      type: '1on1-call',
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((message) => message.includes('creatorId must be a non-empty string'))).toBe(true);
  });
});
