import { describe, expect, it } from 'vitest';

import { validateCreateEventPayload } from '@/services/events/validators/eventFlowValidators.js';

describe('validateCreateEventPayload type enum', () => {
  it('accepts known event types', () => {
    for (const type of ['1on1-call', 'group-event', 'group', 'oneOnOne']) {
      const result = validateCreateEventPayload({
        creatorId: 'creator-1',
        title: 'Event',
        type,
      });
      expect(result.ok).toBe(true);
    }
  });

  it('rejects unknown event types', () => {
    const result = validateCreateEventPayload({
      creatorId: 'creator-1',
      title: 'Event',
      type: 'webinar',
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((message) => message.includes('type must be one of'))).toBe(true);
  });
});
