<template>
    <div class="flex justify-between items-center px-2 py-1 md:hidden">
        <!-- back-button -->
        <div class="flex justify-center items-center w-10 h-10">
          <img
            data-src="/images/chevron-left.webp"
            alt="chevron-left"
            class="lazyload w-6 h-6"
          />
        </div>

        <!-- creator-details -->
        <div class="flex items-center gap-1">
          <!-- creator-information-container -->
          <div class="flex items-center gap-2 h-6 py-1">
            <!-- creator-avatar-container -->
            <div class="w-6 h-6 relative">
              <!-- avatar -->
              <div class="w-full h-full rounded-full">
                <img
                  data-src="/images/featured-media-bg.webp"
                  alt="featured-media-bg"
                  class="lazyload w-full h-full rounded-full object-cover"
                />
              </div>
              <!-- Online-user-signal -->
              <span
                class="block absolute right-0 bottom-[0.188rem] w-1.5 h-1.5 bg-[#07F468] rounded-full"
              ></span>
            </div>

            <div class="flex flex-col">
              <!-- name & tick mark container -->
              <div class="flex items-center gap-1">
                <div class="text-sm font-semibold text-[#98A2B3] line-clamp-1">
                  @sukii19
                </div>
                <div class="flex justify-center items-center w-2.5 h-2.5">
                  <img
                    data-src="/images/svgviewer-png-output-22.webp"
                    alt="verified-tick"
                    class="lazyload w-full h-full object-cover"
                  />
                </div>
              </div>

              <!-- creator-stats-container -->
              <div class="flex items-center gap-3">
                <!-- followers -->
                <div class="flex items-center gap-1">
                  <div class="flex justify-center items-center">
                    <img
                      data-src="/images/eye.webp"
                      alt="eye"
                      class="lazyload w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(12%)_saturate(707%)_hue-rotate(183deg)_brightness(92%)_contrast(88%)]"
                    />
                  </div>
                  <span class="text-xs leading-normal text-[#667085]">18</span>
                </div>

                <!-- likes -->
                <div class="flex items-center gap-1">
                  <div class="flex justify-center items-center">
                    <img
                      data-src="/images/like-normal.webp"
                      alt="like-normal"
                      class="lazyload w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(12%)_saturate(707%)_hue-rotate(183deg)_brightness(92%)_contrast(88%)]"
                    />
                  </div>
                  <span class="text-xs leading-normal text-[#667085]">5</span>
                </div>
              </div>
            </div>

            <!-- action -->
            <div class="flex justify-center items-center w-5 h-5">
              <img
                data-src="/images/3-dots-horizontal.webp"
                alt="3-dots-horizontal"
                class="lazyload w-full"
              />
            </div>
          </div>
        </div>

        <!-- profile-avatar -->
        <div class="flex justify-center items-center relative w-9 h-9 py-1">
          <!-- avatar -->
          <div class="w-9 h-9 rounded-full">
            <img
              data-src="/images/featured-media-bg.webp"
              alt="featured-media-bg"
              class="lazyload w-full h-full rounded-full object-cover"
            />
          </div>
          <!-- Online-user-signal -->
          <span
            class="block absolute right-0 bottom-[0.188rem] w-2 h-2 bg-[#07F468] rounded-full"
          ></span>
        </div>
      </div>
</template>