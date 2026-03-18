<template>
  <div
    class="bg-container w-full flex justify-between items-center h-[100vh] bg-cover bg-no-repeat bg-lightgray xl:bg-center lg:bg-center md:bg-left sm:bg-[position:-100px] max-[479px]:bg-[position:-290px]"
    :style="{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }">
    <!-- Left column (background image area) -->
    <div></div>

    <!-- Right column (content area) -->
    <div
      class="right-column relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full h-full flex flex-col items-start gap-4 px-6 py-12 bg-black/30 lg:w-1/2 after:content-[''] after:fixed after:right-0 after:top-0 after:w-1/2 after:h-full backdrop-blur-[50px] after:z-[1] lg:after:w-1/2 max-lg:after:w-full">
      <!-- Header Container -->
      <div class="relative z-20 flex justify-between items-start w-full">
        <slot name="header">
          <AuthHeader />
        </slot>
      </div>

      <!-- Main Content Slot -->
       
      <slot />

      <!-- Footer Slot (optional) -->
      <slot name="footer">
        <AuthFooter />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAssetUrl } from '@/utils/assets/assetLibrary'
import AuthHeader from './AuthHeader.vue'
import AuthFooter from './AuthFooter.vue'

const bgUrl = ref('')

onMounted(async () => {
  bgUrl.value = await getAssetUrl('auth.background')
})
</script>
