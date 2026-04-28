<!-- src/demo/DemoDropdowns.vue - COMPREHENSIVE TEST SUITE
Based on demopageTestsTODO.txt requirements
~80+ specific test cases organized by requirement sections
-->
<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between sticky top-0 bg-white z-50 py-4 border-b">
      <h1 class="text-3xl font-bold">DropdownHandler — Comprehensive Test Suite</h1>
      <RouterLink to="/"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
        ← Back to Home
      </RouterLink>
    </div>

    <!-- SECTION 1: REQUIRED + IDENTITY -->
    <section class="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
      <h2 class="text-2xl font-bold mb-4 text-blue-900">Section 1: Required + Identity</h2>

      <!-- Test 1.1: Anchor required → Missing anchor throws error -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 1.1: Missing Anchor Throws Error</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Console error "[DropdownHandler] Anchor element not found or not
          mounted."</p>
        <button @click="testMissingAnchor" class="px-3 py-2 border rounded bg-red-50">
          Test Missing Anchor (Check Console)
        </button>
        <div v-if="showMissingAnchorTest">
          <DropdownHandler :anchor="null" :config="{ trigger: 'click', width: 300 }">
            <div class="p-4">This should error</div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test 1.2: Teleports to teleportTo (default 'body') -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 1.2: Teleports to Body</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Dropdown renders under &lt;body&gt; element. Inspect DOM to
          verify.</p>
        <p class="text-xs text-gray-500 mb-2 font-mono bg-gray-50 p-2 rounded">
          <strong>Defaults explicitly defined:</strong><br>
          teleportTo: 'body' (default), trigger: 'click', align: 'center', offset: 8,<br>
          flipOnOverflow: true, closeOnOutsideClick: true, toggleOnTriggerClick: true,<br>
          animation: 'none', scrollEnabled: true, hideScrollbars: true, repositionOnScroll: true,<br>
          ariaRole: 'menu', layer: 'dropdown'
        </p>
        <button ref="test12" class="px-3 py-2 border rounded">Open to Test Teleport</button>
        <DropdownHandler :anchor="test12"
          :config="{ 
            trigger: 'click', 
            width: 300, 
            teleportTo: 'body',
            align: 'center',
            offset: 8,
            flipOnOverflow: true,
            closeOnOutsideClick: true,
            toggleOnTriggerClick: true,
            animation: 'none',
            scrollEnabled: true,
            hideScrollbars: true,
            repositionOnScroll: true,
            ariaRole: 'menu',
            layer: 'dropdown',
            style: { class: 'bg-white border rounded shadow-xl' } 
          }">
          <div class="p-4">Inspect DOM: This should be under &lt;body&gt;</div>
        </DropdownHandler>
      </div>

      <!-- Test 1.3: Root attributes -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 1.3: Root Element Attributes</h3>
        <p class="text-sm text-gray-600 mb-3">
          <strong>What is "root"?</strong> The root element is the outermost <code class="bg-gray-100 px-1 rounded">&lt;div&gt;</code> 
          that DropdownHandler creates when rendering the dropdown. This is the element that gets teleported to the body 
          (or wherever <code class="bg-gray-100 px-1 rounded">teleportTo</code> points).
        </p>
        <p class="text-sm text-gray-600 mb-2">
          <strong>What to test:</strong> Open the dropdown and inspect the root element in DevTools. Verify it has:
        </p>
        <ul class="text-sm text-gray-600 mb-3 ml-4 list-disc space-y-1">
          <li><strong>Unique <code class="bg-gray-100 px-1 rounded">id</code>:</strong> Should be a unique identifier (e.g., "dh-abc123")</li>
          <li><strong><code class="bg-gray-100 px-1 rounded">data-dropdown-handler</code>:</strong> Should match the id value</li>
          <li><strong><code class="bg-gray-100 px-1 rounded">role</code>:</strong> Should be "menu" (or whatever <code class="bg-gray-100 px-1 rounded">ariaRole</code> is set to)</li>
          <li><strong><code class="bg-gray-100 px-1 rounded">aria-hidden</code>:</strong> Should be "false" when open, "true" when closed</li>
        </ul>
        <p class="text-xs text-gray-500 mb-2">
          <strong>How to test:</strong> Click the button below, then open DevTools → Elements → Find the dropdown div (it will be under &lt;body&gt;). 
          Check that all attributes are present and correct. Close the dropdown and verify <code class="bg-gray-100 px-1 rounded">aria-hidden</code> changes to "true".
        </p>
        <button ref="test13" class="px-3 py-2 border rounded">Open & Inspect Root Attributes</button>
        <DropdownHandler :anchor="test13"
          :config="{ trigger: 'click', width: 300, ariaRole: 'menu', style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="font-semibold mb-2">Inspect this dropdown's root element</p>
            <p class="text-sm">Open DevTools → Elements → Find the div with <code class="bg-gray-100 px-1 rounded">data-dropdown-handler</code></p>
            <p class="text-xs text-gray-500 mt-2">The root div is the outermost container, not this content div.</p>
          </div>
        </DropdownHandler>
      </div>
    </section>

    <!-- SECTION 2: VALIDATION (ERRORS) & DEFAULTS -->
    <section class="border-2 border-purple-500 rounded-lg p-6 bg-purple-50">
      <h2 class="text-2xl font-bold mb-4 text-purple-900">Section 2: Validation & Defaults</h2>

      <!-- Test 2.1: Invalid trigger → error -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 2.1: Invalid Trigger Value → Error</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Console error for invalid trigger value</p>
        <button @click="testInvalidTrigger" class="px-3 py-2 border rounded bg-red-50">
          Test Invalid Trigger (Check Console)
        </button>
        <button ref="test21" class="px-3 py-2 border rounded ml-2">Valid: 'click'</button>
        <DropdownHandler :anchor="test21"
          :config="{ trigger: 'click', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">Valid trigger: 'click'</div>
        </DropdownHandler>
        <div v-if="showInvalidTriggerTest">
          <button ref="invalidTriggerAnchor" class="px-3 py-2 border rounded mt-2">Anchor for Invalid Trigger</button>
          <DropdownHandler :anchor="invalidTriggerAnchor"
            :config="{ trigger: 'invalid', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
            <div class="p-4">This should error</div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test 2.2: Invalid align → error -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 2.2: Invalid Align Value → Error</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Console error for invalid align value</p>
        <button @click="testInvalidAlign" class="px-3 py-2 border rounded bg-red-50">
          Test Invalid Align (Check Console)
        </button>
        <button ref="test22" class="px-3 py-2 border rounded ml-2">Valid: 'center'</button>
        <DropdownHandler :anchor="test22"
          :config="{ trigger: 'click', align: 'center', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">Valid align: 'center'</div>
        </DropdownHandler>
        <div v-if="showInvalidAlignTest">
          <button ref="invalidAlignAnchor" class="px-3 py-2 border rounded mt-2">Anchor for Invalid Align</button>
          <DropdownHandler :anchor="invalidAlignAnchor"
            :config="{ trigger: 'click', align: 'invalid', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
            <div class="p-4">This should error</div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test 2.3: Invalid snapEdge → error -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 2.3: Invalid snapEdge Value → Error</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Console error for invalid snapEdge value</p>
        <button @click="testInvalidSnapEdge" class="px-3 py-2 border rounded bg-red-50">
          Test Invalid snapEdge (Check Console)
        </button>
        <button ref="test23" class="px-3 py-2 border rounded ml-2">Valid: null</button>
        <DropdownHandler :anchor="test23"
          :config="{ trigger: 'click', snapEdge: null, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">Valid snapEdge: null</div>
        </DropdownHandler>
        <div v-if="showInvalidSnapEdgeTest">
          <button ref="invalidSnapEdgeAnchor" class="px-3 py-2 border rounded mt-2">Anchor for Invalid snapEdge</button>
          <DropdownHandler :anchor="invalidSnapEdgeAnchor"
            :config="{ trigger: 'click', snapEdge: 'invalid', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
            <div class="p-4">This should error</div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test 2.4: Width types -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 2.4: Width Types (number, string, object responsive map)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: All valid width types work correctly</p>

        <div class="space-y-2">
          <div>
            <button ref="test24a" class="px-3 py-2 border rounded">Width: 400 (number/px)</button>
            <DropdownHandler :anchor="test24a"
              :config="{ trigger: 'click', width: 400, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width is 400px</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test24b" class="px-3 py-2 border rounded">Width: '50vw' (string)</button>
            <DropdownHandler :anchor="test24b"
              :config="{ trigger: 'click', width: '50vw', style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width is 50vw</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test24b2" class="px-3 py-2 border rounded">Width: '100vw' (full viewport)</button>
            <DropdownHandler :anchor="test24b2"
              :config="{ trigger: 'click', width: '100vw', style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width is 100vw (full viewport width on desktop)</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test24c" class="px-3 py-2 border rounded">Width: 'inherit'</button>
            <DropdownHandler :anchor="test24c"
              :config="{ trigger: 'click', width: 'inherit', style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width inherits from anchor</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test24d" class="px-3 py-2 border rounded">Width: Responsive Map</button>
            <DropdownHandler :anchor="test24d"
              :config="{ trigger: 'click', width: { '<640': '100vw', default: '420px' }, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width: 100vw on mobile, 420px on desktop</div>
            </DropdownHandler>
          </div>

          <button @click="testInvalidWidth" class="px-3 py-2 border rounded bg-red-50">
            Test Invalid Width Type (Check Console)
          </button>
          <div v-if="showInvalidWidthTest">
            <button ref="invalidWidthAnchor" class="px-3 py-2 border rounded mt-2">Anchor for Invalid Width</button>
            <DropdownHandler :anchor="invalidWidthAnchor"
              :config="{ trigger: 'click', width: true, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">This should error</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 2.5: Height types -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 2.5: Height Types (number, string, auto)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Valid height types work; auto expands to content; invalid throws error</p>

        <div class="space-y-2">
          <div>
            <button ref="test25a" class="px-3 py-2 border rounded">Height: 200 (number/px)</button>
            <DropdownHandler :anchor="test25a"
              :config="{ trigger: 'click', width: 300, height: 200, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Height is 200px</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test25b" class="px-3 py-2 border rounded">Height: '50vh' (string)</button>
            <DropdownHandler :anchor="test25b"
              :config="{ trigger: 'click', width: 300, height: '50vh', style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Height is 50vh</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test25c" class="px-3 py-2 border rounded">Height: Auto (no height specified)</button>
            <DropdownHandler :anchor="test25c"
              :config="{ trigger: 'click', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Auto Height</p>
                <p class="text-sm mb-2">Dropdown expands to fit content</p>
                <div class="space-y-2">
                  <div class="py-2 border-b">Item 1</div>
                  <div class="py-2 border-b">Item 2</div>
                  <div class="py-2 border-b">Item 3</div>
                  <div class="py-2 border-b">Item 4</div>
                </div>
              </div>
            </DropdownHandler>
          </div>

          <button @click="testInvalidHeight" class="px-3 py-2 border rounded bg-red-50">
            Test Invalid Height Type (Check Console)
          </button>
          <div v-if="showInvalidHeightTest">
            <button ref="invalidHeightAnchor" class="px-3 py-2 border rounded mt-2">Anchor for Invalid Height</button>
            <DropdownHandler :anchor="invalidHeightAnchor"
              :config="{ trigger: 'click', width: 300, height: [], style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">This should error</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 2.6: Default values -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 2.6: Default Configuration Values</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: All defaults applied when not specified</p>
        <button ref="test26" class="px-3 py-2 border rounded">Minimal Config (Uses All Defaults)</button>
        <DropdownHandler :anchor="test26" :config="{ style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4 text-sm">
            <p>Defaults Applied:</p>
            <ul class="list-disc ml-4 mt-2 space-y-1">
              <li>trigger: 'click'</li>
              <li>hoverIntentMs: 50</li>
              <li>offset: 8</li>
              <li>flipOnOverflow: true</li>
              <li>closeOnOutsideClick: true</li>
              <li>toggleOnTriggerClick: true</li>
              <li>animation: 'none'</li>
              <li>mobileBreakpoint: 640</li>
            </ul>
          </div>
        </DropdownHandler>
      </div>
    </section>

    <!-- SECTION 3: OPEN/CLOSE TRIGGERS (PER MODE) -->
    <section class="border-2 border-green-500 rounded-lg p-6 bg-green-50">
      <h2 class="text-2xl font-bold mb-4 text-green-900">Section 3: Open/Close Triggers</h2>

      <!-- Test 3.1: Click trigger -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 3.1: Click Trigger (click opens, outside click closes, Esc closes, toggle)
        </h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Click to open, click outside or Esc to close, click anchor again
          to toggle</p>
        <button ref="test31" class="px-3 py-2 border rounded">Click Trigger Test</button>
        <DropdownHandler :anchor="test31"
          :config="{ trigger: 'click', toggleOnTriggerClick: true, closeOnOutsideClick: true, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p>Click trigger active:</p>
            <ul class="list-disc ml-4 mt-2">
              <li>Click anchor to open</li>
              <li>Click anchor again to close (toggle)</li>
              <li>Click outside to close</li>
              <li>Press Esc to close</li>
            </ul>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 3.2: Hover trigger -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 3.2: Hover Trigger (hover intent, leave closes)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Opens after hoverIntentMs (200ms), closes when leaving
          anchor+dropdown</p>
        <button ref="test32" class="px-3 py-2 border rounded">Hover Me</button>
        <DropdownHandler :anchor="test32"
          :config="{ trigger: 'hover', hoverIntentMs: 200, closeOnOutsideHover: true, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p>Hover trigger active:</p>
            <ul class="list-disc ml-4 mt-1">
              <li>Opens after 200ms hover</li>
              <li>Stays open when hovering inside</li>
              <li>Closes when leaving both areas</li>
            </ul>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 3.2b: Hover trigger with left/right alignment -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 3.2b: Hover Trigger with Left/Right Alignment</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Hover trigger works correctly with left and right alignment</p>
        <div class="space-y-4">
          <div>
            <button ref="test32b1" class="px-3 py-2 border rounded">Hover - Left Aligned</button>
            <DropdownHandler :anchor="test32b1"
              :config="{ trigger: 'hover', hoverIntentMs: 50, align: 'left', closeOnOutsideHover: true, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Left-Aligned Hover</p>
                <p class="text-sm">Dropdown aligns to left edge of button</p>
              </div>
            </DropdownHandler>
          </div>

          <div class="flex justify-end">
            <button ref="test32b2" class="px-3 py-2 border rounded">Hover - Right Aligned</button>
            <DropdownHandler :anchor="test32b2"
              :config="{ trigger: 'hover', hoverIntentMs: 50, align: 'right', closeOnOutsideHover: true, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Right-Aligned Hover</p>
                <p class="text-sm">Dropdown aligns to right edge of button</p>
              </div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 3.3: Focus trigger & Tab Navigation -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 3.3: Focus Trigger & Tab Navigation (Keyboard Accessible)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Tab to focus opens dropdown, Shift+Tab goes back, Esc closes.
          Arrow keys navigate items.</p>
        <div class="space-y-3">
          <div>
            <button ref="test33" tabindex="0" class="px-3 py-2 border rounded">Tab to Focus Me (Opens Dropdown)</button>
            <DropdownHandler :anchor="test33"
              :config="{ trigger: 'focus', width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Focus Trigger Active</p>
                <p class="text-sm mb-2">Instructions:</p>
                <ul class="list-disc ml-4 mt-2 text-sm space-y-1">
                  <li><strong>Tab</strong> → Focus button → Dropdown opens</li>
                  <li><strong>Tab</strong> again → Focus moves to next element → Dropdown closes</li>
                  <li><strong>Shift+Tab</strong> → Go back to previous element</li>
                  <li><strong>Esc</strong> → Closes dropdown</li>
                </ul>
              </div>
            </DropdownHandler>
          </div>
          <div>
            <button ref="test33b" tabindex="0" class="px-3 py-2 border rounded">Another Focusable Button</button>
            <p class="text-xs text-gray-500 mt-1">Tab sequence: Button 1 → Button 2</p>
          </div>
        </div>
      </div>

      <!-- Test 3.4: forceKeepOpen -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 3.4: forceKeepOpen (ignores auto-close, only API/button closes)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Ignores outside click, Esc, scroll. Only closes via button or
          API. Should NOT bounce on body scroll - should smoothly follow anchor.</p>
        <div style="margin-bottom: 10px;">
          <button ref="test34" class="px-3 py-2 border rounded">Force Keep Open Test</button>
        </div>
        <DropdownHandler ref="test34ref" :anchor="test34"
          :config="{ trigger: 'click', forceKeepOpen: true, toggleOnTriggerClick: false, closeOnOutsideClick: false, closeOnScroll: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="font-semibold mb-2">Force Keep Open Mode</p>
            <p class="text-sm mb-2">Try: outside click, Esc, scroll → Won't close</p>
            <button @click="test34ref?.close('manual')" class="px-3 py-2 bg-red-500 text-white rounded">
              Close via API
            </button>
            <button data-dropdown-close class="px-3 py-2 bg-blue-500 text-white rounded ml-2">
              Close via [data-dropdown-close]
            </button>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 3.5: Inside close control [data-dropdown-close] -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 3.5: Internal Close Control [data-dropdown-close]</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Any element with data-dropdown-close attribute closes dropdown
        </p>
        <button ref="test35" class="px-3 py-2 border rounded">Test Internal Close Button</button>
        <DropdownHandler :anchor="test35"
          :config="{ trigger: 'click', width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="mb-3">Click any button to close:</p>
            <button data-dropdown-close class="px-3 py-2 border rounded bg-gray-100 mr-2">Close Button 1</button>
            <button data-dropdown-close class="px-3 py-2 border rounded bg-gray-100">Close Button 2</button>
            <div class="mt-3">
              <span data-dropdown-close class="underline cursor-pointer text-blue-600">Close Link</span>
            </div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 3.6: Nested Dropdown (Dropdown inside Dropdown) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 3.6: Nested Dropdown (Dropdown inside Dropdown)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Parent dropdown opens, then clicking a button inside opens a child dropdown. Both should stay open simultaneously using the same group.</p>
        <p class="text-xs text-gray-500 mb-3 bg-yellow-50 p-2 rounded">
          <strong>Instructions:</strong> Click the parent button to open the first dropdown. Then click "Open Nested Dropdown" inside to open the child dropdown. Both should remain open at the same time.
        </p>
        
        <button ref="test36parent" class="px-3 py-2 border rounded bg-indigo-100">Open Parent Dropdown</button>
        <DropdownHandler :anchor="test36parent"
          :config="{ trigger: 'click', layer: 'dropdown', group: 'nested-test', width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="font-semibold mb-3">Parent Dropdown</p>
            <p class="text-sm mb-4">This is the parent dropdown content.</p>
            <div class="space-y-2">
              <div class="py-2 border-b">Menu Item 1</div>
              <div class="py-2 border-b">Menu Item 2</div>
              <div class="py-2 border-b">
                <button ref="test36child" class="px-3 py-2 border rounded bg-blue-100 w-full text-left flex items-center justify-between">
                  <span>Open Nested Dropdown</span>
                  <span>→</span>
                </button>
                <DropdownHandler :anchor="test36child"
                  :config="{ trigger: 'click', layer: 'dropdown', group: 'nested-test', width: 280, style: { class: 'bg-blue-50 border rounded shadow-xl' } }">
                  <div class="p-4">
                    <p class="font-semibold mb-2">Nested Dropdown</p>
                    <p class="text-sm mb-3">This is a dropdown inside another dropdown!</p>
                    <div class="space-y-2">
                      <div class="py-2 border-b text-sm">Nested Item 1</div>
                      <div class="py-2 border-b text-sm">Nested Item 2</div>
                      <div class="py-2 border-b text-sm">Nested Item 3</div>
                    </div>
                    <p class="text-xs text-gray-500 mt-3">Both parent and child should be open</p>
                  </div>
                </DropdownHandler>
              </div>
              <div class="py-2 border-b">Menu Item 3</div>
            </div>
          </div>
        </DropdownHandler>
      </div>
    </section>

    <!-- SECTION 4: POSITIONING, SIZING, COLLISION -->
    <section class="border-2 border-orange-500 rounded-lg p-6 bg-orange-50">
      <h2 class="text-2xl font-bold mb-4 text-orange-900">Section 4: Positioning, Sizing, Collision</h2>

      <!-- Test 4.1: Width resolution -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 4.1: Width Resolution (number→px, inherit, %, vw, map)</h3>
        <p class="text-sm text-gray-600 mb-2">Already covered in Test 2.4</p>
      </div>

      <!-- Test 4.2: Horizontal alignment -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 4.2: Horizontal Alignment (left, center, right) + Viewport Clamping</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Aligns correctly and never overflows viewport horizontally</p>

        <div class="space-y-4">
          <div>
            <button ref="test42a" class="px-3 py-2 border rounded">Align: Left</button>
            <DropdownHandler :anchor="test42a"
              :config="{ trigger: 'click', align: 'left', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Left-aligned to anchor</div>
            </DropdownHandler>
          </div>

          <div class="flex justify-center">
            <button ref="test42b" class="px-3 py-2 border rounded">Align: Center</button>
            <DropdownHandler :anchor="test42b"
              :config="{ trigger: 'click', align: 'center', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Center-aligned to anchor</div>
            </DropdownHandler>
          </div>

          <div class="flex justify-end">
            <button ref="test42c" class="px-3 py-2 border rounded">Align: Right (Near Edge)</button>
            <DropdownHandler :anchor="test42c"
              :config="{ trigger: 'click', align: 'right', width: 800, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Right-aligned, but clamped to not overflow viewport (width 800px should be clamped)</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 4.2b: Right-Aligned Dropdown -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 4.2b: Right-Aligned Dropdown (Full Test)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Dropdown aligns to right edge of anchor, handles overflow
          correctly, works with scroll</p>
        <div class="space-y-4">
          <div class="flex justify-end">
            <button ref="test42d" class="px-3 py-2 border rounded">Right-Aligned Dropdown</button>
            <DropdownHandler :anchor="test42d"
              :config="{ trigger: 'click', align: 'right', width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Right-Aligned Test</p>
                <p class="text-sm">Dropdown should align to right edge of button</p>
                <p class="text-sm mt-2">Test: Scroll page, resize window, check overflow handling</p>
              </div>
            </DropdownHandler>
          </div>
          <div class="flex justify-end">
            <button ref="test42e" class="px-3 py-2 border rounded">Right-Aligned (Wide - Should Clamp)</button>
            <DropdownHandler :anchor="test42e"
              :config="{ trigger: 'click', align: 'right', width: 600, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Wide dropdown (600px) should clamp to viewport</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 4.3: Vertical positioning + flip -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 4.3: Vertical Positioning (below with offset, flip to top if no space, force top/bottom)
        </h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Default below, flips above when cramped, can force top/bottom without flip</p>

        <div class="space-y-2">
          <div>
            <button ref="test43a" class="px-3 py-2 border rounded">Below (has space)</button>
            <DropdownHandler :anchor="test43a"
              :config="{ trigger: 'click', flipOnOverflow: true, offset: 8, width: 300, height: 200, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Should appear BELOW with 8px offset. Check data-placement="bottom"</div>
            </DropdownHandler>
          </div>

          <div style="margin-top: 600px;">
            <button ref="test43b" class="px-3 py-2 border rounded">Near Bottom (should flip)</button>
            <DropdownHandler :anchor="test43b"
              :config="{ trigger: 'click', flipOnOverflow: true, offset: 8, width: 300, height: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Should FLIP ABOVE anchor. Check data-placement="top"</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test43c" class="px-3 py-2 border rounded">Force Top (no flip)</button>
            <DropdownHandler :anchor="test43c"
              :config="{ trigger: 'click', positionMode: 'above', flipOnOverflow: false, offset: 8, width: 300, height: 200, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Should ALWAYS appear ABOVE anchor, even if no space. Check data-placement="top"</div>
            </DropdownHandler>
          </div>

          <div style="margin-top: 600px;">
            <button ref="test43d" class="px-3 py-2 border rounded">Force Bottom (no flip, near edge)</button>
            <DropdownHandler :anchor="test43d"
              :config="{ trigger: 'click', positionMode: 'below', flipOnOverflow: false, offset: 8, width: 300, height: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Should ALWAYS appear BELOW anchor, even near bottom edge. Check data-placement="bottom" (may overflow viewport)</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 4.3b: Offset/Gap Testing -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 4.3b: Offset/Gap Between Trigger and Dropdown (Less or More Gap)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Different offset values create different gaps between trigger and dropdown. Test with smaller (0-4px) and larger (12-24px) gaps.</p>

        <div class="space-y-4">
          <div>
            <button ref="test43b1" class="px-3 py-2 border rounded">No Gap (offset: 0)</button>
            <DropdownHandler :anchor="test43b1"
              :config="{ trigger: 'click', offset: 0, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">No Gap (0px offset)</p>
                <p class="text-sm">Dropdown should appear directly adjacent to button with no gap</p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test43b2" class="px-3 py-2 border rounded">Small Gap (offset: 4)</button>
            <DropdownHandler :anchor="test43b2"
              :config="{ trigger: 'click', offset: 4, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Small Gap (4px offset)</p>
                <p class="text-sm">Small gap between trigger and dropdown</p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test43b3" class="px-3 py-2 border rounded">Default Gap (offset: 8)</button>
            <DropdownHandler :anchor="test43b3"
              :config="{ trigger: 'click', offset: 8, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Default Gap (8px offset - default)</p>
                <p class="text-sm">Standard gap between trigger and dropdown</p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test43b4" class="px-3 py-2 border rounded">Large Gap (offset: 16)</button>
            <DropdownHandler :anchor="test43b4"
              :config="{ trigger: 'click', offset: 16, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Large Gap (16px offset)</p>
                <p class="text-sm">Larger gap between trigger and dropdown</p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test43b5" class="px-3 py-2 border rounded">Very Large Gap (offset: 24)</button>
            <DropdownHandler :anchor="test43b5"
              :config="{ trigger: 'click', offset: 24, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Very Large Gap (24px offset)</p>
                <p class="text-sm">Very large gap between trigger and dropdown</p>
              </div>
            </DropdownHandler>
          </div>

          <div style="margin-top: 500px;">
            <button ref="test43b6" class="px-3 py-2 border rounded">Large Gap Above (offset: 20, should flip)</button>
            <DropdownHandler :anchor="test43b6"
              :config="{ trigger: 'click', offset: 20, flipOnOverflow: true, width: 300, height: 250, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Large Gap with Flip (20px offset)</p>
                <p class="text-sm">When flipped above, should maintain 20px gap from top of anchor</p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test43b7" class="px-3 py-2 border rounded">Hover with Small Gap (offset: 2)</button>
            <DropdownHandler :anchor="test43b7"
              :config="{ trigger: 'hover', offset: 2, hoverIntentMs: 100, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Hover with Small Gap (2px offset)</p>
                <p class="text-sm">Hover trigger with minimal gap</p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test43b8" class="px-3 py-2 border rounded">Tooltip with Custom Gap (offset: 12)</button>
            <DropdownHandler :anchor="test43b8"
              :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-dark', offset: 12, width: 200, ariaRole: 'tooltip', scrollEnabled: false }">
              <div class="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 bg-gray-900"></div>
              <div>Tooltip with 12px gap</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 4.4: Mobile snap -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 4.4: Mobile Edge Snap (snapEdge left/right only when viewport <
            mobileBreakpoint)</h3>
            <p class="text-sm text-gray-600 mb-2">Expected: Snaps to left edge (0) or right edge on mobile only. Resize
              to < 640px to test.</p>

                <div class="space-y-2">
                  <div>
                    <button ref="test44a" class="px-3 py-2 border rounded">Snap Left (mobile only)</button>
                    <DropdownHandler :anchor="test44a"
                      :config="{ trigger: 'click', snapEdge: 'left', width: { '<640': '100vw', default: '320px' }, mobileBreakpoint: 640, style: { class: 'bg-white border rounded shadow-xl' } }">
                      <div class="p-4">Desktop: normal width. Mobile (< 640px): snaps to left edge, 100vw wide</div>
                    </DropdownHandler>
                  </div>

                  <div class="flex justify-end">
                    <button ref="test44b" class="px-3 py-2 border rounded">Snap Right (mobile only)</button>
                    <DropdownHandler :anchor="test44b"
                      :config="{ trigger: 'click', snapEdge: 'right', width: { '<640': '100vw', default: '320px' }, mobileBreakpoint: 640, style: { class: 'bg-white border rounded shadow-xl' } }">
                      <div class="p-4">Desktop: normal width. Mobile (< 640px): snaps to right edge, 100vw wide</div>
                    </DropdownHandler>
                  </div>
                </div>
      </div>
    </section>

    <!-- SECTION 5: SCROLLING & HEIGHT -->
    <section class="border-2 border-pink-500 rounded-lg p-6 bg-pink-50">
      <h2 class="text-2xl font-bold mb-4 text-pink-900">Section 5: Scrolling & Height</h2>

      <!-- Test 5.1: scrollEnabled -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5.1: scrollEnabled (content scrolls inside, page doesn't jump)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Tall content scrolls within dropdown, page body doesn't scroll
        </p>
        <button ref="test51" class="px-3 py-2 border rounded">Tall Content Scroll Test</button>
        <DropdownHandler :anchor="test51"
          :config="{ trigger: 'click', scrollEnabled: true, hideScrollbars: false, closeOnScroll: true, height: '40vh', width: 400, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4 space-y-2">
            <p class="font-semibold mb-2">Scrollable Content (40vh height, scrollbar visible)</p>
            <div v-for="i in 50" :key="i" class="py-1 border-b">Row {{ i }}</div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 5.2: hideScrollbars -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5.2: hideScrollbars (scrollbar-none class applied, scrolling still works)
        </h3>
        <p class="text-sm text-gray-600 mb-2">Expected: No visible scrollbar, but content is still scrollable</p>
        <button ref="test52" class="px-3 py-2 border rounded">Hidden Scrollbar Test</button>
        <DropdownHandler :anchor="test52"
          :config="{ trigger: 'click', scrollEnabled: true, hideScrollbars: true, height: '300px', width: 400, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4 space-y-2">
            <p class="font-semibold mb-2">Hidden Scrollbar (still scrollable)</p>
            <div v-for="i in 30" :key="i" class="py-1 border-b">Row {{ i }}</div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 5.3: Height Tests (Comprehensive) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5.3: Height Tests (Auto-Height, Max-Height, Inside-Scroll, Overflow)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: All height configurations work correctly with proper overflow
          handling</p>

        <div class="space-y-3">
          <div>
            <button ref="test53a" class="px-3 py-2 border rounded">Height: 250px (Fixed)</button>
            <DropdownHandler :anchor="test53a"
              :config="{ trigger: 'click', height: 250, width: 300, scrollEnabled: true, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="text-sm mb-2">Fixed height: 250px</p>
                <div v-for="i in 20" :key="i" class="py-1 border-b text-sm">Item {{ i }}</div>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test53b" class="px-3 py-2 border rounded">Height: '40vh' (Viewport Relative)</button>
            <DropdownHandler :anchor="test53b"
              :config="{ trigger: 'click', height: '40vh', width: 300, scrollEnabled: true, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="text-sm mb-2">Height: 40vh (40% of viewport)</p>
                <div v-for="i in 30" :key="i" class="py-1 border-b text-sm">Item {{ i }}</div>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test53c" class="px-3 py-2 border rounded">Height: '100%' (Fills Available Space)</button>
            <DropdownHandler :anchor="test53c"
              :config="{ trigger: 'click', height: '100%', width: 300, scrollEnabled: true, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="text-sm mb-2">Height: 100% fills available viewport space</p>
                <div v-for="i in 50" :key="i" class="py-1 border-b text-sm">Item {{ i }}</div>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test53d" class="px-3 py-2 border rounded">Auto Height (No Height Set)</button>
            <DropdownHandler :anchor="test53d"
              :config="{ trigger: 'click', width: 300, scrollEnabled: false, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="text-sm mb-2">Auto height - expands to content</p>
                <div class="space-y-2">
                  <div class="py-2 border-b">Item 1</div>
                  <div class="py-2 border-b">Item 2</div>
                  <div class="py-2 border-b">Item 3</div>
                </div>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test53e" class="px-3 py-2 border rounded">Fixed Height with Overflow Scroll</button>
            <DropdownHandler :anchor="test53e"
              :config="{ trigger: 'click', height: 300, width: 300, scrollEnabled: true, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="text-sm mb-2">Fixed height: 300px with scroll</p>
                <div v-for="i in 25" :key="i" class="py-2 border-b text-sm">Scrollable item {{ i }}</div>
              </div>
            </DropdownHandler>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5B: WIDTH TESTS -->
    <section class="border-2 border-pink-600 rounded-lg p-6 bg-pink-100">
      <h2 class="text-2xl font-bold mb-4 text-pink-900">Section 5B: Width Tests</h2>

      <!-- Test 5B.1: Width Tests (Comprehensive) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5B.1: Width Tests (100% Parent, Min-Width, Auto Width, Viewport Clamping)
        </h3>
        <p class="text-sm text-gray-600 mb-2">Expected: All width configurations work correctly, including 100% width of
          parent</p>

        <div class="space-y-3">
          <div>
            <button ref="test5b1a" class="px-3 py-2 border rounded">Width: 400px (Fixed)</button>
            <DropdownHandler :anchor="test5b1a"
              :config="{ trigger: 'click', width: 400, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Fixed width: 400px</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test5b1b" class="px-3 py-2 border rounded">Width: '50vw' (Viewport Width)</button>
            <DropdownHandler :anchor="test5b1b"
              :config="{ trigger: 'click', width: '50vw', style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width: 50vw (50% of viewport width)</div>
            </DropdownHandler>
          </div>

          <div class="border-2 border-blue-300 p-4 rounded relative" style="width: 500px;" id="parent-container-test">
            <p class="text-sm font-semibold mb-2">Parent Container (500px wide)</p>
            <p class="text-xs text-gray-500 mb-2">The dropdown should align with the left edge of this blue-bordered container</p>
            <button ref="test5b1c" class="px-3 py-2 border rounded">Width: 100% of Parent</button>
            <DropdownHandler :anchor="test5b1c"
              :config="{ trigger: 'click', widthMode: 'parent', widthParentSelector: '.border-blue-300', width: '100%', style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">100% Width of Parent</p>
                <p class="text-sm mb-2">This dropdown should be exactly 500px wide (parent width)</p>
                <p class="text-sm mb-2">✅ Left edge should align with the blue container's left edge</p>
                <p class="text-xs text-gray-500 mt-2">Inspect element to verify: width = 500px, left edge matches container</p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test5b1d" class="px-3 py-2 border rounded">Width: 'inherit' (Anchor Width)</button>
            <DropdownHandler :anchor="test5b1d"
              :config="{ trigger: 'click', width: 'inherit', style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width inherits from anchor button</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test5b1e" class="px-3 py-2 border rounded">Width: Auto (Content-Based)</button>
            <DropdownHandler :anchor="test5b1e"
              :config="{ trigger: 'click', width: 200, style: { class: 'bg-white border rounded shadow-xl min-w-[200px] max-w-[400px]' } }">
              <div class="p-4 whitespace-nowrap">Auto width with min/max constraints - this is a longer content that
                should wrap</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test5b1f" class="px-3 py-2 border rounded">Wide Width (Should Clamp to Viewport)</button>
            <DropdownHandler :anchor="test5b1f"
              :config="{ trigger: 'click', width: 1200, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Width: 1200px should clamp to viewport</div>
            </DropdownHandler>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 6: OVERLAY -->
    <section class="border-2 border-indigo-500 rounded-lg p-6 bg-indigo-50">
      <h2 class="text-2xl font-bold mb-4 text-indigo-900">Section 6: Overlay</h2>

      <!-- Test 6.1: Overlay -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 6.1: Overlay (renders when overlay:true, clicks close unless
          forceKeepOpen, z-index correct)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Semi-transparent overlay appears, clicking closes dropdown,
          overlay z-[999] < dropdown z-[1000]</p>

            <div class="space-y-2">
              <div>
                <button ref="test61a" class="px-3 py-2 border rounded">Overlay: Closeable</button>
                <DropdownHandler :anchor="test61a"
                  :config="{ trigger: 'click', overlay: true, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
                  <div class="p-4">
                    <p class="font-semibold mb-2">Overlay Active</p>
                    <p class="text-sm">Click overlay to close</p>
                  </div>
                </DropdownHandler>
              </div>

              <div>
                <button ref="test61b" class="px-3 py-2 border rounded">Overlay + forceKeepOpen</button>
                <DropdownHandler ref="test61bref" :anchor="test61b"
                  :config="{ trigger: 'click', overlay: true, forceKeepOpen: true, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
                  <div class="p-4">
                    <p class="font-semibold mb-2">Overlay + forceKeepOpen</p>
                    <p class="text-sm mb-3">Click overlay → Won't close</p>
                    <button @click="test61bref?.close('manual')" class="px-3 py-2 bg-red-500 text-white rounded">
                      Close via API
                    </button>
                  </div>
                </DropdownHandler>
              </div>
            </div>
      </div>
    </section>

    <!-- SECTION 7: EVENTS & API -->
    <section class="border-2 border-yellow-500 rounded-lg p-6 bg-yellow-50">
      <h2 class="text-2xl font-bold mb-4 text-yellow-900">Section 7: Events & API</h2>
      <div class="mb-6 bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-600">
        <h3 class="font-bold text-lg mb-3 text-yellow-900">What is this section about?</h3>
        <p class="text-sm text-gray-700 mb-3">
          This section tests the <strong>programmatic interface</strong> of DropdownHandler. There are two main ways to interact with dropdowns programmatically:
        </p>
        <div class="grid md:grid-cols-2 gap-4 mb-3">
          <div class="bg-white p-3 rounded">
            <h4 class="font-semibold mb-2 text-blue-700">1. Events (Reactive)</h4>
            <p class="text-xs text-gray-700 mb-2">
              DropdownHandler emits events when things happen (open, close, reposition, etc.). You listen to these events to react to dropdown state changes.
            </p>
            <p class="text-xs text-gray-600">
              <strong>Use cases:</strong> Update component state, track analytics, coordinate UI elements, handle collisions
            </p>
          </div>
          <div class="bg-white p-3 rounded">
            <h4 class="font-semibold mb-2 text-green-700">2. Public API (Imperative)</h4>
            <p class="text-xs text-gray-700 mb-2">
              Methods you can call directly on the dropdown instance (open(), close(), toggle(), etc.) to control it programmatically.
            </p>
            <p class="text-xs text-gray-600">
              <strong>Use cases:</strong> Open dropdown from external button, close on form submit, check if open, manually reposition
            </p>
          </div>
        </div>
        <p class="text-xs text-gray-600 italic">
          <strong>Why this matters:</strong> Real applications need to coordinate dropdowns with other UI elements, track user behavior, 
          integrate with state management (Vuex/Pinia), and respond to external triggers. Events and API make this possible.
        </p>
      </div>

      <!-- Test 7.1: Vue emits (open, close, repositioned, toggle, collided) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 7.1: Vue Events (open, close, repositioned, toggle, collided)</h3>
        <div class="mb-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            DropdownHandler emits Vue events that you can listen to using <code class="bg-white px-1 rounded">@open</code>, 
            <code class="bg-white px-1 rounded">@close</code>, etc. These events fire when specific actions occur and include 
            detailed payload information.
          </p>
          <p class="text-sm font-semibold mb-2">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>State synchronization:</strong> Update your component state when dropdown opens/closes</li>
            <li><strong>Analytics:</strong> Track user interactions (which dropdowns are opened, how often)</li>
            <li><strong>UI coordination:</strong> Show/hide other UI elements based on dropdown state</li>
            <li><strong>Collision detection:</strong> Know when dropdown hits viewport edges and adjust UI accordingly</li>
            <li><strong>Repositioning feedback:</strong> Detect when dropdown flips position (above/below) for styling</li>
          </ul>
        </div>
        <p class="text-sm text-gray-600 mb-2">Expected: Console logs for all events with correct payload. Each event includes: type, id, timestamp, trigger mode, placement info, anchor rect, and collision data.</p>
        <button ref="test71" class="px-3 py-2 border rounded">Events Test (Check Console)</button>
        <DropdownHandler :anchor="test71"
          :config="{ trigger: 'click', toggleOnTriggerClick: true, width: 400, style: { class: 'bg-white border rounded shadow-xl' } }"
          @open="e => console.log('✓ OPEN event:', e)" @close="e => console.log('✓ CLOSE event:', e)"
          @toggle="e => console.log('✓ TOGGLE event:', e)" @repositioned="e => console.log('✓ REPOSITIONED event:', e)"
          @collided="e => console.log('✓ COLLIDED event:', e)">
          <div class="p-4">
            <p class="font-semibold mb-2">Event Emission Test</p>
            <p class="text-sm mb-2">Open browser console (F12) and interact with the dropdown:</p>
            <ul class="list-disc ml-4 mt-2 text-sm space-y-1">
              <li><strong>Click anchor</strong> → Fires <code class="bg-gray-100 px-1 rounded">open</code> + <code class="bg-gray-100 px-1 rounded">toggle</code> events</li>
              <li><strong>Click anchor again</strong> → Fires <code class="bg-gray-100 px-1 rounded">close</code> + <code class="bg-gray-100 px-1 rounded">toggle</code> events</li>
              <li><strong>On open</strong> → Fires <code class="bg-gray-100 px-1 rounded">repositioned</code> event with placement info</li>
              <li><strong>Near viewport edge</strong> → Fires <code class="bg-gray-100 px-1 rounded">collided</code> event if dropdown hits edge</li>
            </ul>
            <p class="text-xs text-gray-500 mt-3">Each event payload contains: type, id, timestamp, trigger, layer, group, placement, anchorRect, and collision data</p>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 7.2: DOM CustomEvents -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 7.2: DOM CustomEvents (DropdownHandler:open, close, repositioned)</h3>
        <div class="mb-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            In addition to Vue events, DropdownHandler also dispatches native DOM <code class="bg-white px-1 rounded">CustomEvent</code> objects 
            on the <code class="bg-white px-1 rounded">document</code>. These events are named <code class="bg-white px-1 rounded">DropdownHandler:open</code>, 
            <code class="bg-white px-1 rounded">DropdownHandler:close</code>, etc.
          </p>
          <p class="text-sm font-semibold mb-2">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>Framework-agnostic:</strong> Works with vanilla JavaScript, React, Angular, or any framework</li>
            <li><strong>Global listeners:</strong> Listen to all dropdown events from anywhere in your app, not just the component</li>
            <li><strong>Debugging:</strong> Use browser DevTools to monitor all dropdown events across the entire application</li>
            <li><strong>Integration:</strong> Connect dropdowns to external systems, analytics tools, or monitoring services</li>
            <li><strong>Event delegation:</strong> Handle events at the document level without needing component references</li>
          </ul>
          <p class="text-xs text-gray-600 mt-2 italic">
            <strong>Example use case:</strong> A global analytics service that tracks all dropdown interactions across your entire app, 
            regardless of which component opened them.
          </p>
        </div>
        <p class="text-sm text-gray-600 mb-2">Expected: Document receives CustomEvents that can be listened to from anywhere. Check browser console for event logs.</p>
        <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong> Open browser console (F12), then interact with the dropdown below. You'll see events logged like 
          <code class="bg-white px-1 rounded">🔵 DOM Event - OPEN:</code> with full event details.
        </p>
        <button ref="test72" class="px-3 py-2 border rounded">DOM Events Test (Check Console)</button>
        <DropdownHandler :anchor="test72"
          :config="{ trigger: 'click', width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="font-semibold mb-2">DOM CustomEvent Test</p>
            <p class="text-sm mb-2">Open browser console (F12) and interact with this dropdown:</p>
            <ul class="list-disc ml-4 mt-2 text-sm space-y-1">
              <li><strong>Click to open</strong> → <code class="bg-gray-100 px-1 rounded">DropdownHandler:open</code> event fires</li>
              <li><strong>Click outside to close</strong> → <code class="bg-gray-100 px-1 rounded">DropdownHandler:close</code> event fires</li>
              <li><strong>On reposition</strong> → <code class="bg-gray-100 px-1 rounded">DropdownHandler:repositioned</code> event fires</li>
            </ul>
            <p class="text-xs text-gray-500 mt-3">
              These events are available globally via <code class="bg-gray-100 px-1 rounded">document.addEventListener('DropdownHandler:open', ...)</code>
            </p>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 7.3: Public API (open, close, toggle, reposition, isOpen) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 7.3: Public API (open, close, toggle, reposition, isOpen, setLoading)</h3>
        <div class="mb-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            The Public API provides <strong>imperative methods</strong> you can call directly on a dropdown instance. 
            Get the instance using a <code class="bg-white px-1 rounded">ref</code> in Vue, then call methods like 
            <code class="bg-white px-1 rounded">dropdownRef.open()</code> or <code class="bg-white px-1 rounded">dropdownRef.close()</code>.
          </p>
          <p class="text-sm font-semibold mb-2">Available Methods:</p>
          <div class="grid md:grid-cols-2 gap-2 text-xs">
            <div class="bg-white p-2 rounded">
              <code class="font-mono text-blue-700">open(mode?)</code>
              <p class="text-gray-600 mt-1">Opens the dropdown. If already open, repositions it. Optional mode: 'click', 'hover', 'focus'</p>
            </div>
            <div class="bg-white p-2 rounded">
              <code class="font-mono text-red-700">close(origin?)</code>
              <p class="text-gray-600 mt-1">Closes the dropdown. Origin is a string describing why it closed (e.g., 'manual', 'outside-click')</p>
            </div>
            <div class="bg-white p-2 rounded">
              <code class="font-mono text-purple-700">toggle()</code>
              <p class="text-gray-600 mt-1">Opens if closed, closes if open. Returns true if opened, false if closed</p>
            </div>
            <div class="bg-white p-2 rounded">
              <code class="font-mono text-yellow-700">reposition(reason?)</code>
              <p class="text-gray-600 mt-1">Manually triggers repositioning. Useful after content changes or window resize</p>
            </div>
            <div class="bg-white p-2 rounded">
              <code class="font-mono text-indigo-700">isOpen()</code>
              <p class="text-gray-600 mt-1">Returns boolean: true if dropdown is currently open, false if closed</p>
            </div>
            <div class="bg-white p-2 rounded">
              <code class="font-mono text-teal-700">setLoading(boolean)</code>
              <p class="text-gray-600 mt-1">Shows/hides loading indicator. Useful for async operations before showing content</p>
            </div>
          </div>
          <p class="text-sm font-semibold mb-2 mt-3">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>External triggers:</strong> Open dropdown from a button that's not the anchor (e.g., "Show menu" button elsewhere)</li>
            <li><strong>Form integration:</strong> Close dropdown after form submission or validation</li>
            <li><strong>Conditional logic:</strong> Check <code class="bg-white px-1 rounded">isOpen()</code> before performing actions</li>
            <li><strong>Async operations:</strong> Use <code class="bg-white px-1 rounded">setLoading(true)</code> while fetching data, then <code class="bg-white px-1 rounded">setLoading(false)</code></li>
            <li><strong>Dynamic content:</strong> Call <code class="bg-white px-1 rounded">reposition()</code> after dropdown content changes size</li>
            <li><strong>Programmatic control:</strong> Build custom dropdown controls, keyboard shortcuts, or automation</li>
          </ul>
          <p class="text-xs text-gray-600 mt-2 italic">
            <strong>Example use case:</strong> A search form that opens a dropdown, shows loading while fetching results, 
            then displays results. On submit, closes the dropdown and shows success message.
          </p>
        </div>
        <p class="text-sm text-gray-600 mb-2">Expected: All API methods work correctly. Click the colored buttons above to test each method. Check console for event logs.</p>
        <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong> Use the colored buttons above to call each API method. The dropdown will respond accordingly. 
          Click "isOpen()" to see an alert with the current state. Check browser console to see events fire when methods are called.
        </p>

        <div class="space-x-2 mb-3 flex flex-wrap gap-2">
          <button ref="test73anchor" class="px-3 py-2 border rounded bg-gray-100">Anchor Element</button>
          <button @click.stop="test73ref?.open()" class="px-3 py-2 border rounded bg-green-100 hover:bg-green-200 transition-colors">
            <span class="font-mono text-xs">open()</span>
          </button>
          <button @click.stop="test73ref?.close('manual')" class="px-3 py-2 border rounded bg-red-100 hover:bg-red-200 transition-colors">
            <span class="font-mono text-xs">close()</span>
          </button>
          <button @click.stop="test73ref?.toggle()" class="px-3 py-2 border rounded bg-blue-100 hover:bg-blue-200 transition-colors">
            <span class="font-mono text-xs">toggle()</span>
          </button>
          <button @click.stop="test73ref?.reposition()"
            class="px-3 py-2 border rounded bg-yellow-100 hover:bg-yellow-200 transition-colors">
            <span class="font-mono text-xs">reposition()</span>
          </button>
          <button @click.stop="testIsOpen" class="px-3 py-2 border rounded bg-purple-100 hover:bg-purple-200 transition-colors">
            <span class="font-mono text-xs">isOpen()</span>
          </button>
          <button @click.stop="test73ref?.setLoading(true)" class="px-3 py-2 border rounded bg-teal-100 hover:bg-teal-200 transition-colors">
            <span class="font-mono text-xs">setLoading(true)</span>
          </button>
          <button @click.stop="test73ref?.setLoading(false)" class="px-3 py-2 border rounded bg-orange-100 hover:bg-orange-200 transition-colors">
            <span class="font-mono text-xs">setLoading(false)</span>
          </button>
        </div>

        <DropdownHandler ref="test73ref" :anchor="test73anchor"
          :config="{ trigger: 'click', width: 350, loader: { style: 'spinner' }, style: { class: 'bg-white border rounded shadow-xl' } }"
          @open="e => console.log('✓ API Test - OPEN:', e)" @close="e => console.log('✓ API Test - CLOSE:', e)"
          @toggle="e => console.log('✓ API Test - TOGGLE:', e)"
          @repositioned="e => console.log('✓ API Test - REPOSITIONED:', e)"
          @collided="e => console.log('✓ API Test - COLLIDED:', e)">
          <div class="p-4">
            <p class="font-semibold mb-2">Public API Test</p>
            <p class="text-sm mb-2">Use the colored buttons above to test each API method:</p>
            <ul class="list-disc ml-4 mt-2 text-sm space-y-1">
              <li><strong>open()</strong> - Opens dropdown (or repositions if already open)</li>
              <li><strong>close()</strong> - Closes dropdown with 'manual' origin</li>
              <li><strong>toggle()</strong> - Opens if closed, closes if open</li>
              <li><strong>reposition()</strong> - Manually recalculates position</li>
              <li><strong>isOpen()</strong> - Shows alert with current open state</li>
              <li><strong>setLoading(true/false)</strong> - Shows/hides loading spinner</li>
            </ul>
            <p class="text-xs text-gray-500 mt-3">Check browser console (F12) to see events fire when methods are called</p>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 7.4: One-open-at-a-time stack -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 7.4: One-Open-At-A-Time Stack (Auto-Close Behavior)</h3>
        <div class="mb-3 p-3 bg-orange-50 rounded border-l-4 border-orange-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            DropdownHandler maintains a <strong>stack</strong> of open dropdowns. By default, when a new dropdown opens, 
            it automatically closes any other open dropdowns in the same layer (unless they're in the same group). 
            The closed dropdown receives a <code class="bg-white px-1 rounded">close</code> event with 
            <code class="bg-white px-1 rounded">origin: 'stack-opened-other'</code>.
          </p>
          <p class="text-sm font-semibold mb-2">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>Clean UI:</strong> Prevents multiple dropdowns from cluttering the screen</li>
            <li><strong>User experience:</strong> Users expect one menu at a time in most interfaces</li>
            <li><strong>Focus management:</strong> Ensures only one interactive element is active</li>
            <li><strong>Event tracking:</strong> You can detect when a dropdown closes due to another opening</li>
            <li><strong>Layer separation:</strong> Tooltips (layer: 'tooltip') don't close dropdowns (layer: 'dropdown')</li>
            <li><strong>Group exceptions:</strong> Dropdowns with the same group can stay open together (for nested menus)</li>
          </ul>
          <p class="text-xs text-gray-600 mt-2 italic">
            <strong>Example use case:</strong> A navigation menu where opening one submenu automatically closes any other open submenu, 
            keeping the interface clean and focused.
          </p>
        </div>
        <p class="text-sm text-gray-600 mb-2">
          Expected: Opening one dropdown automatically closes the other. The closed dropdown fires a <code class="bg-gray-100 px-1 rounded">close</code> 
          event with <code class="bg-gray-100 px-1 rounded">origin: 'stack-opened-other'</code>. Check browser console to see the close events.
        </p>
        <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong> Open browser console (F12), then click Dropdown A. Next, click Dropdown B - you should see 
          Dropdown A close with origin 'stack-opened-other' logged in console. Then click Dropdown C - Dropdown B should close the same way.
        </p>

        <div class="space-x-2 mb-3">
          <button ref="test74a" class="px-3 py-2 border rounded bg-blue-50 hover:bg-blue-100 transition-colors">Dropdown A</button>
          <button ref="test74b" class="px-3 py-2 border rounded bg-green-50 hover:bg-green-100 transition-colors">Dropdown B</button>
          <button ref="test74c" class="px-3 py-2 border rounded bg-purple-50 hover:bg-purple-100 transition-colors">Dropdown C</button>
        </div>

        <DropdownHandler :anchor="test74a"
          :config="{ trigger: 'click', width: 300, style: { class: 'bg-blue-100 border rounded shadow-xl' } }"
          @close="e => console.log('🔵 Dropdown A closed:', e)">
          <div class="p-4">
            <p class="font-semibold mb-2">Dropdown A</p>
            <p class="text-sm">Opening B or C should close this</p>
            <p class="text-xs text-gray-500 mt-2">Check console for close event with origin: 'stack-opened-other'</p>
          </div>
        </DropdownHandler>

        <DropdownHandler :anchor="test74b"
          :config="{ trigger: 'click', width: 300, style: { class: 'bg-green-100 border rounded shadow-xl' } }"
          @close="e => console.log('🟢 Dropdown B closed:', e)">
          <div class="p-4">
            <p class="font-semibold mb-2">Dropdown B</p>
            <p class="text-sm">Opening A or C should close this</p>
            <p class="text-xs text-gray-500 mt-2">Check console for close event with origin: 'stack-opened-other'</p>
          </div>
        </DropdownHandler>

        <DropdownHandler :anchor="test74c"
          :config="{ trigger: 'click', width: 300, style: { class: 'bg-purple-100 border rounded shadow-xl' } }"
          @close="e => console.log('🟣 Dropdown C closed:', e)">
          <div class="p-4">
            <p class="font-semibold mb-2">Dropdown C</p>
            <p class="text-sm">Opening A or B should close this</p>
            <p class="text-xs text-gray-500 mt-2">Check console for close event with origin: 'stack-opened-other'</p>
          </div>
        </DropdownHandler>
      </div>
    </section>

    <!-- SECTION 8: LIFECYCLE & CLEANUP -->
    <section class="border-2 border-teal-500 rounded-lg p-6 bg-teal-50">
      <h2 class="text-2xl font-bold mb-4 text-teal-900">Section 8: Lifecycle & Cleanup</h2>
      <div class="mb-6 bg-teal-100 p-4 rounded-lg border-l-4 border-teal-600">
        <h3 class="font-bold text-lg mb-3 text-teal-900">What is this section about?</h3>
        <p class="text-sm text-gray-700 mb-3">
          This section tests how DropdownHandler manages its <strong>lifecycle</strong> - from creation to destruction. 
          Proper lifecycle management ensures:
        </p>
        <div class="grid md:grid-cols-2 gap-4 mb-3">
          <div class="bg-white p-3 rounded">
            <h4 class="font-semibold mb-2 text-red-700">1. Memory Leaks Prevention</h4>
            <p class="text-xs text-gray-700 mb-2">
              Event listeners, timers, and DOM references must be cleaned up when dropdowns close or components unmount. 
              Otherwise, they accumulate and cause memory leaks.
            </p>
            <p class="text-xs text-gray-600">
              <strong>Impact:</strong> Apps become slower over time, browsers consume more memory, performance degrades
            </p>
          </div>
          <div class="bg-white p-3 rounded">
            <h4 class="font-semibold mb-2 text-blue-700">2. Route Navigation Handling</h4>
            <p class="text-xs text-gray-700 mb-2">
              In single-page applications (SPAs), route changes should close dropdowns to prevent them from appearing 
              on wrong pages or persisting incorrectly.
            </p>
            <p class="text-xs text-gray-600">
              <strong>Impact:</strong> Better UX, prevents confusion, ensures UI state matches route state
            </p>
          </div>
        </div>
        <p class="text-xs text-gray-600 italic">
          <strong>Why this matters:</strong> Without proper cleanup, your app will have memory leaks, event listeners firing 
          on wrong elements, and dropdowns appearing in unexpected places. This section verifies DropdownHandler handles 
          all cleanup correctly.
        </p>
      </div>

      <!-- Test 8.1: Event listeners bound/removed -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 8.1: Event Listener Lifecycle (Bound When Open, Removed When Closed)</h3>
        <div class="mb-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            DropdownHandler dynamically adds and removes event listeners based on the dropdown's open/closed state. 
            When open, it listens for: <code class="bg-white px-1 rounded">click</code> (outside clicks), 
            <code class="bg-white px-1 rounded">keydown</code> (Escape key), <code class="bg-white px-1 rounded">scroll</code> 
            (page scroll), and <code class="bg-white px-1 rounded">resize</code> (window resize). When closed or unmounted, 
            all listeners are removed.
          </p>
          <p class="text-sm font-semibold mb-2">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>Memory leaks:</strong> Unremoved listeners keep references to DOM elements and functions, preventing garbage collection</li>
            <li><strong>Performance:</strong> Too many active listeners slow down event handling across the entire page</li>
            <li><strong>Unexpected behavior:</strong> Listeners from closed dropdowns can fire on wrong elements or interfere with other components</li>
            <li><strong>Resource usage:</strong> Each listener consumes memory and CPU cycles even when not needed</li>
            <li><strong>Component unmounting:</strong> When Vue component is destroyed, all listeners must be cleaned up or they'll cause errors</li>
            <li><strong>Multiple instances:</strong> With many dropdowns, unremoved listeners multiply and cause severe performance issues</li>
          </ul>
          <p class="text-xs text-gray-600 mt-2 italic">
            <strong>Example problem:</strong> If you open and close 100 dropdowns without cleanup, you'd have 400+ event listeners 
            (4 per dropdown) all firing on every click, scroll, resize, and keydown - making the app extremely slow.
          </p>
          <div class="mt-3 p-2 bg-white rounded text-xs">
            <p class="font-semibold mb-1">Listeners added when dropdown opens:</p>
            <ul class="list-disc ml-4 space-y-1 text-gray-700">
              <li><code class="bg-gray-100 px-1 rounded">document.addEventListener('click', ...)</code> - Detects outside clicks</li>
              <li><code class="bg-gray-100 px-1 rounded">document.addEventListener('keydown', ...)</code> - Detects Escape key</li>
              <li><code class="bg-gray-100 px-1 rounded">window.addEventListener('scroll', ...)</code> - Detects page scroll (if enabled)</li>
              <li><code class="bg-gray-100 px-1 rounded">window.addEventListener('resize', ...)</code> - Detects window resize</li>
            </ul>
            <p class="font-semibold mb-1 mt-2">All removed when dropdown closes or component unmounts</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-2">
          Expected: Event listeners are only active when dropdown is open. When closed or component unmounted, all listeners 
          are removed. You can verify this by checking that outside clicks, Esc key, and scroll only affect the dropdown when it's open.
        </p>
        <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong> Open the dropdown below and try: clicking outside (should close), pressing Esc (should close), 
          scrolling page (should close if closeOnScroll: true). Close the dropdown and try the same actions - nothing should happen 
          because listeners are removed. Use browser DevTools → Performance → Record to verify no lingering listeners.
        </p>
        <button ref="test81" class="px-3 py-2 border rounded bg-teal-100 hover:bg-teal-200 transition-colors">Listener Lifecycle Test</button>
        <DropdownHandler :anchor="test81"
          :config="{ trigger: 'click', closeOnScroll: true, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="font-semibold mb-2">Event Listener Lifecycle Test</p>
            <p class="text-sm mb-3">While this dropdown is <strong>open</strong>, try:</p>
            <ul class="list-disc ml-4 text-sm space-y-1 mb-3">
              <li><strong>Click outside</strong> → Should close (listener active)</li>
              <li><strong>Press Esc key</strong> → Should close (listener active)</li>
              <li><strong>Scroll page</strong> → Should close (listener active)</li>
            </ul>
            <p class="text-sm mb-2">After closing, try the same actions:</p>
            <ul class="list-disc ml-4 text-sm space-y-1">
              <li><strong>Click outside</strong> → Nothing happens (listener removed)</li>
              <li><strong>Press Esc</strong> → Nothing happens (listener removed)</li>
              <li><strong>Scroll page</strong> → Nothing happens (listener removed)</li>
            </ul>
            <p class="text-xs text-gray-500 mt-3">
              This proves listeners are properly cleaned up when dropdown closes, preventing memory leaks.
            </p>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 8.2: Route change handling -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 8.2: Route Change Handling (hashchange/popstate events)</h3>
        <div class="mb-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            In single-page applications (SPAs) using Vue Router or similar, route changes trigger browser events like 
            <code class="bg-white px-1 rounded">hashchange</code> (for hash-based routing like <code class="bg-white px-1 rounded">#/page</code>) 
            and <code class="bg-white px-1 rounded">popstate</code> (for history-based routing). DropdownHandler can automatically 
            close dropdowns when these events fire, controlled by the <code class="bg-white px-1 rounded">destroyOnRouteChange</code> option.
          </p>
          <p class="text-sm font-semibold mb-2">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>Navigation UX:</strong> Dropdowns shouldn't persist when user navigates to a different page/view</li>
            <li><strong>State consistency:</strong> UI state should match route state - open dropdowns on wrong pages confuse users</li>
            <li><strong>Memory cleanup:</strong> Closing dropdowns on route change ensures proper cleanup of listeners and DOM references</li>
            <li><strong>Back/forward navigation:</strong> When user uses browser back/forward buttons, dropdowns should close appropriately</li>
            <li><strong>Deep linking:</strong> If user shares a URL with hash, dropdowns shouldn't be open when page loads</li>
            <li><strong>Flexibility:</strong> Some dropdowns (like persistent notifications) might need to stay open - hence the option</li>
          </ul>
          <p class="text-xs text-gray-600 mt-2 italic">
            <strong>Example problem:</strong> User opens a menu dropdown, then clicks a link that changes the route. Without 
            <code class="bg-white px-1 rounded">destroyOnRouteChange: true</code>, the dropdown stays open on the new page, 
            appearing over content it shouldn't be on, confusing the user.
          </p>
          <div class="mt-3 p-2 bg-white rounded text-xs">
            <p class="font-semibold mb-1">Events monitored:</p>
            <ul class="list-disc ml-4 space-y-1 text-gray-700">
              <li><code class="bg-gray-100 px-1 rounded">window.addEventListener('hashchange', ...)</code> - Fires when URL hash changes (#/page1 → #/page2)</li>
              <li><code class="bg-gray-100 px-1 rounded">window.addEventListener('popstate', ...)</code> - Fires on browser back/forward navigation</li>
            </ul>
            <p class="font-semibold mb-1 mt-2">Configuration:</p>
            <ul class="list-disc ml-4 space-y-1 text-gray-700">
              <li><code class="bg-gray-100 px-1 rounded">destroyOnRouteChange: true</code> (default) - Closes dropdown on route change</li>
              <li><code class="bg-gray-100 px-1 rounded">destroyOnRouteChange: false</code> - Keeps dropdown open during route changes</li>
            </ul>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-2">
          Expected: When <code class="bg-gray-100 px-1 rounded">destroyOnRouteChange: true</code>, changing the URL hash closes the dropdown. 
          When <code class="bg-gray-100 px-1 rounded">false</code>, the dropdown persists through route changes. This test simulates route 
          changes by modifying the URL hash.
        </p>
        <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong> Open the first dropdown below, then click "Change Hash" button. The dropdown should close immediately 
          (because <code class="bg-gray-100 px-1 rounded">destroyOnRouteChange: true</code>). For the second dropdown, open it and click 
          "Change Hash" - it should stay open (because <code class="bg-gray-100 px-1 rounded">destroyOnRouteChange: false</code>). 
          You can also manually change the URL hash in the address bar to test.
        </p>

        <div class="space-y-4">
          <div>
            <button ref="test82a" class="px-3 py-2 border rounded bg-blue-100 hover:bg-blue-200 transition-colors">Close on Route Change</button>
            <DropdownHandler :anchor="test82a"
              :config="{ trigger: 'click', destroyOnRouteChange: true, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">destroyOnRouteChange: true (Default)</p>
                <p class="text-sm mb-3 text-gray-700">
                  This dropdown will automatically close when the route changes (hashchange or popstate events).
                </p>
                <button @click="changeHash()" class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Change Hash (should close dropdown)
                </button>
                <p class="text-xs text-gray-500 mt-2">
                  Click the button above to simulate a route change. The dropdown should close immediately.
                </p>
              </div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test82b" class="px-3 py-2 border rounded bg-green-100 hover:bg-green-200 transition-colors">Persist on Route Change</button>
            <DropdownHandler :anchor="test82b"
              :config="{ trigger: 'click', destroyOnRouteChange: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">destroyOnRouteChange: false</p>
                <p class="text-sm mb-3 text-gray-700">
                  This dropdown will stay open even when the route changes. Useful for persistent notifications or modals.
                </p>
                <button @click="changeHash()" class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  Change Hash (dropdown stays open)
                </button>
                <p class="text-xs text-gray-500 mt-2">
                  Click the button above to simulate a route change. The dropdown should remain open.
                </p>
              </div>
            </DropdownHandler>
          </div>
        </div>
        <div class="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <p class="text-xs text-gray-700">
            <strong>💡 Tip:</strong> You can also test this manually by opening a dropdown, then changing the URL hash in your browser's 
            address bar (e.g., add <code class="bg-white px-1 rounded">#test</code> to the URL). The first dropdown will close, 
            the second will stay open.
          </p>
        </div>
      </div>
    </section>

    <!-- SECTION 9: STYLING & ANIMATION -->
    <section class="border-2 border-red-500 rounded-lg p-6 bg-red-50">
      <h2 class="text-2xl font-bold mb-4 text-red-900">Section 9: Styling & Animation</h2>

      <!-- Test 9.1: No hard-coded CSS -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 9.1: No Hard-Coded CSS (all visuals from style.class)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: All styling comes from Tailwind classes in config.style.class
        </p>

        <div class="space-y-2">
          <div>
            <button ref="test91a" class="px-3 py-2 border rounded">Blue Theme</button>
            <DropdownHandler :anchor="test91a"
              :config="{ trigger: 'click', width: 300, style: { class: 'bg-blue-500 text-white rounded-lg shadow-2xl' } }">
              <div class="p-4">Blue background, white text (from Tailwind classes)</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test91b" class="px-3 py-2 border rounded">Green Theme</button>
            <DropdownHandler :anchor="test91b"
              :config="{ trigger: 'click', width: 300, style: { class: 'bg-green-100 border-2 border-green-500 rounded-xl shadow-lg' } }">
              <div class="p-4">Green theme (from Tailwind classes)</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test91c" class="px-3 py-2 border rounded">Dark Theme</button>
            <DropdownHandler :anchor="test91c"
              :config="{ trigger: 'click', width: 300, style: { class: 'bg-gray-900 text-gray-100 rounded-md shadow-xl border border-gray-700' } }">
              <div class="p-4">Dark theme (from Tailwind classes)</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 9.2: Animations -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 9.2: Animations (none, fade, scale, fade-scale, slide-up, slide-down,
          slide-in-bottom-mobile)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Animation classes applied, duration respected. Scale should have NO fade effect.</p>

        <div class="space-y-2">
          <div>
            <button ref="test92a" class="px-3 py-2 border rounded">Animation: none</button>
            <DropdownHandler :anchor="test92a"
              :config="{ trigger: 'click', animation: 'none', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">No animation (instant)</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test92b" class="px-3 py-2 border rounded">Animation: fade</button>
            <DropdownHandler :anchor="test92b"
              :config="{ trigger: 'click', animation: 'fade', animationDurationMs: 200, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Fade animation only (200ms) - opacity changes, no scale</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test92c" class="px-3 py-2 border rounded">Animation: scale</button>
            <DropdownHandler :anchor="test92c"
              :config="{ trigger: 'click', animation: 'scale', animationDurationMs: 200, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Scale animation only (200ms) - NO fade, only scale transform</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test92f" class="px-3 py-2 border rounded">Animation: fade-scale</button>
            <DropdownHandler :anchor="test92f"
              :config="{ trigger: 'click', animation: 'fade-scale', animationDurationMs: 200, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Fade AND Scale animation (200ms) - both opacity and scale change together</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test92d" class="px-3 py-2 border rounded">Animation: slide-up</button>
            <DropdownHandler :anchor="test92d"
              :config="{ trigger: 'click', animation: 'slide-up', animationDurationMs: 250, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Slide-up animation (250ms)</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test92e" class="px-3 py-2 border rounded">Animation: slide-down</button>
            <DropdownHandler :anchor="test92e"
              :config="{ trigger: 'click', animation: 'slide-down', animationDurationMs: 250, width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">Slide-down animation (250ms)</div>
            </DropdownHandler>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 10: GAPS / NEW FEATURES -->
    <section class="border-2 border-gray-500 rounded-lg p-6 bg-gray-50">
      <h2 class="text-2xl font-bold mb-4 text-gray-900">Section 10: Previously Missing Features (Now Implemented)</h2>

      <!-- Test 10.1: maxWidth -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 10.1: maxWidth Constraint</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Width is constrained by maxWidth value, even if width config is larger</p>
        <p class="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded">
          <strong>How to test:</strong> Open the dropdown below and inspect it in DevTools. The dropdown should be 400px wide maximum, 
          even though width is set to 800px. The maxWidth constraint overrides the width setting.
        </p>
        <button ref="test101" class="px-3 py-2 border rounded bg-blue-100 hover:bg-blue-200 transition-colors">maxWidth Test (800px width, 400px max)</button>
        <DropdownHandler :anchor="test101"
          :config="{ trigger: 'click', width: 800, maxWidth: '400px', style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="font-semibold mb-3 text-lg">maxWidth Constraint Test</p>
            <div class="space-y-3">
              <div class="p-3 bg-blue-50 rounded">
                <p class="text-sm font-semibold mb-1">Configuration:</p>
                <ul class="text-xs space-y-1 ml-4 list-disc">
                  <li>width: <code class="bg-white px-1 rounded">800px</code></li>
                  <li>maxWidth: <code class="bg-white px-1 rounded">400px</code></li>
                </ul>
              </div>
              <div class="p-3 bg-green-50 rounded">
                <p class="text-sm font-semibold mb-1">Expected Result:</p>
                <p class="text-xs">Dropdown should be exactly <strong>400px wide</strong> (constrained by maxWidth)</p>
                <p class="text-xs text-gray-600 mt-1">Inspect element to verify: <code class="bg-white px-1 rounded">width: 400px</code></p>
              </div>
              <div class="border-t pt-3">
                <p class="text-sm mb-2">This is sample content to demonstrate the maxWidth constraint:</p>
                <div class="space-y-2">
                  <div class="p-2 bg-gray-50 rounded text-sm">Content item 1</div>
                  <div class="p-2 bg-gray-50 rounded text-sm">Content item 2</div>
                  <div class="p-2 bg-gray-50 rounded text-sm">Content item 3</div>
                </div>
              </div>
            </div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 10.2: theme mapping -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 10.2: Theme Mapping (tooltip-dark, tooltip-light, dropdown-panel)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Theme presets apply correct classes via helper</p>

        <div class="space-y-2">
          <div>
            <button ref="test102a" class="px-3 py-2 border rounded">Theme: tooltip-dark</button>
            <DropdownHandler :anchor="test102a"
              :config="{ trigger: 'hover', theme: 'tooltip-dark', width: 200, scrollEnabled: false }">
                <div class="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 bg-gray-900"></div>
              <div>Dark tooltip theme</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test102b" class="px-3 py-2 border rounded">Theme: tooltip-light</button>
            <DropdownHandler :anchor="test102b"
              :config="{ trigger: 'hover', theme: 'tooltip-light', width: 200, scrollEnabled: false }">
              <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-200"></div>
              <div>Light tooltip theme</div>
            </DropdownHandler>
          </div>

          <div>
            <button ref="test102c" class="px-3 py-2 border rounded">Theme: dropdown-panel</button>
            <DropdownHandler :anchor="test102c" :config="{ trigger: 'click', theme: 'dropdown-panel', width: 320 }">
              <div class="p-4">Dropdown panel theme</div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 10.3: loader UI -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 10.3: Loader UI</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Loading indicator appears automatically when dropdown opens, then hides after 2 seconds</p>
        <p class="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded">
          <strong>How to test:</strong> Click the button below to open the dropdown. The loader spinner should appear immediately, 
          then automatically disappear after 2 seconds to reveal the content.
        </p>
        <button ref="test103" class="px-3 py-2 border rounded bg-blue-100 hover:bg-blue-200 transition-colors">Loader Test (Auto-shows on open)</button>
        <DropdownHandler ref="test103ref" :anchor="test103"
          :config="{ trigger: 'click', width: 350, loader: { style: 'spinner', class: 'text-blue-500' }, style: { class: 'bg-white border rounded shadow-xl' } }"
          @open="handleLoaderTestOpen">
          <div class="p-4">
            <p class="font-semibold mb-3">Loader UI Test</p>
            <p class="text-sm mb-2">The loader should have appeared automatically when you opened this dropdown.</p>
            <p class="text-sm text-gray-600">After 2 seconds, the loader disappears and this content is shown.</p>
            <div class="mt-4 p-3 bg-gray-50 rounded">
              <p class="text-xs font-semibold mb-1">Loader Configuration:</p>
              <ul class="text-xs space-y-1 ml-4 list-disc">
                <li>style: <code class="bg-white px-1 rounded">'spinner'</code></li>
                <li>class: <code class="bg-white px-1 rounded">'text-blue-500'</code></li>
                <li>Auto-shows on open</li>
                <li>Auto-hides after 2 seconds</li>
              </ul>
            </div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test 10.4: toggle & collided events -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 10.4: Toggle & Collided Events (Now Emitted)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Both events emit properly. Already tested in 7.1</p>
        <p class="text-sm text-gray-500">See Test 7.1 for event emission verification</p>
      </div>
    </section>

    <!-- TOOLTIP TESTS -->
    <section class="border-2 border-cyan-500 rounded-lg p-6 bg-cyan-50">
      <h2 class="text-2xl font-bold mb-4 text-cyan-900">Tooltip Tests (As Generic Floating Layer)</h2>

      <!-- Test T1: Tooltip hover open/close -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T1: Tooltip Hover (hover intent, leave closes)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Opens after hoverIntentMs, closes on leave</p>
        <button ref="testT1" class="px-3 py-2 border rounded inline-flex items-center gap-1">
          Hover for Tooltip <span class="text-xs">ℹ️</span>
        </button>
        <DropdownHandler :anchor="testT1"
          :config="{ trigger: 'hover', hoverIntentMs: 80, layer: 'tooltip', theme: 'tooltip-dark', width: 200, ariaRole: 'tooltip', scrollEnabled: false, closeOnScroll: false }">
          <div class="relative">
            <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-2 h-2 rotate-45 bg-gray-900"></div>
            <div>This is a hover tooltip</div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test T2: Tooltip focus (keyboard accessible) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T2: Tooltip Focus (keyboard accessible)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Tab to focus opens, Tab away closes</p>
        <button ref="testT2" tabindex="0" class="px-3 py-2 border rounded inline-flex items-center gap-1">
          Tab Here <span class="text-xs">⌨️</span>
        </button>
        <DropdownHandler :anchor="testT2"
          :config="{ trigger: 'focus', layer: 'tooltip', theme: 'tooltip-light', width: 220, ariaRole: 'tooltip', scrollEnabled: false }">
          <div class="relative">
            <div class="absolute left-1/2 -translate-x-1/2 -top-3 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-200"></div>
            <div class="text-gray-900">Keyboard accessible tooltip</div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test T3: Tooltip themes -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T3: Tooltip Themes (dark vs light)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Theme classes applied correctly</p>
        <div class="space-x-2">
          <button ref="testT3a" class="px-3 py-2 border rounded">Dark Theme</button>
          <button ref="testT3b" class="px-3 py-2 border rounded">Light Theme</button>
        </div>
        <DropdownHandler :anchor="testT3a"
          :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-dark', width: 200, ariaRole: 'tooltip', scrollEnabled: false }">
          <div class="relative">
            <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-2 h-2 rotate-45 bg-gray-900"></div>
            <div>Dark tooltip theme</div>
          </div>
        </DropdownHandler>
        <DropdownHandler :anchor="testT3b"
          :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-light', width: 200, ariaRole: 'tooltip', scrollEnabled: false }">
          <div class="relative">
            <div class="absolute left-1/2 -translate-x-1/2 -top-3 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-200"></div>
            <div class="text-gray-900">Light tooltip theme</div>
          </div>
        </DropdownHandler>
      </div>
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T4: Tooltip Arrow Placement (Top, Bottom, Left, Right)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Arrow element aligns correctly based on placement. Arrow should point to anchor center. Each placement requires different arrow positioning.</p>
        <p class="text-xs text-gray-500 mb-3 bg-yellow-50 p-2 rounded">
          <strong>How to test:</strong> Hover over each button below. The tooltip should appear with an arrow pointing to the button. 
          The arrow position changes based on tooltip placement (top/bottom/left/right).
        </p>
        <div class="space-y-4">
          <!-- Bottom placement - arrow on top pointing up -->
          <div>
            <button ref="testT4a" class="px-3 py-2 border rounded bg-blue-50">Tooltip with Arrow (Bottom - Arrow Up)</button>
            <DropdownHandler :anchor="testT4a" :config="{
              trigger: 'hover',
              layer: 'tooltip',
              offset: 12,
              width: 220,
              flipOnOverflow: true,
              style: { class: 'bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg' },
              ariaRole: 'tooltip',
              scrollEnabled: false
            }">
              <div class="relative">
                <div class="absolute left-1/2 -translate-x-1/2 -top-3 w-2 h-2 rotate-45 bg-gray-900"></div>
                <div>Tooltip below button - arrow pointing up</div>
              </div>
            </DropdownHandler>
          </div>

          <!-- Top placement - arrow on bottom pointing down -->
          <div style="margin-top: 200px;">
            <button ref="testT4b" class="px-3 py-2 border rounded bg-green-50">Tooltip with Arrow (Top - Arrow Down)</button>
            <DropdownHandler :anchor="testT4b" :config="{
              trigger: 'hover',
              layer: 'tooltip',
              offset: 12,
              width: 220,
              positionMode: 'above',
              flipOnOverflow: false,
              style: { class: 'bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg' },
              ariaRole: 'tooltip',
              scrollEnabled: false
            }">
              <div class="relative">
                <div class="absolute left-1/2 -translate-x-1/2 -bottom-3 w-2 h-2 rotate-45 bg-gray-900"></div>
                <div>Tooltip above button - arrow pointing down</div>
              </div>
            </DropdownHandler>
          </div>

          <!-- Right placement - arrow on left pointing right -->
          <div class="flex justify-start">
            <button ref="testT4c" class="px-3 py-2 border rounded bg-purple-50">Tooltip with Arrow (Right - Arrow Left)</button>
            <DropdownHandler :anchor="testT4c" :config="{
              trigger: 'hover',
              layer: 'tooltip',
              tooltipPlacement: 'right',
              offset: 12,
              width: 200,
              style: { class: 'bg-gray-900 text-white text-xs rounded-md px-2 py-2 shadow-lg' },
              ariaRole: 'tooltip',
              scrollEnabled: false
            }">
              <div class="relative">
                <div class="absolute top-1/2 -translate-y-1/2 -left-3 w-2 h-2 rotate-45 bg-gray-900"></div>
                <div>Tooltip on right - arrow pointing left</div>
              </div>
            </DropdownHandler>
          </div>

          <!-- Left placement - arrow on right pointing left -->
          <div class="flex justify-end">
            <button ref="testT4d" class="px-3 py-2 border rounded bg-orange-50">Tooltip with Arrow (Left - Arrow Right)</button>
            <DropdownHandler :anchor="testT4d" :config="{
              trigger: 'hover',
              layer: 'tooltip',
              tooltipPlacement: 'left',
              offset: 12,
              width: 200,
              style: { class: 'bg-gray-900 text-white text-xs rounded-md px-2 py-2 shadow-lg' },
              ariaRole: 'tooltip',
              scrollEnabled: false
            }">
              <div class="relative">
                <div class="absolute top-1/2 -translate-y-1/2 -right-3 w-2 h-2 rotate-45 bg-gray-900"></div>
                <div>Tooltip on left - arrow pointing right</div>
              </div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test T5: Tooltip adaptive placement (vertical) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T5: Tooltip Adaptive Placement (current: vertical only)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Flips above when near bottom</p>
        <div style="margin-top: 500px;">
          <button ref="testT5" class="px-3 py-2 border rounded">Near Bottom (should flip)</button>
          <DropdownHandler :anchor="testT5"
            :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-dark', width: 200, flipOnOverflow: true, ariaRole: 'tooltip', scrollEnabled: false }">
            <div class="relative">
              <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-2 h-2 rotate-45 bg-gray-900"></div>
              <div>Should appear ABOVE anchor</div>
            </div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test T6: Tooltip Side Placement (Left & Right) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T6: Tooltip Side Placement (Left & Right with Fallback)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Places tooltip on right/left side of anchor. Falls back to other
          positions if no space.</p>
        <div class="space-y-4">
          <div>
            <button ref="testT6a" class="px-3 py-2 border rounded">Right Side Tooltip</button>
            <DropdownHandler :anchor="testT6a"
              :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-light', width: 200, tooltipPlacement: 'right', tooltipFallbackOrder: ['left', 'top', 'bottom'], ariaRole: 'tooltip', scrollEnabled: false }">
              <div class="relative">
                <div class="absolute top-1/2 -translate-y-1/2 -left-4 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-200"></div>
                <div class="text-gray-900">Tooltip appears on the right side of the button</div>
              </div>
            </DropdownHandler>
          </div>
          <div class="flex justify-end">
            <button ref="testT6b" class="px-3 py-2 border rounded">Left Side Tooltip</button>
            <DropdownHandler :anchor="testT6b"
              :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-light', width: 200, tooltipPlacement: 'left', tooltipFallbackOrder: ['right', 'top', 'bottom'], ariaRole: 'tooltip', scrollEnabled: false }">
              <div class="relative">
                <div class="absolute top-1/2 -translate-y-1/2 -right-4 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-gray-200"></div>
                <div class="text-gray-900">Tooltip appears on the left side of the button</div>
              </div>
            </DropdownHandler>
          </div>
          <div class="flex justify-center">
            <button ref="testT6c" class="px-3 py-2 border rounded">Left Tooltip (Near Edge - Should Fallback)</button>
            <DropdownHandler :anchor="testT6c"
              :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-light', width: 250, tooltipPlacement: 'left', tooltipFallbackOrder: ['right', 'top', 'bottom'], ariaRole: 'tooltip', scrollEnabled: false }">
              <div class="relative">
                <div class="absolute top-1/2 -translate-y-1/2 -right-4 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-gray-200"></div>
                <div class="text-gray-900">This should fallback to right/top/bottom if no space on left</div>
              </div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test T7: Tooltip + Dropdown stack interaction -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T7: Tooltip + Dropdown Layer Interaction (Different Layers Can Coexist)</h3>
        <div class="mb-3 p-3 bg-indigo-50 rounded border-l-4 border-indigo-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            DropdownHandler uses a <strong>layer system</strong> to separate different types of floating elements. 
            There are two main layers: <code class="bg-white px-1 rounded">'dropdown'</code> (default) and 
            <code class="bg-white px-1 rounded">'tooltip'</code>. Elements in different layers can be open simultaneously 
            without interfering with each other.
          </p>
          <p class="text-sm font-semibold mb-2">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>UX flexibility:</strong> Users can see tooltips while a dropdown menu is open (e.g., tooltip on a help icon inside an open dropdown)</li>
            <li><strong>No conflicts:</strong> Tooltips don't accidentally close important dropdown menus when users hover over help text or info icons</li>
            <li><strong>Layered interfaces:</strong> Build complex UIs with multiple floating elements that work together harmoniously</li>
            <li><strong>Information display:</strong> Show contextual tooltips on buttons inside dropdowns without closing the parent menu</li>
            <li><strong>Stack management:</strong> Only dropdowns in the same layer follow the "one-open-at-a-time" rule</li>
            <li><strong>Accessibility:</strong> Tooltips can provide additional context without disrupting the main interaction flow</li>
          </ul>
          <p class="text-xs text-gray-600 mt-2 italic">
            <strong>Example use case:</strong> A user opens a settings dropdown menu. Inside the menu, there's a help icon with a tooltip. 
            When the user hovers over the help icon, the tooltip appears while the dropdown menu stays open, providing context without 
            disrupting the user's workflow.
          </p>
          <div class="mt-3 p-2 bg-white rounded text-xs">
            <p class="font-semibold mb-1">Layer behavior:</p>
            <ul class="list-disc ml-4 space-y-1 text-gray-700">
              <li><code class="bg-gray-100 px-1 rounded">layer: 'dropdown'</code> - Follows one-open-at-a-time rule with other dropdowns</li>
              <li><code class="bg-gray-100 px-1 rounded">layer: 'tooltip'</code> - Doesn't close dropdowns, can coexist with any dropdown</li>
              <li>Different layers = No interference = Both can be open simultaneously</li>
            </ul>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-2">
          Expected: Open the dropdown first, then hover over the tooltip button. Both should remain open simultaneously because 
          they're in different layers. The tooltip should not close the dropdown.
        </p>
        <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong> 
          <strong>Step 1:</strong> Click "1. Open Dropdown" button to open the dropdown menu. 
          <strong>Step 2:</strong> While the dropdown is still open, hover over "2. Hover Tooltip" button. 
          The tooltip should appear, and the dropdown should remain open. Both should be visible at the same time.
        </p>
        <div class="space-x-2 mb-3">
          <button ref="testT7dropdown" class="px-3 py-2 border rounded bg-blue-50 hover:bg-blue-100 transition-colors">1. Open Dropdown</button>
          <button ref="testT7tooltip" class="px-3 py-2 border rounded bg-indigo-50 hover:bg-indigo-100 transition-colors">2. Hover Tooltip</button>
        </div>

        <DropdownHandler :anchor="testT7dropdown"
          :config="{ trigger: 'click', layer: 'dropdown', width: 320, style: { class: 'bg-white border rounded shadow-xl' } }">
          <div class="p-4">
            <p class="font-semibold mb-2">Dropdown Layer (layer: 'dropdown')</p>
            <p class="text-sm mb-2">This is a dropdown menu. It's in the 'dropdown' layer.</p>
            <p class="text-sm mb-3">Now hover over the tooltip button →</p>
            <div class="p-2 bg-blue-50 rounded text-xs">
              <p class="font-semibold mb-1">Expected behavior:</p>
              <p class="text-gray-700">When you hover the tooltip button, the tooltip should appear AND this dropdown should stay open.</p>
              <p class="text-gray-600 mt-1">Both should be visible simultaneously because they're in different layers.</p>
            </div>
          </div>
        </DropdownHandler>

        <DropdownHandler :anchor="testT7tooltip"
          :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-dark', width: 200, ariaRole: 'tooltip', scrollEnabled: false }">
          <div class="relative">
            <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-2 h-2 rotate-45 bg-gray-900"></div>
            <div>Tooltip Layer (layer: 'tooltip') - Doesn't close dropdowns!</div>
          </div>
        </DropdownHandler>
      </div>

      <!-- Test T8: Nested Dropdowns (Parent-Child) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test T8: Nested Dropdowns (Parent-Child with Same Group)</h3>
        <div class="mb-3 p-3 bg-purple-50 rounded border-l-4 border-purple-500">
          <p class="text-sm font-semibold mb-2">What this tests:</p>
          <p class="text-sm text-gray-700 mb-2">
            Nested dropdowns are dropdowns that appear inside other dropdowns (like submenus). By default, opening a new 
            dropdown closes others in the same layer. However, when dropdowns share the same <code class="bg-white px-1 rounded">group</code> 
            value, they can stay open simultaneously, allowing parent and child dropdowns to be visible at the same time.
          </p>
          <p class="text-sm font-semibold mb-2">Why this matters:</p>
          <ul class="text-sm text-gray-700 ml-4 list-disc space-y-1">
            <li><strong>Submenu navigation:</strong> Build multi-level menus where parent and child menus are both visible</li>
            <li><strong>Contextual menus:</strong> Show related options in nested dropdowns without losing the parent context</li>
            <li><strong>User orientation:</strong> Users can see the full menu hierarchy, making navigation easier</li>
            <li><strong>Progressive disclosure:</strong> Reveal additional options in child dropdowns while keeping parent visible</li>
            <li><strong>Menu systems:</strong> Essential for building complex navigation menus (like desktop application menus)</li>
            <li><strong>Flexible triggers:</strong> Works with both click and hover triggers for different interaction patterns</li>
          </ul>
          <p class="text-xs text-gray-600 mt-2 italic">
            <strong>Example use case:</strong> A "File" menu dropdown opens. Inside it, there's a "Recent Files" item. When you 
            click "Recent Files", a child dropdown opens showing the list of recent files. Both the "File" menu and "Recent Files" 
            submenu stay open, allowing users to see the full context and navigate easily.
          </p>
          <div class="mt-3 p-2 bg-white rounded text-xs">
            <p class="font-semibold mb-1">How it works:</p>
            <ul class="list-disc ml-4 space-y-1 text-gray-700">
              <li>Parent dropdown: <code class="bg-gray-100 px-1 rounded">group: 'nested-menu-1'</code></li>
              <li>Child dropdown: <code class="bg-gray-100 px-1 rounded">group: 'nested-menu-1'</code> (same group)</li>
              <li>Same group = Both can stay open = Nested menu behavior</li>
              <li>Different groups = Child would close parent = Normal stack behavior</li>
            </ul>
            <p class="font-semibold mb-1 mt-2">Trigger modes:</p>
            <ul class="list-disc ml-4 space-y-1 text-gray-700">
              <li><strong>Click:</strong> Click parent to open, click child button to open child (both stay open)</li>
              <li><strong>Hover:</strong> Hover parent to open, hover child button to open child (both stay open)</li>
            </ul>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-2">
          Expected: Parent dropdown opens first. Then, clicking/hovering the child button opens the child dropdown. 
          Both parent and child should remain open simultaneously because they share the same group. This creates a nested menu effect.
        </p>
        <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong> 
          <strong>Click/Hover Test:</strong> Open the parent dropdown, then click or hover the "Open Child" button inside. 
          Both dropdowns should be visible at the same time. The child dropdown appears next to its button, creating a nested menu structure.
        </p>
        <div class="space-y-4">
          <div>
            <button ref="testT8parent" class="px-3 py-2 border rounded bg-purple-50 hover:bg-purple-100 transition-colors">Parent Dropdown (Click)</button>
            <DropdownHandler :anchor="testT8parent"
              :config="{ trigger: 'click', layer: 'dropdown', group: 'nested-menu-1', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Parent Menu</p>
                <p class="text-sm mb-3">This is the parent dropdown menu.</p>
                <div class="space-y-2 mb-3">
                  <div class="py-2 px-3 bg-gray-50 rounded text-sm">Menu Item 1</div>
                  <div class="py-2 px-3 bg-gray-50 rounded text-sm">Menu Item 2</div>
                </div>
                <p class="text-sm mb-3 font-semibold">Click "Open Child" below to see nested dropdown:</p>
                <button ref="testT8child" class="px-3 py-2 border rounded bg-blue-50 w-full text-left hover:bg-blue-100 transition-colors flex items-center justify-between">
                  <span>Open Child</span>
                  <span>→</span>
                </button>
                <DropdownHandler :anchor="testT8child"
                  :config="{ trigger: 'click', layer: 'dropdown', group: 'nested-menu-1', width: 250, style: { class: 'bg-blue-50 border rounded shadow-xl' } }">
                  <div class="p-4">
                    <p class="font-semibold mb-2">Child Menu</p>
                    <p class="text-sm mb-2">This is a nested dropdown inside the parent.</p>
                    <div class="space-y-2">
                      <div class="py-2 px-3 bg-blue-100 rounded text-sm">Child Item 1</div>
                      <div class="py-2 px-3 bg-blue-100 rounded text-sm">Child Item 2</div>
                      <div class="py-2 px-3 bg-blue-100 rounded text-sm">Child Item 3</div>
                    </div>
                    <p class="text-xs text-gray-500 mt-3">✅ Both parent and child are open simultaneously</p>
                    <p class="text-xs text-gray-500">Same group allows both to stay open</p>
                  </div>
                </DropdownHandler>
              </div>
            </DropdownHandler>
          </div>
          <div>
            <button ref="testT8parentHover" class="px-3 py-2 border rounded bg-green-50 hover:bg-green-100 transition-colors">Parent Dropdown (Hover)</button>
            <DropdownHandler :anchor="testT8parentHover"
              :config="{ trigger: 'hover', layer: 'dropdown', group: 'nested-menu-2', width: 300, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Parent Menu (Hover)</p>
                <p class="text-sm mb-3">This parent opens on hover.</p>
                <div class="space-y-2 mb-3">
                  <div class="py-2 px-3 bg-gray-50 rounded text-sm">Hover Item 1</div>
                  <div class="py-2 px-3 bg-gray-50 rounded text-sm">Hover Item 2</div>
                </div>
                <p class="text-sm mb-3 font-semibold">Hover "Hover for Child" below to see nested dropdown:</p>
                <button ref="testT8childHover" class="px-3 py-2 border rounded bg-yellow-50 w-full text-left hover:bg-yellow-100 transition-colors flex items-center justify-between">
                  <span>Hover for Child</span>
                  <span>→</span>
                </button>
                <DropdownHandler :anchor="testT8childHover"
                  :config="{ trigger: 'hover', layer: 'dropdown', group: 'nested-menu-2', width: 250, style: { class: 'bg-yellow-50 border rounded shadow-xl' } }">
                  <div class="p-4">
                    <p class="font-semibold mb-2">Child Menu (Hover)</p>
                    <p class="text-sm mb-2">Nested dropdown with hover trigger.</p>
                    <div class="space-y-2">
                      <div class="py-2 px-3 bg-yellow-100 rounded text-sm">Hover Child 1</div>
                      <div class="py-2 px-3 bg-yellow-100 rounded text-sm">Hover Child 2</div>
                    </div>
                    <p class="text-xs text-gray-500 mt-3">✅ Both parent and child stay open on hover</p>
                    <p class="text-xs text-gray-500">Works with hover triggers too!</p>
                  </div>
                </DropdownHandler>
              </div>
            </DropdownHandler>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5C: PAGE SCROLL BEHAVIOR (Fixed Positioning) -->
    <section class="border-2 border-pink-700 rounded-lg p-6 bg-pink-200">
      <h2 class="text-2xl font-bold mb-4 text-pink-900">Section 5C: Page Scroll Behavior (Fixed with Page Scroll)</h2>

      <!-- Test 5C.1: Dropdown Follows Anchor on Scroll (repositionOnScroll: true) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5C.1: Dropdown Follows Anchor on Page Scroll (repositionOnScroll: true)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Dropdown stays fixed relative to viewport and follows anchor element when page scrolls. Should smoothly reposition without bouncing.</p>
        <p class="text-xs text-gray-500 mb-3 bg-yellow-50 p-2 rounded">
          <strong>Instructions:</strong> Open the dropdown below, then scroll the page up and down. The dropdown should smoothly follow the button and maintain its position relative to the anchor.
        </p>

        <div class="space-y-4">
          <div style="padding-top: 200px;">
            <button ref="test5c1a" class="px-3 py-2 border rounded bg-blue-100">Scroll Test 1 (repositionOnScroll: true)</button>
            <DropdownHandler :anchor="test5c1a"
              :config="{ trigger: 'click', repositionOnScroll: true, closeOnScroll: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Fixed with Page Scroll</p>
                <p class="text-sm mb-2">Open this dropdown, then scroll the page.</p>
                <p class="text-sm text-gray-600">The dropdown should smoothly follow the button as you scroll.</p>
                <p class="text-xs text-gray-500 mt-2">repositionOnScroll: true (default)</p>
              </div>
            </DropdownHandler>
          </div>

          <div style="padding-top: 300px;">
            <button ref="test5c1b" class="px-3 py-2 border rounded bg-green-100">Scroll Test 2 (Near Middle)</button>
            <DropdownHandler :anchor="test5c1b"
              :config="{ trigger: 'click', repositionOnScroll: true, closeOnScroll: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Another Scroll Test</p>
                <p class="text-sm">Test scrolling with multiple dropdowns open</p>
              </div>
            </DropdownHandler>
          </div>

          <div style="padding-top: 400px;">
            <button ref="test5c1c" class="px-3 py-2 border rounded bg-purple-100">Scroll Test 3 (Bottom Area)</button>
            <DropdownHandler :anchor="test5c1c"
              :config="{ trigger: 'click', repositionOnScroll: true, closeOnScroll: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
              <div class="p-4">
                <p class="font-semibold mb-2">Scroll Test Near Bottom</p>
                <p class="text-sm">Test scrolling when dropdown is near bottom of page</p>
              </div>
            </DropdownHandler>
          </div>
        </div>
      </div>

      <!-- Test 5C.2: Dropdown Closes on Scroll (closeOnScroll: true) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5C.2: Dropdown Closes on Page Scroll (closeOnScroll: true)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Dropdown closes immediately when page is scrolled. Useful for mobile or when scroll should dismiss dropdown.</p>

        <div style="padding-top: 200px;">
          <button ref="test5c2" class="px-3 py-2 border rounded bg-red-100">Closes on Scroll</button>
          <DropdownHandler :anchor="test5c2"
            :config="{ trigger: 'click', closeOnScroll: true, repositionOnScroll: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
            <div class="p-4">
              <p class="font-semibold mb-2">Closes on Scroll</p>
              <p class="text-sm mb-2">Open this dropdown, then scroll the page.</p>
              <p class="text-sm text-red-600">The dropdown should close immediately when you scroll.</p>
              <p class="text-xs text-gray-500 mt-2">closeOnScroll: true, repositionOnScroll: false</p>
            </div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test 5C.3: No Scroll Behavior (repositionOnScroll: false, closeOnScroll: false) -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5C.3: No Scroll Behavior (repositionOnScroll: false, closeOnScroll: false)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Dropdown stays in original position when page scrolls (may appear detached from anchor).</p>

        <div style="padding-top: 200px;">
          <button ref="test5c3" class="px-3 py-2 border rounded bg-yellow-100">No Scroll Handling</button>
          <DropdownHandler :anchor="test5c3"
            :config="{ trigger: 'click', repositionOnScroll: false, closeOnScroll: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
            <div class="p-4">
              <p class="font-semibold mb-2">No Scroll Handling</p>
              <p class="text-sm mb-2">Open this dropdown, then scroll the page.</p>
              <p class="text-sm text-yellow-700">The dropdown will stay in its original position (may appear detached).</p>
              <p class="text-xs text-gray-500 mt-2">repositionOnScroll: false, closeOnScroll: false</p>
            </div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test 5C.4: Hover Dropdown with Scroll -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5C.4: Hover Dropdown with Page Scroll</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Hover dropdown repositions smoothly when page scrolls while hovered.</p>

        <div style="padding-top: 200px;">
          <button ref="test5c4" class="px-3 py-2 border rounded bg-indigo-100">Hover & Scroll Test</button>
          <DropdownHandler :anchor="test5c4"
            :config="{ trigger: 'hover', hoverIntentMs: 100, repositionOnScroll: true, closeOnScroll: false, width: 350, style: { class: 'bg-white border rounded shadow-xl' } }">
            <div class="p-4">
              <p class="font-semibold mb-2">Hover & Scroll</p>
              <p class="text-sm mb-2">Hover this button, then scroll the page while keeping mouse over.</p>
              <p class="text-sm">The dropdown should follow the button smoothly.</p>
            </div>
          </DropdownHandler>
        </div>
      </div>

      <!-- Test 5C.5: Tooltip with Scroll -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5C.5: Tooltip with Page Scroll</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Tooltip repositions when page scrolls while hovered.</p>

        <div style="padding-top: 200px;">
          <button ref="test5c5" class="px-3 py-2 border rounded bg-cyan-100">Hover Tooltip & Scroll</button>
          <DropdownHandler :anchor="test5c5"
            :config="{ trigger: 'hover', layer: 'tooltip', theme: 'tooltip-dark', repositionOnScroll: true, closeOnScroll: false, width: 200, ariaRole: 'tooltip', scrollEnabled: false }">
            <div>Hover and scroll - tooltip should follow</div>
          </DropdownHandler>
        </div>
      </div>

      

  

      <!-- Test 5C.8: Scroll with Flipped Dropdown -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test 5C.8: Scroll with Flipped Dropdown (Above Anchor)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: When dropdown flips above anchor, it should still reposition correctly on scroll.</p>

        <div style="padding-top: 600px; padding-bottom: 200px;">
          <button ref="test5c8" class="px-3 py-2 border rounded bg-orange-100">Flipped Above + Scroll</button>
          <DropdownHandler :anchor="test5c8"
            :config="{ trigger: 'click', flipOnOverflow: true, repositionOnScroll: true, closeOnScroll: false, width: 300, height: 250, style: { class: 'bg-white border rounded shadow-xl' } }">
            <div class="p-4">
              <p class="font-semibold mb-2">Flipped Above</p>
              <p class="text-sm mb-2">This dropdown should appear ABOVE the button (flipped).</p>
              <p class="text-sm">Scroll the page - it should maintain position relative to anchor.</p>
            </div>
          </DropdownHandler>
        </div>
      </div>
    </section>

    <!-- SECTION: NON-FIXED DROPDOWN (Normal Div) -->
    <section class="border-2 border-amber-500 rounded-lg p-6 bg-amber-50">
      <h2 class="text-2xl font-bold mb-4 text-amber-900">Non-Fixed Dropdown (Normal Div Expanding Below Content)</h2>

      <!-- Test NF1: Non-Fixed Normal Div Dropdown -->
      <div class="test-case mb-6 p-4 bg-white rounded border">
        <h3 class="font-semibold mb-2">✓ Test NF1: Non-Fixed Dropdown (Opens Below Content with Effects)</h3>
        <p class="text-sm text-gray-600 mb-2">Expected: Dropdown appears as normal div expanding below content (not
          fixed/absolute), with smooth height animation</p>
        <div class="space-y-4">
          <div class="relative border-2 border-gray-300 rounded-lg p-4">
            <p class="font-semibold mb-2">Container with Non-Fixed Dropdown</p>
            <button ref="testNF1" @click="showNonFixed = !showNonFixed"
              class="px-3 py-2 border rounded bg-blue-100">Toggle Dropdown Below</button>
            <div class="mt-2 overflow-hidden transition-all duration-300"
              :class="showNonFixed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'">
              <div class="p-4 bg-white border rounded shadow-lg">
                <p class="font-semibold mb-2">Non-Fixed Dropdown Content</p>
                <p class="text-sm mb-2">This dropdown expands below the button in normal document flow</p>
                <ul class="list-disc ml-4 space-y-1 text-sm">
                  <li>Not fixed or absolute positioned</li>
                  <li>Opens below content with smooth animation</li>
                  <li>Height animation effect</li>
                  <li>Part of normal document flow</li>
                </ul>
                <div class="mt-3 space-y-2">
                  <div v-for="i in 5" :key="i" class="py-2 border-b">Item {{ i }}</div>
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500">Note: This uses Vue's transition, not DropdownHandler's fixed positioning.
            This is an example of a non-fixed dropdown pattern.</p>
        </div>
      </div>
    </section>

   

    <!-- Extra spacing for scroll tests -->
    <div style="height: 400px;"></div>

    <!-- FINAL SUMMARY -->
    <div class="text-center p-6 bg-green-100 border-2 border-green-500 rounded-lg">
      <p class="text-2xl font-bold text-green-900">✓ Comprehensive Test Suite Complete</p>
      <p class="text-gray-700 mt-2 mb-4">All test cases organized into clear categories:</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-left text-sm max-w-4xl mx-auto">
        <div>
          <p class="font-semibold">Section 1: Required + Identity</p>
          <p class="text-xs text-gray-600">Anchor, teleport, attributes</p>
        </div>
        <div>
          <p class="font-semibold">Section 2: Validation & Defaults</p>
          <p class="text-xs text-gray-600">Error handling, defaults</p>
        </div>
        <div>
          <p class="font-semibold">Section 3: Open/Close Triggers</p>
          <p class="text-xs text-gray-600">Click, hover, focus, forceKeepOpen</p>
        </div>
        <div>
          <p class="font-semibold">Section 4: Positioning & Sizing</p>
          <p class="text-xs text-gray-600">Alignment, placement, collision</p>
        </div>
        <div>
          <p class="font-semibold">Section 5: Scrolling & Height</p>
          <p class="text-xs text-gray-600">Scroll behavior, height tests</p>
        </div>
        <div>
          <p class="font-semibold">Section 5B: Width Tests</p>
          <p class="text-xs text-gray-600">100% parent, auto, clamping</p>
        </div>
        <div>
          <p class="font-semibold">Section 5C: Page Scroll Behavior</p>
          <p class="text-xs text-gray-600">Fixed positioning, scroll repositioning</p>
        </div>
        <div>
          <p class="font-semibold">Section 6: Overlay</p>
          <p class="text-xs text-gray-600">Overlay behavior</p>
        </div>
        <div>
          <p class="font-semibold">Section 7: Events & API</p>
          <p class="text-xs text-gray-600">Vue events, DOM events, public API</p>
        </div>
        <div>
          <p class="font-semibold">Section 8: Lifecycle</p>
          <p class="text-xs text-gray-600">Cleanup, route changes</p>
        </div>
        <div>
          <p class="font-semibold">Section 9: Styling & Animation</p>
          <p class="text-xs text-gray-600">Themes, animations</p>
        </div>
        <div>
          <p class="font-semibold">Section 10: Advanced Features</p>
          <p class="text-xs text-gray-600">maxWidth, themes, loader</p>
        </div>
        <div>
          <p class="font-semibold">Tooltip Tests</p>
          <p class="text-xs text-gray-600">Hover, focus, placement, arrows</p>
        </div>
        <div>
          <p class="font-semibold">Non-Fixed Dropdown</p>
          <p class="text-xs text-gray-600">Normal div expanding</p>
        </div>
        <div>
          <p class="font-semibold">Scroll Behavior Tests</p>
          <p class="text-xs text-gray-600">Body scroll, inside scroll, reposition</p>
        </div>
      </div>
      <p class="text-gray-700 mt-4 text-sm">Scroll up to test each requirement section</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import DropdownHandler from '@/components/dropdownHandler/DropdownHandler.vue'

// Listen for all DOM events
if (typeof document !== 'undefined') {
  document.addEventListener('DropdownHandler:open', (e) => console.log('🔵 DOM Event - OPEN:', e.detail))
  document.addEventListener('DropdownHandler:close', (e) => console.log('🔴 DOM Event - CLOSE:', e.detail))
  document.addEventListener('DropdownHandler:repositioned', (e) => console.log('🟡 DOM Event - REPOSITIONED:', e.detail))
  document.addEventListener('DropdownHandler:toggle', (e) => console.log('🟣 DOM Event - TOGGLE:', e.detail))
  document.addEventListener('DropdownHandler:collided', (e) => console.log('🟠 DOM Event - COLLIDED:', e.detail))
}

// Section 1 refs
const test12 = ref(null)
const test13 = ref(null)
const showMissingAnchorTest = ref(false)

// Section 2 refs
const test21 = ref(null)
const test22 = ref(null)
const test23 = ref(null)
const test24a = ref(null)
const test24b = ref(null)
const test24b2 = ref(null)
const test24c = ref(null)
const test24d = ref(null)
const test25a = ref(null)
const test25b = ref(null)
const test25c = ref(null)
// Invalid config test refs
const showInvalidTriggerTest = ref(false)
const showInvalidAlignTest = ref(false)
const showInvalidSnapEdgeTest = ref(false)
const showInvalidWidthTest = ref(false)
const showInvalidHeightTest = ref(false)
const invalidTriggerAnchor = ref(null)
const invalidAlignAnchor = ref(null)
const invalidSnapEdgeAnchor = ref(null)
const invalidWidthAnchor = ref(null)
const invalidHeightAnchor = ref(null)
const test26 = ref(null)

// Section 3 refs
const test31 = ref(null)
const test32 = ref(null)
const test32b1 = ref(null)
const test32b2 = ref(null)
const test33 = ref(null)
const test34 = ref(null)
const test34ref = ref(null)
const test35 = ref(null)
const test36parent = ref(null)
const test36child = ref(null)

// Section 4 refs
const test42a = ref(null)
const test42b = ref(null)
const test42c = ref(null)
const test43a = ref(null)
const test43b = ref(null)
const test43c = ref(null)
const test43d = ref(null)
const test43b1 = ref(null)
const test43b2 = ref(null)
const test43b3 = ref(null)
const test43b4 = ref(null)
const test43b5 = ref(null)
const test43b6 = ref(null)
const test43b7 = ref(null)
const test43b8 = ref(null)
const test44a = ref(null)
const test44b = ref(null)

// Section 5 refs
const test51 = ref(null)
const test52 = ref(null)
const test53a = ref(null)
const test53b = ref(null)
const test53c = ref(null)

// Section 6 refs
const test61a = ref(null)
const test61b = ref(null)
const test61bref = ref(null)

// Section 7 refs
const test71 = ref(null)
const test72 = ref(null)
const test73anchor = ref(null)
const test73ref = ref(null)
const test74a = ref(null)
const test74b = ref(null)
const test74c = ref(null)

// Section 8 refs
const test81 = ref(null)
const test82a = ref(null)
const test82b = ref(null)

// Section 9 refs
const test91a = ref(null)
const test91b = ref(null)
const test91c = ref(null)
const test92a = ref(null)
const test92b = ref(null)
const test92c = ref(null)
const test92d = ref(null)
const test92e = ref(null)
const test92f = ref(null)

// Section 10 refs
const test101 = ref(null)
const test102a = ref(null)
const test102b = ref(null)
const test102c = ref(null)
const test103 = ref(null)
const test103ref = ref(null)

// Tooltip test refs
const testT1 = ref(null)
const testT2 = ref(null)
const testT3a = ref(null)
const testT3b = ref(null)
const testT4a = ref(null)
const testT4b = ref(null)
const testT4c = ref(null)
const testT4d = ref(null)
const testT5 = ref(null)
const testT6a = ref(null)
const testT6b = ref(null)
const testT6c = ref(null)
const testT7dropdown = ref(null)
const testT7tooltip = ref(null)
const testT8parent = ref(null)
const testT8child = ref(null)
const testT8parentHover = ref(null)
const testT8childHover = ref(null)

// Section 4 additional refs
const test42d = ref(null)
const test42e = ref(null)

// Section 5 additional refs
const test53d = ref(null)
const test53e = ref(null)

// Section 5B refs (Width tests)
const test5b1a = ref(null)
const test5b1b = ref(null)
const test5b1c = ref(null)
const test5b1d = ref(null)
const test5b1e = ref(null)
const test5b1f = ref(null)

// Non-fixed dropdown refs
const testNF1 = ref(null)
const showNonFixed = ref(false)

// Scroll test refs
const testS1 = ref(null)
const testS1ref = ref(null)
const testS2a = ref(null)
const testS2b = ref(null)
const testS3 = ref(null)
const testS3ref = ref(null)

// Section 5C: Page scroll behavior refs
const test5c1a = ref(null)
const test5c1b = ref(null)
const test5c1c = ref(null)
const test5c2 = ref(null)
const test5c3 = ref(null)
const test5c4 = ref(null)
const test5c5 = ref(null)
const test5c6a = ref(null)
const test5c6b = ref(null)
const test5c7a = ref(null)
const test5c7b = ref(null)
const test5c7c = ref(null)
const test5c8 = ref(null)

// Section 3 additional refs
const test33b = ref(null)

// Test functions
function testMissingAnchor() {
  console.error('Testing missing anchor...')
  showMissingAnchorTest.value = true
  setTimeout(() => showMissingAnchorTest.value = false, 100)
}

function testInvalidTrigger() {
  console.error('Testing invalid trigger...')
  showInvalidTriggerTest.value = true
  setTimeout(() => showInvalidTriggerTest.value = false, 100)
}

function testInvalidAlign() {
  console.error('Testing invalid align...')
  showInvalidAlignTest.value = true
  setTimeout(() => showInvalidAlignTest.value = false, 100)
}

function testInvalidSnapEdge() {
  console.error('Testing invalid snapEdge...')
  showInvalidSnapEdgeTest.value = true
  setTimeout(() => showInvalidSnapEdgeTest.value = false, 100)
}

function testInvalidWidth() {
  console.error('Testing invalid width...')
  showInvalidWidthTest.value = true
  setTimeout(() => showInvalidWidthTest.value = false, 100)
}

function testInvalidHeight() {
  console.error('Testing invalid height...')
  showInvalidHeightTest.value = true
  setTimeout(() => showInvalidHeightTest.value = false, 100)
}

function testIsOpen() {
  const isOpen = test73ref.value?.isOpen()
  alert(`isOpen: ${isOpen}`)
}

function handleLoaderTestOpen() {
  if (!test103ref.value) return

  // Set loading to true automatically when dropdown opens
  test103ref.value.setLoading(true)

  // Reset after 2 seconds
  setTimeout(() => {
    if (test103ref.value) {
      test103ref.value.setLoading(false)
      console.log('Loader auto-hidden after 2 seconds')
    }
  }, 2000)
}

function changeHash() {
  const oldHash = window.location.hash
  window.location.hash = Math.random().toString(36).slice(2)
  console.log(`Hash changed from ${oldHash} to ${window.location.hash}`)
}

// Non-fixed dropdown toggle
function toggleNonFixed() {
  showNonFixed.value = !showNonFixed.value
}

</script>

<style scoped>
.test-case {
  scroll-margin-top: 120px;
}
</style>
