<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAssetUrl } from "@/composables/useAssetUrl.js";
import ProfileHeaderActions from "./ProfileHeaderActions.vue";

const { t } = useI18n();
const { url: logoFullUrl } = useAssetUrl("profile.logo.full");
const { url: logoWhiteUrl } = useAssetUrl("profile.logo.whiteFull");
</script>

<template>
    <div class="w-full">
          <!-- header-wrapper -->
          <div
            class="relative md:bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.00)_100%)]"
          >
            <!-- header-inner-wrapper -->
            <div
              class="flex justify-between items-center gap-6 relative z-[2] h-14 md:h-[4.375rem]"
            >
              <!-- navigation and logo section -->
              <div
                class="flex justify-start items-center gap-[3.375rem] px-2 md:px-4 xl:pr-12"
              >
                <div class="flex items-center gap-1 md:gap-4">
                  <!-- logo-section -->
                  <div class="opacity-50 sm:opacity-100">
                    <a href="#" class="hidden opacity-70 leading-[0] xl:block">
                       <!-- // disini -->
                      <img
                        :src="logoFullUrl"
                        :alt="t('profile.alt.logoFull')"
                        class="w-[8.9375rem] h-[2.375rem]"
                      />
                    </a>

                    <a href="#" class="flex leading-[0] xl:hidden">
                      <img
                        :src="logoWhiteUrl"
                        :alt="t('profile.alt.logoWhite')"
                        class="-7 h-7"
                      />  
                    </a>
                  </div>
                </div>
              </div>

              <ProfileHeaderActions/>
            </div>
          </div>
        </div>
</template>
