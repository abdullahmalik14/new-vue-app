<script setup>
import { useI18n } from "vue-i18n";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

defineProps({
  handle: { type: String, default: "@sukii19" },
  followers: { type: [String, Number], default: 35 },
  likes: { type: [String, Number], default: 14 },
  subscribers: { type: [String, Number], default: 2 },
});

const { t } = useI18n();
const { url: verifiedUrl } = useAssetUrl("profile.icon.verified");
const { url: avatarUrl } = useAssetUrl("profile.avatar");
</script>

<template>
      <div class="flex justify-end px-4 pt-4 xl:px-12">
          <!-- profile-info -->
          <div
            class="hidden items-center gap-4 pr-2.5 border-r border-white md:inline-flex"
          >
            <div class="flex flex-col items-start gap-2">
              <!-- user-name-title -->
              <div class="flex items-start gap-4 self-stretch h-6">
                <div class="flex items-center gap-2 flex-grow">
                  <div class="text-base font-semibold text-white line-clamp-1">
                    {{ handle }}
                  </div>
                  <img
                    :src="verifiedUrl"
                    :alt="t('profile.alt.verified')"
                    class="w-4 h-4"
                  />
                </div>
              </div>

              <!-- profile-info-list -->
              <div class="flex items-start gap-4 opacity-70 relative z-[-1]">
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-xs leading-normal text-white"
                    >{{ t('profile.labels.followers') }}</span
                  >
                  <span class="text-sm text-white">{{ followers }}</span>
                </div>

                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-xs leading-normal text-white">{{ t('profile.labels.likes') }}</span>
                  <span class="text-sm text-white">{{ likes }}</span>
                </div>

                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-xs leading-normal text-white"
                    >{{ t('profile.labels.subscribers') }}</span
                  >
                  <span class="text-sm text-white">{{ subscribers }}</span>
                </div>
              </div>
            </div>

            <!-- creator-avatar-container -->
            <div class="flex flex-col justify-center items-center">
              <img
                :src="avatarUrl"
                :alt="t('profile.alt.avatar')"
                class="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
</template>
