<script setup>
import { useI18n } from "vue-i18n";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

defineProps({
  handle: { type: String, default: "@sukii19" },
});

const { t } = useI18n();
const { url: verifiedUrl } = useAssetUrl("profile.icon.verified");
const { url: addNormalUrl } = useAssetUrl("profile.icon.addNormal");
const { url: addActiveUrl } = useAssetUrl("profile.icon.addActive");
const { url: likeNormalUrl } = useAssetUrl("profile.icon.likeNormal");
const { url: likeActiveUrl } = useAssetUrl("profile.icon.likeActive");
const { url: dotsUrl } = useAssetUrl("profile.icon.dots");
const { url: avatarUrl } = useAssetUrl("profile.avatar");
</script>

<template>
     <div class="flex flex-end pl-0">
          <div
            class="inline-flex items-center gap-4 pl-4 border-l border-white"
          >
            <div class="flex flex-col items-start gap-2">
              <!-- user-name-title -->
              <div class="flex items-start gap-4 self-stretch h-6">
                <div class="flex items-center gap-2 flex-grow">
                  <div
                    class="text-sm font-semibold text-[#e7e5e4] line-clamp-1"
                  >
                    {{ handle }}
                  </div>
                  <img
                    :src="verifiedUrl"
                    :alt="t('profile.alt.verified')"
                    class="w-4 h-4"
                  />
                </div>
              </div>

              <!-- profile-links-options -->
              <div class="flex justify-end items-center gap-2 w-full">
                <span
                  class="flex justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] cursor-pointer"
                >
                  <img
                    :src="addNormalUrl"
                    :alt="t('profile.alt.addNormal')"
                    class="w-4 h-4"
                  />
                </span>

                <span
                  class="hidden justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] active [.active]:bg-[#e9e5d3bf] max-[580px]:[.active]:bg-black/75 max-[580px]:[.active]:shadow-[0_0_10px_0_rgba(7,244,104,0.30),0_0_10px_0_rgba(7,244,104,0.10)] max-[580px]:[.active]:backdrop-blur-[25px] max-[580px]:[.active]:text-[#07F468] max-[580px]:[.active]:border-transparent cursor-pointer"
                >
                  <img
                    :src="addActiveUrl"
                    :alt="t('profile.alt.addActive')"
                    class="w-4 h-4"
                  />
                </span>

                <span
                  class="flex justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] cursor-pointer"
                >
                  <img
                    :src="likeNormalUrl"
                    :alt="t('profile.alt.likeNormal')"
                    class="w-4 h-4"
                  />
                </span>

                <span
                  class="hidden justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] active [.active]:bg-black/75 max-[580px]:[.active]:bg-black/75 max-[580px]:[.active]:shadow-[0_0_10px_0_rgba(7,244,104,0.30),0_0_10px_0_rgba(7,244,104,0.10)] max-[580px]:[.active]:backdrop-blur-[25px] max-[580px]:[.active]:text-[#07F468] max-[580px]:[.active]:border-transparent cursor-pointer"
                > 
                  <img
                    :src="likeActiveUrl"
                    :alt="t('profile.alt.likeActive')"
                    class="w-4 h-4"
                  />
                </span>

                <div class="relative cursor-pointer">
                  <span
                    class="flex justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] cursor-pointer"
                  >
                    <img
                      :src="dotsUrl"
                      :alt="t('profile.alt.dots')"
                      class="w-4 h-4"
                    />
                  </span>

                  <!-- add-dropdown-menu-here -->
                </div>
              </div>
            </div>

            <div
              class="flex flex-col justify-center items-center cursor-pointer"
            >
              <img
                :src="avatarUrl"
                :alt="t('profile.alt.avatar')"
                class="w-[2.813rem] h-[2.813rem] rounded-[12.5rem] object-cover"
              />
            </div>
          </div>
        </div>
</template>
