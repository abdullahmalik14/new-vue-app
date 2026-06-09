<script setup lang="ts">
import ProfileHeaderActions from './ProfileHeaderActions.vue';

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
                        data-src="/images/website-logo.webp"
                        alt="our-website-logo-full"
                        class="lazyload w-[8.9375rem] h-[2.375rem]"
                      />
                    </a>

                    <a href="#" class="flex leading-[0] xl:hidden">
                      <img
                        data-src="/images/our-website-full-white-logo.webp"
                        alt="our-website-logo"
                        class="lazyload -7 h-7"
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