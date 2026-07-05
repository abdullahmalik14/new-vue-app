<template>
  <p class="xl:mb-5 w-[100%] md:max-w-[45rem] md:min-w[45rem]">
    <span class="text-base text-white line-clamp-2 sm:leading-7 md:text-lg">{{ description }}</span>
    <span class="text-xs leading-normal font-semibold text-[#07F468] md:text-sm cursor-pointer"
      @click="showSeeMorePopup = true">
      <span class="text-xs leading-normal font-medium text-white md:text-sm md:font-semibold">{{ t('profile.labels.ellipsis') }}</span>
      {{ t('profile.labels.readMore') }}
    </span>
  </p>

  <ProfileSeeMorePopup v-model="showSeeMorePopup" />
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import ProfileSeeMorePopup from "@/dev/components/ui/popups/profile/ProfileSeeMorePopup.vue";

defineProps({
  description: {
    type: String,
    default:
      "I love eating! watch me eat different food every 8pm EST time👅!Here is Jenny’s bio. I love eating! watch me eat different food every Week. Here is Jenny's bio.",
  },
});

const { t } = useI18n();
const showSeeMorePopup = ref(false);
</script>
