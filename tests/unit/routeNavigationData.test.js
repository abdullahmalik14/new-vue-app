import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/section/sectionResolver.js', () => ({
  resolveRoleSectionVariant: vi.fn((section, role) => section[role] || section.default),
}));

import { resolveCurrentSectionForNavigation } from '../../src/utils/route/routeNavigationData.js';

describe('routeNavigationData (M9)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolveCurrentSectionForNavigation returns string sections directly', () => {
    const section = resolveCurrentSectionForNavigation(
      { meta: { section: 'auth' } },
      'guest',
    );

    expect(section).toBe('auth');
  });

  it('resolveCurrentSectionForNavigation resolves role-based section objects', () => {
    const section = resolveCurrentSectionForNavigation(
      {
        meta: {
          section: {
            creator: 'dashboard-creator',
            fan: 'dashboard-fan',
          },
        },
      },
      'creator',
    );

    expect(section).toBe('dashboard-creator');
  });

  it('resolveCurrentSectionForNavigation returns null when section is missing', () => {
    expect(resolveCurrentSectionForNavigation({ meta: {} }, 'guest')).toBeNull();
  });
});
