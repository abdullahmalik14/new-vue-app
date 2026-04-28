/**
 * DropdownHandler Helper Functions and Theme Mapping
 * External utilities to support the DropdownHandler component
 * 
 * This module provides utility functions for:
 * - Theme-to-class mapping for preset visual styles
 * - Width/height resolution supporting multiple modes (viewport, parent, ancestor)
 * - Positioning calculations (horizontal, vertical, tooltip side placement)
 * - Collision detection for viewport boundaries
 * - Viewport utilities
 * 
 * Architecture:
 * - These are UI/DOM-bound utility functions, NOT pure functions
 * - Functions may access DOM globals (window, document) and have side effects (console.warn)
 * - Most functions accept viewport dimensions and DOM rects as parameters (preferred pattern)
 * - Some functions (like getViewportSize, resolveWidth) access DOM directly when needed
 * - DOM access is guarded for SSR safety but functions are not environment-agnostic
 * - Functions gracefully degrade in SSR/Node environments by returning safe defaults
 * 
 * Function Categories:
 * - Pure functions: getThemeClasses, parseResponsiveWidth, computeHorizontalPosition, 
 *   computeVerticalPosition, computeTooltipPosition, detectCollision, computeDropdownLayout
 *   (these only operate on their parameters, no DOM access, fully testable)
 * - DOM-bound functions: resolveWidth, resolveHeight, getViewportSize, isMobile
 *   (these access window/document or DOM elements, have side effects like console.warn)
 * 
 * SSR Safety:
 * - All window/document access is guarded with typeof checks
 * - DOM method calls (getBoundingClientRect, closest, querySelector) are wrapped in try-catch
 * - Viewport dimensions should be provided by caller when possible (no direct window access in pure functions)
 * - Safe to import in SSR, tests, and Node.js environments (returns fallbacks)
 * 
 * Testing:
 * - Pure functions can be tested in Node.js without mocks
 * - DOM-bound functions require browser environment or mocks for window/document
 * - Functions that accept viewport/rects as parameters are easier to test
 * 
 * @module dropdown-helpers
 * @version 2.0.0
 */

// SSR fallback constants (used when browser environment is unavailable)
const SSR_FALLBACK_VIEWPORT_WIDTH = 1024
const SSR_FALLBACK_VIEWPORT_HEIGHT = 768
const SSR_FALLBACK_DEFAULT_WIDTH = 400

// ===== CLOSE REASONS =====
/**
 * Close reason constants - exported for consumer use
 * These string literals are used throughout the component to identify why a dropdown closed.
 * Using this enum-like object prevents typos and provides autocomplete support.
 * 
 * @example
 * // In consumer code:
 * import { CLOSE_REASONS } from './dropdown-helpers.js'
 * 
 * dropdownRef.value.on('close', (event) => {
 *   if (event.reason === CLOSE_REASONS.ESCAPE_KEY) {
 *     // Handle escape key close
 *   } else if (event.reason === CLOSE_REASONS.OUTSIDE_CLICK) {
 *     // Handle outside click close
 *   }
 * })
 */
export const CLOSE_REASONS = Object.freeze({
  MANUAL: 'manual',                    // Programmatic close (default)
  OUTSIDE_CLICK: 'outside-click',      // Click outside dropdown
  ESCAPE_KEY: 'escape-key',            // Escape key pressed
  SCROLL: 'scroll',                    // Scroll event (when closeOnScroll is true)
  HOVER_LEAVE: 'hover-leave',          // Mouse left dropdown (hover mode)
  HOVER_LEAVE_ANCHOR: 'hover-leave-anchor', // Mouse left anchor (hover mode)
  OVERLAY_CLICK: 'overlay-click',      // Overlay clicked
  OVERLAY_HOVER: 'overlay-hover',      // Overlay hovered (hover mode)
  CLOSE_BUTTON: 'close-button',        // Close button clicked
  FOCUS_BLUR: 'focus-blur',           // Focus lost (focus trigger)
  MOUSEUP: 'mouseup',                 // Mouse up on anchor (focus trigger)
  ROUTE_CHANGE: 'route-change',       // Route/hash changed
  STACK_OPENED_OTHER: 'stack-opened-other', // Another dropdown in same layer opened
  ANCHOR_INVALID: 'anchor-invalid',   // Anchor element became invalid
  ERROR: 'error',                     // Error during operation
  TOGGLE: 'toggle'                    // Toggled closed
})

// ===== THEME MAPPING =====

/**
 * Theme-to-class mapping for preset visual styles
 * These can be overridden by config.style.class
 */
export const THEME_CLASS_MAP = {
  'generic': '',
  'tooltip-dark': 'bg-gray-900 text-white text-xs rounded-md px-2 py-1 shadow-lg',
  'tooltip-light': 'bg-white text-gray-900 text-xs rounded-md px-2 py-1 shadow-md border border-gray-200',
  'dropdown-panel': 'bg-white rounded-xl shadow-xl border border-gray-100 p-2',
}

/**
 * Get theme classes for a given theme name
 * 
 * This function provides diagnostic warnings in development mode to help catch typos
 * and missing theme names. Unknown themes silently fall back to 'generic' in production
 * to prevent breaking the UI, but dev mode warnings help identify configuration issues.
 * 
 * @param {string} themeName - The theme identifier
 * @returns {string} CSS classes for the theme (falls back to 'generic' if unknown)
 * 
 * @example
 * getThemeClasses('tooltip-dark')  // Returns dark theme classes
 * getThemeClasses('tooltip-light') // Returns light theme classes
 * getThemeClasses('typo-dark')     // Dev: warns, returns generic; Prod: silently returns generic
 * 
 * @note In development mode, this function logs console.warn for:
 * - null/undefined themeName
 * - Unknown theme names (not in THEME_CLASS_MAP)
 * - Includes list of available themes in warning message
 * 
 * @note In production mode, unknown themes silently fall back to 'generic' to prevent UI breakage
 */
export function getThemeClasses(themeName) {
  // Handle null/undefined themeName with diagnostic warning in dev mode
  if (!themeName) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[DropdownHandler] Theme name is ${themeName === null ? 'null' : 'undefined'}, ` +
        `falling back to 'generic'. Available themes: ${Object.keys(THEME_CLASS_MAP).join(', ')}`
      )
    }
    return THEME_CLASS_MAP['generic']
  }
  
  const result = THEME_CLASS_MAP[themeName] || THEME_CLASS_MAP['generic']
  
  // Diagnostic warning in dev mode for unknown themes (helps catch typos and missing config)
  // This prevents silent degradation that can be hard to spot during development
  if (process.env.NODE_ENV !== 'production' && !THEME_CLASS_MAP[themeName] && themeName !== 'generic') {
    console.warn(
      `[DropdownHandler] Unknown theme "${themeName}", falling back to 'generic'. ` +
      `Available themes: ${Object.keys(THEME_CLASS_MAP).join(', ')}`
    )
  }
  
  return result
}

// ===== WIDTH RESOLUTION =====

/**
 * Parse responsive width configuration
 * @param {number|string|object} width - Width configuration
 * @param {number} viewportWidth - Current viewport width
 * @returns {string} Resolved width as a string (e.g., '400px', '100vw', 'inherit')
 */
export function parseResponsiveWidth(width, viewportWidth) {
  if (typeof width === 'number') return `${width}px`
  
  if (typeof width === 'string') {
    if (width === 'inherit') return 'inherit'
    return width
  }
  
  if (width && typeof width === 'object') {
    let selected = width.default || '400px'
    
    // Process rules in order
    for (const [rule, val] of Object.entries(width)) {
      if (rule === 'default') continue
      
      if (rule.startsWith('<')) {
        const max = Number(rule.slice(1))
        if (viewportWidth < max) selected = val
      } else if (rule.startsWith('>')) {
        const min = Number(rule.slice(1))
        if (viewportWidth > min) selected = val
      }
    }
    
    return selected
  }
  
  return '400px'
}

/**
 * Compute actual width in pixels from a width specification
 * @param {string} widthSpec - Width specification ('inherit', 'NNpx', 'NN%', 'NNvw', or number)
 * @param {HTMLElement} anchorEl - Anchor element (for 'inherit' mode)
 * @param {HTMLElement|null} referenceEl - Reference element for parent/ancestor modes
 * @param {number} viewportWidth - Current viewport width
 * @returns {number} Width in pixels
 */
export function computeWidthPx(widthSpec, anchorEl, referenceEl = null, viewportWidth) {
  // SSR-safe: viewportWidth must be provided by caller, no default window access
  // Fallback only used if caller doesn't provide (shouldn't happen in normal usage)
  if (viewportWidth === undefined || viewportWidth === null) {
    viewportWidth = SSR_FALLBACK_VIEWPORT_WIDTH
  }
  
  // SSR-safe: Guard DOM access
  if (typeof document === 'undefined' || !anchorEl) {
    // Fallback for SSR or missing anchor
    if (widthSpec === 'inherit') {
      return SSR_FALLBACK_DEFAULT_WIDTH // Default width if can't inherit
    }
    // Continue with other calculations that don't require DOM
  }
  
  if (widthSpec === 'inherit') {
    // SSR-safe: Only call getBoundingClientRect if DOM is available
    // Note: In ideal architecture, component would call getBoundingClientRect and pass rect data
    if (typeof document !== 'undefined' && anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
      try {
        const rect = anchorEl.getBoundingClientRect()
        return rect.width
      } catch (e) {
        // Fallback if getBoundingClientRect fails
        return SSR_FALLBACK_DEFAULT_WIDTH
      }
    }
    return SSR_FALLBACK_DEFAULT_WIDTH // Fallback for SSR
  }
  
  // If we have a reference element (parent/ancestor mode), use it for % calculations
  if (referenceEl && widthSpec.includes('%')) {
    // SSR-safe: Only call getBoundingClientRect if DOM is available
    if (typeof document !== 'undefined' && typeof referenceEl.getBoundingClientRect === 'function') {
      try {
        const n = Number(widthSpec.replace('%', ''))
        const refRect = referenceEl.getBoundingClientRect()
        return Math.max(0, (refRect.width * n) / 100)
      } catch (e) {
        // Fallback if getBoundingClientRect fails
        const n = Number(widthSpec.replace('%', ''))
        return Math.max(0, (viewportWidth * n) / 100)
      }
    }
    // Fallback to viewport-based calculation for SSR
    const n = Number(widthSpec.replace('%', ''))
    return Math.max(0, (viewportWidth * n) / 100)
  }
  
  if (widthSpec.endsWith('vw')) {
    const n = Number(widthSpec.replace('vw', ''))
    return Math.max(0, (viewportWidth * n) / 100)
  }
  
  if (widthSpec.endsWith('%')) {
    const n = Number(widthSpec.replace('%', ''))
    return Math.max(0, (viewportWidth * n) / 100)
  }
  
  if (widthSpec.endsWith('px')) {
    return Number(widthSpec.replace('px', ''))
  }
  
  const asNum = Number(widthSpec)
  return isNaN(asNum) ? 400 : asNum
}

// Cache for warned selectors to avoid console spam
// This Set persists across all resolveWidth calls and all dropdown instances,
// ensuring each selector only warns once even if used by multiple dropdowns
// or called repeatedly during reposition/resize operations
const warnedSelectors = new Set()

/**
 * Resolve width based on width mode (viewport, parent, ancestor)
 * 
 * This is a DOM-bound utility function (not pure) that:
 * - Accesses DOM via anchorEl.closest() and document.querySelector()
 * - Has side effects: logs console.warn when selectors are not found (dev mode only)
 * 
 * @param {object} config - Component configuration
 * @param {HTMLElement} anchorEl - Anchor element
 * @param {number} viewportWidth - Current viewport width
 * @returns {number} Width in pixels
 */
export function resolveWidth(config, anchorEl, viewportWidth) {
  // SSR-safe: viewportWidth must be provided by caller, no default window access
  // Fallback only used if caller doesn't provide (shouldn't happen in normal usage)
  if (viewportWidth === undefined || viewportWidth === null) {
    viewportWidth = SSR_FALLBACK_VIEWPORT_WIDTH
  }
  if (typeof document === 'undefined' || !anchorEl) {
    return viewportWidth || SSR_FALLBACK_DEFAULT_WIDTH
  }
  
  const widthSpec = parseResponsiveWidth(config.width, viewportWidth)
  
  let referenceEl = null
  
  // Handle parent/ancestor width modes
  // SSR-safe: Only use DOM methods if document is available
  // Note: In ideal architecture, component would query DOM and pass referenceEl directly
  if (typeof document !== 'undefined' && anchorEl) {
    if (config.widthMode === 'parent' && config.widthParentSelector) {
      // SSR-safe: closest() requires DOM, guard it
      if (typeof anchorEl.closest === 'function') {
        try {
          referenceEl = anchorEl.closest(config.widthParentSelector)
        } catch (e) {
          // closest() failed, referenceEl remains null
          referenceEl = null
        }
      }
      if (!referenceEl) {
        // Deduplicate warnings per selector to avoid console spam
        // This Set persists across all resolveWidth calls, so each selector only warns once
        const selectorKey = `parent:${config.widthParentSelector}`
        if (!warnedSelectors.has(selectorKey)) {
          warnedSelectors.add(selectorKey)
          // Only warn in development to avoid production console noise
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[DropdownHandler] Parent selector "${config.widthParentSelector}" not found, falling back to viewport mode`)
          }
        }
      }
    } else if (config.widthMode === 'ancestor' && config.widthAncestorSelector) {
      // SSR-safe: querySelector requires document
      // Note: In ideal architecture, component would query DOM and pass referenceEl directly
      if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
        try {
          referenceEl = document.querySelector(config.widthAncestorSelector)
        } catch (e) {
          // querySelector failed, referenceEl remains null
          referenceEl = null
        }
      }
      if (!referenceEl) {
        // Deduplicate warnings per selector to avoid console spam
        const selectorKey = `ancestor:${config.widthAncestorSelector}`
        if (!warnedSelectors.has(selectorKey)) {
          warnedSelectors.add(selectorKey)
          // Only warn in development to avoid production console noise
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[DropdownHandler] Ancestor selector "${config.widthAncestorSelector}" not found, falling back to viewport mode`)
          }
        }
      }
    }
  }
  
  return computeWidthPx(widthSpec, anchorEl, referenceEl, viewportWidth)
}

// ===== HEIGHT RESOLUTION =====

/**
 * Compute height in pixels or CSS string
 * 
 * This is a DOM-bound utility function (not pure) that:
 * - Accesses DOM via anchorEl.getBoundingClientRect() when height is '100%'
 * 
 * All '100%' height logic is centralized here to avoid duplication between helper and component.
 * The function handles both initial estimation and placement-aware calculation.
 * 
 * @param {number|string|null} height - Height configuration
 * @param {HTMLElement} anchorEl - Anchor element
 * @param {number} offset - Offset from anchor
 * @param {number} viewportHeight - Current viewport height (required for '100%' mode)
 * @param {object|null} placementInfo - Optional placement information for accurate '100%' calculation
 * @param {number|null} placementInfo.top - Top position in viewport coordinates (for placement-aware calculation)
 * @param {boolean|null} placementInfo.flipped - Whether dropdown is flipped above anchor
 * @param {DOMRect|null} placementInfo.anchorRect - Anchor bounding rect (if already computed)
 * @returns {string|null} Height as CSS value or null
 */
export function resolveHeight(height, anchorEl, offset = 8, viewportHeight, placementInfo = null) {
  // SSR-safe: viewportHeight must be provided by caller, no default window access
  // Fallback only used if caller doesn't provide (shouldn't happen in normal usage)
  if (viewportHeight === undefined || viewportHeight === null) {
    viewportHeight = SSR_FALLBACK_VIEWPORT_HEIGHT
  }
  if (!height) return null
  
  if (typeof height === 'number') return `${height}px`
  
  if (typeof height === 'string') {
    if (height === '100%') {
      // Centralized '100%' height calculation - handles all cases here
      // All logic for '100%' height is in this function to avoid duplication
      
      // Backward compatibility: handle old API where topPosition was passed as number
      let topPosition = null
      let flipped = null
      let anchorRect = null
      
      if (placementInfo !== null && placementInfo !== undefined) {
        if (typeof placementInfo === 'number') {
          // Old API: placementInfo is a number (topPosition)
          topPosition = placementInfo
        } else if (typeof placementInfo === 'object') {
          // New API: placementInfo is an object with placement information
          topPosition = placementInfo.top
          flipped = placementInfo.flipped
          anchorRect = placementInfo.anchorRect
        }
      }
      
      // Case 1: Placement-aware calculation using provided top position (most accurate)
      // This is used when top position is already calculated (from computeVerticalPosition)
      if (topPosition !== null && topPosition !== undefined) {
        // Height = viewport height - top position - bottom padding (10px)
        // topPosition is in viewport coordinates
        return `${Math.max(0, viewportHeight - topPosition - 10)}px`
      }
      
      // Case 2: Placement-aware calculation using flipped state and anchor rect
      // This is used when we know the placement but haven't calculated top yet
      if (flipped !== null && flipped !== undefined) {
        // SSR-safe: Guard DOM access
        if (!anchorEl || typeof document === 'undefined' || typeof anchorEl.getBoundingClientRect !== 'function') {
          return `${viewportHeight - 20}px`
        }
        try {
          const rect = anchorRect || anchorEl.getBoundingClientRect()
          // Calculate top position based on flipped state
          const topInViewport = flipped
            ? Math.max(0, rect.top - offset)
            : rect.bottom + offset
          // Height = viewport height - top position - bottom padding (10px)
          return `${Math.max(0, viewportHeight - topInViewport - 10)}px`
        } catch (e) {
          // Fallback if getBoundingClientRect fails
          return `${viewportHeight - 20}px`
        }
      }
      
      // Case 3: Initial estimate (before placement is determined)
      // Compute based on available space around anchor
      // SSR-safe: Guard DOM access
      // Note: In ideal architecture, component would call getBoundingClientRect and pass rect data
      if (!anchorEl || typeof document === 'undefined' || typeof anchorEl.getBoundingClientRect !== 'function') {
        return `${viewportHeight - 20}px`
      }
      try {
        const anchorRect = anchorEl.getBoundingClientRect()
        const spaceBelow = viewportHeight - (anchorRect.bottom + offset)
        const spaceAbove = anchorRect.top - offset
        return `${Math.min(viewportHeight - 20, Math.max(spaceBelow, spaceAbove))}px`
      } catch (e) {
        // Fallback if getBoundingClientRect fails
        return `${viewportHeight - 20}px`
      }
    }
    return height
  }
  
  return null
}

// ===== HORIZONTAL POSITIONING =====

/**
 * Compute horizontal position with incremental alignment logic (thresholds for partial fits)
 * Enhanced to prefer partial fits over flipping when clipping is minor
 * 
 * @param {string} align - Alignment ('left', 'center', 'right')
 * @param {DOMRect} anchorRect - Anchor element rect
 * @param {number} dropdownWidth - Dropdown width in pixels
 * @param {number} viewportWidth - Current viewport width
 * @param {number} clipThreshold - Maximum clipping in pixels before trying alternative alignment (default: 50px or 20% of width)
 * @returns {object} { left: number, align: string, flipped: boolean } - Returns alignment used and whether it was flipped
 */
export function computeHorizontalPosition(align, anchorRect, dropdownWidth, viewportWidth, clipThreshold = null) {
  // SSR-safe: viewportWidth must be provided by caller, no default window access
  // Fallback only used if caller doesn't provide (shouldn't happen in normal usage)
  if (viewportWidth === undefined || viewportWidth === null) {
    viewportWidth = SSR_FALLBACK_VIEWPORT_WIDTH
  }
  
  // Default threshold: 50px or 20% of dropdown width, whichever is smaller
  // This allows partial fits (e.g., 80% visible) before trying alternative alignment
  if (clipThreshold === null || clipThreshold === undefined) {
    clipThreshold = Math.min(50, dropdownWidth * 0.2)
  }
  
  // Calculate positions for each alignment
  const leftAlign = anchorRect.left
  const rightAlign = anchorRect.right - dropdownWidth
  const centerAlign = anchorRect.left + (anchorRect.width / 2) - (dropdownWidth / 2)
  
  // Calculate clipping amounts for each alignment
  const getClipAmount = (pos) => {
    const leftClip = Math.max(0, -pos)
    const rightClip = Math.max(0, (pos + dropdownWidth) - viewportWidth)
    return Math.max(leftClip, rightClip)
  }
  
  const leftClip = getClipAmount(leftAlign)
  const rightClip = getClipAmount(rightAlign)
  const centerClip = getClipAmount(centerAlign)
  
  // Preference order: try preferred alignment first, then alternatives if severe clipping
  let result = { left: 0, align: align, flipped: false }
  
  if (align === 'left') {
    if (leftClip <= clipThreshold) {
      // Preferred alignment fits with minor clipping
      result.left = leftAlign
      result.align = 'left'
    } else if (rightClip < leftClip && rightAlign >= 0) {
      // Right alignment has less clipping - try it
      result.left = rightAlign
      result.align = 'right'
      result.flipped = true
    } else if (centerClip < leftClip && centerAlign >= 0 && centerAlign + dropdownWidth <= viewportWidth) {
      // Center alignment has less clipping - try it
      result.left = centerAlign
      result.align = 'center'
      result.flipped = true
    } else {
      // Use preferred alignment even with clipping (will be clamped)
      result.left = leftAlign
      result.align = 'left'
    }
  } else if (align === 'right') {
    if (rightClip <= clipThreshold) {
      // Preferred alignment fits with minor clipping
      result.left = rightAlign
      result.align = 'right'
    } else if (leftClip < rightClip && leftAlign >= 0) {
      // Left alignment has less clipping - try it
      result.left = leftAlign
      result.align = 'left'
      result.flipped = true
    } else if (centerClip < rightClip && centerAlign >= 0 && centerAlign + dropdownWidth <= viewportWidth) {
      // Center alignment has less clipping - try it
      result.left = centerAlign
      result.align = 'center'
      result.flipped = true
    } else {
      // Use preferred alignment even with clipping (will be clamped)
      result.left = rightAlign
      result.align = 'right'
    }
  } else { // 'center'
    if (centerClip <= clipThreshold) {
      // Preferred alignment fits with minor clipping
      result.left = centerAlign
      result.align = 'center'
    } else if (leftClip < centerClip && leftAlign >= 0) {
      // Left alignment has less clipping - try it
      result.left = leftAlign
      result.align = 'left'
      result.flipped = true
    } else if (rightClip < centerClip && rightAlign >= 0) {
      // Right alignment has less clipping - try it
      result.left = rightAlign
      result.align = 'right'
      result.flipped = true
    } else {
      // Use preferred alignment even with clipping (will be clamped)
      result.left = centerAlign
      result.align = 'center'
    }
  }
  
  // Last resort: clamp to viewport bounds (ensures dropdown is always visible)
  if (result.left < 0) {
    result.left = 0
  }
  if (result.left + dropdownWidth > viewportWidth) {
    result.left = Math.max(0, viewportWidth - dropdownWidth)
  }
  
  return result
}

// ===== VERTICAL POSITIONING =====

/**
 * Compute vertical position with incremental flip logic (thresholds for partial fits)
 * Enhanced to prefer partial fits over flipping when clipping is minor
 * 
 * @param {string} positionMode - Position mode ('adaptive', 'below', 'above')
 * @param {DOMRect} anchorRect - Anchor element rect
 * @param {number} dropdownHeight - Dropdown height in pixels
 * @param {number} offset - Offset from anchor
 * @param {number} viewportHeight - Current viewport height
 * @param {boolean} flipOnOverflow - Whether to flip when no space
 * @param {number} clipThreshold - Maximum clipping in pixels before flipping (default: 50px or 20% of height)
 * @returns {object} { top: number, placement: 'top'|'bottom', flipped: boolean }
 */
export function computeVerticalPosition(positionMode, anchorRect, dropdownHeight, offset, viewportHeight, flipOnOverflow = true, clipThreshold = null) {
  // SSR-safe: viewportHeight must be provided by caller, no default window access
  // Fallback only used if caller doesn't provide (shouldn't happen in normal usage)
  if (viewportHeight === undefined || viewportHeight === null) {
    viewportHeight = SSR_FALLBACK_VIEWPORT_HEIGHT
  }
  
  // Default threshold: 50px or 20% of dropdown height, whichever is smaller
  // This allows partial fits (e.g., 80% visible) before flipping
  if (clipThreshold === null || clipThreshold === undefined) {
    clipThreshold = Math.min(50, dropdownHeight * 0.2)
  }
  
  const belowTop = anchorRect.bottom + offset
  const aboveTop = anchorRect.top - offset - dropdownHeight
  
  // Force above
  if (positionMode === 'above') {
    return {
      top: aboveTop,
      placement: 'top',
      flipped: false
    }
  }
  
  // Force below
  if (positionMode === 'below') {
    return {
      top: belowTop,
      placement: 'bottom',
      flipped: false
    }
  }
  
  // Adaptive (default behavior) with incremental collision handling
  if (flipOnOverflow) {
    const spaceBelow = viewportHeight - belowTop
    const spaceAbove = anchorRect.top - offset
    
    // Calculate how much would be clipped if we place below
    const clipBelow = Math.max(0, dropdownHeight - spaceBelow)
    
    // Calculate how much would be clipped if we place above
    const clipAbove = Math.max(0, dropdownHeight - spaceAbove)
    
    // Preference order:
    // 1. Try preferred position (below) if clipping is minor (< threshold)
    // 2. Try opposite side if severe clipping on preferred side
    // 3. Choose side with less clipping as last resort
    
    if (clipBelow <= clipThreshold && spaceBelow > 0) {
      // Preferred position (below) fits with minor clipping - use it
      return {
        top: belowTop,
        placement: 'bottom',
        flipped: false
      }
    }
    
    // Severe clipping below - try opposite side if it fits better
    if (clipBelow > clipThreshold && spaceAbove >= dropdownHeight) {
      // Opposite side (above) has full space - flip to it
      return {
        top: aboveTop,
        placement: 'top',
        flipped: true
      }
    }
    
    // Both sides have issues - choose the one with less clipping
    if (clipAbove < clipBelow && spaceAbove > 0) {
      // Above has less clipping - use it
      return {
        top: aboveTop,
        placement: 'top',
        flipped: true
      }
    }
    
    // Below has less clipping (or equal) - use it even with clipping
    // This will be clamped later in the component
    return {
      top: belowTop,
      placement: 'bottom',
      flipped: false
    }
  }
  
  // Default: below (no flip logic)
  return {
    top: belowTop,
    placement: 'bottom',
    flipped: false
  }
}

// ===== TOOLTIP SIDE PLACEMENT =====

/**
 * Compute tooltip position with side placement and fallback logic
 * @param {string} placement - Primary placement ('top-right', 'top-left', 'right', 'left', etc.)
 * @param {Array<string>} fallbackOrder - Fallback placements to try
 * @param {DOMRect} anchorRect - Anchor element rect
 * @param {number} width - Dropdown width
 * @param {number} height - Dropdown height
 * @param {number} offset - Offset from anchor
 * @param {object} viewport - { width, height }
 * @returns {object} { left, top, placement: string, collision: boolean }
 */
export function computeTooltipPosition(placement, fallbackOrder, anchorRect, width, height, offset, viewport) {
  // SSR-safe: viewport must be provided by caller, no default window access
  // Fallback only used if caller doesn't provide (shouldn't happen in normal usage)
  if (!viewport || typeof viewport !== 'object') {
    viewport = { width: SSR_FALLBACK_VIEWPORT_WIDTH, height: SSR_FALLBACK_VIEWPORT_HEIGHT }
  }
  const placements = [placement, ...(fallbackOrder || [])]
  
  for (const p of placements) {
    const result = tryTooltipPlacement(p, anchorRect, width, height, offset, viewport)
    if (!result.collision) {
      return result
    }
  }
  
  // If all fail, use the first one anyway
  return tryTooltipPlacement(placement, anchorRect, width, height, offset, viewport)
}

/**
 * Try a specific tooltip placement
 * @private
 */
function tryTooltipPlacement(placement, anchorRect, width, height, offset, viewport) {
  let left = 0
  let top = 0
  
  switch (placement) {
    case 'top-right':
      top = anchorRect.top - offset - height
      left = anchorRect.right - width
      break
      
    case 'top-left':
      top = anchorRect.top - offset - height
      left = anchorRect.left
      break
      
    case 'bottom-right':
      top = anchorRect.bottom + offset
      left = anchorRect.right - width
      break
      
    case 'bottom-left':
      top = anchorRect.bottom + offset
      left = anchorRect.left
      break
      
    case 'right':
      left = anchorRect.right + offset
      top = anchorRect.top + (anchorRect.height / 2) - (height / 2)
      break
      
    case 'left':
      left = anchorRect.left - offset - width
      top = anchorRect.top + (anchorRect.height / 2) - (height / 2)
      break
      
    case 'top':
      top = anchorRect.top - offset - height
      left = anchorRect.left + (anchorRect.width / 2) - (width / 2)
      break
      
    case 'bottom':
      top = anchorRect.bottom + offset
      left = anchorRect.left + (anchorRect.width / 2) - (width / 2)
      break
      
    default:
      // Default to bottom
      top = anchorRect.bottom + offset
      left = anchorRect.left + (anchorRect.width / 2) - (width / 2)
  }
  
  // Check for collision
  const collision = (
    left < 0 ||
    top < 0 ||
    left + width > viewport.width ||
    top + height > viewport.height
  )
  
  return { left, top, placement, collision }
}

// ===== COLLISION DETECTION =====

/**
 * Detect collision and return detailed collision info with clipping amounts
 * Enhanced to support incremental collision handling (thresholds, partial fits)
 * 
 * @param {object} rect - { left, top, width, height }
 * @param {object} viewport - { width, height }
 * @returns {object} { 
 *   horizontal: boolean, 
 *   vertical: boolean, 
 *   details: object,
 *   amounts: { left: number, right: number, top: number, bottom: number } - clipping amounts in pixels
 *   horizontalAmount: number - total horizontal clipping (max of left/right)
 *   verticalAmount: number - total vertical clipping (max of top/bottom)
 * }
 */
export function detectCollision(rect, viewport) {
  // SSR-safe: viewport must be provided by caller, no default window access
  // Fallback only used if caller doesn't provide (shouldn't happen in normal usage)
  if (!viewport || typeof viewport !== 'object') {
    viewport = { width: SSR_FALLBACK_VIEWPORT_WIDTH, height: SSR_FALLBACK_VIEWPORT_HEIGHT }
  }
  
  // Calculate clipping amounts (how much is clipped in pixels)
  const leftClip = Math.max(0, -rect.left)
  const rightClip = Math.max(0, (rect.left + rect.width) - viewport.width)
  const topClip = Math.max(0, -rect.top)
  const bottomClip = Math.max(0, (rect.top + rect.height) - viewport.height)
  
  const horizontalLeft = rect.left < 0
  const horizontalRight = rect.left + rect.width > viewport.width
  const verticalTop = rect.top < 0
  const verticalBottom = rect.top + rect.height > viewport.height
  
  return {
    horizontal: horizontalLeft || horizontalRight,
    vertical: verticalTop || verticalBottom,
    details: {
      left: horizontalLeft,
      right: horizontalRight,
      top: verticalTop,
      bottom: verticalBottom
    },
    amounts: {
      left: leftClip,
      right: rightClip,
      top: topClip,
      bottom: bottomClip
    },
    horizontalAmount: Math.max(leftClip, rightClip),
    verticalAmount: Math.max(topClip, bottomClip)
  }
}

// ===== VIEWPORT UTILITIES =====

/**
 * Get current viewport dimensions
 * 
 * This is a DOM-bound utility function (not pure) that:
 * - Accesses window.innerWidth, window.innerHeight, and document.documentElement
 * - Returns fallback values in SSR/Node environments
 * 
 * SSR-safe: Returns fallback values if window/document are not available
 * 
 * @returns {object} { width, height }
 */
export function getViewportSize() {
  // SSR-safe: Check for window/document before accessing
  if (typeof window === 'undefined') {
    return { width: SSR_FALLBACK_VIEWPORT_WIDTH, height: SSR_FALLBACK_VIEWPORT_HEIGHT }
  }
  
  // Safely access window properties with fallbacks
  let width = SSR_FALLBACK_VIEWPORT_WIDTH
  let height = SSR_FALLBACK_VIEWPORT_HEIGHT
  
  // Access window.innerWidth with proper guards
  if (typeof window.innerWidth === 'number') {
    width = window.innerWidth
  } else if (typeof document !== 'undefined' && document.documentElement && typeof document.documentElement.clientWidth === 'number') {
    width = document.documentElement.clientWidth
  }
  
  // Access window.innerHeight with proper guards
  if (typeof window.innerHeight === 'number') {
    height = window.innerHeight
  } else if (typeof document !== 'undefined' && document.documentElement && typeof document.documentElement.clientHeight === 'number') {
    height = document.documentElement.clientHeight
  }
  
  return { width, height }
}

/**
 * Check if viewport is mobile based on breakpoint
 * 
 * This is a DOM-bound utility function (not pure) that accesses window via getViewportSize().
 * It's called reactively from DropdownHandler on each reposition, so changes
 * to mobileBreakpoint in config will be reflected on the next reposition.
 * 
 * IMPORTANT: This is a PER-CONFIG function, NOT a global setting.
 * Each dropdown instance can have its own mobile breakpoint, allowing different
 * dropdowns to respond differently to viewport size changes.
 * 
 * Behavior:
 * - Evaluated on-demand (not a reactive computed)
 * - Called from repositionInternal() on each reposition
 * - Changes to mobileBreakpoint while dropdown is open take effect on next reposition
 * - Watched for changes - triggers reposition when modified while dropdown is open
 * 
 * @param {number} breakpoint - Mobile breakpoint in pixels (default: 640)
 * @returns {boolean} True if viewport width is less than breakpoint
 * 
 * @example
 * // Per-config breakpoint (evaluated on each reposition)
 * isMobile(640) // Standard mobile breakpoint
 * isMobile(768) // Tablet breakpoint
 * 
 * @example
 * // Used in DropdownHandler repositionInternal()
 * const mobile = isMobile(config.value.mobileBreakpoint)
 * if (mobile && config.value.snapEdge) {
 *   // Apply mobile-specific snap behavior
 * }
 * 
 * @note This is NOT a reactive computed - it's evaluated on-demand.
 * If you need reactive mobile detection, create a computed in the component.
 * 
 * @note This function accesses window via getViewportSize(), so it's not pure.
 * For testing, consider mocking getViewportSize() or using a test helper.
 */
export function isMobile(breakpoint = 640) {
  // SSR-safe: getViewportSize handles window/document checks
  const viewport = getViewportSize()
  return viewport.width < breakpoint
}

// ===== PURE LAYOUT COMPUTATION =====

/**
 * Pure function to compute dropdown layout (position, size, collision) from inputs
 * 
 * This is a testable "pure core" that separates positioning logic from DOM reads/writes.
 * All inputs are provided as parameters - no DOM access, no side effects, no reactive refs.
 * 
 * @param {object} anchorRect - Anchor element bounding rect { left, top, right, bottom, width, height }
 * @param {object} dropdownSize - Dropdown dimensions { width, height } in pixels
 * @param {object} viewport - Viewport dimensions { width, height } in pixels
 * @param {object} config - Positioning configuration object
 * @param {string} config.align - Horizontal alignment ('left' | 'center' | 'right')
 * @param {string} config.positionMode - Vertical position mode ('adaptive' | 'below' | 'above')
 * @param {number} config.offset - Offset from anchor in pixels
 * @param {boolean} config.flipOnOverflow - Whether to flip when no space
 * @param {string|null} config.tooltipPlacement - Tooltip placement (null for regular dropdown)
 * @param {Array<string>|null} config.tooltipFallbackOrder - Tooltip fallback placements
 * @param {string|null} config.snapEdge - Snap to edge ('left' | 'right' | null)
 * @param {string} config.widthMode - Width mode ('viewport' | 'parent' | 'ancestor')
 * @param {string|number|object} config.width - Width configuration
 * @param {string|number|null} config.height - Height configuration
 * @param {number} config.mobileBreakpoint - Mobile breakpoint in pixels
 * @param {object} options - Additional options
 * @param {object} options.tooltipOriginOffset - Offset for tooltip normalization { left, top }
 * @param {object|null} options.parentRect - Parent element rect for width calculations
 * @param {boolean} options.mobile - Whether viewport is mobile (for snapEdge)
 * @returns {object} Layout result {
 *   top: number,
 *   left: number,
 *   maxWidth: number|null,
 *   maxHeight: string|null,
 *   alignmentUsed: string,
 *   flipped: boolean,
 *   placement: string,
 *   collision: { horizontal: boolean, vertical: boolean, details: object, amounts: object },
 *   snappedEdge: string|null
 * }
 */
export function computeDropdownLayout(anchorRect, dropdownSize, viewport, config, options = {}) {
  const {
    tooltipOriginOffset = { left: 0, top: 0 },
    parentRect = null,
    mobile = false
  } = options

  const offset = Number(config.offset || 0)
  const { width: ddWidth, height: ddHeight } = dropdownSize

  let left = 0
  let top = 0
  let finalPlacement = 'bottom'
  let flipped = false
  let snappedEdge = null
  let collision = { horizontal: false, vertical: false, details: {}, amounts: {} }
  let alignmentUsed = config.align || 'center'

  // Mobile snap edge detection
  if (mobile && config.snapEdge) {
    snappedEdge = config.snapEdge
  }

  // Tooltip placement path
  if (config.tooltipPlacement) {
    const result = computeTooltipPosition(
      config.tooltipPlacement,
      config.tooltipFallbackOrder,
      anchorRect,
      ddWidth,
      ddHeight,
      offset,
      viewport
    )

    // Translate back to viewport coordinates if we normalized to a scroll container
    left = result.left + tooltipOriginOffset.left
    top = result.top + tooltipOriginOffset.top
    finalPlacement = result.placement

    const collisionResult = detectCollision({ left, top, width: ddWidth, height: ddHeight }, viewport)
    collision = collisionResult

    // Clamp to viewport
    if (left < 0) left = 0
    if (left + ddWidth > viewport.width) left = Math.max(0, viewport.width - ddWidth)
    if (top < 0) top = 0
    if (top + ddHeight > viewport.height) top = Math.max(0, viewport.height - ddHeight)
  } else {
    // Regular dropdown positioning path

    // Horizontal positioning
    if (parentRect && config.widthMode === 'parent') {
      const widthSpec = typeof config.width === 'string' ? config.width : String(config.width)
      if (widthSpec.includes('%')) {
        // Parent width mode with percentage - align to parent
        left = parentRect.left
        if (left < 0) left = 0
        if (left + ddWidth > viewport.width) left = Math.max(0, viewport.width - ddWidth)
      } else {
        // Parent width mode but not percentage - use normal alignment
        const horizResult = computeHorizontalPosition(config.align, anchorRect, ddWidth, viewport.width)
        left = horizResult.left
        alignmentUsed = horizResult.align
        if (horizResult.flipped) {
          collision.horizontal = true
        }
      }
    } else {
      // Normal horizontal positioning
      const horizResult = computeHorizontalPosition(config.align, anchorRect, ddWidth, viewport.width)
      left = horizResult.left
      alignmentUsed = horizResult.align
      if (horizResult.flipped) {
        collision.horizontal = true
      }
    }

    // Apply snap edge
    if (snappedEdge === 'left') left = 0
    if (snappedEdge === 'right') left = Math.max(0, viewport.width - ddWidth)

    // Check if final position differs from computed (e.g., due to snapEdge) to detect collision
    const originalLeft = left
    if (left < 0) left = 0
    if (left + ddWidth > viewport.width) left = Math.max(0, viewport.width - ddWidth)

    if (left !== originalLeft) {
      collision.horizontal = true
    }

    // Vertical positioning
    const vertResult = computeVerticalPosition(
      config.positionMode,
      anchorRect,
      ddHeight,
      offset,
      viewport.height,
      config.flipOnOverflow
    )

    top = vertResult.top
    finalPlacement = vertResult.placement
    flipped = vertResult.flipped

    if (flipped) {
      collision.vertical = true
    }

    // Detect collision for vertical positioning
    const vertCollision = detectCollision({ left, top, width: ddWidth, height: ddHeight }, viewport)
    collision = {
      horizontal: collision.horizontal || vertCollision.horizontal,
      vertical: collision.vertical || vertCollision.vertical,
      details: vertCollision.details,
      amounts: vertCollision.amounts
    }
  }

  // Calculate maxWidth if configured
  let maxWidth = null
  if (config.maxWidth) {
    let maxW = config.maxWidth
    if (typeof maxW === 'number') maxW = `${maxW}px`
    maxWidth = `min(${maxW}, ${viewport.width}px)`
  }

  // Calculate maxHeight for '100%' height mode (needs placement info)
  let maxHeight = null
  if (config.height === '100%') {
    // For '100%' height, we need to recalculate after placement is determined
    // This is a simplified calculation - the component will handle the full recalculation
    // with placement info if needed
    const spaceBelow = viewport.height - (anchorRect.bottom + offset)
    const spaceAbove = anchorRect.top - offset
    const availableSpace = flipped ? spaceAbove : spaceBelow
    maxHeight = `${Math.max(0, availableSpace - 10)}px` // 10px bottom padding
  }

  return {
    top,
    left,
    maxWidth,
    maxHeight,
    alignmentUsed,
    flipped,
    placement: finalPlacement,
    collision,
    snappedEdge
  }
}

