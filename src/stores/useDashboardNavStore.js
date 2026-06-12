import { defineStore } from 'pinia';

export const useDashboardNavStore = defineStore('dashboardNav', {
  state: () => ({
    // Store badge counts dynamically fetched from mock/API
    menuBadgeCountsById: {},
    // Global notification counts
    unreadNotificationCount: 0,
  }),
  getters: {
    // Getter to retrieve a specific badge count by its ID
    getMenuBadgeCount: (state) => (badgeId) => {
      return state.menuBadgeCountsById[badgeId] || 0;
    }
  },
  actions: {
    // Action to hydrate the store from the dashboard nav API
    hydrateFromDashboardNavApi(payload) {
      if (payload.badges) {
        this.menuBadgeCountsById = { ...this.menuBadgeCountsById, ...payload.badges };
      }
      if (payload.notifications !== undefined) {
        this.unreadNotificationCount = payload.notifications;
      }
    }
  }
});
