<!-- ====================== BasePopup.vue ======================
A single, reusable Vue 3 SFC that handles BOTH centered popups and slide-ins.
- Teleports to <body>
- Shared overlay (singleton) with stacking
- Responsive width/height maps using your schema
- Effects: instant, fade, scale, slideTopFade (popup); translate for slide-in
- Focus trap, Esc-to-close, body scroll lock
- Events: DOM CustomEvents + Vue emits, with detailed flags in event.detail
- Data-attribute close buttons: [data-popup-close], [data-slideIn-close]
- Loader via CONFIG-SPECIFIED COMPONENT (no built-in loader markup)
- Allows custom classes and attributes on the container
- Defaults per your specs (close is instant; popup default height is 500px; slide-in from left)
- NEW: Optional scrollable content with hidden scrollbar
================================================================= -->
<template>
  <Teleport :to="props.teleportTo || 'body'" :disabled="cfg.isAbsolute">
    <!-- Local overlay for absolute popups to avoid dimming whole screen -->
    <div 
      v-if="isPanelVisible && cfg.isAbsolute && cfg.shouldShowOverlay"
      class="absolute inset-0 bg-black/5 backdrop-blur-[7.5px] z-[1999] cursor-pointer"
      @click="handleEscapeKey"
    ></div>

    <!-- Panel wrapper (modal container) -->
    <div
      v-show="isPanelVisible"
      ref="popupPanelRef"
      :role="ariaRole"
      :aria-modal="isModal ? 'true' : undefined"
      :tabindex="isModal ? -1 : undefined"
      :class="containerClassList"
      v-bind="containerBindAttrs"
      @keydown.esc.prevent.stop="handleEscapeKey"
      @click.stop
      class="relative"
    >
      <!-- Optional loader (rendered via config.loader.component) -->
      <div
        v-if="isLoading"
        class="pointer-events-none"
        style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:9999; background:rgba(0,0,0,0.1);"
      >
        <component
          v-if="loaderComponent"
          :is="loaderComponent"
          v-bind="loaderProps"
          :data-loader-position="loaderPosition"
        />
        <div v-else class="rounded-lg shadow-lg px-6 py-4 text-center border-2 border-blue-300">
          <div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div class="text-sm font-medium text-gray-700">Loading...</div>
        </div>
      </div>

      <!-- Content slot -->
      <div
        ref="popupContentRef"
        :class="contentClassList"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

/**
 * BasePopup.vue
 * Requirements satisfied:
 *  - Vue 3 + <script setup>, JS
 *  - Shared overlay & stacking via composable
 *  - Config schema preserved (width/height maps with "<", "A-B", ">", "default")
 *  - Popup positions: center-center (default), top-center, or full page (when width/height resolve to 100%)
 *  - Slide-in: default from left; respects offset; pins to edge unless offset set
 *  - Close on outside clicks closes the MOST RECENT panel (top of stack), subsequent outside clicks close lower ones in turn
 *  - Default close is INSTANT; popup default height 500px; slide-in height 100%
 *  - Data-attribute close buttons supported inside content
 *  - Custom classes & attributes on container via config.containerClass / config.containerAttrs
 *  - Validate presence before acting; throw with clear console error (as requested)
 *  - Events carry flags and metadata for custom logic
 *  - NEW: Optional scrollable content with hidden scrollbar (default: true)
 */

import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { usePopupStack } from '../../../composables/usePopupStack.js';

const PANEL_EVENT_PHASE_OPEN = "open";
const PANEL_EVENT_PHASE_CLOSE = "close";

const props = defineProps({
  /**
   * Full config object (schema preserved)
   * Example keys:
   * {
   *   actionType: "popup" | "slideIn",
   *   speed, effect, customEffect, closeSpeed, closeEffect,
   *   shouldShowOverlay, shouldCloseOnOutsideClick, shouldLockBodyScroll, zIndex, forceZIndex,
   *   width: {...}, height: {...},
   *   from: "left" | "right" | "top" | "bottom",
   *   offset: "0px" | "30px" | number,
   *   resetOnClose, customClass, containerClass, containerAttrs,
   *   shouldCloseOnEscape, onOpen, onClose,
   *   position: "center" | "top-center" | "full" (popup only),
   *   loader: { component: <VueComponent>, props: {...}, position: "center"|"top-center"|... },
   *   scrollable: true | false (NEW: makes content scrollable with hidden scrollbar)
   * }
   */
  config: {
    type: Object,
    required: true
  },
  /**
   * v-model control for visibility
   */
  modelValue: {
    type: Boolean,
    default: false
  },
  /**
   * Optional loading state to show loader component
   */
  isLoading: {
    type: Boolean,
    default: false
  },
  /**
   * Target for teleportation. Defaults to body.
   */
  teleportTo: {
    type: String,
    default: 'body'
  }
});

const emit = defineEmits([
  'update:modelValue',
  'opened',
  'closed'
]);

// -------------------- Defaults (per your spec) --------------------
const defaults = {
  actionType: 'popup',
  speed: '200ms',
  effect: 'ease',
  customEffect: 'scale', // popup default
  closeSpeed: '0ms',     // default close is INSTANT
  closeEffect: 'instant',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockScroll: true,
  zIndex: 2000,
  forceZIndex: null,
  width: { default: '600px' },
  height: { default: '500px' }, // popup default height
  from: 'left', // slide-in default
  offset: '0px',
  resetOnClose: true,
  customClass: '',
  containerClass: '',
  containerAttrs: {},
  shouldCloseOnEscape: true,
  position: 'center', // popup: center | top-center | full (inferred if width/height=100%)
  scrollable: true ,// NEW: default scrollable with hidden scrollbar
  verticalAlign: 'stretch',
  isAbsolute: false // NEW: Support for absolute positioning within relative parent
};

// -------------------- State & Refs --------------------
const popupPanelRef = ref(null);
const popupContentRef = ref(null);
const isPanelVisible = ref(false);
const currentZIndex = ref(defaults.zIndex);

const {
  registerPanel,
  unregisterPanel,
  bringToFront,
  setOverlayActive,
  setOverlayVisible,
  setOverlayZ,
  overlayClick,
  bodyScrollLock,
} = usePopupStack();

// -------------------- Helpers --------------------
const cfg = computed(() => ({ ...defaults, ...(props.config || {}) }));

function assertPopupShellInvariant(msg) {
  console.error(`[BasePopup] ${msg}`);
  throw new Error(msg);
}

function resolveResponsive(value) {
  if (value == null) return value;
  if (typeof value !== 'object') {
    return (typeof value === 'string') ? value.trim().toLowerCase() : value;
  }
  const w = window.innerWidth;
  const fallback = value.default ?? Object.values(value)[0];
  let matchedBreakpointValue = null;

  for (const key in value) {
    if (key === 'default') continue;
    if (key.startsWith('<')) {
      const breakpointWidthLimit = parseInt(key.slice(1), 10);
      if (w < breakpointWidthLimit) matchedBreakpointValue = value[key];
    } else if (key.startsWith('>')) {
      const breakpointWidthLimit = parseInt(key.slice(1), 10);
      if (w > breakpointWidthLimit) matchedBreakpointValue = value[key];
    } else if (key.includes('-')) {
      const [min, max] = key.split('-').map(n => parseInt(n, 10));
      if (w >= min && w <= max) matchedBreakpointValue = value[key];
    }
  }
  const resolved = (matchedBreakpointValue ?? fallback);
  return (typeof resolved === 'string') ? resolved.trim().toLowerCase() : resolved;
}

function isInstantOpen() {
  // open animation considered instant if speed === "0ms" OR customEffect === "instant"
  return cfg.value.speed === '0ms' || cfg.value.customEffect === 'instant';
}
function isInstantClose() {
  // close animation considered instant if closeSpeed === "0ms" OR closeEffect === "instant"
  return (cfg.value.closeSpeed ?? cfg.value.speed) === '0ms' || (cfg.value.closeEffect ?? cfg.value.effect) === 'instant';
}

function dispatchDomEvent(name, detail) {
  // Include a "flag" payload for custom logic as requested
  // detail will include: type, mode, isPopup, isSlideIn, zIndex, id (if containerAttrs has data-* id), timestamps, etc.
  const el = popupPanelRef.value;
  if (!el) return;
  const ev = new CustomEvent(name, { bubbles: true, cancelable: false, detail });
  el.dispatchEvent(ev);
}

// -------------------- Derived styles & classes --------------------
const isPopup = computed(() => (cfg.value.actionType || 'popup') === 'popup');
const isSlideIn = computed(() => !isPopup.value);

const ariaRole = computed(() => {
  // Use dialog semantics for modal popups; slide-ins default to complementary unless overlay makes them modal
  if (isPopup.value) return 'dialog';
  return cfg.value.shouldShowOverlay ? 'dialog' : 'complementary';
});
const isModal = computed(() => !!cfg.value.shouldShowOverlay);

// container class: minimal Tailwind; visual decisions mostly from config / inline transforms
const containerClassList = computed(() => {
  const base = [
    'isolate',
    'text-base',
    'antialiased',
    'pointer-events-auto',
    'outline-none'
  ];
  // Hide scrollbar via CSS (for Chrome/Safari — inline styles can't target ::webkit-scrollbar)
  if (cfg.value.scrollable !== false) {
    base.push('scrollbar-hide');
  }
  if (cfg.value.containerClass) {
    if (Array.isArray(cfg.value.containerClass)) base.push(...cfg.value.containerClass);
    else base.push(cfg.value.containerClass);
  }
  if (cfg.value.customClass) base.push(cfg.value.customClass);
  return base;
});

const contentClassList = computed(() => {
  // popupContentRef is a pure pass-through — popupPanelRef itself is the scroll container.
  // Slot content just needs to fill the parent naturally (no height or overflow constraint here).
  return ['w-full'];
});

const containerBindAttrs = computed(() => {
  // Add any data-* or aria-* attributes the caller wants
  const attrs = cfg.value.containerAttrs || {};
  return attrs;
});

// Loader component from config
const loaderComponent = computed(() => (cfg.value.loader && cfg.value.loader.component) ? cfg.value.loader.component : null);
const loaderProps = computed(() => (cfg.value.loader && cfg.value.loader.props) ? cfg.value.loader.props : {});
const loaderPosition = computed(() => (cfg.value.loader && cfg.value.loader.position) ? cfg.value.loader.position : 'center');

// -------------------- Open/Close mechanics --------------------
async function openPanel() {
  validateBeforeOpen();
  isPanelVisible.value = true;

  await nextTick();

  const panel = popupPanelRef.value;
  if (!panel) return;

  // z-index calc & overlay
  const baseZIndex = (cfg.value.forceZIndex != null) ? cfg.value.forceZIndex : (cfg.value.zIndex ?? defaults.zIndex);
  
  // Register with stack after nextTick ensures popupPanelRef.value is not null
  registerPanel(popupPanelRef, {
    onPanelBecameTopMost: () => { 
      registerOverlayClickHandler();
    },
    onPopupStackEmptied: () => {
      setOverlayVisible(false);
      setOverlayActive(false);
      bodyScrollLock(false);
    }
  });

  currentZIndex.value = bringToFront(panel, baseZIndex);
  if (cfg.value.shouldShowOverlay && !cfg.value.isAbsolute) {
    setOverlayZ(currentZIndex.value - 1);
    setOverlayActive(true);
    setOverlayVisible(true);
    registerOverlayClickHandler();
  } else if (cfg.value.shouldCloseOnOutsideClick) {
    // Even without global overlay, set up outside click detection
    registerOverlayClickHandler();
  }


  // Body scroll lock
  if (cfg.value.shouldLockBodyScroll) bodyScrollLock(true);

  // Initial inline styles (positioning + transform off-screen if needed)
  applyPanelInitialStyles(panel);

  // Wire data-close buttons
  attachCloseButtonListeners();

  // Focus handling
  focusPopupPanelElement();

  // Animate open
  requestAnimationFrame(() => {
    applyPanelEnterStyles(panel);
    const completePanelOpen = () => {
      // Add document click listener for outside click detection (only if no overlay)
      if (!cfg.value.shouldShowOverlay && cfg.value.shouldCloseOnOutsideClick) {
        // Use setTimeout to ensure the popup is fully rendered before adding the listener
        setTimeout(() => {
          document.addEventListener('click', handleDocumentClick);
        }, 100);
      }
      
      // Dispatch events with flags
      const detail = buildEventDetail(PANEL_EVENT_PHASE_OPEN);
      const domName = isPopup.value ? (cfg.value.openDomEventName || 'popup:open') : (cfg.value.openDomEventName || 'slideIn:open');
      dispatchDomEvent(domName, detail);
      emit('opened', detail);
    };
    if (isInstantOpen()) completePanelOpen();
    else panel.addEventListener('transitionend', completePanelOpen, { once: true });
  });
}

function closePanel() {
  const panel = popupPanelRef.value;
  if (!panel) return;

  applyPanelLeaveStyles(panel);

  const completePanelClose = () => {
    // Reset styles if requested
    if (cfg.value.resetOnClose) {
      panel.removeAttribute('style');
      if (cfg.value.customClass) {
        // nothing else to remove; customClass is kept as class (per spec)
      }
    }
    isPanelVisible.value = false;

    // Unlock scroll if this panel was locking it
    if (cfg.value.shouldLockBodyScroll) bodyScrollLock(false);

    // Remove document click listener if it was added
    if (!cfg.value.shouldShowOverlay && cfg.value.shouldCloseOnOutsideClick) {
      document.removeEventListener('click', handleDocumentClick);
    }

    // Overlay & scroll unlock managed by stack (only if top-most)
    unregisterPanel(panel);

    // Restore focus to previous element
    restoreFocus();

    // Events
    const detail = buildEventDetail(PANEL_EVENT_PHASE_CLOSE);
    const domName = isPopup.value ? (cfg.value.closeDomEventName || 'popup:close') : (cfg.value.closeDomEventName || 'slideIn:close');
    dispatchDomEvent(domName, detail);
    emit('closed', detail);
  };

  if (isInstantClose()) completePanelClose();
  else panel.addEventListener('transitionend', completePanelClose, { once: true });
}


function closeTopMostPanel() {
  // Only close if THIS panel is top-most; otherwise let the real top-most handle it
  const panel = popupPanelRef.value;
  if (!panel) return;
  if (bringToFront.isTop(panel)) {
    emit('update:modelValue', false);
  }
}

function handleDocumentClick(event) {
  const panel = popupPanelRef.value;
  if (!panel || !isPanelVisible.value) return;
  
  // Check if click is outside the panel
  if (!panel.contains(event.target)) {
    closeTopMostPanel();
  }
}

// -------------------- Validation --------------------
function validateBeforeOpen() {
  // Always validate presence before performing actions
  // Popup always centers (or top-center/full page per config); slide-in requires direction
  // Ensure we have the element refs
  if (!popupPanelRef.value) assertPopupShellInvariant('Panel element not found.');
  if (!popupContentRef.value) assertPopupShellInvariant('Content element not found.');

  // Validate actionType
  const at = cfg.value.actionType || 'popup';
  if (at !== 'popup' && at !== 'slideIn') assertPopupShellInvariant(`Invalid actionType "${at}". Use "popup" or "slideIn".`);

  // Validate effects if provided
  const ce = (cfg.value.customEffect || (isPopup.value ? 'scale' : null));
  if (isPopup.value) {
    const allowed = ['instant', 'fade', 'scale', 'slideTopFade'];
    if (ce && !allowed.includes(ce)) assertPopupShellInvariant(`Unsupported popup customEffect "${ce}". Allowed: ${allowed.join(', ')}`);
  }

  // slide-in direction
  if (isSlideIn.value) {
    const dir = cfg.value.from || 'left';
    const allowedDir = ['left', 'right', 'top', 'bottom'];
    if (!allowedDir.includes(dir)) assertPopupShellInvariant(`Invalid slide-in "from"="${dir}". Allowed: ${allowedDir.join(', ')}`);
  }

  // Validate width/height types
  validateSizeValue(cfg.value.width, 'width');
  validateSizeValue(cfg.value.height, 'height');
}

function validateSizeValue(value, name) {
  if (value == null) return; // null/undefined is allowed
  
  if (typeof value === 'string') {
    // String values: px, %, vw, vh, auto
    const validStringPattern = /^(auto|\d+(\.\d+)?(px|%|vw|vh|rem|em))$/i;
    if (!validStringPattern.test(value.trim())) {
      assertPopupShellInvariant(`Invalid ${name} string value "${value}". Use format like "600px", "50%", "100vw", "100vh", "30rem", "2em", or "auto".`);
    }
  } else if (typeof value === 'number') {
    // Number values: treated as pixels
    if (value < 0) {
      assertPopupShellInvariant(`Invalid ${name} number value "${value}". Must be non-negative.`);
    }
  } else if (typeof value === 'object') {
    // Responsive object: validate each key-value pair
    for (const key in value) {
      if (key === 'default') {
        validateSizeValue(value[key], `${name}.default`);
      } else if (key.startsWith('<') || key.startsWith('>')) {
        // Breakpoint keys like "<640", ">1024"
        const num = parseInt(key.slice(1), 10);
        if (isNaN(num) || num <= 0) {
          assertPopupShellInvariant(`Invalid ${name} breakpoint key "${key}". Use format like "<640" or ">1024".`);
        }
        validateSizeValue(value[key], `${name}.${key}`);
      } else if (key.includes('-')) {
        // Range keys like "301-767"
        const [min, max] = key.split('-').map(n => parseInt(n, 10));
        if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0 || min >= max) {
          assertPopupShellInvariant(`Invalid ${name} range key "${key}". Use format like "301-767" where min < max.`);
        }
        validateSizeValue(value[key], `${name}.${key}`);
      } else {
        assertPopupShellInvariant(`Invalid ${name} object key "${key}". Use "default", "<N", ">N", or "N-M" format.`);
      }
    }
  } else {
    assertPopupShellInvariant(`Invalid ${name} type "${typeof value}". Use string, number, or responsive object.`);
  }
}

// -------------------- Style application --------------------
function applyPanelInitialStyles(panel) {
  const w = resolveResponsive(cfg.value.width);
  const h = resolveResponsive(cfg.value.height);
  const normalizedW = (typeof w === 'string') ? w.trim().toLowerCase() : w;
  const normalizedH = (typeof h === 'string') ? h.trim().toLowerCase() : h;
  const isFullWidth = ['100%', '100vw'].includes(normalizedW);
  const isFullHeight = ['100%', '100vh'].includes(normalizedH);

  // Base styles
  panel.style.position = cfg.value.isAbsolute ? 'absolute' : 'fixed';
  panel.style.zIndex = String(currentZIndex.value);
  panel.style.visibility = 'visible';
  panel.style.width = (normalizedW ?? 'auto');
  panel.style.maxHeight = window.innerHeight + 'px';

  // popupPanelRef IS the scroll container. This means:
  // - Mouse wheel fires on popupPanelRef (or its children) → scrolls popupPanelRef ✓
  // - Arrow keys work because popupPanelRef is focused (tabindex=-1) and overflow-y: auto ✓
  // - Touch scroll works naturally ✓
  // - overscroll-behavior: contain prevents scroll chain leaking to the locked body ✓
  if (cfg.value.scrollable !== false) {
    panel.style.overflowY = 'auto';
    panel.style.overflowX = 'hidden';
    panel.style.overscrollBehavior = 'contain';
    panel.style.scrollbarWidth = 'none';       // Firefox: hide scrollbar
    panel.style.msOverflowStyle = 'none';      // IE/Edge: hide scrollbar
  } else {
    panel.style.overflow = 'visible';
  }

  // --- POPUP LOGIC ---
  if (isPopup.value) {
    // ... (Popup logic same as before) ...
    panel.style.height = (normalizedH ?? '500px'); // Restore popup height logic
    
    const pos = resolveResponsive(cfg.value.position) || 'center';
    if (isFullWidth) { panel.style.left = '0'; panel.style.right = '0'; } else { panel.style.left = '50%'; }
    if (isFullHeight) { panel.style.top = '0'; panel.style.bottom = '0'; } 
    else {
      if (pos === 'top-center') panel.style.top = '0';
      else panel.style.top = '50%';
    }

    const effect = cfg.value.customEffect || 'scale';
    if (isInstantOpen()) {
      panel.style.transition = 'none';
      if (!isFullWidth || !isFullHeight) {
        if (effect === 'slideTopFade') { panel.style.opacity = '1'; panel.style.transform = 'translate(-50%, -50%)'; }
        else if (effect === 'fade') { panel.style.opacity = '1'; }
        else { panel.style.transform = 'translate(-50%, -50%)'; }
      }
    } else {
      if (effect === 'fade') {
        panel.style.opacity = '0';
        panel.style.transition = `opacity ${cfg.value.speed} ${cfg.value.effect}`;
      } else if (effect === 'slideTopFade') {
        panel.style.opacity = '0';
        panel.style.transform = isFullWidth || isFullHeight ? 'none' : 'translate(-50%, -150%)';
        panel.style.transition = `transform ${cfg.value.speed} ${cfg.value.effect}, opacity ${cfg.value.speed} ${cfg.value.effect}`;
      } else {
        panel.style.transform = (isFullWidth || isFullHeight) ? 'none' : (pos === 'top-center' ? 'translate(-50%, 0) scale(0)' : 'translate(-50%, -50%) scale(0)');
        panel.style.transition = `transform ${cfg.value.speed} ${cfg.value.effect}`;
      }
    }
    
    if (!isFullWidth && !isFullHeight && cfg.value.position !== 'top-center') {
      panel.style.transform = panel.style.transform || 'translate(-50%, -50%)';
    }

  } else {
    // --- SLIDE-IN LOGIC (UPDATED FOR BOTTOM ALIGNMENT) ---
    const dir = cfg.value.from || 'left';
    const offset = (typeof cfg.value.offset === 'number') ? `${cfg.value.offset}px` : (cfg.value.offset || '0px');
    const verticalAlign = cfg.value.verticalAlign || 'stretch'; // Get vertical align config

    // LEFT / RIGHT SLIDE-INS
    if (dir === 'left' || dir === 'right') {
      
      // Vertical Alignment Logic
      if (verticalAlign === 'stretch') {
        panel.style.top = '0';
        panel.style.bottom = '0';
        panel.style.height = '100%';
      } else if (verticalAlign === 'bottom') {
        panel.style.top = 'auto';
        panel.style.bottom = '0px'; // Thora gap bottom se
        panel.style.height = (normalizedH ?? 'auto'); // Auto height
      } else if (verticalAlign === 'top') {
        panel.style.top = '20px'; // Thora gap top se
        panel.style.bottom = 'auto';
        panel.style.height = (normalizedH ?? 'auto');
      } else {
        // center
        panel.style.top = '50%';
        panel.style.bottom = 'auto';
        panel.style.height = (normalizedH ?? 'auto');
        // Note: transform will need specific handling below for center, but bottom is priority here
      }

      // Horizontal Logic
      if (dir === 'left') {
        panel.style.left = offset || '0';
        panel.style.right = 'auto';
        panel.style.transform = (verticalAlign === 'center') ? 'translate(-100%, -50%)' : 'translateX(-100%)';
      } else {
        panel.style.right = offset || '0';
        panel.style.left = 'auto';
        panel.style.transform = (verticalAlign === 'center') ? 'translate(100%, -50%)' : 'translateX(100%)';
      }

    } else {
      // TOP / BOTTOM SLIDE-INS (Standard logic)
      panel.style.left = '0';
      panel.style.right = '0';
      if (dir === 'top') {
        panel.style.top = offset || '0';
        panel.style.bottom = 'auto';
        panel.style.transform = 'translateY(-100%)';
      } else {
        panel.style.bottom = offset || '0';
        panel.style.top = 'auto';
        panel.style.transform = 'translateY(100%)';
      }
      panel.style.width = (normalizedW ?? '100%');
      panel.style.height = (normalizedH ?? 'auto');
    }

    if (isInstantOpen()) {
      panel.style.transition = 'none';
    } else {
      // Transition apply
      panel.style.transition = `transform ${cfg.value.speed} ${cfg.value.effect}`;
    }
  }
}

function applyPanelEnterStyles(panel) {
  if (isPopup.value) {
     // ... (Popup logic same as before, no change needed) ...
     // Copy paste old popup enter logic here
     const w = resolveResponsive(cfg.value.width);
     const h = resolveResponsive(cfg.value.height);
     const isFullWidth = ['100%', '100vw'].includes((w || '').toString());
     const isFullHeight = ['100%', '100vh'].includes((h || '').toString());
     const pos = cfg.value.position || 'center';
     const effect = cfg.value.customEffect || 'scale';

     if (effect === 'fade') { panel.style.opacity = '1'; }
     else if (effect === 'slideTopFade') {
       panel.style.opacity = '1';
       panel.style.transform = (isFullWidth || isFullHeight) ? 'none' : (pos === 'top-center' ? 'translate(-50%, 0)' : 'translate(-50%, -50%)');
     } else {
       panel.style.transform = (isFullWidth || isFullHeight) ? 'none' : (pos === 'top-center' ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, -50%) scale(1)');
     }
  } else {
    // --- SLIDE IN ENTER ---
    const verticalAlign = cfg.value.verticalAlign || 'stretch';
    const dir = cfg.value.from || 'left';

    if ((dir === 'left' || dir === 'right') && verticalAlign === 'center') {
       panel.style.transform = 'translate(0, -50%)'; // Keep vertical centering
    } else {
       panel.style.transform = 'translate(0, 0)';
    }
  }
}

function applyPanelLeaveStyles(panel) {
  if (isInstantClose()) {
    panel.style.transition = 'none';
  }
  if (isPopup.value) {
    const effect = cfg.value.customEffect || 'scale';
    if (effect === 'fade') {
      panel.style.opacity = '0';
    } else if (effect === 'slideTopFade') {
      panel.style.opacity = '0';
      panel.style.transform = 'translate(-50%, -150%)';
    } else {
      panel.style.transform = 'translate(-50%, -50%) scale(0)';
    }
  } else {
    const dir = cfg.value.from || 'left';
    if (dir === 'left') panel.style.transform = 'translateX(-100%)';
    else if (dir === 'right') panel.style.transform = 'translateX(100%)';
    else if (dir === 'top') panel.style.transform = 'translateY(-100%)';
    else panel.style.transform = 'translateY(100%)';
  }
}

// -------------------- Focus & keyboard --------------------
let lastActive = null;

function focusPopupPanelElement() {
  lastActive = document.activeElement;
  const el = popupPanelRef.value;
  if (!el) return;
  // Focus the panel itself (tabindex=-1 for modals).
  // This is critical: when popupPanelRef is focused, arrow keys and Page Up/Down
  // scroll the popupPanelRef (which is overflow-y: auto). If we focused a child
  // button instead, arrow keys would do nothing (buttons don't respond to arrow keys).
  el.focus({ preventScroll: true });
}

function restoreFocus() {
  if (lastActive && typeof lastActive.focus === 'function') {
    lastActive.focus({ preventScroll: true });
  }
}

function handleEscapeKey() {
  if (!cfg.value.shouldCloseOnEscape) return;
  closeTopMostPanel();
}

// -------------------- Close buttons --------------------
function attachCloseButtonListeners() {
  const el = popupPanelRef.value;
  if (!el) return;
  const selector = isPopup.value ? '[data-popup-close]' : '[data-slideIn-close]';
  el.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', handleCloseClick, { once: false });
  });
}
function handleCloseClick() {
  closeTopMostPanel();
}

// -------------------- Events detail --------------------
function buildEventDetail(panelEventPhase) {
  return {
    panelEventPhase: panelEventPhase, // "open" | "close"
    type: cfg.value.actionType || 'popup',
    isPopup: isPopup.value,
    isSlideIn: isSlideIn.value,
    zIndex: currentZIndex.value,
    timestamp: Date.now(),
    flags: {
      isInstantOpen: isInstantOpen(),
      isInstantClose: isInstantClose(),
      hasOverlay: !!cfg.value.shouldShowOverlay,
      shouldLockScroll: !!cfg.value.shouldLockBodyScroll,
      scrollable: cfg.value.scrollable !== false
    },
    config: { ...cfg.value }
  };
}

// Helper to register the overlay click handler for THIS panel
function registerOverlayClickHandler() {
  if (cfg.value.shouldCloseOnOutsideClick) {
    overlayClick.setHandler(() => closeTopMostPanel());
  } else if (cfg.value.shouldShowOverlay) {
    // If showing overlay but NOT closing on outside, swallow clicks
    overlayClick.setHandler(() => {});
  }
}

// -------------------- Watchers & lifecycle --------------------
watch(() => props.modelValue, (isModelValueOpen) => {
  if (isModelValueOpen) {
    openPanel();
  } else {
    if (isPanelVisible.value) closePanel();
  }
}, { immediate: false });

watch(() => cfg.value.width, () => {
  if (!isPanelVisible.value) return;
  const panel = popupPanelRef.value;
  if (!panel) return;
  panel.style.width = resolveResponsive(cfg.value.width);
});
watch(() => cfg.value.height, () => {
  if (!isPanelVisible.value) return;
  const panel = popupPanelRef.value;
  if (!panel) return;
  panel.style.height = resolveResponsive(cfg.value.height);
  panel.style.maxHeight = window.innerHeight + 'px';
});

function handleWindowResize() {
  if (!isPanelVisible.value) return;
  const panel = popupPanelRef.value;
  if (!panel) return;
  // Re-apply width/height responsively
  if (cfg.value.width) panel.style.width = resolveResponsive(cfg.value.width);
  if (cfg.value.height) panel.style.height = resolveResponsive(cfg.value.height);
  panel.style.maxHeight = window.innerHeight + 'px';
}

onMounted(() => {
  window.addEventListener('resize', handleWindowResize, { passive: true });
  if (props.modelValue) {
    openPanel();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  // Remove document click listener if it was added
  if (!cfg.value.shouldShowOverlay && cfg.value.shouldCloseOnOutsideClick) {
    document.removeEventListener('click', handleDocumentClick);
  }
  // Ensure scroll unlocked if this panel was locking it
  bodyScrollLock(false);
  const panel = popupPanelRef.value;
  if (panel) unregisterPanel(panel);
});

// -------------------- v-model methods exposed --------------------
defineExpose({
  open: () => { emit('update:modelValue', true); },
  close: () => { emit('update:modelValue', false); },
  toggle: () => { emit('update:modelValue', !props.modelValue); }
});
</script>

<style scoped>
/* No hard-coded visual CSS; Tailwind handles visuals.
   Positioning/transform/opacity are inline because they're dynamic. */
</style>
