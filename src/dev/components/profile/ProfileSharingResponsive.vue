<script setup>
import { useI18n } from "vue-i18n";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

const { t } = useI18n();
const { url: tokenUrl } = useAssetUrl("profile.icon.token");
const { url: heartUrl } = useAssetUrl("profile.icon.heart");
const { url: linkUrl } = useAssetUrl("profile.icon.link");
const { url: dotsUrl } = useAssetUrl("profile.icon.dots");
</script>

<template>
    <div class="flex items-center gap-1 py-2 md:hidden">
                <!-- tip-button -->
                <div class="flex gap-1">
                  <div
                    class="flex justify-end relative pl-[1.875rem] md:flex-grow md:pl-0"
                  >
                    <span
                      class="absolute top-1/2 left-0 -translate-y-1/2 z-[1]"
                    >
                      <img
                        :src="tokenUrl"
                        :alt="t('profile.alt.token')"
                        class="w-12 h-12"
                      />
                    </span>

                    <span
                      class="flex justify-center items-center text-sm text-white w-[5.594rem] h-8 px-2 border border-[#e9e5d380] bg-black/10 backdrop-blur-[25px] [transition:all_0.3s_ease-in-out] max-[580px]:rounded-[0_50px_50px_0] max-[580px]:[border:0.5px_solid_#FF9AD0] max-[580px]:[background:linear-gradient(0deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.75)_100%),linear-gradient(180deg,rgba(232,3,174,0.54)_0%,rgba(232,3,174,0.60)_100%)] max-[580px]:shadow-[0_0_10px_0_rgba(232,3,174,0.30),0_0_10px_0_rgba(232,3,174,0.10),0_ 0_10px_0_rgba(232,3,174,0.30)_inset] md:w-[90%]"
                      >{{ t('profile.labels.tip') }}</span
                    >
                  </div>
                </div>

                <span
                  class="flex justify-center items-center w-8 h-8 bg-black/10 border border-[#e9e5d380] rounded-full [transition:all_0.3s_ease-in-out] cursor-pointer md:w-12 md:h-12"
                >
                  <img
                    :src="heartUrl"
                    :alt="t('profile.alt.heart')"
                    class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(84%)_sepia(12%)_saturate(222%)_hue-rotate(12deg)_brightness(105%)_contrast(97%)]"
                  />
                </span>

                <span
                  class="flex justify-center items-center w-8 h-8 bg-black/10 border border-[#e9e5d380] rounded-full [transition:all_0.3s_ease-in-out] cursor-pointer md:w-12 md:h-12"
                >
                  <img
                    :src="linkUrl"
                    :alt="t('profile.alt.link')"
                    class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(84%)_sepia(12%)_saturate(222%)_hue-rotate(12deg)_brightness(105%)_contrast(97%)]"
                  />
                </span>

                <div class="relative cursor-pointer">
                  <span
                    class="flex justify-center items-center w-8 h-8 rounded-full [transition:all_0.3s_ease-in-out] md:w-12 h-12"
                  >
                    <img
                      :src="dotsUrl"
                      :alt="t('profile.alt.dots')"
                      class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(84%)_sepia(12%)_saturate(222%)_hue-rotate(12deg)_brightness(105%)_contrast(97%)]"
                    />
                  </span>
                </div>
              </div>
</template>
