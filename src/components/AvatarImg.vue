<!-- /src/components/AvatarImg.vue -->
<!-- Reactive avatar image that updates instantly on store change. -->
<!-- Adds version to src (?v=version) to force browser to reload when content changes. -->

<script setup lang="ts">
import { computed } from 'vue'
import { useCacheStore } from '@/stores/cacheStore'

interface Props {
  userKey: string        // e.g. "user:123"
  alt?: string
  class?: string
  // Fallback image if none yet
  fallbackSrc?: string
  // Optional width/height passthrough
  width?: number | string
  height?: number | string
}

const props = defineProps<Props>()

const store = useCacheStore()
const entry = computed(() => store.get<{ avatarUrl?: string }>(props.userKey))
const src = computed(() => {
  const base = entry.value?.value?.avatarUrl || props.fallbackSrc || ''
  const v = entry.value?.version || 0
  if (!base) return ''
  // If base already has query params, append with &
  const join = base.includes('?') ? '&' : '?'
  return `${base}${join}v=${v}`
})
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt || 'User avatar'"
    :width="width"
    :height="height"
    :class="class"
    loading="lazy"
    decoding="async"
  />
  <div v-else :class="class" aria-label="No avatar available"></div>
</template>