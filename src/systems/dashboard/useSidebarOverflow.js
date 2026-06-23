import { ref, computed } from 'vue';

export function useSidebarOverflow(dashboardMenuItems, elRef, menuContainerRef, menuItemMeasureRef, moreMenuButtonWrapperRef) {
  const visibleMenuItems = ref([]);
  const overflowMenuItems = ref([]);
  const isMoreVisible = ref(false);
  const isMoreFlyoutHovered = ref(false);
  const isMoreButtonHovered = ref(false);
  let moreFlyoutHideTimeoutId = null;

  const updateVisibleMenuItems = (headerContainerRef, footerContainerRef, logoContainerRef) => {
    if (!menuContainerRef.value || !menuItemMeasureRef.value || !elRef.value) return;
    
    const sidebarHeight = elRef.value.offsetHeight;
    const headerHeight = headerContainerRef.value ? headerContainerRef.value.offsetHeight : 0;
    const footerHeight = footerContainerRef.value ? footerContainerRef.value.offsetHeight : 0;
    const logoHeight = logoContainerRef.value ? logoContainerRef.value.offsetHeight : 0;
    
    const layoutFixedSpacingPx = 50; 
    const availableHeightForMenuItemsPx = sidebarHeight - headerHeight - footerHeight - logoHeight - layoutFixedSpacingPx;
    
    const measuredMenuItemHeightPx = menuItemMeasureRef.value ? menuItemMeasureRef.value.offsetHeight : 52;
    const menuItemHeight = measuredMenuItemHeightPx + 4; 
    const moreButtonHeight = menuItemHeight;

    let usedMenuHeightPx = 0;
    const visibleMenuItemsBuffer = [];
    const overflowMenuItemsBuffer = [];

    const totalRequiredMenuHeightPx = (dashboardMenuItems.value || []).length * menuItemHeight;
    if (totalRequiredMenuHeightPx <= availableHeightForMenuItemsPx) {
      visibleMenuItems.value = [...(dashboardMenuItems.value || [])];
      overflowMenuItems.value = [];
      return;
    }

    const availableHeightPxWithMore = availableHeightForMenuItemsPx - moreButtonHeight;

    (dashboardMenuItems.value || []).forEach((item) => {
      if (usedMenuHeightPx + menuItemHeight <= availableHeightPxWithMore) {
        usedMenuHeightPx += menuItemHeight;
        visibleMenuItemsBuffer.push(item);
      } else {
        overflowMenuItemsBuffer.push(item);
      }
    });

    visibleMenuItems.value = visibleMenuItemsBuffer;
    overflowMenuItems.value = overflowMenuItemsBuffer;
  };

  const showMoreMenuFlyout = () => {
    if (moreFlyoutHideTimeoutId) clearTimeout(moreFlyoutHideTimeoutId);
    isMoreVisible.value = true;
  };

  const hideMoreMenuFlyout = () => {
    if (moreFlyoutHideTimeoutId) clearTimeout(moreFlyoutHideTimeoutId);
    moreFlyoutHideTimeoutId = setTimeout(() => {
      if (!isMoreButtonHovered.value && !isMoreFlyoutHovered.value) {
        isMoreVisible.value = false;
      }
    }, 150);
  };

  const handleMoreButtonMouseEnter = () => {
    isMoreButtonHovered.value = true;
    showMoreMenuFlyout();
  };

  const handleMoreButtonMouseLeave = () => {
    isMoreButtonHovered.value = false;
    hideMoreMenuFlyout();
  };

  const handleFlyoutMouseEnter = () => {
    isMoreFlyoutHovered.value = true;
    showMoreMenuFlyout();
  };

  const handleFlyoutMouseLeave = () => {
    isMoreFlyoutHovered.value = false;
    hideMoreMenuFlyout();
  };

  const moreMenuFlyoutPositionStyle = computed(() => {
    if (!isMoreVisible.value || !moreMenuButtonWrapperRef.value) return { top: '-9999px', left: '-9999px' };
    const moreButtonBoundingRect = moreMenuButtonWrapperRef.value.getBoundingClientRect();
    
    const overflowMenuRowCount = Math.ceil(overflowMenuItems.value.length / 2);
    let moreFlyoutHeight = (overflowMenuRowCount * 52) + ((overflowMenuRowCount - 1) * 24) + (2 * 16); 
    if (overflowMenuItems.value.length === 0) moreFlyoutHeight = 0; 
    if (moreFlyoutHeight < 100) moreFlyoutHeight = 100;

    let moreFlyoutTopPx = moreButtonBoundingRect.top;
    const windowHeight = window.innerHeight;
    if (moreFlyoutTopPx + moreFlyoutHeight > windowHeight - 10) {
      moreFlyoutTopPx = windowHeight - moreFlyoutHeight - 10;
    }
    if (moreFlyoutTopPx < 10) moreFlyoutTopPx = 10;
    
    return {
      top: `${moreFlyoutTopPx}px`,
      left: `${moreButtonBoundingRect.right + 4}px`,
      pointerEvents: 'auto'
    };
  });

  const moreMenuFlyoutHoverBridgeStyle = computed(() => {
    if (!isMoreVisible.value || !moreMenuButtonWrapperRef.value) return { top: '-9999px', left: '-9999px' };
    const moreButtonBoundingRect = moreMenuButtonWrapperRef.value.getBoundingClientRect();
    return {
      top: `${moreButtonBoundingRect.top - 10}px`,
      left: `${moreButtonBoundingRect.right - 10}px`,
      width: '30px',
      height: `${moreButtonBoundingRect.height + 20}px`
    };
  });

  return {
    visibleMenuItems,
    overflowMenuItems,
    isMoreVisible,
    updateVisibleMenuItems,
    handleMoreButtonMouseEnter,
    handleMoreButtonMouseLeave,
    handleFlyoutMouseEnter,
    handleFlyoutMouseLeave,
    moreMenuFlyoutPositionStyle,
    moreMenuFlyoutHoverBridgeStyle
  };
}
