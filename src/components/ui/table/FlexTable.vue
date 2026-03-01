<script setup>
/* eslint-disable no-console */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

/* PROPS */
const props = defineProps({
  columns: { type: Array, required: true },   // [{key,label,basis?,grow?,align?,hiddenAt?,responsiveLabel?}]
  rows: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },

  theme: { type: Object, default: () => ({
    container: 'relative bg-white border border-zinc-200 rounded-lg shadow-sm ',
    header: 'bg-zinc-50 text-zinc-700',
    headerRow: 'flex items-center',
    headerCell: 'px-4 py-2 text-xs font-semibold uppercase tracking-wide',
    row: 'flex items-center odd:bg-white even:bg-zinc-50 hover:bg-zinc-100',
    cell: 'py-2 text-sm text-zinc-800',
    footer: 'p-3 text-center'
  })},
  themeMobile: { type: Object, default: () => ({
    container: 'relative bg-white border border-zinc-200 rounded-lg shadow-sm',
    card: 'rounded-lg border border-zinc-200 p-4 space-y-2',
    cardRow: 'flex items-start justify-between gap-3',
    cardLabel: 'text-xs text-zinc-500',
    cardValue: 'text-sm text-zinc-800',
    footer: 'p-3 text-center'
  })},

  // layout
  innerScroll: { type: Boolean, default: false },
  stickyHeader: { type: Boolean, default: false },
  maxHeight: { type: String, default: '' },
  desktopBreakpoint: { type: String, default: 'md' },

  // mobile stacked layout + optional inner scroller
  showMobile: { type: Boolean, default: false },
  mobileInnerScroll: { type: Boolean, default: false },
  mobileMaxHeight: { type: String, default: '' },

  // load more modes
  infinite: { type: Boolean, default: false },                 // auto-fetch on threshold
  revealButtonOnThreshold: { type: Boolean, default: false },  // show button when near bottom
  alwaysShowLoadMore: { type: Boolean, default: false },       // manual button always visible
  hasMore: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  threshold: { type: [String, Number], default: '100px' },
  useScrollEvents: { type: Boolean, default: true },

  // misc
  variantForRow: { type: Function, default: null },            // (row, index) => 'special' | null
  rowAttrs: { type: Function, default: null },                 // (row, index) => { ...data-attrs }
  alignDefault: { type: String, default: 'left' }
})

const emit = defineEmits(['load-more','row-click','row-context','cell-click'])

/* ELEMENT REFS */
const containerEl = ref(null) // outer container to compute element→viewport threshold in window mode
const bodyEl = ref(null)      // inner scroller (desktop table body)
const mobileEl = ref(null)    // inner scroller (mobile stacked body)

/* GUARDS */
const hasEl = (el) => !!(el && el instanceof Element)

/* CLASSES */
const bp = computed(() => props.desktopBreakpoint || 'md')
const showDesktopClass = computed(() => `${bp.value}:block block`)
const showMobileClass  = computed(() => `${bp.value}:hidden block`)

const hasScrollArea = computed(() => props.innerScroll && !!props.maxHeight)
const bodyStyle = computed(() =>
  (props.innerScroll && props.maxHeight)
    ? { maxHeight: props.maxHeight, overflowY: 'auto' }
    : {}
)
const mobileBodyStyle = computed(() =>
  (props.mobileInnerScroll)
    ? { maxHeight: props.mobileMaxHeight || '70vh', overflowY: 'auto' }
    : {}
)

/* ALIGNMENT HELPERS */
const alignClass = (a) => a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left'
const hiddenAtClasses = (arr) => Array.isArray(arr) && arr.length ? arr.map(bp => `${bp}:hidden`).join(' ') : ''
const colClass = (col) => [
  col.basis || 'basis-1/3',
  col.grow ? 'grow' : 'grow-0',
  'shrink-0',
  alignClass(col.align || props.alignDefault),
  hiddenAtClasses(col.hiddenAt)
].join(' ')

/* THRESHOLD PARSE — use your ScrollEvents helper if present */
function toPx(raw, el) {
  try {
    const v = window.ScrollEvents?.toPixelThreshold?.(raw, el)
    if (typeof v === 'number') return v
  } catch (e) { console.warn('[FlexTable] toPx error — fallback to 100', e) }
  const n = Number(raw); return Number.isFinite(n) ? n : 100
}

/* STATE + LOGS */
const nearBottom = ref(false)
const log = (msg, data) => console.log('[FlexTable]', msg, data ?? '')

/* WINDOW ELEMENT-RELATIVE CHECK */
function checkWindowNearBottom() {
  if (!hasEl(containerEl.value)) return
  const rect = containerEl.value.getBoundingClientRect()
  const dist = rect.bottom - (window.innerHeight || document.documentElement.clientHeight)
  const px = toPx(props.threshold, containerEl.value)
  const within = dist <= px
  if (within !== nearBottom.value) {
    nearBottom.value = within
    log('window-check', { rectBottom: rect.bottom, viewportH: window.innerHeight, dist, px, within })
  }
}

/* EMIT LOAD MORE */
function maybeEmitLoad() {
  if (props.loading || !props.hasMore) return
  log('emit load-more')
  emit('load-more')
}

/* WIRING — YOUR ScrollEvents as debounced source */
let seInner = null, seWindow = null, seMobile = null

function attachInner() {
  if (!props.innerScroll || !hasEl(bodyEl.value)) return
  nearBottom.value = false
  const el = bodyEl.value
  if (props.useScrollEvents && window.ScrollEvents) {
    seInner?.destroy?.()
    seInner = new window.ScrollEvents(el, {
      eventName: 'ft:inner',
      threshold: props.threshold,
      useWindowScrollInsteadOfElement: false,
      debounceDelayMs: 40,
      debounceFireOnTrailingEdge: true,
      enableDebugLogging: true
    })
    el.addEventListener('ft:inner', () => {
      const px = toPx(props.threshold, el)
      const d = el.scrollHeight - (el.scrollTop + el.clientHeight)
      log('inner-threshold', { d, px })
      if (props.revealButtonOnThreshold) nearBottom.value = d <= px
      else if (props.infinite && d <= px) maybeEmitLoad()
    })
  } else {
    const onScroll = () => {
      const px = toPx(props.threshold, el)
      const d = el.scrollHeight - (el.scrollTop + el.clientHeight)
      log('inner-fallback', { d, px })
      if (props.revealButtonOnThreshold) nearBottom.value = d <= px
      else if (props.infinite && d <= px) maybeEmitLoad()
    }
    el.__ftScroll = onScroll
    el.addEventListener('scroll', onScroll, { passive: true })
  }
}
function detachInner() {
  const el = bodyEl.value
  try { seInner?.destroy?.(); seInner = null } catch {}
  el?.removeEventListener?.('ft:inner', maybeEmitLoad)
  if (el?.__ftScroll) { el.removeEventListener('scroll', el.__ftScroll); delete el.__ftScroll }
  nearBottom.value = false
}

function attachMobile() {
  if (!props.mobileInnerScroll || !hasEl(mobileEl.value)) return
  nearBottom.value = false
  const el = mobileEl.value
  if (props.useScrollEvents && window.ScrollEvents) {
    seMobile?.destroy?.()
    seMobile = new window.ScrollEvents(el, {
      eventName: 'ft:mobile',
      threshold: props.threshold,
      useWindowScrollInsteadOfElement: false,
      debounceDelayMs: 40,
      debounceFireOnTrailingEdge: true,
      enableDebugLogging: true
    })
    el.addEventListener('ft:mobile', () => {
      const px = toPx(props.threshold, el)
      const d = el.scrollHeight - (el.scrollTop + el.clientHeight)
      log('mobile-threshold', { d, px })
      if (props.revealButtonOnThreshold) nearBottom.value = d <= px
      else if (props.infinite && d <= px) maybeEmitLoad()
    })
  } else {
    const onScroll = () => {
      const px = toPx(props.threshold, el)
      const d = el.scrollHeight - (el.scrollTop + el.clientHeight)
      log('mobile-fallback', { d, px })
      if (props.revealButtonOnThreshold) nearBottom.value = d <= px
      else if (props.infinite && d <= px) maybeEmitLoad()
    }
    el.__ftMob = onScroll
    el.addEventListener('scroll', onScroll, { passive: true })
  }
}
function detachMobile() {
  const el = mobileEl.value
  try { seMobile?.destroy?.(); seMobile = null } catch {}
  el?.removeEventListener?.('ft:mobile', maybeEmitLoad)
  if (el?.__ftMob) { el.removeEventListener('scroll', el.__ftMob); delete el.__ftMob }
  nearBottom.value = false
}

function attachWindow() {
  if (props.innerScroll || props.mobileInnerScroll) return // inner modes take precedence
  nearBottom.value = false
  if (props.useScrollEvents && window.ScrollEvents) {
    seWindow?.destroy?.()
    seWindow = new window.ScrollEvents(window, {
      eventName: 'ft:win',
      threshold: props.threshold, // used for toPx + debug
      useWindowScrollInsteadOfElement: true,
      debounceDelayMs: 50,
      debounceFireOnTrailingEdge: true,
      enableDebugLogging: true
    })
    document.documentElement.addEventListener('ft:win', () => {
      checkWindowNearBottom()
      if (!props.revealButtonOnThreshold && props.infinite && nearBottom.value) maybeEmitLoad()
    })
  } else {
    const onWin = () => {
      checkWindowNearBottom()
      if (!props.revealButtonOnThreshold && props.infinite && nearBottom.value) maybeEmitLoad()
    }
    window.__ftWin = onWin
    window.addEventListener('scroll', onWin, { passive: true })
    onWin()
  }
}
function detachWindow() {
  try { seWindow?.destroy?.(); seWindow = null } catch {}
  document.documentElement?.removeEventListener?.('ft:win', maybeEmitLoad)
  if (window.__ftWin) { window.removeEventListener('scroll', window.__ftWin); delete window.__ftWin }
  nearBottom.value = false
}

/* LIFECYCLE */
onMounted(async () => {
  await nextTick()
  log('mounted', {
    innerScroll: props.innerScroll,
    mobileInnerScroll: props.mobileInnerScroll,
    threshold: props.threshold
  })
  attachInner()
  attachMobile()
  attachWindow()
  if (!props.innerScroll && !props.mobileInnerScroll && props.revealButtonOnThreshold) {
    checkWindowNearBottom()
  }
})
onBeforeUnmount(() => { detachInner(); detachMobile(); detachWindow() })
watch(
  () => [
    props.infinite, props.useScrollEvents, props.threshold,
    props.innerScroll, props.mobileInnerScroll,
    props.maxHeight, props.mobileMaxHeight,
    props.revealButtonOnThreshold
  ],
  async () => {
    log('props changed → rewire')
    detachInner(); detachMobile(); detachWindow()
    await nextTick()
    attachInner(); attachMobile(); attachWindow()
  }
)

/* ROW / CELL EVENTS */
function onRowClick(row) { log('row-click', row); emit('row-click', row) }
function onRowContext(e, row) { e?.preventDefault?.(); log('row-context', row); emit('row-context', row) }
function onCellClick(payload) { log('cell-click', payload); emit('cell-click', payload) }
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE & Edge */
  scrollbar-width: none; /* Firefox */
}
</style>

<template>
  <div ref="containerEl">
    <!-- DESKTOP TABLE (always rendered; compresses on small screens unless hidden via theme) -->
    <div :class="showDesktopClass">
      <div :class="theme.container">
        <div ref="bodyEl" class="scroll-smooth no-scrollbar" :style="bodyStyle" >
          <!-- HEADER -->
          <div v-if="columns && columns.length"
               :class="[theme.header, theme.headerRow, (stickyHeader && hasScrollArea) ? 'sticky top-0 z-10' : '']">
            <template v-for="col in columns" :key="'h-'+col.key">
              <div :class="[theme.headerCell, colClass(col)]">
                <slot :name="'header.'+col.key" :col="col">{{ col.label }}</slot>
              </div>
            </template>
          </div>

          <!-- ROWS -->
          <template v-for="(row, rIdx) in rows" :key="row[rowKey] ?? rIdx">
            <slot v-if="typeof variantForRow==='function' && variantForRow(row, rIdx)==='special'"
                  name="row.special" :row="row" :columns="columns" :alignClass="alignClass" :hiddenAtClasses="hiddenAtClasses" />
            <div v-else :class="[theme.row,'w-full']"
                 v-bind="rowAttrs ? rowAttrs(row, rIdx) : {}"
                 @click="onRowClick(row)"
                 @contextmenu="onRowContext($event, row)">
              <template v-for="(col, cIdx) in columns" :key="(row[rowKey] ?? rIdx)+'-'+col.key">
                <div :class="[theme.cell, colClass(col)]"
                     @click.stop="onCellClick({ row, col, rowIndex: rIdx, colIndex: cIdx })">
                  <slot :name="'cell.'+col.key" :value="row[col.key]" :row="row" :col="col" :rowIndex="rIdx" :colIndex="cIdx">
                    {{ row[col.key] }}
                  </slot>
                </div>
              </template>
            </div>
          </template>

          <!-- FOOTER / LOAD MORE -->
          <div :class="theme.footer"
               v-if="
                 alwaysShowLoadMore ||
                 loading ||
                 (hasMore && (
                   (!infinite && !revealButtonOnThreshold) ||
                   (revealButtonOnThreshold && nearBottom) ||
                   (infinite && !revealButtonOnThreshold && nearBottom)
                 ))
               ">
            <button v-if="hasMore"
                    class="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
                    :disabled="loading"
                    @click="maybeEmitLoad">
              <span>Load more</span>
            </button>
            <div v-else class="text-xs text-zinc-500">No more rows</div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE STACKED VIEW (optional) -->
    <div v-if="showMobile" :class="showMobileClass">
      <div :class="themeMobile.container">
        <div ref="mobileEl" class="`scroll`-smooth space-y-3 p-2" :style="mobileBodyStyle">
          <div v-for="(row,rIdx) in rows" :key="'m-'+(row[rowKey] ?? rIdx)"
               :class="themeMobile.card"
               v-bind="rowAttrs ? rowAttrs(row, rIdx) : {}"
               @click="onRowClick(row)" @contextmenu="onRowContext($event,row)">
            <template v-for="(col,cIdx) in columns" :key="'m-'+(row[rowKey] ?? rIdx)+'-'+col.key">
              <div :class="[themeMobile.cardRow, hiddenAtClasses(col.hiddenAt)]">
                <div :class="themeMobile.cardLabel">
                  <slot :name="'header.'+col.key" :col="col">{{ col.responsiveLabel ?? col.label }}</slot>
                </div>
                <div :class="[themeMobile.cardValue, alignClass(col.align || 'left')]"
                     @click.stop="$emit('cell-click',{ row, col, rowIndex:rIdx, colIndex:cIdx, mode:'stack' })">
                  <slot :name="'cellMobile.'+col.key" :value="row[col.key]" :row="row" :col="col" :rowIndex="rIdx" :colIndex="cIdx">
                    <slot :name="'cell.'+col.key" :value="row[col.key]" :row="row" :col="col" :rowIndex="rIdx" :colIndex="cIdx">
                      {{ row[col.key] }}
                    </slot>
                  </slot>
                </div>
              </div>
            </template>
          </div>

          <!-- MOBILE FOOTER / LOAD MORE -->
          <div :class="themeMobile.footer"
               v-if="alwaysShowLoadMore || loading || (hasMore && ((revealButtonOnThreshold && nearBottom) || (infinite && !revealButtonOnThreshold && nearBottom)))">
            <button v-if="hasMore"
                    class="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
                    :disabled="loading"
                    @click="maybeEmitLoad">
              <span>Load more</span>
            </button>
            <div v-else class="text-xs text-zinc-500">No more rows</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>