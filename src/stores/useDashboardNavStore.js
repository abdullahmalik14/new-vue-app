import { defineStore } from 'pinia';
import { fetchDashboardNavData } from '@/services/dashboard/dashboardNavApi.js';
import * as cacheHandler from '@/infrastructure/cache/cacheHandler.js';

export const useDashboardNavStore = defineStore('dashboardNav', {
  state: () => ({
    /**
     * @type {Record<string, string|number>}
     * TTL: 60s
     */
    menuBadgeCountsById: {},
    /**
     * @type {Record<string, string|number>}
     * TTL: 60s
     */
    tabBadgeCounts: {},
    /**
     * @type {number}
     * TTL: 60s
     */
    unreadNotificationCount: 0,
    /**
     * @type {object|null}
     * TTL: 15m
     */
    profileSummary: null,
    // Submenu state
    isSubmenuOpen: false,
    activeSubmenuTitle: null,
  }),
  getters: {
    getTabBadgeCount: (state) => (tabId) => {
      return state.tabBadgeCounts[tabId] || 0;
    },
    getMenuBadgeCount: (state) => (badgeId) => {
      return state.menuBadgeCountsById[badgeId] || 0;
    }
  },
  actions: {
    async hydrateFromDashboardNavApi() {
      try {
        const payload = await fetchDashboardNavData();
        if (payload.badges) {
          this.menuBadgeCountsById = { ...this.menuBadgeCountsById, ...payload.badges };
          cacheHandler.setValueWithExpiration('dashboardNav_badges', this.menuBadgeCountsById, 60 * 1000); // 60s TTL
        }
        if (payload.tabBadges) {
          this.tabBadgeCounts = { ...this.tabBadgeCounts, ...payload.tabBadges };
          cacheHandler.setValueWithExpiration('dashboardNav_tabBadges', this.tabBadgeCounts, 60 * 1000); // 60s TTL
        }
        if (payload.notifications !== undefined) {
          this.unreadNotificationCount = payload.notifications;
          cacheHandler.setValueWithExpiration('dashboardNav_notifications', this.unreadNotificationCount, 60 * 1000); // 60s TTL
        }
        if (payload.profileSummary) {
          this.profileSummary = payload.profileSummary;
          cacheHandler.setValueWithExpiration('dashboardNav_profile', this.profileSummary, 15 * 60 * 1000); // 15m TTL
        }
      } catch (e) {
        console.error('Failed to hydrate dashboard nav store:', e);
      }
    }
  }
});
