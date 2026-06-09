<template>
  <div class="shop-wrapper">
    <ShopHeader />
    <div style="display:grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: 60vh;">
      <ShopSidebar />
      <div>
        <h1>Shop Page</h1>
        <button @click="preloadDashboard">Dashboard</button>
      </div>
    </div>
    <ShopFooter />
  </div>
</template>

<script setup>
import { default as ShopHeader } from './ShopHeader.vue'
import { default as ShopSidebar } from './ShopSidebar.vue'
import { default as ShopFooter } from './ShopFooter.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const preloadDashboard = () => {
  router.push('/dashboard')
}
</script>
