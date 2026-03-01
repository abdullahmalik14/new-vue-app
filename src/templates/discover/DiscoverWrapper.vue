<template>
  <div class="discover-wrapper">
    <DiscoverHeader />
    <div style="display:grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: 60vh;">
      <DiscoverSidebar />
      <>
        <h1>Discover Page</h1>
        <div style="margin: 16px 0; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px;">
            <input type="checkbox" v-model="imageChecked" style="width: 18px; height: 18px; cursor: pointer;" />
            <span style="font-weight: 500;">Show Image</span>
          </label>
        </div>
        <!-- <img v-if="imageChecked" :src="externalImageUrl" alt="Discover hero"
          style="max-width: 100%; height: auto; margin-top: 24px;" /> -->
        <img v-if="imageChecked" src="/media/sample.jpg" alt="Discover hero">
    </div>
    <DiscoverFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { default as DiscoverHeader } from './DiscoverHeader.vue'
import { default as DiscoverSidebar } from './DiscoverSidebar.vue'
import { default as DiscoverFooter } from './DiscoverFooter.vue'

// Checkbox state - controls v-if on image
const imageChecked = ref(true)

const externalImageUrl = ref('https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Pizigani_1367_Chart_10MB.jpg/1200px-Pizigani_1367_Chart_10MB.jpg?20110407064506')
</script>
