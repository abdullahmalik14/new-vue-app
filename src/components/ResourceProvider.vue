<!-- /src/components/ResourceProvider.vue -->
<!-- Headless provider component that hits an endpoint and writes to the cacheStore. -->
<!-- Use when you want a declarative fetch in a parent route/component with slots. -->

<script setup lang="ts">
import { onMounted, watch, toRef } from 'vue'
import { useCacheStore } from '@/stores/cacheStore'

interface Props {
  resourceKey: string
  endpoint: string
  ttlMs?: number
  flag?: string
  immediate?: boolean
  // optional post-process transform
  transform?: (payload: any) => any
  // optional fetch options (GET-only by default)
  fetchOptions?: RequestInit
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'loaded', payload: any): void
  (e: 'error', err: any): void
}>()

const store = useCacheStore()
const endpointRef = toRef(props, 'endpoint')

async function fetchPayload() {
  try {
    const res = await fetch(endpointRef.value, { method: 'GET', ...(props.fetchOptions || {}) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    let json = await res.json()
    if (props.transform) json = props.transform(json)
    store.set(props.resourceKey, json, { ttlMs: props.ttlMs ?? 60_000, flag: props.flag })
    emit('loaded', json)
  } catch (err) {
    emit('error', err)
  }
}

onMounted(() => {
  if (props.immediate !== false) fetchPayload()
})

// Re-fetch if endpoint string changes
watch(endpointRef, () => fetchPayload())
</script>

<template>
  <slot />
</template>