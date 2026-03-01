(function () {
  const summary = {
    activeFans: 1240,
    newSubscribers: 87,
    revenueToday: '$2,450',
    responseRate: '96%'
  };

  window.dashboardMetrics = {
    ready: true,
    getSummary() {
      return { ...summary };
    }
  };

  const event = typeof CustomEvent === 'function'
    ? new CustomEvent('dashboard-metrics:ready', { detail: { summary } })
    : null;

  if (event) {
    window.dispatchEvent(event);
  }
})();
