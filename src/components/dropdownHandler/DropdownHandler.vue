<template>
  <Teleport :to="teleportTarget" v-if="isOpenInternal">
    <div :id="dropdownId" ref="dropdownRef" :role="ariaRole" :data-dropdown-handler="dropdownId"
      :data-placement="lastPlacement?.placement || 'bottom'" :data-layer="config?.layer" :data-group="config?.group"
      :class="outerContainerClass" :style="computedContainerStyle" @mouseenter="onDropdownMouseEnter"
      @mouseleave="onDropdownMouseLeave" @click="onDropdownClick">

      <div v-if="isLoading && config?.loader" :class="loaderContainerClass">
        <div v-if="config?.loader?.style === 'spinner'" class="loader-spinner" :class="config?.loader?.class"></div>
        <div v-else-if="config?.loader?.style === 'dots'" class="loader-dots" :class="config?.loader?.class"></div>
        <slot v-else-if="config?.loader?.style === 'custom'" name="loader"></slot>
      </div>

      <div ref="contentScrollRef" :class="contentContainerClass" :style="contentStyle">
        <slot />
      </div>
    </div>

    <!-- Overlay: decorative visual backdrop only, not in accessibility tree -->
    <!-- role="presentation" and aria-hidden="true" ensure assistive tech ignores this element -->
    <!-- This prevents the overlay from being treated as interactive content or intercepting focus -->
    <div v-if="config?.overlay" :class="overlayClass" role="presentation" aria-hidden="true" @click="handleOverlayClick"
      @mouseenter="handleOverlayHover" />
  </Teleport>
</template>

<script setup>
/**
 * DropdownHandler Component - SSR-Safe Implementation
 * 
 * This component is designed to be SSR-tolerant (server-side rendering compatible).
 * All DOM and window access is consistently guarded to prevent crashes in SSR environments.
 * 
 * SSR Safety Strategy:
 * - Centralized browser check: isBrowser() helper function ensures consistent guards
 * - All document/window access is guarded: if (!isBrowser()) return
 * - DOM-dependent operations only execute in browser context
 * - Event handlers (click, scroll, etc.) only fire in browser, so minimal guards needed there
 * - Computed properties and watchers guard DOM access defensively
 * - Helper functions (from dropdown-helpers.js) receive DOM data via parameters:
 *   - viewport dimensions passed explicitly (not accessed directly in helpers)
 *   - DOM elements passed as parameters (not queried in helpers)
 *   - No direct window/document access in helper functions
 * 
 * Architecture Decision:
 * - This component is SSR-safe (not browser-only)
 * - All DOM access is gated behind isBrowser() checks
 * - Helpers are pure or receive DOM data via parameters
 * - Component gracefully degrades in SSR (renders but interactions require hydration)
 * 
 * Note: This component requires browser environment for full functionality.
 * In SSR, it will render but dropdown interactions require client-side hydration.
 */
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick, defineExpose } from 'vue'
import {
  getThemeClasses,
  resolveWidth,
  resolveHeight,
  computeHorizontalPosition,
  computeVerticalPosition,
  computeTooltipPosition,
  detectCollision,
  getViewportSize,
  isMobile,
  computeDropdownLayout,
  CLOSE_REASONS
} from './dropdown-helpers.js'

// ===== SSR SAFETY HELPERS =====
/**
 * Check if we're in a browser environment (not SSR/Node)
 * This is a centralized check to ensure consistent SSR safety across the component
 * 
 * @returns {boolean} True if window and document are available
 */
/**
 * Check if we're in a browser environment (not SSR/Node)
 * This is a centralized check to ensure consistent SSR safety across the component
 * 
 * @returns {boolean} True if window and document are available
 */
function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Find the nearest scrollable ancestor of an element.
 * 
 * Used for tooltip positioning so that offsets inside scrollable containers
 * (cards, modals, sidebars) are respected. Falls back to null when none found.
 */
function getScrollableAncestor(el) {
  if (!isBrowser() || !el) return null

  let node = el.parentElement
  while (node && node !== document.body && node !== document.documentElement) {
    try {
      const style = window.getComputedStyle(node)
      const overflowY = style.overflowY
      const overflowX = style.overflowX
      const isScrollable = /(auto|scroll)/.test(overflowY) || /(auto|scroll)/.test(overflowX)
      if (isScrollable) return node
    } catch (e) {
      // If getComputedStyle fails, skip this node
    }
    node = node.parentElement
  }
  return null
}

// Global dropdown stack - uses dropdownId (string) as key to prevent memory leaks
// Using string IDs instead of object references allows entries to be garbage collected
// even if unregister is not called (e.g., hot-reload, component destruction quirks)
// The Map stores { instance, layer, group } where instance is the exposed API object
const __DROPDOWN_STACK = new Map() // Map<dropdownId: string, { instance, layer, group }>

/**
 * Clean up stale entries from the dropdown stack
 * Removes entries where the instance is invalid or no longer functional
 * This prevents memory leaks if instances are destroyed without unregistering
 * 
 * @param {string|null} excludeId - Optional dropdown ID to exclude from cleanup (e.g., current instance)
 * @returns {number} Number of stale entries cleaned up
 */
function __stackCleanupStale(excludeId = null) {
  let cleaned = 0
  for (const [id, entry] of __DROPDOWN_STACK.entries()) {
    // Skip the excluded ID (e.g., current instance being registered)
    if (excludeId && id === excludeId) continue
    
    // Check if instance is invalid or no longer functional
    if (!entry.instance || typeof entry.instance.close !== 'function') {
      __DROPDOWN_STACK.delete(id)
      cleaned++
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[DropdownHandler] Cleaned up stale stack entry for dropdown: ${id}`)
      }
    }
  }
  return cleaned
}

/**
 * Register a dropdown instance in the global stack
 * Closes other open dropdowns in the same layer (unless same group)
 * 
 * @param {string} dropdownId - Unique identifier for this dropdown instance
 * @param {object} instance - The exposed API object with open/close/toggle methods
 * @param {string} layer - Layer name ('dropdown' or 'tooltip')
 * @param {string|null} group - Optional group identifier (dropdowns in same group can coexist)
 */
function __stackRegister(dropdownId, instance, layer = 'dropdown', group = null) {
  // Defensive cleanup: Remove stale entries where instance is invalid
  // This prevents memory leaks if instances are destroyed without unregistering
  // Cleanup happens proactively on every register to catch orphaned entries
  __stackCleanupStale(dropdownId)

  // Process valid entries to close other dropdowns in the same layer
  for (const [id, entry] of __DROPDOWN_STACK.entries()) {
    // Skip self
    if (id === dropdownId) continue

    // Skip tooltips (they don't close dropdowns)
    if (layer === 'tooltip') continue

    // Skip dropdowns in the same group (nested menus)
    if (group && entry.group === group) continue

    // Skip dropdowns in different layers
    if (entry.layer !== layer) continue

    // Close other dropdowns in the same layer
    try {
      entry.instance.close('stack-opened-other')
    } catch (e) {
      // If close fails, the instance is likely stale - mark for cleanup
      // This will be cleaned up on the next register or explicit cleanup
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[DropdownHandler] Error closing dropdown ${id} during stack register:`, e)
      }
      // Immediately remove the stale entry since close() failed
      __DROPDOWN_STACK.delete(id)
    }
  }

  // Register this instance
  __DROPDOWN_STACK.set(dropdownId, { instance, layer, group })
}

/**
 * Unregister a dropdown instance from the global stack
 * Also performs cleanup of any stale entries to prevent memory leaks
 * 
 * @param {string} dropdownId - Unique identifier for this dropdown instance
 */
function __stackUnregister(dropdownId) {
  __DROPDOWN_STACK.delete(dropdownId)
  // Proactive cleanup: remove any other stale entries when unregistering
  // This helps catch cases where other instances failed to unregister
  __stackCleanupStale()
}

const props = defineProps({
  anchor: {
    type: [HTMLElement, Object],
    required: false,
    validator: (value) => value === null || value instanceof HTMLElement || (typeof value === 'object' && value !== null)
  },
  config: { type: Object, required: true },
})

const emit = defineEmits(['open', 'close', 'toggle', 'repositioned', 'collided'])

const isOpenInternal = ref(false)
const dropdownRef = ref(null)
const contentScrollRef = ref(null)
const isLoading = ref(false)
const openMode = ref('click')
const hoverOpenTimer = ref(null)
const hoverCloseTimer = ref(null)
const clickFocusOpenTimer = ref(null) // Timer for click/focus open delay
const lastPlacement = ref({ flipped: false, snappedEdge: null, align: 'center', placement: 'bottom' })
const dropdownId = `dh-${Math.random().toString(36).slice(2)}`
const shouldAnimate = ref(false)
const isTransitioning = ref(false) // Guard against rapid open/close spam - prevents overlapping animations
const lastCollision = ref(null)
const lastCloseReason = ref(null) // Track last close reason for consumer access
const lastWindowScrollY = ref(0)
const lastWindowScrollX = ref(0)
// Cache last layout snapshot to avoid unnecessary DOM writes when position/size hasn't changed
// This micro-optimization prevents style writes and layout reflows on resize/scroll storms
const lastDropdownPosition = ref({ left: null, top: null, maxWidth: null, maxHeight: null })
const lastRepositionTime = ref(0) // Track last reposition time for throttling (used in repositionInternal)
const lastScrollActionTime = ref(0) // Track last scroll action (reposition or close) for throttling
const MIN_REPOSITION_INTERVAL_MS = 16 // Minimum time between reposition operations (throttles expensive DOM reads/writes) - used in repositionInternal and handleWindowScroll
const MIN_SCROLL_ACTION_INTERVAL_MS = 32 // Minimum time between scroll actions (reposition or close) - increased for better performance
let scrollThrottleRaf = null
const originalBodyOverflow = ref('')
const originalBodyPaddingRight = ref('')

// Default z-index constants - these define the reserved z-index range for dropdowns
// ===== Z-INDEX RESERVATION =====
// 
// IMPORTANT: By default, DropdownHandler reserves z-index 999-1000 for dropdown overlays and dropdowns.
// This is a HIDDEN AUTHORITY on z-ordering - if your app uses modals, notifications, tooltips, or other
// overlays in this range, you MUST configure zIndexBase (or overlayZIndex) to avoid conflicts.
//
// Default z-index values (configurable via config):
// - Overlay: 999 (configurable via zIndexBase or overlayZIndex)
// - Dropdown: 1000 (always overlayZIndex + 1, or zIndexBase + 1)
//
// To avoid conflicts, configure zIndexBase in your dropdown config:
// - Example: If modals use z-index 1000-1100, set zIndexBase: 1100
// - Example: If tooltips use z-index 500-600, default (999-1000) is fine
//
// @see DEFAULTS.zIndexBase and DEFAULTS.overlayZIndex for configuration options
const DEFAULT_Z_INDEX_BASE = 999      // Default overlay z-index (configurable via config.zIndexBase)
const DEFAULT_DROPDOWN_Z_INDEX = 1000 // Default dropdown z-index (always overlayZIndex + 1, or zIndexBase + 1)

const DEFAULTS = Object.freeze({

  trigger: 'click',
  hoverIntentMs: 50,
  // Close delay for hover mode (in milliseconds)
  // 
  // Default: 100ms (provides a forgiving delay when moving pointer between anchor and dropdown)
  // This delay prevents the dropdown from closing immediately when the pointer leaves,
  // making it feel less twitchy and more forgiving when moving across small gaps.
  //
  // The delay is cancelled if the pointer re-enters the anchor or dropdown before it expires,
  // allowing smooth transitions between anchor and dropdown.
  //
  // Example use cases:
  // - hoverCloseDelayMs: 100 (default) - forgiving delay for most cases
  // - hoverCloseDelayMs: 150 - longer delay for larger gaps or slower pointer movement
  // - hoverCloseDelayMs: 50 - shorter delay for more responsive feel
  // - hoverCloseDelayMs: 0 - immediate close (not recommended, feels twitchy)
  hoverCloseDelayMs: 100,
  // Open delay for click/focus triggers (in milliseconds)
  // 
  // Default: 0 (immediate open, backwards compatible)
  // Set to 10-20ms to add a small delay that helps avoid conflicts with:
  // - Double-click events (prevents dropdown from opening on first click of double-click)
  // - Rapid focus changes during keyboard navigation
  // - Rapid clicking/tapping on touch devices
  //
  // This delay is similar to hoverIntentMs but applies to click/focus triggers.
  // The delay uses the same timer infrastructure as hover for consistency.
  //
  // Example use cases:
  // - openDelayMs: 0 (default) - immediate open (backwards compatible)
  // - openDelayMs: 15 - small delay to avoid double-click conflicts
  // - openDelayMs: 20 - slightly longer delay for touch devices
  openDelayMs: 0,
  toggleOnTriggerClick: true,
  // Controlled mode configuration
  //
  // When true, the dropdown is in **controlled mode**:
  // - All automatic trigger behavior (click/hover/focus) is DISABLED
  // - No anchor event listeners are attached by bindTrigger()
  // - No global listeners are registered by addGlobalListeners()
  // - The dropdown only opens/closes when the consumer calls the exposed methods:
  //   - open(origin?)
  //   - close(origin?)
  //   - toggle(origin?)
  // - Recommended pattern for integrating with external state machines, routers, or
  //   complex UIs where you want full control over when the dropdown opens/closes.
  //
  // When false (default), the dropdown is in **uncontrolled mode**:
  // - Trigger behavior is driven by config.trigger ('click' | 'hover' | 'focus')
  // - Anchor event listeners (click/hover/focus) are attached automatically
  // - Global listeners (document click, Escape key, scroll/resize) are managed
  //   based on config flags: closeOnOutsideClick, closeOnScroll, repositionOnScroll
  // - Recommended pattern for simple dropdown usage where internal behavior
  //   manages open/close lifecycle.
  controlledMode: false,
  // Disabled state
  //
  // When true, the dropdown is **disabled**:
  // - All open/toggle attempts are ignored (from both internal triggers and public API)
  // - Anchor element remains interactive (clicks, navigation, etc. still work)
  // - No overlay or dropdown content will be shown
  // - Useful for: loading states, permission gating, A/B variants where dropdown
  //   is present in layout but must never open.
  //
  // NOTE: disabled takes precedence over all triggers and controlledMode.
  // Even in controlledMode, calling open()/toggle() will no-op when disabled is true.
  disabled: false,
  // Whether to prevent default behavior and stop propagation on anchor click
  // 
  // Default: true (backwards compatible - prevents default to avoid navigation/form submission)
  // Set to false to allow normal anchor/button behavior (navigation, form submission, etc.)
  // while still opening the dropdown.
  //
  // You can also override this per-anchor using data-dropdown-suppress-default attribute:
  // - <a data-dropdown-suppress-default="false"> - Allows normal link behavior
  // - <a data-dropdown-suppress-default="true"> - Suppresses default (same as config: true)
  // - <a> (no attribute) - Uses config.suppressTriggerDefault value
  //
  // Example use cases:
  // - Link with dropdown: suppressTriggerDefault: false allows navigation + dropdown
  // - Button with dropdown: suppressTriggerDefault: false allows form submission + dropdown
  // - Dropdown-only trigger: suppressTriggerDefault: true (default) prevents default behavior
  suppressTriggerDefault: true,
  forceKeepOpen: false,

  align: 'center',
  snapEdge: null,
  offset: 8,
  positionMode: 'adaptive',
  flipOnOverflow: true,

  width: 400,
  height: null,
  maxWidth: null,
  widthMode: 'viewport',
  widthParentSelector: null,
  widthAncestorSelector: null,

  tooltipPlacement: null,
  tooltipFallbackOrder: null,

  scrollEnabled: true,
  hideScrollbars: true,
  closeOnScroll: false,
  repositionOnScroll: true,
  preventBodyScroll: false,

  closeOnOutsideClick: true,
  closeOnOutsideHover: true,
  // Whether to ignore button clicks outside dropdown when closeOnOutsideClick is true
  // 
  // Default: false (buttons close dropdown when clicked outside)
  // Set to true to prevent ALL buttons from closing the dropdown
  // 
  // For fine-grained control, use data-dropdown-ignore-click attribute on specific buttons:
  // <button data-dropdown-ignore-click>This button won't close dropdowns</button>
  // This allows you to ignore specific buttons while allowing others to close the dropdown
  // 
  // Example use cases:
  // - ignoreOutsideButtons: false (default) - buttons close dropdown (normal behavior)
  // - ignoreOutsideButtons: true - buttons never close dropdown (useful for toolbars with many buttons)
  // - Use data-dropdown-ignore-click on specific buttons - mixed behavior (some buttons close, some don't)
  ignoreOutsideButtons: false,
  destroyOnRouteChange: true,

  animation: 'none',
  animationDurationMs: 120,
  overlay: false,
  theme: 'generic',
  // Style configuration for dropdown container
  // Structure: { class?: string, inline?: Record<string, string>, style?: Record<string, string>, contentStyle?: Record<string, string>, attrs?: Record<string, string> }
  // - class: CSS classes to add to outer container (merged with computed classes)
  // - inline: Inline styles object (merged into computedContainerStyle LAST, takes precedence over computed styles)
  // - style: Alias for 'inline' (more intuitive name, same behavior - if both provided, 'inline' takes precedence)
  // - contentStyle: Inline styles for content container
  // - attrs: Reserved for future use (data-*, aria-* attributes)
  // 
  // Example:
  // style: {
  //   class: 'my-custom-dropdown',
  //   inline: { maxHeight: '400px', backgroundColor: '#fff' }
  // }
  // OR (using 'style' alias):
  // style: {
  //   class: 'my-custom-dropdown',
  //   style: { maxHeight: '400px', backgroundColor: '#fff' }
  // }
  style: {},

  teleportTo: 'body',
  ariaRole: 'menu',
  // Mobile breakpoint configuration
  //
  // IMPORTANT: This is a PER-CONFIG value, NOT a global setting.
  // Each dropdown instance can have its own mobile breakpoint, allowing different
  // dropdowns to respond differently to viewport size changes.
  //
  // Behavior:
  // - Evaluated reactively on each repositionInternal() call
  // - Changes to mobileBreakpoint while dropdown is open take effect on next reposition
  // - Watched for changes - triggers reposition when modified while dropdown is open
  // - Used to determine if snapEdge should be applied (mobile-specific behavior)
  //
  // Default: 640px (standard mobile breakpoint, matches Tailwind's 'sm' breakpoint)
  //
  // Example use cases:
  // - Desktop dropdown: mobileBreakpoint: 1024 (only snaps on tablets/small laptops)
  // - Mobile-first dropdown: mobileBreakpoint: 480 (snaps on small phones)
  // - Responsive dropdown: mobileBreakpoint: 768 (matches tablet breakpoint)
  //
  // @see isMobile() helper in dropdown-helpers.js for implementation
  // @see watch() at bottom of file that triggers reposition on mobileBreakpoint changes
  mobileBreakpoint: 640,

  // Z-index configuration
  // 
  // IMPORTANT: By default, DropdownHandler reserves z-index 999-1000 for dropdown overlays and dropdowns.
  // If your application uses modals, notifications, tooltips, or other overlays in this range,
  // you MUST configure zIndexBase (or overlayZIndex) to avoid conflicts.
  //
  // Z-index layering:
  // - Overlay: zIndexBase (default: 999)
  // - Dropdown: zIndexBase + 1 (default: 1000)
  // This ensures the dropdown is always above its overlay.
  //
  // Example: If your modals use z-index 1000-1100, set zIndexBase: 1100 to place dropdowns above modals.
  // Example: If your tooltips use z-index 500-600, you can keep the default (999-1000).
  //
  // @see DEFAULT_Z_INDEX_BASE and DEFAULT_DROPDOWN_Z_INDEX constants above
  zIndexBase: DEFAULT_Z_INDEX_BASE, // Base z-index for overlay (default: 999)
  overlayZIndex: null, // Optional: separate overlay z-index (defaults to zIndexBase if not set)
  loader: null,
  layer: 'dropdown',
  group: null,
})


function validateConfig(cfg) {
  // Guard against null/undefined config to prevent errors in reactive paths
  if (!cfg || typeof cfg !== 'object') {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Config validation failed: config is null or not an object')
    }
    return // Early return to prevent errors
  }

  // Wrap entire validation in try-catch to ensure it NEVER throws
  // This function is called in reactive paths (computed/watch) and must fail gracefully
  try {
    const errors = []
    const warnings = []

    // Soft validation - collect errors instead of throwing
    // This function must NEVER throw to avoid breaking reactive paths (computed/watch)
    const triggerOk = ['click', 'hover', 'focus'].includes(cfg.trigger)
    if (!triggerOk) {
      errors.push(`Invalid trigger: ${cfg.trigger}. Must be 'click', 'hover', or 'focus'.`)
      cfg.trigger = DEFAULTS.trigger
    }

    const alignOk = ['center', 'left', 'right'].includes(cfg.align)
    if (!alignOk) {
      errors.push(`Invalid align: ${cfg.align}. Must be 'center', 'left', or 'right'.`)
      cfg.align = DEFAULTS.align
    }

    const positionModeOk = ['adaptive', 'below', 'above'].includes(cfg.positionMode)
    if (!positionModeOk) {
      errors.push(`Invalid positionMode: ${cfg.positionMode}. Must be 'adaptive', 'below', or 'above'.`)
      cfg.positionMode = DEFAULTS.positionMode
    }

    const widthModeOk = ['viewport', 'parent', 'ancestor'].includes(cfg.widthMode)
    if (!widthModeOk) {
      errors.push(`Invalid widthMode: ${cfg.widthMode}. Must be 'viewport', 'parent', or 'ancestor'.`)
      cfg.widthMode = DEFAULTS.widthMode
    }

    const animOk = ['none', 'fade', 'scale', 'fade-scale', 'slide-up', 'slide-down', 'slide-in-bottom-mobile'].includes(cfg.animation)
    if (!animOk) {
      errors.push(`Invalid animation: ${cfg.animation}.`)
      cfg.animation = DEFAULTS.animation
    }

    if (cfg.snapEdge && !['left', 'right'].includes(cfg.snapEdge)) {
      errors.push(`Invalid snapEdge: ${cfg.snapEdge}. Must be 'left', 'right', or null.`)
      cfg.snapEdge = DEFAULTS.snapEdge
    }

    if (cfg.width && typeof cfg.width !== 'number' && typeof cfg.width !== 'string' && typeof cfg.width !== 'object') {
      errors.push('width must be number|string|responsive map object')
      cfg.width = DEFAULTS.width
    }

    if (cfg.height && typeof cfg.height !== 'number' && typeof cfg.height !== 'string') {
      errors.push('height must be number|string')
      cfg.height = DEFAULTS.height
    }

    const layerOk = ['dropdown', 'tooltip'].includes(cfg.layer)
    if (!layerOk) {
      errors.push(`Invalid layer: ${cfg.layer}. Must be 'dropdown' or 'tooltip'.`)
      cfg.layer = DEFAULTS.layer
    }

    // Validate hoverIntentMs
    const hoverDelay = Number(cfg.hoverIntentMs)
    if (!Number.isFinite(hoverDelay) || hoverDelay < 0) {
      warnings.push(`Invalid hoverIntentMs: ${cfg.hoverIntentMs}. Using default: ${DEFAULTS.hoverIntentMs}ms`)
      cfg.hoverIntentMs = DEFAULTS.hoverIntentMs
    }

    // Validate openDelayMs
    const openDelay = Number(cfg.openDelayMs)
    if (!Number.isFinite(openDelay) || openDelay < 0) {
      warnings.push(`Invalid openDelayMs: ${cfg.openDelayMs}. Using default: ${DEFAULTS.openDelayMs}ms`)
      cfg.openDelayMs = DEFAULTS.openDelayMs
    }

    // Validate hoverCloseDelayMs
    const hoverCloseDelay = Number(cfg.hoverCloseDelayMs)
    if (!Number.isFinite(hoverCloseDelay) || hoverCloseDelay < 0) {
      warnings.push(`Invalid hoverCloseDelayMs: ${cfg.hoverCloseDelayMs}. Using default: ${DEFAULTS.hoverCloseDelayMs}ms`)
      cfg.hoverCloseDelayMs = DEFAULTS.hoverCloseDelayMs
    }

    // Warnings for missing selectors
    if (cfg.widthMode === 'parent' && !cfg.widthParentSelector) {
      warnings.push('widthMode is "parent" but widthParentSelector is not provided')
    }
    if (cfg.widthMode === 'ancestor' && !cfg.widthAncestorSelector) {
      warnings.push('widthMode is "ancestor" but widthAncestorSelector is not provided')
    }

    if (cfg.tooltipFallbackOrder && !Array.isArray(cfg.tooltipFallbackOrder)) {
      warnings.push('tooltipFallbackOrder must be an array')
      cfg.tooltipFallbackOrder = null
    }

    // Validate controlledMode (must be boolean if provided)
    if (cfg.controlledMode !== undefined && typeof cfg.controlledMode !== 'boolean') {
      warnings.push('controlledMode must be a boolean. Using default: false')
      cfg.controlledMode = DEFAULTS.controlledMode
    }

    // Validate disabled (must be boolean if provided)
    if (cfg.disabled !== undefined && typeof cfg.disabled !== 'boolean') {
      warnings.push('disabled must be a boolean. Using default: false')
      cfg.disabled = DEFAULTS.disabled
    }

    // Validate nested config structures (dev mode only for performance)
    // This prevents subtle runtime bugs from mis-shaped nested objects
    if (process.env.NODE_ENV !== 'production') {
      // Validate config.style structure
      // Expected shape: { class?: string, inline?: Record<string, string>, style?: Record<string, string>, contentStyle?: Record<string, string>, attrs?: Record<string, string> }
      // - class: CSS classes to add to outer container (merged with computed classes)
      // - inline: Inline styles object (merged into computedContainerStyle LAST, takes precedence over computed styles)
      // - style: Alias for 'inline' (more intuitive name, same behavior - if both provided, 'inline' takes precedence)
      // - contentStyle: Inline styles for content container
      // - attrs: Reserved for future use (data-*, aria-* attributes)
      if (cfg.style && typeof cfg.style !== 'object') {
        warnings.push('config.style must be an object')
        cfg.style = {}
      } else if (cfg.style) {
        // Check for unknown keys in style object
        const validStyleKeys = ['class', 'inline', 'style', 'contentStyle', 'attrs']
        const styleKeys = Object.keys(cfg.style)
        const unknownStyleKeys = styleKeys.filter(key => !validStyleKeys.includes(key))
        if (unknownStyleKeys.length > 0) {
          warnings.push(`config.style contains unknown keys: ${unknownStyleKeys.join(', ')}. Valid keys: ${validStyleKeys.join(', ')}`)
        }

        if (cfg.style.class !== undefined && typeof cfg.style.class !== 'string') {
          warnings.push('config.style.class must be a string')
          cfg.style.class = ''
        }
        if (cfg.style.inline !== undefined && (typeof cfg.style.inline !== 'object' || Array.isArray(cfg.style.inline) || cfg.style.inline === null)) {
          warnings.push('config.style.inline must be an object (plain object, not array/null)')
          cfg.style.inline = {}
        }
        // Validate config.style.style (alias for inline, more intuitive)
        if (cfg.style.style !== undefined && (typeof cfg.style.style !== 'object' || Array.isArray(cfg.style.style) || cfg.style.style === null)) {
          warnings.push('config.style.style must be an object (plain object, not array/null). Note: This is an alias for config.style.inline')
          cfg.style.style = {}
        }
        // Validate config.style.contentStyle (optional object for content container styles)
        if (cfg.style.contentStyle !== undefined && (typeof cfg.style.contentStyle !== 'object' || Array.isArray(cfg.style.contentStyle) || cfg.style.contentStyle === null)) {
          warnings.push('config.style.contentStyle must be an object (plain object, not array/null)')
          cfg.style.contentStyle = undefined
        }
        // Note: attrs is reserved for future use (data-*, aria-* attributes)
        // Currently not implemented but structure allows for it
      }

      // Validate config.contentStyle (legacy, for backward compatibility)
      if (cfg.contentStyle !== undefined && (typeof cfg.contentStyle !== 'object' || Array.isArray(cfg.contentStyle) || cfg.contentStyle === null)) {
        warnings.push('config.contentStyle must be an object (plain object, not array/null). Prefer config.style.contentStyle instead.')
        cfg.contentStyle = undefined
      }

      // Validate config.loader structure
      // Expected shape: { style: 'spinner'|'dots'|'custom', class?: string, theme?: string, background?: string, containerClass?: string }
      // - style: Required for loader to work (determines loader type)
      // - class: Optional CSS classes for loader element
      // - theme: Optional theme override for loader
      // - background: Optional background color/class for loader container
      // - containerClass: Optional CSS classes for loader container
      if (cfg.loader && cfg.loader !== null) {
        if (typeof cfg.loader !== 'object' || Array.isArray(cfg.loader)) {
          warnings.push('config.loader must be an object or null')
          cfg.loader = null
        } else {
          // Check for unknown keys in loader object
          const validLoaderKeys = ['style', 'class', 'theme', 'background', 'containerClass']
          const loaderKeys = Object.keys(cfg.loader)
          const unknownLoaderKeys = loaderKeys.filter(key => !validLoaderKeys.includes(key))
          if (unknownLoaderKeys.length > 0) {
            warnings.push(`config.loader contains unknown keys: ${unknownLoaderKeys.join(', ')}. Valid keys: ${validLoaderKeys.join(', ')}`)
          }

          // Validate loader.style (required for loader to work)
          // If style is missing, loader won't work but we don't error (loader is optional)
          if (cfg.loader.style !== undefined) {
            const validLoaderStyles = ['spinner', 'dots', 'custom']
            if (!validLoaderStyles.includes(cfg.loader.style)) {
              warnings.push(`config.loader.style must be one of: ${validLoaderStyles.join(', ')}. Got: "${cfg.loader.style}". Using default: 'spinner'`)
              cfg.loader.style = 'spinner' // Default fallback
            }
          } else if (cfg.loader.class || cfg.loader.theme || cfg.loader.background || cfg.loader.containerClass) {
            // Warn if loader has other properties but no style (loader won't work)
            warnings.push('config.loader has properties but missing required "style" property. Loader will not be displayed.')
          }

          // Validate loader.class (optional string)
          if (cfg.loader.class !== undefined && typeof cfg.loader.class !== 'string') {
            warnings.push('config.loader.class must be a string')
            cfg.loader.class = ''
          }

          // Validate loader.theme (optional string)
          if (cfg.loader.theme !== undefined && typeof cfg.loader.theme !== 'string') {
            warnings.push('config.loader.theme must be a string')
            cfg.loader.theme = undefined
          }

          // Validate loader.background (optional string)
          if (cfg.loader.background !== undefined && typeof cfg.loader.background !== 'string') {
            warnings.push('config.loader.background must be a string')
            cfg.loader.background = undefined
          }

          // Validate loader.containerClass (optional string)
          if (cfg.loader.containerClass !== undefined && typeof cfg.loader.containerClass !== 'string') {
            warnings.push('config.loader.containerClass must be a string')
            cfg.loader.containerClass = ''
          }
        }
      }

      // Validate tooltipPlacement (if provided, should be a valid placement string)
      // Valid placements: 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
      const validTooltipPlacements = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
      if (cfg.tooltipPlacement !== undefined && cfg.tooltipPlacement !== null) {
        if (typeof cfg.tooltipPlacement !== 'string') {
          warnings.push('tooltipPlacement must be a string or null')
          cfg.tooltipPlacement = null
        } else {
          const trimmed = cfg.tooltipPlacement.trim()
          if (trimmed === '') {
            warnings.push('tooltipPlacement cannot be an empty string')
            cfg.tooltipPlacement = null
          } else if (!validTooltipPlacements.includes(trimmed)) {
            warnings.push(
              `tooltipPlacement "${trimmed}" is not a valid placement. ` +
              `Valid placements: ${validTooltipPlacements.join(', ')}. ` +
              `Using "${trimmed}" anyway (will fallback to 'bottom' in computeTooltipPosition)`
            )
            // Don't change the value - let computeTooltipPosition handle it with its fallback logic
          }
        }
      }

      // Validate tooltipFallbackOrder array contents (if provided)
      // Should contain only valid placement strings
      if (cfg.tooltipFallbackOrder && Array.isArray(cfg.tooltipFallbackOrder)) {
        const invalidItems = cfg.tooltipFallbackOrder.filter(item => typeof item !== 'string')
        if (invalidItems.length > 0) {
          warnings.push(`tooltipFallbackOrder must contain only strings. Found ${invalidItems.length} invalid item(s)`)
          cfg.tooltipFallbackOrder = cfg.tooltipFallbackOrder.filter(item => typeof item === 'string')
        }

        // Validate that all items are valid placements
        const invalidPlacements = cfg.tooltipFallbackOrder.filter(item =>
          typeof item === 'string' && !validTooltipPlacements.includes(item.trim())
        )
        if (invalidPlacements.length > 0) {
          warnings.push(
            `tooltipFallbackOrder contains invalid placements: ${invalidPlacements.join(', ')}. ` +
            `Valid placements: ${validTooltipPlacements.join(', ')}`
          )
          // Don't filter them out - let computeTooltipPosition handle invalid placements with its fallback logic
        }
      }
    }

    // Log errors/warnings in dev mode only
    if (process.env.NODE_ENV !== 'production') {
      if (errors.length > 0) {
        console.error('[DropdownHandler] Config validation errors:', errors)
      }
      if (warnings.length > 0) {
        console.warn('[DropdownHandler] Config validation warnings:', warnings)
      }
    }

    // Never throw - this function is called in reactive paths (computed/watch)
    // All errors are logged and values are fixed by falling back to defaults
  } catch (error) {
    // Catch any unexpected errors during validation to prevent breaking reactive paths
    // This should never happen, but protects against edge cases (e.g., property access on null)
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Unexpected error during config validation:', error)
      console.error('[DropdownHandler] Config object:', cfg)
    }
    // Don't throw - silently fail and let component use defaults
    // The config object may be partially validated, which is acceptable
  }
}


const config = computed(() => {
  // Wrap in try-catch to ensure computed never throws, even if validation fails
  // This prevents breaking the component tree when config is invalid
  try {
    const cfg = Object.assign({}, DEFAULTS, props.config || {})
    validateConfig(cfg)
    return cfg
  } catch (error) {
    // Fallback to defaults if anything goes wrong (should never happen due to validateConfig protection)
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Error in config computed, using defaults:', error)
    }
    return { ...DEFAULTS }
  }
})

// Cache teleport target to avoid repeated querySelector calls
// Only re-query when teleportTo selector actually changes
const resolvedTeleportTarget = ref(null)
const lastTeleportSelector = ref(null)

const teleportTarget = computed(() => {
  const target = config.value?.teleportTo || 'body'

  // Fast path: 'body' doesn't need querySelector
  if (target === 'body') {
    // Only update cache if it changed
    if (lastTeleportSelector.value !== 'body') {
      lastTeleportSelector.value = 'body'
      resolvedTeleportTarget.value = 'body'
    }
    return 'body'
  }

  // Cache hit: selector hasn't changed, return cached result
  if (target === lastTeleportSelector.value && resolvedTeleportTarget.value !== null) {
    return resolvedTeleportTarget.value
  }

  // Cache miss: selector changed, need to query DOM
  lastTeleportSelector.value = target

  if (typeof document !== 'undefined') {
    try {
      const el = document.querySelector(target)
      if (!el) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[DropdownHandler] Teleport target "${target}" not found, falling back to 'body'`)
        }
        resolvedTeleportTarget.value = 'body'
        return 'body'
      }
      // Cache the selector string (Vue Teleport accepts selector strings)
      resolvedTeleportTarget.value = target
      return target
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[DropdownHandler] Error querying teleport target "${target}":`, e)
      }
      resolvedTeleportTarget.value = 'body'
      return 'body'
    }
  }

  // SSR fallback: cache the target even without DOM access
  resolvedTeleportTarget.value = target
  return target
})
const ariaRole = computed(() => config.value?.ariaRole || 'menu')


const outerContainerClass = computed(() => {
  if (!config.value) return `absolute z-[${DEFAULT_DROPDOWN_Z_INDEX}] flex flex-col`

  // Dropdown z-index is always 1 above the overlay z-index to ensure proper layering
  // If overlayZIndex is set, use that as base; otherwise use zIndexBase
  // @see DEFAULTS.zIndexBase documentation for z-index range reservation
  const overlayZIndex = config.value.overlayZIndex !== null && config.value.overlayZIndex !== undefined
    ? config.value.overlayZIndex
    : (config.value.zIndexBase || DEFAULT_Z_INDEX_BASE)
  const zIndex = overlayZIndex + 1
  const base = ['absolute', `z-[${zIndex}]`, 'flex', 'flex-col']

  const themeClass = getThemeClasses(config.value.theme)
  if (themeClass) base.push(themeClass)

  // Pure CSS class-based animation system - no inline styles for animations
  // Single mechanism per animation mode: CSS classes handle all animation states
  if (config.value.useTransitionAnimation && config.value.animation === 'slide-up') {
    // Transition-based animation: CSS classes handle all states
    base.push('dropdown-slide-up')
    if (shouldAnimate.value) {
      base.push('dropdown-slide-up-entered')
    } else if (isOpenInternal.value) {
      base.push('dropdown-slide-up-entering')
    }
  } else if (config.value.useTransitionAnimation && config.value.animation === 'slide-down') {
    // Transition-based animation: CSS classes handle all states
    base.push('dropdown-slide-down')
    if (shouldAnimate.value) {
      base.push('dropdown-slide-down-entered')
    } else if (isOpenInternal.value) {
      base.push('dropdown-slide-down-entering')
    }
  } else if (config.value.animation !== 'none') {
    // Keyframe-based animation: CSS classes handle initial state and animation
    if (shouldAnimate.value) {
      // Animation is running - use animation class
      base.push(animationInClass.value)
    } else if (isOpenInternal.value) {
      // Initial state before animation starts - use initial state class
      const initialClass = animationInitialClass.value
      if (initialClass) {
        base.push(initialClass)
      }
    }
  }

  const styleClass = config.value.style?.class || ''

  // Determine if content has max height constraint based on explicit config values
  // 
  // IMPORTANT: This uses explicit config properties, NOT regex parsing of CSS classes.
  // This approach is robust to:
  // - Tailwind class naming changes (max-h-screen, max-h-[500px], etc.)
  // - Custom CSS class names
  // - Switching between Tailwind and custom CSS
  // - Arbitrary values and dynamic class generation
  //
  // Detection sources (in order of precedence):
  // 1. config.maxHeight - explicit maxHeight configuration
  // 2. config.height - if set and not 'auto' (implies height constraint)
  // 3. config.style.inline.maxHeight or config.style.style.maxHeight - inline style maxHeight property
  //
  // Note: config.style.class is NOT parsed for max-height detection.
  // If you need max-height behavior, use one of the explicit config properties above.
  const inlineStyles = config.value.style?.inline || config.value.style?.style
  const hasMaxHeight =
    config.value.maxHeight !== undefined && config.value.maxHeight !== null ||
    (config.value.height !== undefined && config.value.height !== null && config.value.height !== 'auto') ||
    (inlineStyles && (
      inlineStyles.maxHeight !== undefined ||
      inlineStyles['max-height'] !== undefined
    ))

  if (config.value.scrollEnabled || hasMaxHeight) {
    base.push('overflow-hidden')
  }

  if (styleClass) base.push(styleClass)

  return base.join(' ')
})

const contentContainerClass = computed(() => {
  if (!config.value) return 'flex-1 min-h-0 w-full overflow-visible'

  const arr = ['flex-1', 'min-h-0', 'w-full']

  if (config.value.scrollEnabled) {
    arr.push('overflow-auto')
  } else {
    arr.push('overflow-visible')
  }

  if (config.value.hideScrollbars) arr.push('scrollbar-none')

  return arr.join(' ')
})

const overlayClass = computed(() => {
  // Z-index is configurable via config.zIndexBase or config.overlayZIndex
  // Default: 999 (DEFAULT_Z_INDEX_BASE) - see constants above for z-index reservation documentation
  // Use overlayZIndex if explicitly set, otherwise fall back to zIndexBase
  // This allows fine-grained control over overlay z-index to avoid conflicts with other app layers
  // @see DEFAULTS.zIndexBase documentation for z-index range reservation and configuration
  const zIndex = config.value.overlayZIndex !== null && config.value.overlayZIndex !== undefined
    ? config.value.overlayZIndex
    : (config.value.zIndexBase || DEFAULT_Z_INDEX_BASE)
  return ['fixed', 'inset-0', `z-[${zIndex}]`, 'bg-black/50'].join(' ')
})

const loaderContainerClass = computed(() => {
  // Theme-aware loader styling - adapts to dropdown theme to prevent visual clashes
  // 
  // Theme resolution order:
  // 1. config.loader.theme (loader-specific theme override)
  // 2. config.theme (dropdown theme, e.g., 'tooltip-dark', 'tooltip-light')
  // 3. 'generic' (fallback)
  //
  // Dark theme detection: checks if theme name includes 'dark' (e.g., 'tooltip-dark')
  // This ensures dark-themed dropdowns get dark loader overlays, preventing white flash
  const loaderTheme = config.value.loader?.theme || config.value.theme || 'generic'
  const isDark = loaderTheme.includes('dark')

  // Allow custom background via config.loader.background, otherwise use theme-based defaults
  // Theme-based defaults ensure loader matches dropdown appearance:
  // - Dark themes (tooltip-dark, etc.): dark gray overlay
  // - Light themes (tooltip-light, dropdown-panel, generic): white overlay
  let bgClass = config.value.loader?.background
  if (!bgClass) {
    // Theme-based defaults - automatically adapts to dropdown theme
    bgClass = isDark ? 'bg-gray-900 bg-opacity-75' : 'bg-white bg-opacity-75'
  }

  // Allow custom classes via config.loader.containerClass
  const customClass = config.value.loader?.containerClass || ''

  return `absolute inset-0 flex items-center justify-center ${bgClass} z-10 ${customClass}`.trim()
})


// Reactive viewport size for computedContainerStyle
// This ref is updated on window resize events, making computedContainerStyle reactive to viewport changes
// Updated via: handleWindowResize() (when dropdown open) and direct resize listener (always active)
// Initialized with actual viewport size on mount (via updateViewportSize() in onMounted)
const viewportSize = ref(getViewportSize())

function updateViewportSize() {
  // SSR-safe: Guard window/document access
  if (typeof window === 'undefined') return
  
  // Update reactive ref - this triggers recomputation of computedContainerStyle
  // Since computedContainerStyle accesses viewportSize.value.width, it will automatically
  // recompute whenever viewportSize changes, making maxWidth reactive to viewport changes
  viewportSize.value = getViewportSize()
}

const computedContainerStyle = computed(() => {
  if (!config.value) return { '--dh-anim-ms': '120ms' }

  const ms = Number(config.value.animationDurationMs || 120)
  const style = {
    '--dh-anim-ms': `${ms}ms`
  }

  // Apply computed styles first (these can be overridden by inline styles)
  if (isOpenInternal.value && config.value.repositionOnScroll) {
    style['will-change'] = 'top, left'
  }

  // maxWidth calculation is reactive to viewportSize changes
  // viewportSize is updated on window resize, so this computed will automatically recompute
  if (config.value.maxWidth) {
    let maxW = config.value.maxWidth
    if (typeof maxW === 'number') maxW = `${maxW}px`
    // Accessing viewportSize.value.width makes this computed reactive to viewport changes
    style.maxWidth = `min(${maxW}, ${viewportSize.value.width}px)`
  }

  // Pure CSS class-based animation system - NO inline styles for animations
  // All animation states (initial, animating, final) are handled by CSS classes only
  // This ensures a single mechanism per animation mode with no conflicts
  //
  // Animation logic is handled entirely by outerContainerClass:
  // - Transition animations: CSS classes (.dropdown-slide-up-entering, etc.)
  // - Keyframe animations: CSS classes (.animate-*-initial, then .animate-*-in)
  // - No animation: No animation classes
  //
  // Inline styles are ONLY used for non-animation properties:
  // - maxWidth, will-change, and user-provided config.style.inline overrides

  // Merge inline styles from config LAST so they take precedence over computed styles
  // This allows users to override computed styles (e.g., maxWidth) via config.style.inline or config.style.style
  // 
  // IMPORTANT: Do NOT use inline styles for animation properties (opacity, transform, filter, etc.)
  // Animations are handled purely by CSS classes in outerContainerClass to avoid conflicts.
  // If you need to override animation behavior, use CSS classes via config.style.class instead.
  //
  // Structure: config.style = { class: string, inline?: Record<string, string>, style?: Record<string, string> }
  // Note: Both 'inline' and 'style' are supported for inline styles (style is an alias for inline, more intuitive)
  // If both are provided, 'inline' takes precedence (more explicit)
  const inlineStyles = config.value.style?.inline || config.value.style?.style
  if (inlineStyles && typeof inlineStyles === 'object' && !Array.isArray(inlineStyles)) {
    Object.assign(style, inlineStyles)
  }

  return style
})

/**
 * Content container inline styles
 * 
 * Configurable via:
 * - config.style.contentStyle (preferred, consistent with style structure)
 * - config.contentStyle (legacy, for backward compatibility)
 * 
 * Default: { height: '100%', width: '100%' } - fills container
 * Override for custom layouts (e.g., tooltips that shouldn't stretch, fit-content sizing)
 * 
 * @example
 * // Tooltip that sizes to content
 * config.style.contentStyle = { width: 'auto', height: 'auto' }
 * 
 * @example
 * // Fixed width content
 * config.style.contentStyle = { width: '200px', height: 'auto' }
 * 
 * @example
 * // Remove default width/height (use CSS classes instead)
 * config.style.contentStyle = { width: undefined, height: undefined }
 */
const contentStyle = computed(() => {
  if (!config.value) {
    return { height: '100%', width: '100%' }
  }

  const base = {
    height: '100%',
    width: '100%'
  }

  // Allow config overrides for content dimensions
  // Prefer config.style.contentStyle (consistent with style structure)
  // Fall back to config.contentStyle for backward compatibility
  const contentStyleOverride = config.value.style?.contentStyle || config.value.contentStyle

  if (contentStyleOverride && typeof contentStyleOverride === 'object') {
    // Merge override into base, allowing undefined values to remove properties
    const merged = { ...base }
    for (const [key, value] of Object.entries(contentStyleOverride)) {
      if (value === undefined || value === null) {
        // Remove property if explicitly set to undefined/null
        delete merged[key]
      } else {
        merged[key] = value
      }
    }
    return merged
  }

  return base
})

const animationInClass = computed(() => {
  const map = {
    'none': 'animate-none',
    'fade': 'animate-fade-in',
    'scale': 'animate-scale-in',
    'fade-scale': 'animate-fade-scale-in',
    'slide-up': 'animate-slide-up-in',
    'slide-down': 'animate-slide-down-in',
    'slide-in-bottom-mobile': 'animate-slide-in-bottom-mobile',
  }
  return map[config.value.animation] || 'animate-none'
})

const animationInitialClass = computed(() => {
  const map = {
    'none': '',
    'fade': 'animate-fade-initial',
    'scale': 'animate-scale-initial',
    'fade-scale': 'animate-fade-scale-initial',
    'slide-up': 'animate-slide-up-initial',
    'slide-down': 'animate-slide-down-initial',
    'slide-in-bottom-mobile': 'animate-slide-in-bottom-mobile-initial',
  }
  return map[config.value.animation] || ''
})

// requireEl removed - using graceful null checks insteads


// Global scroll lock ref-counting
// This ensures multiple dropdowns can safely use preventBodyScroll without conflicts
// Only the first dropdown saves original values, and only the last one restores them
// If another component (modal, etc.) changes body styles while locked, we detect and handle it
let scrollLockCount = 0
let globalOriginalBodyOverflow = ''
let globalOriginalBodyPaddingRight = ''
let scrollLockOwnerId = null // Track which dropdown instance owns the lock (for debugging/monitoring)
// IMPORTANT: Only the instance that first locked (scrollLockOwnerId) should restore styles
// This prevents conflicts when multiple dropdowns use preventBodyScroll

// Global event listeners ref-counting
// This ensures only one set of global listeners exists across all dropdown instances
// Multiple dropdowns can share the same listeners, reducing overhead
let globalListenerRefCount = 0
let globalListenersAttached = false

// Shared global listener handlers - these are called by the ref-counted system
// Each dropdown instance has its own handlers, but we need shared wrappers
const globalClickHandlers = new Set()
const globalEscapeHandlers = new Set()
const globalScrollHandlers = new Set()
const globalResizeHandlers = new Set()

// Shared event handlers that dispatch to all registered dropdown instances
function sharedDocumentClick(e) {
  // Call all registered click handlers
  for (const handler of globalClickHandlers) {
    try {
      handler(e)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Error in document click handler:', error)
      }
    }
  }
}

function sharedEscapeKey(e) {
  // Call all registered escape handlers
  for (const handler of globalEscapeHandlers) {
    try {
      handler(e)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Error in escape key handler:', error)
      }
    }
  }
}

function sharedWindowScroll(e) {
  // Call all registered scroll handlers
  for (const handler of globalScrollHandlers) {
    try {
      handler(e)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Error in window scroll handler:', error)
      }
    }
  }
}

function sharedWindowResize(e) {
  // Call all registered resize handlers
  for (const handler of globalResizeHandlers) {
    try {
      handler(e)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Error in window resize handler:', error)
      }
    }
  }
}

function preventBodyScroll() {
  if (!config.value.preventBodyScroll) return
  // SSR-safe: Guard all DOM/window access - return early if not in browser
  // This prevents errors in SSR environments, tests, or when window/document are not available
  // Explicitly check both window and document before using any properties
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!isBrowser()) return

  // Additional guard: ensure window.innerWidth and document.documentElement are available
  // Some test environments or edge cases may have window but not innerWidth
  if (typeof window.innerWidth !== 'number' || !document.documentElement) return

  try {
    // Increment ref count - tracks how many dropdowns are using preventBodyScroll
    // This allows multiple dropdowns to safely use preventBodyScroll without conflicts
    const previousCount = scrollLockCount
    scrollLockCount++

    // CRITICAL: Only save original values on FIRST lock (when count goes from 0 to 1)
    // This ensures we capture the original state before any dropdown locks the body
    // Subsequent dropdowns that lock will increment the count but won't overwrite saved values
    if (previousCount === 0) {
      const body = document.body
      if (!body) {
        // If body doesn't exist, decrement count and return
        scrollLockCount = Math.max(0, scrollLockCount - 1)
        return
      }

      // Save original values BEFORE modifying body styles
      // These will be restored only when ALL locks are released (scrollLockCount === 0)
      globalOriginalBodyOverflow = body.style.overflow || ''
      globalOriginalBodyPaddingRight = body.style.paddingRight || ''

      // Track this instance as the lock owner (for debugging/monitoring)
      // Note: The "owner" is the first instance to lock, but restoration happens
      // when the LAST instance unlocks (when scrollLockCount reaches 0)
      scrollLockOwnerId = dropdownId

      // Calculate scrollbar width using guarded window and document properties
      // Both window.innerWidth and document.documentElement.clientWidth are now verified to exist
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      // Apply scroll lock
      body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      // Another dropdown already locked the body (scrollLockCount > 1)
      // Verify the lock is still active - another component (modal, etc.) might have changed styles
      const body = document.body
      if (body && body.style && body.style.overflow !== 'hidden') {
        // Body was unlocked by another component while we were locked
        // This means another component (modal, etc.) is managing body scroll
        // Update our saved values to current state to prevent restoring stale values
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[DropdownHandler] Body scroll was unlocked by another component while dropdown "${dropdownId}" was open. ` +
            `Original values updated to current state to prevent conflicts. ` +
            `This is normal when modals or other components manage body scroll.`
          )
        }
        // Update saved values to current state (so we don't overwrite when restoring)
        // This prevents conflicts with other components that manage body scroll
        globalOriginalBodyOverflow = body.style.overflow || ''
        globalOriginalBodyPaddingRight = body.style.paddingRight || ''
      }
      // Note: We don't re-apply the lock here because another component might be managing it
      // The ref-counting ensures we track how many dropdowns want the lock, but we respect
      // other components that might have changed the body styles
    }

    // Store per-instance values for backwards compatibility
    // These are not used for restoration (global values are used), but kept for compatibility
    originalBodyOverflow.value = globalOriginalBodyOverflow
    originalBodyPaddingRight.value = globalOriginalBodyPaddingRight
  } catch (error) {
    // If locking fails, decrement the count to keep ref-counting accurate
    scrollLockCount = Math.max(0, scrollLockCount - 1)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DropdownHandler] Error preventing body scroll:', error)
    }
  }
}


function restoreBodyScroll() {
  if (!config.value.preventBodyScroll) return
  // SSR-safe: Guard all DOM access - return early if not in browser
  // This prevents errors in SSR environments, tests, or when document is not available
  // Explicitly check both window and document before using any properties
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!isBrowser()) return

  // Additional guard: ensure document.body exists
  // Some test environments may have document but not body element
  if (!document.body) return

  try {
    // Decrement ref count
    scrollLockCount = Math.max(0, scrollLockCount - 1)

    // CRITICAL: Only restore when ALL locks are released (count reaches 0)
    // This ensures that if multiple dropdowns use preventBodyScroll, we only restore
    // when the last one closes, preventing conflicts and overwriting active locks
    if (scrollLockCount === 0) {
      const body = document.body

      // Verify body is still in locked state before restoring
      // If body.style.overflow is not 'hidden', another component (modal, etc.) has changed it
      // In that case, we should not restore our saved values (they're stale and would overwrite the other component's lock)
      if (body && body.style && body.style.overflow === 'hidden') {
        // Body is still locked by us - safe to restore original values
        // Only restore if we have saved original values (defensive check)
        if (globalOriginalBodyOverflow !== undefined || globalOriginalBodyPaddingRight !== undefined) {
          body.style.overflow = globalOriginalBodyOverflow
          body.style.paddingRight = globalOriginalBodyPaddingRight
        }

        // Clear lock owner tracking
        scrollLockOwnerId = null
        globalOriginalBodyOverflow = ''
        globalOriginalBodyPaddingRight = ''
      } else {
        // Another component has changed the body styles - don't restore stale values
        // This prevents overwriting a modal's or other component's scroll lock
        // This is expected behavior when modals or other components manage body scroll
        if (process.env.NODE_ENV !== 'production') {
          const currentOverflow = (body && body.style) ? body.style.overflow : 'unknown'
          console.warn(
            `[DropdownHandler] Body scroll was changed by another component while locked. ` +
            `Not restoring original values to avoid conflicts. ` +
            `Current overflow: "${currentOverflow}". ` +
            `This is normal when modals or other components manage body scroll.`
          )
        }
        // Clear saved values since they're no longer valid
        // Don't restore - let the other component manage the scroll lock
        globalOriginalBodyOverflow = ''
        globalOriginalBodyPaddingRight = ''
        scrollLockOwnerId = null
      }
    } else {
      // scrollLockCount > 0: Other dropdowns still have locks
      // Do NOT restore - let the last dropdown handle restoration
      // This is the key to proper ref-counting: only the last instance restores
      if (process.env.NODE_ENV !== 'production') {
        console.debug(
          `[DropdownHandler] Not restoring body scroll: ${scrollLockCount} dropdown(s) still have locks. ` +
          `This instance will not restore until all locks are released.`
        )
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DropdownHandler] Error restoring body scroll:', error)
    }
  }
}

/**
 * Resolve anchor element from props.anchor
 * 
 * This function NEVER throws - it returns null if anchor cannot be resolved.
 * This ensures the dropdown fails gracefully instead of breaking the component tree.
 * 
 * Supports multiple anchor formats:
 * - HTMLElement directly: props.anchor = <HTMLElement>
 * - Vue component ref: props.anchor = <Component> (accesses .$el)
 * - Vue ref object: props.anchor = ref() (accesses .value)
 * 
 * @returns {HTMLElement|null} The resolved anchor element, or null if not available
 * 
 * @note This function is called in reactive paths and event handlers.
 * It must never throw to prevent breaking the component tree.
 * Callers should check for null and handle gracefully (no-op).
 */
function resolveAnchor() {
  try {
    // Handle null/undefined anchor
    if (!props.anchor) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Anchor prop is null or undefined. Ensure anchor is provided and mounted.')
      }
      return null
    }

    // Try to resolve anchor from various formats
    const a = props.anchor.$el || props.anchor
    const anchorEl = a && (a instanceof HTMLElement ? a : a?.value instanceof HTMLElement ? a.value : null)

    if (!anchorEl) {
      // Anchor prop exists but element is not available (not mounted, wrong type, etc.)
      if (process.env.NODE_ENV !== 'production') {
        const anchorType = typeof props.anchor
        const anchorInfo = props.anchor?.$el ? 'component (no $el)' :
          props.anchor?.value ? `ref (value: ${typeof props.anchor.value})` :
            `type: ${anchorType}`
        console.error(
          `[DropdownHandler] Anchor element not found or not mounted. ` +
          `Anchor prop: ${anchorInfo}. ` +
          `Ensure anchor is a mounted HTMLElement, Vue component ref, or Vue ref object.`
        )
      }
      return null
    }

    return anchorEl
  } catch (e) {
    // Catch any unexpected errors during resolution (property access, etc.)
    // Never throw - return null to allow component to continue functioning
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Unexpected error resolving anchor:', e)
      console.error('[DropdownHandler] Anchor prop value:', props.anchor)
    }
    return null
  }
}


function repositionInternal(reason = 'manual') {
  if (!isOpenInternal.value) return
  // SSR-safe: Guard all DOM/window access - return early if not in browser
  // repositionInternal is only called when dropdown is open (browser context),
  // but guard defensively for safety in SSR/tests
  if (!isBrowser()) return

  // Throttle reposition operations to prevent excessive DOM reads/writes
  // Allow certain reasons to bypass throttle (e.g., initial open, manual calls)
  const bypassThrottle = ['open', 'open-again', 'open-layout', 'manual'].includes(reason)

  const now = Date.now()

  if (!bypassThrottle) {
    const timeSinceLastReposition = now - lastRepositionTime.value

    // Skip if last reposition was too recent (prevents excessive work on rapid events)
    // This is critical for resize/config-change events that can fire rapidly
    if (timeSinceLastReposition < MIN_REPOSITION_INTERVAL_MS) {
      // Schedule retry on next frame if we're throttling
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          if (isOpenInternal.value) {
            repositionInternal(reason)
          }
        })
      }
      return
    }
  }

  // Update timing when we decide to proceed with reposition
  // This ensures throttling works even if position doesn't change
  lastRepositionTime.value = now

  try {
    const anchorEl = resolveAnchor()
    if (!anchorEl) {
      // Missing anchor is a critical error - log as error, not warning
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Cannot reposition: anchor element not available')
      }
      return
    }

    const dd = dropdownRef.value
    if (!dd) {
      // Dropdown element not yet mounted (timing issue with Teleport + ref attachment)
      // This can happen if repositionInternal is called before Vue has finished mounting
      // the teleported element, or during transitions/dynamic anchor changes
      // 
      // Gracefully handle this lifecycle race by scheduling a retry instead of crashing
      // This is NOT a fatal error - just a transient timing issue
      if (process.env.NODE_ENV !== 'production') {
        console.debug(
          `[DropdownHandler] Dropdown element not yet mounted, scheduling retry. ` +
          `Reason: ${reason}. This is normal during initial mount or rapid config changes.`
        )
      }

      // Retry on next frame if element not ready
      // SSR-safe: requestAnimationFrame only exists in browser
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          // Double-check dropdown is still open and element is now available
          if (isOpenInternal.value && dropdownRef.value) {
            repositionInternal(reason)
          } else if (isOpenInternal.value && !dropdownRef.value && process.env.NODE_ENV !== 'production') {
            // Element still not available after retry - log warning but don't crash
            console.warn(
              `[DropdownHandler] Dropdown element still not available after retry. ` +
              `Reason: ${reason}. Dropdown may be in transition or anchor may be unmounting.`
            )
          }
        })
      }
      return
    }

    // Additional safety check: verify element is actually in the DOM
    // This handles edge cases where ref exists but element was removed from DOM
    if (typeof document !== 'undefined' && !document.body.contains(dd)) {
      // Element exists in ref but not in DOM - wait for it to be attached
      if (process.env.NODE_ENV !== 'production') {
        console.debug(
          `[DropdownHandler] Dropdown element not yet in DOM, scheduling retry. ` +
          `Reason: ${reason}.`
        )
      }

      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          if (isOpenInternal.value && dropdownRef.value && document.body.contains(dropdownRef.value)) {
            repositionInternal(reason)
          }
        })
      }
      return
    }

    // ===== PHASE 1: DOM READS =====
    // Read all DOM data needed for layout computation
    const anchorRect = anchorEl.getBoundingClientRect()
    const offset = Number(config.value.offset || 0)

    // Viewport used for positioning; defaults to window viewport but
    // for tooltips we prefer the nearest scrollable ancestor to avoid
    // ignoring ancestor scroll offsets.
    let viewport = getViewportSize()

    // Tooltip-specific normalization to respect scrollable ancestors
    // If anchor is inside a scrollable container, compute tooltip positions
    // relative to that container and then translate back to viewport coords.
    let anchorRectForPosition = anchorRect
    let tooltipOriginOffset = { left: 0, top: 0 }
    if (config.value.tooltipPlacement) {
      const scrollAncestor = getScrollableAncestor(anchorEl)
      if (scrollAncestor && scrollAncestor !== document.body && scrollAncestor !== document.documentElement) {
        const containerRect = scrollAncestor.getBoundingClientRect()
        const scrollLeft = scrollAncestor.scrollLeft || 0
        const scrollTop = scrollAncestor.scrollTop || 0

        // Anchor rect relative to scroll container content box (includes scroll offsets)
        anchorRectForPosition = {
          ...anchorRect,
          left: anchorRect.left - containerRect.left + scrollLeft,
          right: anchorRect.right - containerRect.left + scrollLeft,
          top: anchorRect.top - containerRect.top + scrollTop,
          bottom: anchorRect.bottom - containerRect.top + scrollTop
        }

        // Use container dimensions as the effective viewport for collision/placement
        viewport = {
          width: scrollAncestor.clientWidth,
          height: scrollAncestor.clientHeight
        }

        // Offset back to viewport coordinates after placement calculation
        tooltipOriginOffset = {
          left: containerRect.left - scrollLeft,
          top: containerRect.top - scrollTop
        }
      }
    }

    // Read parent element for width calculations
    let parentElement = null
    let parentRect = null
    if (config.value.widthMode === 'parent' && config.value.widthParentSelector) {
      parentElement = anchorEl.closest(config.value.widthParentSelector)
      if (parentElement) {
        parentRect = parentElement.getBoundingClientRect()
      }
    } else if (config.value.widthMode === 'ancestor' && config.value.widthAncestorSelector) {
      parentElement = (typeof document !== 'undefined') ? document.querySelector(config.value.widthAncestorSelector) : null
      if (parentElement) {
        parentRect = parentElement.getBoundingClientRect()
      }
    }

    // Calculate dropdown width and height (DOM reads)
    const ddWidth = resolveWidth(config.value, anchorEl, viewport.width)
    const computedHeight = resolveHeight(config.value.height, anchorEl, offset, viewport.height)

    // Apply initial width/height to DOM (needed to measure actual height)
    dd.style.width = `${ddWidth}px`
    if (computedHeight) {
      dd.style.height = computedHeight
      dd.style.maxHeight = computedHeight
    } else {
      dd.style.height = ''
      dd.style.maxHeight = ''
      dd.style.minHeight = '0'
    }

    // Force reflow to get accurate height measurement
    void dd.offsetHeight

    // Read actual dropdown height from DOM
    let ddHeight = dd.offsetHeight || 0
    if (ddHeight === 0 && computedHeight) {
      const heightMatch = computedHeight.match(/(\d+(?:\.\d+)?)px/)
      if (heightMatch) {
        ddHeight = parseFloat(heightMatch[1])
      } else if (computedHeight.includes('vh')) {
        const vhMatch = computedHeight.match(/(\d+(?:\.\d+)?)vh/)
        if (vhMatch) {
          ddHeight = (viewport.height * parseFloat(vhMatch[1])) / 100
        }
      }
    }
    if (ddHeight === 0) {
      ddHeight = Math.min(300, viewport.height * 0.4)
    }

    // Mobile detection (for snapEdge)
    const mobile = isMobile(config.value.mobileBreakpoint)

    // ===== PHASE 2: PURE LAYOUT COMPUTATION =====
    // Use pure function to compute layout - no DOM access, fully testable
    const layout = computeDropdownLayout(
      anchorRectForPosition,
      { width: ddWidth, height: ddHeight },
      viewport,
      config.value,
      {
        tooltipOriginOffset,
        parentRect,
        mobile
      }
    )

    // Extract layout results
    let { top, left, maxWidth, maxHeight, alignmentUsed, flipped, placement: finalPlacement, collision, snappedEdge } = layout

    // ===== PHASE 3: HANDLE '100%' HEIGHT RECALCULATION =====
    // For '100%' height, we need to recalculate after placement is determined
    // This requires DOM access, so it's done here in the component
    if (config.value.height === '100%' && !config.value.tooltipPlacement) {
      const placementHeight = resolveHeight(
        config.value.height,
        anchorEl,
        offset,
        viewport.height,
        { flipped, anchorRect, top }
      )
      if (placementHeight) {
        // Update height and recalculate layout if height changed significantly
        const heightMatch = placementHeight.match(/(\d+(?:\.\d+)?)px/)
        if (heightMatch) {
          const newHeight = parseFloat(heightMatch[1])
          if (Math.abs(newHeight - ddHeight) > 1) {
            // Height changed - recalculate layout with new height
            ddHeight = newHeight
            const updatedLayout = computeDropdownLayout(
              anchorRectForPosition,
              { width: ddWidth, height: ddHeight },
              viewport,
              config.value,
              {
                tooltipOriginOffset,
                parentRect,
                mobile
              }
            )
            top = updatedLayout.top
            left = updatedLayout.left
            finalPlacement = updatedLayout.placement
            flipped = updatedLayout.flipped
            collision = updatedLayout.collision
          }
          maxHeight = placementHeight
        }
      }
    }

    // ===== PHASE 4: DOM WRITES =====
    // Convert viewport coordinates to document coordinates for absolute positioning
    const scrollX = (typeof window !== 'undefined' ? (window.scrollX || window.pageXOffset) : 0) || (typeof document !== 'undefined' ? document.documentElement.scrollLeft : 0) || 0
    const scrollY = (typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset) : 0) || (typeof document !== 'undefined' ? document.documentElement.scrollTop : 0) || 0

    const roundedLeft = Math.round(left + scrollX)
    const roundedTop = Math.round(top + scrollY)

    // Defensive check: verify element is still valid before final DOM writes
    // This handles edge cases where element might be removed during reposition
    // (e.g., rapid config changes, component unmounting, etc.)
    if (!dd || (typeof document !== 'undefined' && !document.body.contains(dd))) {
      // Element was removed during reposition - this is a transient timing issue
      // Schedule retry if dropdown is still open
      if (isOpenInternal.value && typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          if (isOpenInternal.value && dropdownRef.value) {
            repositionInternal(reason)
          }
        })
      }
      return
    }

    // Micro-optimization: Check if layout actually changed before writing to DOM
    // This prevents unnecessary style writes and layout reflows on resize/scroll storms
    // Compare position (left/top) and size constraints (maxWidth/maxHeight)
    const lastPos = lastDropdownPosition.value
    const positionChanged = lastPos.left === null || lastPos.top === null ||
      Math.abs(lastPos.left - roundedLeft) >= 2 ||
      Math.abs(lastPos.top - roundedTop) >= 2
    
    const maxWidthChanged = lastPos.maxWidth !== maxWidth
    const maxHeightChanged = lastPos.maxHeight !== maxHeight
    const layoutChanged = positionChanged || maxWidthChanged || maxHeightChanged

    // Only write to DOM if layout actually changed
    if (layoutChanged) {
      // Write position if changed
      if (positionChanged) {
        dd.style.left = `${roundedLeft}px`
        dd.style.top = `${roundedTop}px`
      }
      
      // Write maxWidth if changed
      if (maxWidthChanged) {
        if (maxWidth) {
          dd.style.maxWidth = maxWidth
        } else {
          // Remove maxWidth if it was set but is now null
          dd.style.maxWidth = ''
        }
      }
      
      // Write maxHeight if changed (only for '100%' height mode)
      if (maxHeightChanged && config.value.height === '100%') {
        if (maxHeight) {
          dd.style.maxHeight = maxHeight
        } else {
          // Remove maxHeight if it was set but is now null
          dd.style.maxHeight = ''
        }
      }
      
      // Update cache with new values
      lastDropdownPosition.value = { 
        left: roundedLeft, 
        top: roundedTop, 
        maxWidth: maxWidth || null, 
        maxHeight: maxHeight || null 
      }
      // Note: lastRepositionTime already updated at function start for throttling
    }

    dd.dataset.placement = finalPlacement

    if (dd.offsetHeight === 0 && reason === 'open') {
      requestAnimationFrame(() => {
        if (isOpenInternal.value && dropdownRef.value) {
          repositionInternal('open-layout')
        }
      })
    }

    lastPlacement.value = { flipped, snappedEdge, align: alignmentUsed, placement: finalPlacement }

    if (collision.horizontal || collision.vertical || snappedEdge) {
      const collisionPayload = {
        ...payload('collided'),
        horizontal: collision.horizontal,
        vertical: collision.vertical,
        snapped: !!snappedEdge,
        finalPlacement: lastPlacement.value
      }
      lastCollision.value = collisionPayload
      emit('collided', collisionPayload)
      dispatchDomEvent('collided', collisionPayload)
    }

    emit('repositioned', { flipped, snappedEdge, align: alignmentUsed, placement: finalPlacement, reason })
    dispatchDomEvent('repositioned', { flipped, snappedEdge, align: config.value.align, placement: finalPlacement, reason })
  } catch (error) {
    // Soft failure - handle errors gracefully without crashing
    // Most errors here are transient timing issues (element not mounted, removed during reposition, etc.)
    // NOT fatal configuration errors - those should be caught by validateConfig

    const errorMessage = error?.message || String(error)
    const isTimingError = errorMessage.includes('not found') ||
      errorMessage.includes('null') ||
      errorMessage.includes('undefined') ||
      !dropdownRef.value ||
      (typeof document !== 'undefined' && dropdownRef.value && !document.body.contains(dropdownRef.value))

    if (isTimingError) {
      // Transient timing issue - element not ready or removed during reposition
      // Schedule retry instead of closing dropdown
      if (process.env.NODE_ENV !== 'production') {
        console.debug(
          `[DropdownHandler] Transient error during reposition (timing issue), scheduling retry. ` +
          `Reason: ${reason}, Error: ${errorMessage}`
        )
      }

      if (isOpenInternal.value && typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          if (isOpenInternal.value && dropdownRef.value) {
            repositionInternal(reason)
          }
        })
      }
    } else {
      // Unexpected error - fail softly by closing this dropdown instead of breaking parent tree
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Error during reposition, closing dropdown softly:', error)
      }

      isTransitioning.value = false
      isOpenInternal.value = false
      lastCloseReason.value = CLOSE_REASONS.ERROR

      try {
        restoreBodyScroll()
      } catch (e) { }
      try {
        removeGlobalListeners()
      } catch (e) { }
      try {
        __stackUnregister(dropdownId)
      } catch (e) { }

      try {
        const closePayload = payload('close', { origin: CLOSE_REASONS.ERROR, reason: CLOSE_REASONS.ERROR })
        emit('close', closePayload)
        dispatchDomEvent('close', closePayload)
      } catch (e) { }
    }
  }
}

function open(mode = config.value.trigger) {
  try {
    // Disabled: never open (from any origin, including public API)
    if (config.value.disabled) {
      return false
    }

    // Guard against rapid open/close spam: prevent overlapping animations
    // If already transitioning, ignore new open requests (unless already open, then just reposition)
    if (isTransitioning.value) {
      if (isOpenInternal.value) {
        // Already open and transitioning - just reposition if needed
        nextTick(() => repositionInternal('open-again'))
        return true
      }
      // Transitioning to closed - ignore new open request to prevent spam
      return false
    }

    if (isOpenInternal.value) {
      nextTick(() => repositionInternal('open-again'))
      return true
    }

    // Cache anchor element on open
    cachedAnchorEl = resolveAnchor()
    if (!cachedAnchorEl) {
      // Missing anchor is a critical error - log as error, not warning
      if (process.env.NODE_ENV !== 'production') {
        console.error('[DropdownHandler] Cannot open: anchor element not available')
      }
      return false
    }

    // Set transitioning flag to prevent rapid open/close spam
    isTransitioning.value = true
    shouldAnimate.value = false
    isOpenInternal.value = true
    openMode.value = mode

    lastDropdownPosition.value = { left: null, top: null, maxWidth: null, maxHeight: null }
    lastRepositionTime.value = 0

    __stackRegister(dropdownId, exposedApi, config.value.layer, config.value.group)

    if (typeof window !== 'undefined') {
      lastWindowScrollY.value = window.scrollY || window.pageYOffset || (typeof document !== 'undefined' ? document.documentElement.scrollTop : 0)
      lastWindowScrollX.value = window.scrollX || window.pageXOffset || (typeof document !== 'undefined' ? document.documentElement.scrollLeft : 0)
    }

    preventBodyScroll()

    addGlobalListeners()

    nextTick(() => {
      try {
        repositionInternal('open')
      } catch (error) {
        // Error boundary: repositionInternal has its own try-catch, but catch here as extra safety
        // If repositionInternal's error handling fails, this prevents breaking the parent tree
        if (process.env.NODE_ENV !== 'production') {
          console.error('[DropdownHandler] Error in repositionInternal during open:', error)
        }
        // repositionInternal should have already handled the error, but ensure state is clean
        isTransitioning.value = false
        isOpenInternal.value = false
        return
      }

      nextTick(() => {
        try {
          setupContentScrollPrevention()

          if (config.value.useTransitionAnimation && config.value.animation === 'slide-up') {
              const dd = dropdownRef.value
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  try {
                    if (dd) {
                      void dd.offsetHeight
                      shouldAnimate.value = true
                      nextTick(() => {
                        if (dd) void dd.offsetHeight
                      })
                    }
                    applyAnimation(true, () => {
                      // Clear transitioning flag when open animation completes
                      isTransitioning.value = false
                    })
                  } catch (error) {
                    // Error boundary: catch errors in animation setup
                    if (process.env.NODE_ENV !== 'production') {
                      console.error('[DropdownHandler] Error in slide-up animation setup:', error)
                    }
                    isTransitioning.value = false
                  }
                })
              })
            } else if (config.value.useTransitionAnimation && config.value.animation === 'slide-down') {
              const dd = dropdownRef.value
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  try {
                    if (dd) {
                      void dd.offsetHeight
                      shouldAnimate.value = true
                      nextTick(() => {
                        if (dd) void dd.offsetHeight
                      })
                    }
                    applyAnimation(true, () => {
                      // Clear transitioning flag when open animation completes
                      isTransitioning.value = false
                    })
                  } catch (error) {
                    // Error boundary: catch errors in animation setup
                    if (process.env.NODE_ENV !== 'production') {
                      console.error('[DropdownHandler] Error in slide-down animation setup:', error)
                    }
                    isTransitioning.value = false
                  }
                })
              })
            } else if (config.value.animation !== 'none') {
              // Keyframe-based animation: Remove initial state class, add animation class
              const dd = dropdownRef.value
              const animClass = animationInClass.value
              const initialClass = animationInitialClass.value

              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  try {
                    if (dd && animClass && animClass !== 'animate-none') {
                      // Remove initial state class (if present)
                      if (initialClass) {
                        dd.classList.remove(initialClass)
                      }
                      // Add animation class - CSS handles the transition
                      dd.classList.add(animClass)
                      void dd.offsetHeight
                    }
                    applyAnimation(true, () => {
                      // Clear transitioning flag when open animation completes
                      isTransitioning.value = false
                    })
                  } catch (error) {
                    // Error boundary: catch errors in animation setup
                    if (process.env.NODE_ENV !== 'production') {
                      console.error('[DropdownHandler] Error in keyframe animation setup:', error)
                    }
                    isTransitioning.value = false
                  }
                })
              })
            } else {
              // No animation: element appears immediately
              try {
                applyAnimation(true, () => {
                  // Clear transitioning flag immediately for no-animation case
                  isTransitioning.value = false
                })
              } catch (error) {
                // Error boundary: catch errors in animation
                if (process.env.NODE_ENV !== 'production') {
                  console.error('[DropdownHandler] Error in no-animation setup:', error)
                }
                isTransitioning.value = false
              }
            }
        } catch (error) {
          // Error boundary: catch errors in animation setup, content scroll prevention, or nextTick callback
          if (process.env.NODE_ENV !== 'production') {
            console.error('[DropdownHandler] Error in animation setup or content scroll prevention:', error)
          }
          isTransitioning.value = false
          // Only close dropdown if error is severe (not just timing issues)
          // Most errors here are transient and shouldn't close the dropdown
        }
      })
    })

    emit('open', payload('open'))
    dispatchDomEvent('open', payload('open'))
    return true
  } catch (error) {
    // Soft failure on open - clear transitioning flag on error
    isTransitioning.value = false
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Error during open:', error)
    }
    isOpenInternal.value = false
    return false
  }
}

let contentScrollHandler = null

function setupContentScrollPrevention() {
  try {
    if (contentScrollHandler && contentScrollRef.value) {
      contentScrollRef.value.removeEventListener('scroll', contentScrollHandler)
    }

    const contentScroll = contentScrollRef.value
    if (contentScroll && config.value.scrollEnabled) {
      contentScrollHandler = (e) => {
        e.stopPropagation()
      }
      contentScroll.addEventListener('scroll', contentScrollHandler, { passive: true, capture: false })
    } else {
      contentScrollHandler = null
    }
  } catch (error) {
    // Soft failure - log error but don't break dropdown
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DropdownHandler] Error setting up content scroll prevention:', error)
    }
    // Clear handler on error to prevent leaks
    contentScrollHandler = null
  }
}

function close(origin = 'manual', force = false) {
  try {
    if (!isOpenInternal.value) return false
    if (config.value.forceKeepOpen && !force) return false

    // Guard against rapid open/close spam: prevent overlapping animations
    // If already transitioning, ignore new close requests (unless forced)
    if (isTransitioning.value && !force) {
      return false
    }

    // Clear click/focus open timer to prevent opening after close
    if (clickFocusOpenTimer.value) {
      clearTimeout(clickFocusOpenTimer.value)
      clickFocusOpenTimer.value = null
    }

    // Clear cached anchor on close
    cachedAnchorEl = null

    // Set transitioning flag to prevent rapid open/close spam
    isTransitioning.value = true

    // For v-if: we need to keep element mounted during exit animations
    // Check if we have an exit animation that needs the element to stay in DOM
    const hasExitAnimation = config.value.animation !== 'none' && config.value.animationDurationMs > 0

    if (contentScrollHandler && contentScrollRef.value) {
      contentScrollRef.value.removeEventListener('scroll', contentScrollHandler)
      contentScrollHandler = null
    }

    // Helper function to complete the close (unmount element and cleanup)
    const completeClose = () => {
      // Clear transitioning flag when close completes
      isTransitioning.value = false

      // Store close reason for consumer access
      lastCloseReason.value = origin

      isOpenInternal.value = false
      restoreBodyScroll()
      removeGlobalListeners()
      __stackUnregister(dropdownId)

      // Emit close event with reason (origin) for consumer logic
      // The reason allows consumers to react differently based on how dropdown closed
      // (e.g., analytics, form reset, different behaviors for esc vs click-outside)
      const closePayload = payload('close', { origin, reason: origin })
      emit('close', closePayload)
      dispatchDomEvent('close', closePayload)
    }

    // Handle transition-based animations using centralized animation handler
    // This centralizes all class toggling and transition watching in one place
    if (config.value.useTransitionAnimation && (config.value.animation === 'slide-up' || config.value.animation === 'slide-down')) {
      const dd = dropdownRef.value
      if (dd) {
        shouldAnimate.value = false

        // Use centralized slide exit animation handler
        // This handles: class toggling + transition watching + cleanup in one place
        const fallbackDurationMs = Number(config.value.animationDurationMs || 120)
        handleSlideExitAnimation(dd, config.value.animation, fallbackDurationMs, () => {
          // completeClose() will clear isTransitioning.value
          completeClose()
        })
      } else {
        // If no element, just perform standard close cleanup
        shouldAnimate.value = false
        completeClose()
      }
    } else if (hasExitAnimation) {
      // For other exit animations, keep element mounted during animation
      shouldAnimate.value = false
      applyAnimation(false, () => {
        completeClose()
      })
    } else {
      // No exit animation, can unmount immediately
      shouldAnimate.value = false
      completeClose()
    }

    return true
  } catch (error) {
    // Soft failure on close - ensure dropdown does not break the parent tree
    isTransitioning.value = false
    isOpenInternal.value = false
    lastCloseReason.value = CLOSE_REASONS.ERROR

    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Error during close:', error)
    }

    // Best-effort cleanup; ignore errors from these paths
    try {
      restoreBodyScroll()
    } catch (e) { }
    try {
      removeGlobalListeners()
    } catch (e) { }
    try {
      __stackUnregister(dropdownId)
    } catch (e) { }

    // Emit a soft-error close event so consumers can react if needed
    try {
      const closePayload = payload('close', { origin: CLOSE_REASONS.ERROR, reason: CLOSE_REASONS.ERROR })
      emit('close', closePayload)
      dispatchDomEvent('close', closePayload)
    } catch (e) { }

    return false
  }
}

function toggle(origin = 'toggle') {
  // Disabled: ignore toggle attempts (both internal and public)
  if (config.value.disabled) {
    return false
  }

  const wasOpen = isOpenInternal.value
  const willOpen = !wasOpen

  const result = willOpen ? open(origin) : close(origin, true)

  const togglePayload = {
    ...payload('toggle'),
    direction: willOpen ? 'open' : 'close',
    result
  }
  emit('toggle', togglePayload)
  dispatchDomEvent('toggle', togglePayload)

  return result
}

function reposition(reason = 'public') {
  if (!isOpenInternal.value) {
    return false
  }

  if (!dropdownRef.value) {
    return false
  }

  nextTick(() => {
    if (isOpenInternal.value && dropdownRef.value) {
      repositionInternal(reason)
    }
  })

  return true
}

function isOpen() {
  return !!isOpenInternal.value
}

function publicClose(origin = 'manual') {
  return close(origin, true)
}

// Timing safeguards for loader to prevent flicker
// These safeguards prevent visual flicker when loading is toggled rapidly (e.g., double-click actions)
// and ensure the loader is visible long enough to be perceived by users
let loadingShowTimeout = null
let loadingHideTimeout = null
let loadingStartTime = null
const LOADER_SHOW_DELAY = 100 // Delay before showing loader (prevents flicker on fast operations)
const LOADER_MIN_DURATION = 200 // Minimum time loader is visible once shown (ensures visibility)

/**
 * Set loading state with timing safeguards to prevent flicker
 * 
 * This function implements two timing safeguards:
 * 1. Debounced appearance: Loader only shows if loading persists for LOADER_SHOW_DELAY ms
 *    - Prevents flicker on rapid on/off toggles (e.g., double-click actions)
 *    - Fast operations (< 100ms) won't show loader at all
 * 2. Minimum visible duration: Loader stays visible for at least LOADER_MIN_DURATION ms
 *    - Ensures loader is visible long enough to be perceived
 *    - Prevents jarring flash appearance/disappearance
 * 
 * @param {boolean} loading - Whether to show or hide the loader
 */
function setLoading(loading) {
  // Clear any pending timeouts to prevent race conditions
  if (loadingShowTimeout) {
    clearTimeout(loadingShowTimeout)
    loadingShowTimeout = null
  }
  if (loadingHideTimeout) {
    clearTimeout(loadingHideTimeout)
    loadingHideTimeout = null
  }

  if (loading) {
    // Debounce showing loader - only show if loading persists for LOADER_SHOW_DELAY ms
    // This prevents flicker on rapid on/off toggles (e.g., double-click actions)
    // Fast operations (< LOADER_SHOW_DELAY) won't trigger loader at all
    loadingShowTimeout = setTimeout(() => {
      // Only show if loadingStartTime is still set (hasn't been cancelled by setLoading(false))
      if (loadingStartTime !== null) {
        isLoading.value = true
        // Track when loader actually became visible (for minimum duration calculation)
        loadingStartTime = Date.now()
      }
      loadingShowTimeout = null
    }, LOADER_SHOW_DELAY)

    // Track that loading was requested (used to verify timeout callback is still valid)
    // Use timestamp as marker - if setLoading(false) is called before timeout, this will be null
    if (loadingStartTime === null) {
      loadingStartTime = 0 // Use 0 as marker that loading was requested but not yet visible
    }
  } else {
    // Cancel any pending show timeout (loading was cancelled before debounce completed)
    // If loader never appeared, we don't need to enforce minimum duration
    if (loadingShowTimeout) {
      loadingStartTime = null
      return // Don't proceed with hide logic since loader never appeared
    }

    // Hide loader with minimum visible duration safeguard
    // This ensures loader stays visible long enough to be perceived, preventing jarring flash
    if (isLoading.value && loadingStartTime && loadingStartTime > 0) {
      // Calculate how long loader has been visible
      const visibleDuration = Date.now() - loadingStartTime
      const remainingTime = Math.max(0, LOADER_MIN_DURATION - visibleDuration)

      // Hide after remaining minimum duration (or immediately if already shown long enough)
      loadingHideTimeout = setTimeout(() => {
        isLoading.value = false
        loadingStartTime = null
        loadingHideTimeout = null
      }, remainingTime)
    } else {
      // Loader wasn't shown yet or already hidden, just reset state
      isLoading.value = false
      loadingStartTime = null
    }
  }
}

// Exposed API - inline const (no lazy initialization or caching needed)
// In <script setup>, this runs per component instance anyway, so lazy initialization
// doesn't provide any benefit. Using inline const is simpler and clearer.
// This object is created fresh for each component instance.
const exposedApi = {
  open,
  close: publicClose,
  toggle,
  reposition,
  isOpen,
  setLoading,
  // Expose last close reason for consumer logic
  // Allows consumers to react differently based on how dropdown closed
  // (e.g., analytics, form reset, different behaviors for esc vs click-outside)
  get lastCloseReason() {
    return lastCloseReason.value
  }
}

function payload(type, extra = {}) {
  // SSR-safe: resolveAnchor and getBoundingClientRect are only called from event handlers
  // (which only fire in browser), but guard defensively for safety
  const anchorEl = (() => {
    if (typeof document === 'undefined') return null
    try { return resolveAnchor() } catch { return null }
  })()
  const rect = anchorEl ? (() => {
    try { return anchorEl.getBoundingClientRect() } catch { return null }
  })() : null

  return {
    type,
    id: dropdownId,
    timestamp: Date.now(),
    trigger: config.value.trigger,
    layer: config.value.layer,
    group: config.value.group,
    placement: lastPlacement.value,
    anchorRect: rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null,
    collision: lastCollision.value,
    ...extra,
  }
}

/**
* Dispatch a DOM CustomEvent on the document
* 
* This function is SSR-safe and will silently no-op in non-browser environments.
* It's called from reactive paths and event handlers, so it must never throw.
* 
* @param {string} name - Event name (will be prefixed with 'DropdownHandler:')
* @param {object} detail - Event detail payload
* 
* @note This function never throws - it gracefully fails in SSR/tests/non-DOM contexts.
* Events are only dispatched in browser environments where document is available.
*/
function dispatchDomEvent(name, detail) {
  // SSR-safe: Guard document access to prevent errors in non-browser environments
  // This allows the component to work in SSR, tests, and Node.js contexts
  // Check document existence first before accessing any properties
  if (typeof document === 'undefined') return
  
  // Check that dispatchEvent method exists and is callable
  // Some environments may have document but not support CustomEvent/dispatchEvent
  if (typeof document.dispatchEvent !== 'function') return

  try {
    document.dispatchEvent(new CustomEvent(`DropdownHandler:${name}`, { detail }))
  } catch (error) {
    // Catch any unexpected errors (e.g., if CustomEvent is not supported)
    // Never throw - silently fail to prevent breaking reactive paths
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[DropdownHandler] Failed to dispatch DOM event "${name}":`, error)
    }
  }
}

/**
 * Compute the effective CSS transition duration (including delays) for an element.
 * 
 * This function reads the element's computed style and derives the maximum total
 * transition time across all transitioned properties. It falls back to the
 * provided durationMs when CSS information is unavailable or invalid.
 * 
 * @param {HTMLElement} element - Target element
 * @param {number} durationMs - Fallback duration in milliseconds
 * @returns {number} Effective duration in milliseconds
 */
function getTransitionDurationMs(element, durationMs) {
  const fallback = Number(durationMs) || 0

  // SSR / safety guards
  if (!element || typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return fallback
  }

  try {
    const style = window.getComputedStyle(element)
    if (!style) return fallback

    const parseTime = (value) => {
      if (!value) return 0
      const trimmed = String(value).trim()
      if (trimmed.endsWith('ms')) {
        const n = Number(trimmed.slice(0, -2))
        return Number.isFinite(n) ? n : 0
      }
      if (trimmed.endsWith('s')) {
        const n = Number(trimmed.slice(0, -1))
        return Number.isFinite(n) ? n * 1000 : 0
      }
      const n = Number(trimmed)
      return Number.isFinite(n) ? n : 0
    }

    const rawDurations = (style.transitionDuration || '').split(',')
    const rawDelays = (style.transitionDelay || '').split(',')

    let maxTotal = 0
    const len = Math.max(rawDurations.length, rawDelays.length)

    for (let i = 0; i < len; i++) {
      const dur = parseTime(rawDurations[i] || rawDurations[0] || '')
      const delay = parseTime(rawDelays[i] || rawDelays[0] || '')
      const total = dur + delay
      if (total > maxTotal) {
        maxTotal = total
      }
    }

    // Use CSS-derived value when it is sensible; otherwise fallback
    if (maxTotal > 0) {
      return maxTotal
    }
    return fallback
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DropdownHandler] Failed to read CSS transition duration, falling back to configured duration:', error)
    }
    return fallback
  }
}

/**
 * Centralized slide animation exit handler
 * 
 * Handles the complete "start exit animation + watch for completion" pattern for slide-up/slide-down.
 * This centralizes all class toggling and transition watching in one place, eliminating
 * fragile manual transitionend juggling and class management scattered throughout the component.
 * 
 * @param {HTMLElement} element - The dropdown element
 * @param {string} animation - Animation type ('slide-up' or 'slide-down')
 * @param {number} durationMs - Expected transition duration in milliseconds (fallback)
 * @param {Function} onComplete - Callback when transition completes
 * @returns {Function} Cleanup function to cancel the animation watcher
 */
function handleSlideExitAnimation(element, animation, durationMs, onComplete) {
  if (!element || !onComplete) {
    // If element not available, call callback immediately
    if (typeof onComplete === 'function') {
      setTimeout(() => onComplete(), durationMs || 0)
    }
    return () => { } // Return no-op cleanup
  }

  // Centralized class management - all class toggling happens here
  const enterClass = animation === 'slide-up' ? 'dropdown-slide-up-entered' : 'dropdown-slide-down-entered'
  const exitClass = animation === 'slide-up' ? 'dropdown-slide-up-exiting' : 'dropdown-slide-down-exiting'
  const allClasses = animation === 'slide-up'
    ? ['dropdown-slide-up-exiting', 'dropdown-slide-up-entering', 'dropdown-slide-up-entered']
    : ['dropdown-slide-down-exiting', 'dropdown-slide-down-entering', 'dropdown-slide-down-entered']

  // Start exit animation by toggling classes
  element.classList.remove(enterClass)
  element.classList.add(exitClass)

  // Watch for transition completion using centralized helper
  return watchTransition(element, durationMs, () => {
    // Cleanup all animation classes after transition completes
    element.classList.remove(...allClasses)
    // Call completion callback
    if (typeof onComplete === 'function') {
      onComplete()
    }
  })
}

/**
 * Centralized CSS transition watcher helper
 * 
 * Handles the "transitionend + timeout fallback" pattern in a robust, reusable way.
 * This eliminates fragile transitionend juggling throughout the component.
 * 
 * @param {HTMLElement} element - The element to watch for CSS transitions
 * @param {number} durationMs - Expected transition duration in milliseconds (fallback)
 * @param {Function} onComplete - Callback when transition completes
 * @returns {Function} Cleanup function to cancel the watcher
 */
function watchTransition(element, durationMs, onComplete) {
  if (!element || !onComplete) {
    // If element not available, call callback immediately
    if (typeof onComplete === 'function') {
      setTimeout(() => onComplete(), durationMs || 0)
    }
    return () => { } // Return no-op cleanup
  }

  let completed = false
  let timeoutId = null

  const complete = () => {
    if (completed) return
    completed = true

    // Cleanup timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    // Call callback
    if (typeof onComplete === 'function') {
      onComplete()
    }
  }

  const onTransitionEnd = (e) => {
    // Only handle transitions on the target element itself (not children)
    // This prevents child element transitions from triggering completion
    if (e.target !== element) return

    // Accept any transition property - robust to CSS changes
    // Don't check propertyName because CSS might transition multiple properties
    complete()
  }

  // Listen for transitionend with once: true for automatic cleanup
  element.addEventListener('transitionend', onTransitionEnd, { once: true })

  // Set timeout as fallback (use slightly longer than expected to avoid race conditions)
  // Handles cases where:
  // - Element is hidden/removed before transition completes
  // - CSS transition is disabled/changed
  // - transitionend doesn't fire for any reason
  const effectiveDuration = getTransitionDurationMs(element, durationMs)
  const timeoutDuration = effectiveDuration + 50 // Add 50ms buffer for safety
  timeoutId = setTimeout(() => {
    if (process.env.NODE_ENV !== 'production' && dropdownRef.value === element) {
      console.warn('[DropdownHandler] Transition timeout fallback triggered - transitionend did not fire within expected time')
    }
    complete()
  }, timeoutDuration)

  // Return cleanup function
  return () => {
    if (completed) return

    completed = true

    // Remove event listener
    if (element && element.parentNode) {
      try {
        element.removeEventListener('transitionend', onTransitionEnd)
      } catch (e) {
        // Ignore errors if element was removed
      }
    }

    // Clear timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
}

/**
 * Animation timing helper - simplified wrapper around watchTransition
 * 
 * @param {boolean} opening - Whether this is an opening animation (unused, kept for API compatibility)
 * @param {Function} doneCb - Callback when animation completes
 */
function applyAnimation(opening, doneCb) {
  const ms = Number(config.value.animationDurationMs || 120)
  if (config.value.animation === 'none' || ms === 0) {
    if (typeof doneCb === 'function') doneCb()
    return
  }

  // For transition-based animations, use centralized transition watcher
  const useTransition = config.value.useTransitionAnimation &&
    (config.value.animation === 'slide-up' || config.value.animation === 'slide-down')

  if (useTransition) {
    const dd = dropdownRef.value
    watchTransition(dd, ms, doneCb)
  } else {
    // For non-transition animations (keyframes), use timeout only
    setTimeout(() => {
      if (typeof doneCb === 'function') doneCb()
    }, ms)
  }
}

function addGlobalListeners() {
  // SSR-safe: Guard all DOM/window access - return early if not in browser
  if (!isBrowser()) return

  // Controlled mode: skip ALL automatic global listeners
  // In controlledMode, the consumer is responsible for closing/repositioning
  // the dropdown (e.g., on outside click, Escape key, scroll).
  if (config.value.controlledMode) return

  // Increment ref count
  globalListenerRefCount++

  // Register this instance's handlers
  const needsClickListeners = config.value.trigger === 'click' || config.value.trigger === 'focus'
  const needsScrollListeners = config.value.closeOnScroll || config.value.repositionOnScroll

  if (needsClickListeners) {
    globalClickHandlers.add(handleDocumentClick)
    globalEscapeHandlers.add(handleEscapeKey)
  }

  if (needsScrollListeners) {
    globalScrollHandlers.add(handleWindowScroll)
  }

  globalResizeHandlers.add(handleWindowResize)

  // Attach shared listeners only once (when first dropdown opens)
  // The shared listeners dispatch to all registered handlers in the Sets
  // This ensures only one listener per event type exists across all dropdown instances
  if (!globalListenersAttached) {
    // Attach click/keydown listeners if any dropdown needs them
    // IMPORTANT: Use bubbling phase (capture: false) instead of capture phase
    // This ensures dropdown click handling runs AFTER app-level handlers, allowing
    // app code to react to clicks first (e.g., updating state, preventing default, etc.)
    // before the dropdown decides whether to close. This prevents surprising behavior
    // where dropdowns close/open before the app has a chance to handle the click.
    // Only use capture phase if you have a specific bug it solves, and document it clearly.
    if (globalClickHandlers.size > 0 || globalEscapeHandlers.size > 0) {
      document.addEventListener('click', sharedDocumentClick, { capture: false })
      document.addEventListener('keydown', sharedEscapeKey)
    }

    // Attach scroll listener if any dropdown needs it
    if (globalScrollHandlers.size > 0) {
      window.addEventListener('scroll', sharedWindowScroll, { capture: false, passive: true })
    }

    // Attach resize listener (always needed when any dropdown is open)
    if (globalResizeHandlers.size > 0) {
      window.addEventListener('resize', sharedWindowResize, { passive: true })
    }

    globalListenersAttached = true
  }
}

function removeGlobalListeners() {
  // SSR-safe: Guard all DOM/window access - return early if not in browser
  if (!isBrowser()) return

  // Decrement ref count
  globalListenerRefCount = Math.max(0, globalListenerRefCount - 1)

  // Unregister this instance's handlers
  globalClickHandlers.delete(handleDocumentClick)
  globalEscapeHandlers.delete(handleEscapeKey)
  globalScrollHandlers.delete(handleWindowScroll)
  globalResizeHandlers.delete(handleWindowResize)

  // Remove shared listeners only when no dropdowns need them
  // Check both ref count (safety) and Set sizes (accuracy) to ensure proper cleanup
  // This prevents removing listeners that other instances still need
  if (globalListenerRefCount === 0 && globalListenersAttached) {
    // Only remove listeners if the corresponding handler Sets are empty
    // This ensures we don't remove listeners that other instances might still need
    // (defensive check - if ref count is 0, Sets should be empty, but verify)
    if (globalClickHandlers.size === 0 && globalEscapeHandlers.size === 0) {
      document.removeEventListener('click', sharedDocumentClick, { capture: false })
      document.removeEventListener('keydown', sharedEscapeKey)
    }

    if (globalScrollHandlers.size === 0) {
      window.removeEventListener('scroll', sharedWindowScroll, { capture: false, passive: true })
    }

    if (globalResizeHandlers.size === 0) {
      window.removeEventListener('resize', sharedWindowResize, { passive: true })
    }

    globalListenersAttached = false
  }
}

// Cache anchor element to avoid repeated resolution
let cachedAnchorEl = null
// Track previous anchor to clean up listeners when anchor changes
let previousAnchorEl = null

function handleDocumentClick(e) {
  if (!isOpenInternal.value) return
  if (config.value.trigger !== 'click' && config.value.trigger !== 'focus') return

  // Fast path: check dropdown first (no DOM queries needed - just ref access)
  // This allows early return without resolving anchor for clicks inside dropdown
  const ddEl = dropdownRef.value
  if (ddEl && ddEl.contains(e.target)) {
    // If click is inside dropdown, onDropdownClick handler will handle it (including close buttons)
    return
  }

  // Use cached anchor element (set at open time) to avoid calling resolveAnchor() on every click
  // Anchor element doesn't change while dropdown is open, so caching is safe and efficient
  // Only resolve if cache is null (defensive fallback, shouldn't happen after successful open)
  let anchorEl = cachedAnchorEl
  if (!anchorEl) {
    anchorEl = resolveAnchor()
    // Update cache defensively (though it should already be set on open)
    if (anchorEl) cachedAnchorEl = anchorEl
  }
  if (!anchorEl) return

  if (anchorEl.contains(e.target)) {
    // Anchor click is handled by onAnchorClick (including toggleOnTriggerClick logic)
    // Just return here to avoid closing the dropdown on anchor click
    return
  }

  // Handle button clicks outside dropdown
  // By default (ignoreOutsideButtons: false), buttons close the dropdown when clicked outside
  // Set ignoreOutsideButtons: true to prevent ALL buttons from closing the dropdown
  // 
  // You can also use data-dropdown-ignore-click attribute on specific buttons to ignore them:
  // <button data-dropdown-ignore-click>This button won't close dropdowns</button>
  // This allows fine-grained control: ignore specific buttons while allowing others to close
  const target = e.target
  if (target) {
    // Check if this specific button has data-dropdown-ignore-click attribute
    // This allows per-button control regardless of global ignoreOutsideButtons setting
    const buttonElement = target.tagName === 'BUTTON' ? target : target.closest('button')
    if (buttonElement) {
      // Check for data attribute first (per-button override)
      if (buttonElement.hasAttribute('data-dropdown-ignore-click')) {
        // This specific button is marked to be ignored - don't close dropdown
        return
      }

      // Check global config setting
      if (config.value.ignoreOutsideButtons === true) {
        // Global setting: ignore all buttons
        return
      }

      // Default behavior: buttons close the dropdown (continue to closeOnOutsideClick check below)
    }
  }

  if (config.value.closeOnOutsideClick) {
    close('outside-click')
  }
}

function handleEscapeKey(e) {
  if (e.key === 'Escape' && isOpenInternal.value && (config.value.trigger === 'click' || config.value.trigger === 'focus')) {
    // SSR-safe: guard document before accessing activeElement
    if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur()
    }
    close('escape-key')
  }
}

function handleWindowScroll(e) {
  if (!isOpenInternal.value) return

  // Throttle all scroll handling using requestAnimationFrame
  // This prevents excessive DOM reads/writes on high-frequency scroll devices
  if (scrollThrottleRaf !== null) {
    return
  }

  scrollThrottleRaf = requestAnimationFrame(() => {
    scrollThrottleRaf = null

    // Early exit if dropdown closed during RAF delay
    if (!isOpenInternal.value) return

    // Determine which path we need (close-only vs reposition)
    // This allows us to optimize the fast path (close-only) to skip unnecessary work
    const closeOnly = config.value.closeOnScroll && !config.value.repositionOnScroll
    const needsReposition = config.value.repositionOnScroll

    // Fast path: Simple "close on scroll" - minimal work needed
    if (closeOnly) {
      // Time-based throttling: Check MIN_SCROLL_ACTION_INTERVAL_MS before doing any work
      const now = Date.now()
      const timeSinceLastAction = now - lastScrollActionTime.value
      if (timeSinceLastAction < MIN_SCROLL_ACTION_INTERVAL_MS) {
        // Too soon since last action - skip all work
        return
      }

      // Read scroll positions (minimal work for close-only path)
      const currentScrollY = window.scrollY || window.pageYOffset || (typeof document !== 'undefined' ? document.documentElement.scrollTop : 0)
      const currentScrollX = window.scrollX || window.pageXOffset || (typeof document !== 'undefined' ? document.documentElement.scrollLeft : 0)

      // Check if scroll actually changed (0.5px threshold to ignore sub-pixel movements)
      const scrollYChanged = Math.abs(currentScrollY - lastWindowScrollY.value) > 0.5
      const scrollXChanged = Math.abs(currentScrollX - lastWindowScrollX.value) > 0.5

      if (!scrollYChanged && !scrollXChanged) return

      // Ignore scroll events from dropdown's own scroll container
      const ddEl = dropdownRef.value
      const contentScroll = contentScrollRef.value
      if (e.target && ddEl && (ddEl === e.target || ddEl.contains(e.target))) {
        return
      }
      if (e.target && contentScroll && (contentScroll === e.target || contentScroll.contains(e.target))) {
        return
      }

      // Update scroll positions and action time
      lastWindowScrollY.value = currentScrollY
      lastWindowScrollX.value = currentScrollX
      lastScrollActionTime.value = now

      // Fast path: Just close, no reposition logic needed
      if (isOpenInternal.value) {
        close('scroll')
      }
      return // Early exit - skip all reposition checks
    }

    // Full path: Handle reposition or close with reposition checks
    // Time-based throttling: Check MIN_REPOSITION_INTERVAL_MS FIRST to avoid any work
    // This is critical for high-frequency scroll devices (trackpads, touch)
    const now = Date.now()
    const timeSinceLastReposition = now - lastRepositionTime.value
    const timeSinceLastAction = now - lastScrollActionTime.value

    // If reposition is needed, check MIN_REPOSITION_INTERVAL_MS before doing any work
    if (needsReposition && timeSinceLastReposition < MIN_REPOSITION_INTERVAL_MS) {
      // Too soon since last reposition - skip all work
      // The next scroll event will trigger reposition if needed
      return
    }

    // If any scroll action is needed, check MIN_SCROLL_ACTION_INTERVAL_MS before doing work
    if (timeSinceLastAction < MIN_SCROLL_ACTION_INTERVAL_MS) {
      // Too soon since last action - skip all work
      return
    }

    // Read scroll positions once per frame (only if we passed throttling checks)
    const currentScrollY = window.scrollY || window.pageYOffset || (typeof document !== 'undefined' ? document.documentElement.scrollTop : 0)
    const currentScrollX = window.scrollX || window.pageXOffset || (typeof document !== 'undefined' ? document.documentElement.scrollLeft : 0)

    // Check if scroll actually changed (0.5px threshold to ignore sub-pixel movements)
    const scrollYChanged = Math.abs(currentScrollY - lastWindowScrollY.value) > 0.5
    const scrollXChanged = Math.abs(currentScrollX - lastWindowScrollX.value) > 0.5

    if (!scrollYChanged && !scrollXChanged) return

    // Ignore scroll events from dropdown's own scroll container (needed for both paths)
    const ddEl = dropdownRef.value
    const contentScroll = contentScrollRef.value

    if (e.target && ddEl && (ddEl === e.target || ddEl.contains(e.target))) {
      return
    }
    if (e.target && contentScroll && (contentScroll === e.target || contentScroll.contains(e.target))) {
      return
    }

    // Update scroll positions
    lastWindowScrollY.value = currentScrollY
    lastWindowScrollX.value = currentScrollX
    lastScrollActionTime.value = now

    // Full path: Handle reposition or close with reposition checks
    if (config.value.repositionOnScroll) {
      // Safe to call repositionInternal - throttling already checked above
      // repositionInternal will update lastRepositionTime
      if (isOpenInternal.value) {
        repositionInternal('scroll')
      }
    } else if (config.value.closeOnScroll) {
      // Close on scroll (when repositionOnScroll is false but closeOnScroll is true)
      if (isOpenInternal.value) {
        close('scroll')
      }
    }
  })
}

function handleWindowResize() {
  updateViewportSize()
  if (isOpenInternal.value) {
    repositionInternal('resize')
  }
}

function onDropdownMouseEnter() {
  if (openMode.value === 'hover') {
    if (hoverOpenTimer.value) {
      clearTimeout(hoverOpenTimer.value)
      hoverOpenTimer.value = null
    }
    if (hoverCloseTimer.value) {
      clearTimeout(hoverCloseTimer.value)
      hoverCloseTimer.value = null
    }
  }
}

function onDropdownMouseLeave(e) {
  if (openMode.value === 'hover' && config.value.closeOnOutsideHover) {
    // Check if mouse is moving to anchor (don't close in that case)
    const related = e.relatedTarget
    const anchorEl = cachedAnchorEl || resolveAnchor()

    if (related && anchorEl && anchorEl.contains(related)) {
      // Mouse is moving to anchor, don't close
      return
    }

    // Use configurable close delay to avoid accidental closes
    // This gives user a brief moment to move mouse back to anchor or dropdown
    // Validate and get hover close delay
    let hoverCloseDelay = Number(config.value.hoverCloseDelayMs)
    if (!Number.isFinite(hoverCloseDelay) || hoverCloseDelay < 0) {
      hoverCloseDelay = DEFAULTS.hoverCloseDelayMs
    }

    clearTimeout(hoverCloseTimer.value)
    hoverCloseTimer.value = setTimeout(() => {
      // Double-check dropdown is not hovered (user might have moved back)
      const dd = dropdownRef.value
      if (dd && dd.matches(':hover')) {
        return
      }
      close('hover-leave')
    }, hoverCloseDelay)
  }
}

function onDropdownClick(e) {
  // Check for data-dropdown-close attribute
  const closeBtn = e.target.closest('[data-dropdown-close]')
  if (closeBtn) {
    close('close-button', true)
    return
  }

  // Stop propagation to prevent document click handler from firing
  e.stopPropagation()
}

function handleOverlayClick() {
  if (isOpenInternal.value) {
    if (config.value.forceKeepOpen) {
      return
    }
    close('overlay-click', true)
  }
}

function handleOverlayHover() {
  // Overlay mouseenter as fallback - only fires once when mouse enters overlay
  // Primary close mechanism is via mouseleave from anchor/dropdown with hover-intent timer
  // This avoids the noise of mousemove events while still providing a fallback for edge cases
  if (config.value.closeOnOutsideHover && openMode.value === 'hover') {
    // Use configurable close delay to allow mouseleave handlers to fire first
    // This prevents double-closing and gives preference to anchor/dropdown mouseleave
    // Validate and get hover close delay
    let hoverCloseDelay = Number(config.value.hoverCloseDelayMs)
    if (!Number.isFinite(hoverCloseDelay) || hoverCloseDelay < 0) {
      hoverCloseDelay = DEFAULTS.hoverCloseDelayMs
    }

    clearTimeout(hoverCloseTimer.value)
    hoverCloseTimer.value = setTimeout(() => {
      // Only close if dropdown is not hovered (mouseleave should have handled it)
      // This is a fallback for cases where mouseleave events might not fire correctly
      const dd = dropdownRef.value
      if (dd && !dd.matches(':hover')) {
        close('overlay-hover')
      }
    }, hoverCloseDelay)
  }
}

let focusClickHandler = null
let focusMouseDownHandler = null
let focusMouseUpHandler = null

function bindTrigger() {
  // ALWAYS clean up previous anchor's listeners FIRST
  // This prevents leaked listeners when anchor is swapped in dynamic lists
  // We clean up even if the new anchor resolves to the same element, because
  // the anchor prop (ref object) might have changed, indicating a rebind is needed
  if (previousAnchorEl) {
    try {
      // Check if previous anchor is still in DOM before trying to remove listeners
      // This handles cases where the old anchor was removed from DOM
      const isInDOM = typeof document !== 'undefined' &&
        document.body &&
        (document.body.contains(previousAnchorEl) ||
          document.documentElement.contains(previousAnchorEl))

      if (isInDOM) {
        // Anchor is still in DOM - safe to remove listeners
        previousAnchorEl.removeEventListener('click', onAnchorClick)
        previousAnchorEl.removeEventListener('focus', onAnchorFocus)
        previousAnchorEl.removeEventListener('blur', onAnchorBlur)
        if (focusClickHandler) {
          previousAnchorEl.removeEventListener('click', focusClickHandler)
        }
        if (focusMouseDownHandler) {
          previousAnchorEl.removeEventListener('mousedown', focusMouseDownHandler)
        }
        if (focusMouseUpHandler) {
          previousAnchorEl.removeEventListener('mouseup', focusMouseUpHandler)
          if (typeof document !== 'undefined') {
            document.removeEventListener('mouseup', focusMouseUpHandler)
          }
        }
        cleanupHover(previousAnchorEl)
      } else {
        // Anchor was removed from DOM - just clean up hover timers and document listeners
        // Event listeners are automatically removed when element is removed from DOM
        cleanupHover(null) // Pass null since element is gone
        if (focusMouseUpHandler && typeof document !== 'undefined') {
          document.removeEventListener('mouseup', focusMouseUpHandler)
        }
      }
    } catch (error) {
      // Old anchor might be removed from DOM or in an invalid state - ignore errors gracefully
      // This is expected in dynamic lists where anchors are frequently swapped
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[DropdownHandler] Error cleaning up previous anchor listeners (anchor may be removed):', error)
      }
      // Still try to clean up hover timers and document listeners
      try {
        cleanupHover(null)
        if (focusMouseUpHandler && typeof document !== 'undefined') {
          document.removeEventListener('mouseup', focusMouseUpHandler)
        }
      } catch (cleanupError) {
        // Ignore cleanup errors - element is likely gone
      }
    }

    // Clear previous anchor reference after cleanup attempt
    previousAnchorEl = null
  }

  // Now resolve and (optionally) bind to the new anchor
  const anchorEl = resolveAnchor()
  if (!anchorEl) {
    // Missing anchor is a critical error - log as error, not warning
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Cannot bind trigger: anchor element not available')
    }
    // Ensure previousAnchorEl is cleared
    previousAnchorEl = null
    return
  }

  // Controlled mode: DO NOT attach any automatic trigger listeners
  // In this mode, open/close/toggle are driven exclusively by the consumer
  // via the exposed API methods, not by anchor events.
  if (config.value.controlledMode) {
    // We still update previousAnchorEl for cleanup purposes, but skip binding
    previousAnchorEl = anchorEl
    return
  }

  // Remove listeners from new anchor (in case bindTrigger is called multiple times on same anchor)
  // This is safe even if listeners weren't previously attached
  // This handles the case where bindTrigger is called multiple times on the same element
  try {
    anchorEl.removeEventListener('click', onAnchorClick)
    anchorEl.removeEventListener('focus', onAnchorFocus)
    anchorEl.removeEventListener('blur', onAnchorBlur)
    if (focusClickHandler) {
      anchorEl.removeEventListener('click', focusClickHandler)
      focusClickHandler = null
    }
    if (focusMouseDownHandler) {
      anchorEl.removeEventListener('mousedown', focusMouseDownHandler)
      focusMouseDownHandler = null
    }
    if (focusMouseUpHandler) {
      anchorEl.removeEventListener('mouseup', focusMouseUpHandler)
      if (typeof document !== 'undefined') {
        document.removeEventListener('mouseup', focusMouseUpHandler)
      }
      focusMouseUpHandler = null
    }
    cleanupHover(anchorEl)
  } catch (error) {
    // If removing listeners fails, the element might be in an invalid state
    // Log warning but continue - we'll try to add listeners anyway
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DropdownHandler] Error removing existing listeners from anchor:', error)
    }
  }

  // Bind listeners based on trigger type
  try {
    if (config.value.trigger === 'click') {
      anchorEl.addEventListener('click', onAnchorClick)
      // Track this anchor for cleanup on next change
      previousAnchorEl = anchorEl
    } else if (config.value.trigger === 'focus') {
      anchorEl.addEventListener('focus', onAnchorFocus)
      anchorEl.addEventListener('blur', onAnchorBlur)

      focusMouseDownHandler = (e) => {
        e.stopPropagation()
        if (!isOpenInternal.value) {
          open('focus')
        }
      }
      focusMouseUpHandler = (e) => {
        const anchorEl = resolveAnchor()
        if (anchorEl && anchorEl.contains(e.target)) {
          if (isOpenInternal.value && !config.value.forceKeepOpen) {
            close('mouseup')
          }
        }
      }
      anchorEl.addEventListener('mousedown', focusMouseDownHandler)
      if (typeof document !== 'undefined') {
        document.addEventListener('mouseup', focusMouseUpHandler)
      }
      // Track this anchor as the previous one for next cleanup
      previousAnchorEl = anchorEl
    } else if (config.value.trigger === 'hover') {
      setupHover(anchorEl)
      // setupHover already sets previousAnchorEl
    }
  } catch (error) {
    // If binding fails, log error but don't throw
    // This allows the component to continue functioning
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DropdownHandler] Error binding trigger listeners:', error)
    }
    // Clear previousAnchorEl on error to prevent stale reference
    previousAnchorEl = null
  }
}

function onAnchorClick(e) {
  // Disabled: allow anchor's own behavior (navigation, etc.) but never open dropdown
  if (config.value.disabled) {
    return
  }

  if (config.value.trigger === 'click') {
    // Determine whether to suppress default behavior
    // Priority order:
    // 1. Data attribute on anchor (data-dropdown-suppress-default) - highest priority
    // 2. Config option (suppressTriggerDefault) - default: true for backwards compatibility
    // 
    // This allows anchors to work normally (navigation, form submission, etc.) while still
    // opening the dropdown, unless explicitly configured to suppress default behavior.

    let shouldSuppress = config.value.suppressTriggerDefault !== false // Default: true (backwards compat)

    // Check for data attribute override on the anchor element
    // data-dropdown-suppress-default="true" forces suppression
    // data-dropdown-suppress-default="false" forces NO suppression (allows normal anchor behavior)
    const anchorEl = resolveAnchor()
    if (anchorEl && anchorEl.hasAttribute('data-dropdown-suppress-default')) {
      const attrValue = anchorEl.getAttribute('data-dropdown-suppress-default')
      // If attribute exists, it overrides config
      // "true" or empty string = suppress, "false" = don't suppress
      shouldSuppress = attrValue !== 'false'
    }

    // Only prevent default and stop propagation if suppression is enabled
    // This allows anchors/buttons to work normally (navigation, form submission, etc.)
    // while still opening the dropdown when suppressTriggerDefault is false
    if (shouldSuppress) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Clear any existing open timer (e.g., from rapid clicks)
  if (clickFocusOpenTimer.value) {
    clearTimeout(clickFocusOpenTimer.value)
    clickFocusOpenTimer.value = null
  }

  // Validate and get open delay
  let openDelay = Number(config.value.openDelayMs)
  if (!Number.isFinite(openDelay) || openDelay < 0) {
    openDelay = DEFAULTS.openDelayMs
  }

  // Use delay timer if configured, otherwise open immediately
  if (openDelay > 0) {
    clickFocusOpenTimer.value = setTimeout(() => {
      clickFocusOpenTimer.value = null
      if (config.value.toggleOnTriggerClick) {
        if (config.value.forceKeepOpen && isOpenInternal.value) return
        toggle('click') // Pass 'click' origin when triggered by actual click event
      } else if (!isOpenInternal.value) {
        open('click')
      }
    }, openDelay)
  } else {
    // No delay - open immediately (backwards compatible)
    if (config.value.toggleOnTriggerClick) {
      if (config.value.forceKeepOpen && isOpenInternal.value) return
      toggle('click') // Pass 'click' origin when triggered by actual click event
    } else if (!isOpenInternal.value) {
      open('click')
    }
  }
}

function onAnchorFocus(e) {
  // Disabled: never open on focus when disabled
  if (config.value.disabled) {
    return
  }

  // Clear any existing open timer (e.g., from rapid focus changes)
  if (clickFocusOpenTimer.value) {
    clearTimeout(clickFocusOpenTimer.value)
    clickFocusOpenTimer.value = null
  }

  // Validate and get open delay
  let openDelay = Number(config.value.openDelayMs)
  if (!Number.isFinite(openDelay) || openDelay < 0) {
    openDelay = DEFAULTS.openDelayMs
  }

  // Use delay timer if configured, otherwise open immediately
  if (openDelay > 0) {
    clickFocusOpenTimer.value = setTimeout(() => {
      clickFocusOpenTimer.value = null
      if (!isOpenInternal.value) {
        open('focus')
      }
    }, openDelay)
  } else {
    // No delay - open immediately (backwards compatible)
    if (!isOpenInternal.value) {
      open('focus')
    }
  }
}

function onAnchorBlur(e) {
  if (config.value.forceKeepOpen) return

  const relatedTarget = e.relatedTarget
  const dd = dropdownRef.value
  if (relatedTarget && dd && dd.contains(relatedTarget)) {
    return
  }

  setTimeout(() => {
    // SSR-safe: guard document before accessing activeElement
    // Event handlers only fire in browser, but guard defensively
    if (!isBrowser() || typeof document.activeElement === 'undefined') return
    const anchorEl = resolveAnchor()
    if (document.activeElement !== anchorEl && isOpenInternal.value) {
      close('focus-blur')
    }
  }, 0)
}

let hoverAnchorEnter = null
let hoverAnchorLeave = null

function setupHover(anchorEl) {
  cleanupHover(anchorEl)

  // Disabled: don't attach hover behavior when disabled
  if (config.value.disabled) {
    return
  }

  // Validate and clamp hoverIntentMs to prevent NaN causing immediate open
  // NaN in setTimeout behaves as 0, which removes hover intent delay
  // This validation ensures invalid values (like 'fast', null, undefined) don't cause unexpected behavior
  let hoverDelay = Number(config.value.hoverIntentMs)
  if (!Number.isFinite(hoverDelay) || hoverDelay < 0) {
    // Invalid value detected - log warning and use default
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[DropdownHandler] Invalid hoverIntentMs: "${config.value.hoverIntentMs}". ` +
        `Expected a finite number >= 0. Using default: ${DEFAULTS.hoverIntentMs}ms`
      )
    }
    hoverDelay = DEFAULTS.hoverIntentMs
  }

  hoverAnchorEnter = () => {
    // Cancel any pending close timer when re-entering anchor
    // This allows smooth transitions between anchor and dropdown
    if (hoverCloseTimer.value) {
      clearTimeout(hoverCloseTimer.value)
      hoverCloseTimer.value = null
    }

    clearTimeout(hoverOpenTimer.value)
    hoverOpenTimer.value = setTimeout(() => {
      if (!isOpenInternal.value) {
        open('hover')
      }
    }, hoverDelay)
  }

  hoverAnchorLeave = (e) => {
    clearTimeout(hoverOpenTimer.value)
    hoverOpenTimer.value = null
    if (!isOpenInternal.value) return

    const dd = dropdownRef.value
    if (!dd) {
      close('hover-leave-anchor')
      return
    }

    const related = e.relatedTarget
    // If mouse is moving to dropdown or back to anchor, cancel close timer
    if (related && (dd.contains(related) || anchorEl.contains(related))) {
      clearTimeout(hoverCloseTimer.value)
      hoverCloseTimer.value = null
      return
    }

    // Use configurable close delay to avoid accidental closes
    // This gives user a brief moment to move mouse back to anchor or dropdown
    // Validate and get hover close delay
    let hoverCloseDelay = Number(config.value.hoverCloseDelayMs)
    if (!Number.isFinite(hoverCloseDelay) || hoverCloseDelay < 0) {
      hoverCloseDelay = DEFAULTS.hoverCloseDelayMs
    }

    clearTimeout(hoverCloseTimer.value)
    hoverCloseTimer.value = setTimeout(() => {
      const dd = dropdownRef.value
      if (dd && dd.matches(':hover')) {
        return
      }
      close('hover-leave-anchor')
    }, hoverCloseDelay)
  }

  anchorEl.addEventListener('mouseenter', hoverAnchorEnter)
  anchorEl.addEventListener('mouseleave', hoverAnchorLeave)

  // Track this anchor as the previous one for next cleanup
  previousAnchorEl = anchorEl
}

function cleanupHover(anchorEl) {
  if (hoverOpenTimer.value) {
    clearTimeout(hoverOpenTimer.value)
    hoverOpenTimer.value = null
  }
  if (hoverCloseTimer.value) {
    clearTimeout(hoverCloseTimer.value)
    hoverCloseTimer.value = null
  }
  // Clean up click/focus open timer
  if (clickFocusOpenTimer.value) {
    clearTimeout(clickFocusOpenTimer.value)
    clickFocusOpenTimer.value = null
  }
  if (anchorEl && hoverAnchorEnter) {
    anchorEl.removeEventListener('mouseenter', hoverAnchorEnter)
  }
  if (anchorEl && hoverAnchorLeave) {
    anchorEl.removeEventListener('mouseleave', hoverAnchorLeave)
  }
  hoverAnchorEnter = hoverAnchorLeave = null
}

function handleRouteLikeChange() {
  if (!config.value.destroyOnRouteChange) return
  close('route-change')
}

onMounted(() => {
  // SSR-safe: Guard all DOM/window access - return early if not in browser
  // onMounted only runs in browser, but guard defensively for safety
  if (!isBrowser()) {
    return
  }

  updateViewportSize()
  window.addEventListener('popstate', handleRouteLikeChange)
  window.addEventListener('hashchange', handleRouteLikeChange)
  window.addEventListener('resize', updateViewportSize, { passive: true })

  nextTick(() => {
    try {
      bindTrigger()
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[DropdownHandler] Error binding trigger on mount:', e)
      }
    }
  })
})

onBeforeUnmount(() => {
  // Clean up all timers
  if (hoverOpenTimer.value) {
    clearTimeout(hoverOpenTimer.value)
    hoverOpenTimer.value = null
  }
  if (hoverCloseTimer.value) {
    clearTimeout(hoverCloseTimer.value)
    hoverCloseTimer.value = null
  }
  if (clickFocusOpenTimer.value) {
    clearTimeout(clickFocusOpenTimer.value)
    clickFocusOpenTimer.value = null
  }
  // Clean up loader timeouts
  if (loadingShowTimeout) {
    clearTimeout(loadingShowTimeout)
    loadingShowTimeout = null
  }
  if (loadingHideTimeout) {
    clearTimeout(loadingHideTimeout)
    loadingHideTimeout = null
  }
  if (scrollThrottleRaf !== null) {
    cancelAnimationFrame(scrollThrottleRaf)
    scrollThrottleRaf = null
  }

  // Close dropdown if still open
  if (isOpenInternal.value) {
    isOpenInternal.value = false
    restoreBodyScroll()
  }

  if (contentScrollHandler && contentScrollRef.value) {
    contentScrollRef.value.removeEventListener('scroll', contentScrollHandler)
    contentScrollHandler = null
  }

  // Always clean up global listeners (safety net - handles both open and closed cases)
  removeGlobalListeners()

  const anchorEl = (() => { try { return resolveAnchor() } catch { return null } })()
  if (anchorEl) {
    anchorEl.removeEventListener('click', onAnchorClick)
    anchorEl.removeEventListener('focus', onAnchorFocus)
    anchorEl.removeEventListener('blur', onAnchorBlur)
    if (focusClickHandler) {
      anchorEl.removeEventListener('click', focusClickHandler)
      focusClickHandler = null
    }
    if (focusMouseDownHandler) {
      anchorEl.removeEventListener('mousedown', focusMouseDownHandler)
      focusMouseDownHandler = null
    }
    if (focusMouseUpHandler) {
      anchorEl.removeEventListener('mouseup', focusMouseUpHandler)
      if (typeof document !== 'undefined') {
        document.removeEventListener('mouseup', focusMouseUpHandler)
      }
      focusMouseUpHandler = null
    }
    cleanupHover(anchorEl)
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', handleRouteLikeChange)
    window.removeEventListener('hashchange', handleRouteLikeChange)
    window.removeEventListener('resize', updateViewportSize, { passive: true })
  }
  __stackUnregister(dropdownId)
  cachedAnchorEl = null
})

// Watch for anchor changes
// This is critical for dynamic lists where anchor refs are swapped
// Without this, old anchors keep their listeners and new anchors never get bound
watch(() => props.anchor, (newAnchor, oldAnchor) => {
  // Skip if component is unmounted or anchor hasn't actually changed
  // (Vue watchers can fire even when value is the same in some edge cases)
  if (newAnchor === oldAnchor) {
    return
  }

  nextTick(() => {
    // Guard against component being unmounted during nextTick
    if (typeof document === 'undefined') {
      return
    }

    try {
      // Always rebind trigger when anchor changes
      // bindTrigger() will clean up the old anchor and bind to the new one
      bindTrigger()

      // Update cached anchor if dropdown is open
      // This ensures click-outside detection works with the new anchor
      if (isOpenInternal.value) {
        const newAnchorEl = resolveAnchor()
        if (newAnchorEl) {
          cachedAnchorEl = newAnchorEl
          // Reposition dropdown relative to new anchor
          repositionInternal('anchor-change')
        } else {
          // New anchor is invalid - close dropdown
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[DropdownHandler] Anchor changed to invalid element, closing dropdown')
          }
          close('anchor-invalid')
        }
      }
    } catch (e) {
      // Log error but don't throw - component should continue functioning
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[DropdownHandler] Error rebinding trigger after anchor change:', e)
      }
    }
  })
}, { deep: false, immediate: false })

// Watch for trigger-related config changes - split into targeted watchers for performance
// IMPORTANT: When trigger changes while dropdown is open, we MUST update global listeners
// because different triggers require different global listeners:
// - 'click'/'focus' triggers need document click + Escape key listeners
// - 'hover' trigger doesn't need document click/Escape listeners
// Without updating, you get mismatched behavior (e.g., config says 'hover' but Escape still closes)
watch(() => [config.value.trigger, config.value.toggleOnTriggerClick, config.value.hoverIntentMs], () => {
  nextTick(() => {
    try {
      // Always rebind trigger (handles anchor listeners)
      bindTrigger()

      // CRITICAL: Update global listeners if dropdown is open and trigger changed
      // This ensures global listeners (document click, Escape key) match the current trigger
      // Example: If trigger changes from 'click' to 'hover' while open:
      // - Old: document click listener active (wrong for 'hover')
      // - New: document click listener removed (correct for 'hover')
      if (isOpenInternal.value) {
        // Remove old listeners first (cleans up handlers for old trigger)
        removeGlobalListeners()
        // Add new listeners (registers handlers based on new trigger)
        addGlobalListeners()
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[DropdownHandler] Error rebinding trigger after config change:', e)
      }
    }
  })
}, { deep: false })

// Watch for scroll-related config changes - updates global scroll listeners when changed while open
// IMPORTANT: When closeOnScroll or repositionOnScroll changes while dropdown is open, we MUST update
// global listeners because these determine whether window scroll listener is needed
// Without updating, you get mismatched behavior (e.g., config says no scroll handling but listener still active)
watch(() => [config.value.closeOnScroll, config.value.repositionOnScroll], () => {
  if (isOpenInternal.value) {
    nextTick(() => {
      try {
        // CRITICAL: Update global listeners to reflect new scroll behavior
        // This ensures scroll listeners are added/removed based on new config values
        // Example: If closeOnScroll changes from true to false while open:
        // - Old: window scroll listener active (wrong, shouldn't close on scroll)
        // - New: window scroll listener removed (correct, no scroll handling)
        removeGlobalListeners()
        addGlobalListeners()
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[DropdownHandler] Error updating scroll listeners after config change:', e)
        }
      }
    })
  }
}, { deep: false })

// Watch for layout/positioning config changes - triggers reposition when dropdown is open
// This is optimized to only watch specific fields that affect positioning, avoiding deep watch overhead
watch(() => [
  config.value.align,
  config.value.width,
  config.value.height,
  config.value.positionMode,
  config.value.offset,
  config.value.flipOnOverflow,
  config.value.widthMode,
  config.value.maxWidth,
  config.value.snapEdge,
  config.value.widthParentSelector,
  config.value.widthAncestorSelector,
  config.value.tooltipPlacement,
  config.value.tooltipFallbackOrder,
  config.value.mobileBreakpoint
], () => {
  if (isOpenInternal.value) {
    nextTick(() => {
      repositionInternal('config-change')
    })
  }
}, { deep: false })

defineExpose(exposedApi)
</script>
