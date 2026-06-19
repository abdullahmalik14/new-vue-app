export function createDashboardSidebarSlideInConfig(overrides = {}) {
  return {
    actionType: "slideIn",
    from: "left",
    offset: "5.625rem",
    speed: "250ms",
    effect: "ease-in-out",
    shouldShowOverlay: false,
    shouldCloseOnOutsideClick: true,
    shouldLockBodyScroll: false,
    shouldCloseOnEscape: true,
    height: "100%",
    scrollable: true,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
    width: { default: "auto" },
    ...overrides
  };
}
