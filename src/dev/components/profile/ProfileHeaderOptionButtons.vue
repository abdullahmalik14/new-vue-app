<script setup>
import { useI18n } from "vue-i18n";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

const { t } = useI18n();
const { url: tokenUrl } = useAssetUrl("profile.icon.token");
const { url: callUrl } = useAssetUrl("profile.icon.call");
const { url: callHoverUrl } = useAssetUrl("profile.icon.callHover");
const { url: onlineDotUrl } = useAssetUrl("profile.icon.onlineDot");
const { url: messageUrl } = useAssetUrl("profile.icon.message");
const { url: messageHoverUrl } = useAssetUrl("profile.icon.messageHover");
</script>

<template>
     <div class="hidden md:flex items-center gap-2 flex-wrap">
          <!-- tip-button -->
          <div
            class="w-[3.75rem] h-[3.75rem] grayscale relative pointer-events-none"
          >
            <span
              class="absolute top-0 left-0 block w-[3.75rem] h-[3.75rem] group/icon"
            >
              <img
                :src="tokenUrl"
                :alt="t('profile.alt.token')"
                class="absolute top-0 left-0 transition-all duration-200 group-hover/icon:opacity-0"
              />
              <img
                :src="tokenUrl"
                :alt="t('profile.alt.token')"
                class="absolute top-0 left-0 transition-all duration-200 opacity-0 duration-[0.4s] group-hover/icon:opacity-100 group-hover/icon:scale-110"
              />
            </span>
          </div>

          <!-- private-call-button -->
          <div
            class="w-[3.75rem] h-[3.75rem] grayscale relative pointer-events-none"
          >
            <span
              class="absolute top-0 left-0 block w-[3.75rem] h-[3.75rem] group/icon"
            >
              <img
                :src="callUrl"
                :alt="t('profile.alt.call')"
                class="absolute top-0 left-0 transition-all duration-200 group-hover/icon:opacity-0"
              />
              <img
                :src="callHoverUrl"
                :alt="t('profile.alt.callHover')"
                class="absolute top-0 left-0 transition-all duration-200 opacity-0 duration-[0.4s] group-hover/icon:opacity-100 group-hover/icon:scale-110"
              />
              <img
                :src="onlineDotUrl"
                :alt="t('profile.alt.onlineDot')"
                class="absolute w-[18%] top-0 right-[3px] duration-500"
              />
            </span>
          </div>

          <!-- private-message-button -->
          <div
            class="w-[3.75rem] h-[3.75rem] grayscale relative pointer-events-none"
          >
            <span
              class="absolute top-0 left-0 block w-[3.75rem] h-[3.75rem] group/icon"
            >
              <img
                :src="messageUrl"
                :alt="t('profile.alt.message')"
                class="absolute top-0 left-0 transition-all duration-200 group-hover/icon:opacity-0"
              />
              <img
                :src="messageHoverUrl"
                :alt="t('profile.alt.message')"
                class="absolute top-0 left-0 transition-all duration-200 opacity-0 duration-[0.4s] group-hover/icon:opacity-100 group-hover/icon:scale-110"
              />
              <img
                :src="onlineDotUrl"
                :alt="t('profile.alt.onlineDot')"
                class="absolute w-[18%] top-0 right-[3px] duration-500"
              />
            </span>
          </div>
        </div>
</template>
