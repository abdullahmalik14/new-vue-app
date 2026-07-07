<script setup>
import { useI18n } from "vue-i18n";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

defineProps({
  displayName: { type: String, default: "Sukii19" },
  handle: { type: String, default: "@sukii19" },
  age: { type: [String, Number], default: "22" },
  location: { type: String, default: "Hong Kong" },
  followers: { type: [String, Number], default: 35 },
  likes: { type: [String, Number], default: 14 },
  subscribers: { type: [String, Number], default: 2 },
});

const { t } = useI18n();
const { url: avatarUrl } = useAssetUrl("profile.avatar");
const { url: verifiedTickUrl } = useAssetUrl("profile.icon.verifiedTick");
const { url: profileUrl } = useAssetUrl("profile.icon.profile");
const { url: heartUrl } = useAssetUrl("profile.icon.heart");
const { url: logoUrl } = useAssetUrl("profile.icon.logo");
</script>

<template>
  <div class="flex gap-2 md:hidden">
    <!-- Avatar Wrapper -->
    <div class="relative">
      <!-- avatar -->
      <div
        class="bg-[#2970FF] w-16 h-16 aspect-square rounded-[25%_75%_50%_51%_/_45%_65%_36%_55%] relative overflow-hidden"
      >
        <img
          :src="avatarUrl"
          :alt="t('profile.alt.avatar')"
          class="w-full h-full absolute top-0 left-0 object-cover"
        />
      </div>

      <!-- Online-user-signal -->
      <span
        class="block absolute right-[0.313rem] bottom-[0.188rem] w-2 h-2 bg-[#07F468] rounded-full"
      ></span>
    </div>
  </div>

  <div class="flex flex-col gap-1 md:hidden">
    <h1
      class="hidden items-center gap-1 text-xl leading-normal font-semibold text-white md:flex md:text-5xl md:leading-[3.75rem] xl:text-6xl xl:leading-[4.5rem] xl:mb-5"
    >
      {{ displayName }}
      <div class="flex w-3.5 h-3.5 md:hidden">
        <img
          :src="verifiedTickUrl"
          :alt="t('profile.alt.verifiedTick')"
          class="w-3.5 h-3.5"
        />
      </div>
    </h1>

    <!-- profile-info-list -->
    <div class="flex items-start gap-3 opacity-70">
      <div class="flex items-center gap-1">
        <span class="flex items-center">
          <img
            :src="profileUrl"
            :alt="t('profile.alt.profile')"
            class="w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)]"
          />
        </span>
        <span class="text-sm font-light text-[#EAECF0]">{{ followers }}</span>
      </div>

      <div class="flex items-center gap-1">
        <span class="flex items-center">
          <img
            :src="heartUrl"
            :alt="t('profile.alt.heart')"
            class="w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)]"
          />
        </span>
        <span class="text-sm font-light text-[#EAECF0]">{{ likes }}</span>
      </div>

      <div class="flex items-center gap-1">
        <span class="flex items-center">
          <img
            :src="logoUrl"
            :alt="t('profile.alt.logo')"
            class="w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)]"
          />
        </span>
        <span class="text-sm font-light text-[#EAECF0]">{{ subscribers }}</span>
      </div>
    </div>

    <div class="flex gap-1">
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1"
        >{{ handle }}</span
      >
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1">{{ t('profile.labels.separator') }}</span>
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1">{{ age }}</span>
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1">{{ t('profile.labels.separator') }}</span>
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1"
        >{{ location }}</span
      >
    </div>
  </div>
</template>
