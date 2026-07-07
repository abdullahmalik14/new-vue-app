<script setup>
import { useI18n } from "vue-i18n";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

const { t } = useI18n();
const { url: heartUrl } = useAssetUrl("profile.icon.heart");
const { url: linkUrl } = useAssetUrl("profile.icon.link");
const { url: dotsUrl } = useAssetUrl("profile.icon.dots");
</script>

<template>
    
              <div
                class="hidden items-center gap-[0.3125rem] py-2 md:flex md:py-0"
              >
                <span
                  class="flex justify-center items-center w-8 h-8 bg-black/10 border border-[#e9e5d380] rounded-full [transition:all_0.3s_ease-in-out] cursor-pointer md:w-12 md:h-12"
                >
                  <img
                    :src="heartUrl"
                    :alt="t('profile.alt.heart')"
                    class="w-4 h-4 md:w-6 md:h-6 [filter:brightness(0)_saturate(100%)_invert(84%)_sepia(12%)_saturate(222%)_hue-rotate(12deg)_brightness(105%)_contrast(97%)]"
                  />
                </span>

                <span
                  class="flex justify-center items-center w-8 h-8 bg-black/10 border border-[#e9e5d380] rounded-full [transition:all_0.3s_ease-in-out] cursor-pointer md:w-12 md:h-12"
                >
                  <img
                    :src="linkUrl"
                    :alt="t('profile.alt.link')"
                    class="w-4 h-4 md:w-6 md:h-6 [filter:brightness(0)_saturate(100%)_invert(84%)_sepia(12%)_saturate(222%)_hue-rotate(12deg)_brightness(105%)_contrast(97%)]"
                  />
                </span>

                <div class="relative cursor-pointer">
                  <span
                    class="flex justify-center items-center w-8 h-8 rounded-full [transition:all_0.3s_ease-in-out] md:w-12 h-12"
                  >
                    <img
                      :src="dotsUrl"
                      :alt="t('profile.alt.dots')"
                      class="w-4 h-4 md:w-6 md:h-6 [filter:brightness(0)_saturate(100%)_invert(84%)_sepia(12%)_saturate(222%)_hue-rotate(12deg)_brightness(105%)_contrast(97%)]"
                    />
                  </span>
                </div>
              </div>
</template>
