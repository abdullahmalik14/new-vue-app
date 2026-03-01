<template>
  <p class="xl:mb-5 w-[100%] md:max-w-[45rem] md:min-w[45rem]">
    <span class="text-base text-white line-clamp-2 sm:leading-7 md:text-lg">I love eating! watch me eat different food
      every 8pm EST time👅!Here is
      Jenny’s bio. I love eating! watch me eat different food every Week. Here
      is Jenny's bio.</span>
    <span class="text-xs leading-normal font-semibold text-[#07F468] md:text-sm cursor-pointer"
      @click="showSeeMorePopup = true">
      <span class="text-xs leading-normal font-medium text-white md:text-sm md:font-semibold">...</span>
      Read more
    </span>
  </p>

  <ProfileSeeMorePopup v-model="showSeeMorePopup" />
</template>

<script setup>
import { ref } from "vue";
import ProfileSeeMorePopup from "@/templates/profileAbdullah/popups/ProfileSeeMorePopup.vue";

const showSeeMorePopup = ref(false);
</script>