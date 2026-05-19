<template>
  <svg width="100%" :height="height" class="sparkline" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" style="overflow: visible;">
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
        <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
      </linearGradient>
      <clipPath :id="clipId">
        <rect :x="points[0]?.x || 0" y="0" :width="(points[points.length-1]?.x - points[0]?.x) || width" :height="height" />
      </clipPath>
    </defs>
    <g :clip-path="`url(#${clipId})`">
      <!-- Area fill -->
      <path :d="areaPath" :fill="`url(#${gradientId})`" />
      <!-- Line -->
      <path :d="linePath" fill="none" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [3, 5, 4, 7, 6, 8, 7, 9, 8, 10] },
  width: { type: Number, default: 80 },
  height: { type: Number, default: 32 },
  color: { type: String, default: '#22c55e' } // green by default
})

const gradientId = computed(() => `sparkline-grad-${Math.random().toString(36).slice(2, 8)}`)
const clipId = computed(() => `sparkline-clip-${Math.random().toString(36).slice(2, 8)}`)

const points = computed(() => {
  const d = props.data
  if (!d || d.length < 2) return []
  const min = Math.min(...d)
  const max = Math.max(...d)
  const range = max - min || 1
  const paddingX = 0
  const paddingY = 2
  const w = props.width - paddingX * 2
  const h = props.height - paddingY * 2
  return d.map((v, i) => ({
    x: paddingX + (i / (d.length - 1)) * w,
    y: paddingY + h - ((v - min) / range) * h
  }))
})

const linePath = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
})

const areaPath = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const lastX = pts[pts.length - 1].x
  const firstX = pts[0].x
  return `${line} L${lastX.toFixed(1)},${props.height} L${firstX.toFixed(1)},${props.height} Z`
})
</script>
