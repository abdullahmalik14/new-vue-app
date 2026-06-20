import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDashboardSidebarMenuItems } from '../../src/config/dashboardSidebarMenuItems.js';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

const getAssetUrls = vi.hoisted(() => vi.fn());

vi.mock('@/systems/assets/assetLibrary.js', () => ({
  getAssetUrls,
}));

describe('menuItems.assets (§85)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    getAssetUrls.mockReset();
    getAssetUrls.mockResolvedValue({
      'dashboard.menu.analytics': '/assets/menu/analytics.svg',
      'dashboard.menu.payout': '/assets/menu/payout.svg',
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('resolves dot-notation flags', async () => {
    const items = await resolveDashboardSidebarMenuItems([
      { menuItemId: 1, iconAssetFlag: 'dashboard.menu.analytics', submenuItems: [] },
    ]);

    expect(items[0].iconUrl).toBe('/assets/menu/analytics.svg');
  });

  it('skips absolute URLs', async () => {
    await resolveDashboardSidebarMenuItems([
      { menuItemId: 1, iconAssetFlag: 'https://cdn.example.com/icon.svg', submenuItems: [] },
    ]);

    expect(getAssetUrls).toHaveBeenCalledWith([]);
  });

  it('skips data: URLs', async () => {
    await resolveDashboardSidebarMenuItems([
      { menuItemId: 1, iconAssetFlag: 'data:image/png;base64,abc', submenuItems: [] },
    ]);

    expect(getAssetUrls).toHaveBeenCalledWith([]);
  });

  it('skips plain strings without dot', async () => {
    await resolveDashboardSidebarMenuItems([
      { menuItemId: 1, iconAssetFlag: 'analytics', submenuItems: [] },
    ]);

    expect(getAssetUrls).toHaveBeenCalledWith([]);
  });

  it('warns missing flag', async () => {
    getAssetUrls.mockResolvedValue({});

    await resolveDashboardSidebarMenuItems([
      { menuItemId: 1, iconAssetFlag: 'dashboard.menu.analytics', submenuItems: [] },
    ]);

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing asset for flag: dashboard.menu.analytics'),
    );
  });

  it('batch unique flags once', async () => {
    await resolveDashboardSidebarMenuItems([
      { menuItemId: 1, iconAssetFlag: 'dashboard.menu.analytics', submenuItems: [] },
      { menuItemId: 2, iconAssetFlag: 'dashboard.menu.analytics', submenuItems: [] },
      { menuItemId: 3, iconAssetFlag: 'dashboard.menu.payout', submenuItems: [] },
    ]);

    expect(getAssetUrls).toHaveBeenCalledTimes(1);
    expect(getAssetUrls).toHaveBeenCalledWith([
      'dashboard.menu.analytics',
      'dashboard.menu.payout',
    ]);
  });

  it('translates translationKey', async () => {
    const items = await resolveDashboardSidebarMenuItems([
      {
        menuItemId: 1,
        translationKey: 'dashboard.menu.analytics',
        iconAssetFlag: 'dashboard.menu.analytics',
        submenuItems: [],
      },
    ]);

    expect(items[0].translationKey).toBe('dashboard.menu.analytics');
  });

  it('fallback title on translation error', async () => {
    const items = await resolveDashboardSidebarMenuItems([
      {
        menuItemId: 1,
        fallbackLabel: 'Analytics',
        translationKey: 'dashboard.menu.analytics',
        iconAssetFlag: 'dashboard.menu.analytics',
        submenuItems: [],
      },
    ]);

    expect(items[0].fallbackLabel).toBe('Analytics');
  });

  it('role filter excludes item', async () => {
    const items = await resolveDashboardSidebarMenuItems(
      [{ menuItemId: 1, roles: ['creator'], iconAssetFlag: 'dashboard.menu.payout', submenuItems: [] }],
      'guest',
    );

    expect(items).toEqual([]);
  });

  it('recursive children', async () => {
    getAssetUrls.mockResolvedValue({ 'dashboard.menu.orders': '/assets/menu/orders.svg' });

    const items = await resolveDashboardSidebarMenuItems([
      {
        menuItemId: 1,
        iconAssetFlag: 'dashboard.menu.orders',
        submenuItems: [{ menuItemId: 2, iconAssetFlag: 'dashboard.menu.orders', submenuItems: [] }],
      },
    ]);

    expect(items[0].submenuItems[0].iconUrl).toBe('/assets/menu/orders.svg');
  });

  it('role filter on children', async () => {
    const items = await resolveDashboardSidebarMenuItems(
      [
        {
          menuItemId: 1,
          iconAssetFlag: 'dashboard.menu.analytics',
          submenuItems: [{ menuItemId: 2, roles: ['creator'], iconAssetFlag: '', submenuItems: [] }],
        },
      ],
      'guest',
    );

    expect(items[0].submenuItems).toEqual([]);
  });

  it('default menuItems param', async () => {
    const items = await resolveDashboardSidebarMenuItems();

    expect(items.length).toBeGreaterThan(0);
    expect(getAssetUrls).toHaveBeenCalled();
  });

  it('empty array → []', async () => {
    await expect(resolveDashboardSidebarMenuItems([])).resolves.toEqual([]);
    expect(getAssetUrls).toHaveBeenCalledWith([]);
  });
});
