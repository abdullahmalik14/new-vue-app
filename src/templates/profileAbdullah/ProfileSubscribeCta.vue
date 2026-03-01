<script setup>
import { ref } from 'vue';
import ProfileSubscriptionPopup from './popups/ProfileSubscriptionPopup.vue';
const profileSubscriptionPopupOpen = ref(false);
</script>

<template>
     <div class="flex md:mt-8 xl:mt-16">
              <!-- new-subscriber-button -->
              <div
                class="flex justify-center items-end min-w-[45rem] max-w-[45rem] w-full h-20 cursor-pointer sm:px-5 md:relative"
              >
                <!-- buy-now-button -->
                <button
                  class="flex justify-center items-center gap-1 w-[53%] h-[3.75rem] absolute left-0 bg-black flex-grow px-6 py-[0.313rem] shadow-[0_0_24px_0_rgba(251,4,100,0.25)] md:rounded-[16px_0_0_16px] lg:w-[27.875rem] group/button"
                >
                  <span
                    class="hidden absolute bottom-1 left-0 text-white w-[6.875rem] h-[6.25rem] overflow-hidden md:block"
                  >
                    <span class="w-[6.875rem] h-[6.25rem] block relative">
                      <img
                        data-src="/images/subscriber-btn-img.webp"
                        alt="subscriber-btn-img"
                        class="lazyload absolute bottom-0 left-0 opacity-100 [transition:all_0.5s_ease-in-out] transition-all duration-500 ease-in-out group-hover/button:animate-bouncedown"
                      />
                      <img
                        data-src="/images/subscriber-btn-hover-img.webp"
                        alt="subscriber-btn-hover-img"
                        class="lazyload absolute bottom-0 left-0 opacity-0 w-[3.75rem] [transition:all_0.5s_ease-in-out] transition-all duration-500 ease-in-out group-hover/button:animate-bouncup"
                      />
                    </span>
                  </span>

                  <!-- subscribe-hot-tag -->
                  <div
                    class="absolute bottom-12 left-[0.6875rem] text-black md:relative md:bottom-[unset] md:left-[unset]"
                  >
                    <span class="absolute left-[-0.75rem] z-[1] text-black">
                      <span
                        class="absolute top-1 w-[0.8125rem] h-3 shadow-[3px_0_4px_0_rgba(0,0,0,0.25)] z-[-3] text-black"
                      ></span>
                      <img
                        data-src="/images/hot-offer.webp"
                        alt="hot-offer"
                        class="lazyload w-6 h-6 aspect-square"
                      />
                    </span>
                   
                  </div>

                  <!-- tier-price -->wi
                  <span
                    class="text-xs leading-6 font-medium whitespace-nowrap text-white md:text-sm"
                    >Starting
                    <span
                      class="text-lg leading-[2rem] font-medium text-white -mr-1 md:text-3xl md:leading-[2.375rem] md:-mr-2"
                    >
                      $32
                    </span>
                    <span
                      class="text-xs leading-6 font-medium whitespace-nowrap text-white line-through md:text-sm"
                      >45</span
                    >
                    /mo
                  </span>
                </button>

                <!-- subscribe-button -->
                <div
                  class="absolute right-0 flex flex-col justify-center items-center w-1/2 h-20 min-h-[4.5] pl-12 pr-6 py-4 md:right-4 md:min-w-[20rem] lg:right-0 lg:w-auto"
                >
                  <div
                    class="absolute flex flex-col justify-center items-center gap-2.5 w-full h-20 min-h-[4.5] md:min-w-[20rem] md:w-[-webkit-fill-available] lg:w-auto"
                  >
                    <!-- shape-wrapper -->
                    <div
                      class="absolute h-20 left-[-1.65625rem] sm:left-[-1.625rem]"
                    >
                      <img
                        data-src="/images/subscriber-button-shape.webp"
                        alt="subscriber-button-shape"
                        class="lazyload w-[1.75rem] h-full"
                      />
                    </div>

                    <button
                    @click="profileSubscriptionPopupOpen = true"
                      class="flex justify-center items-center self-stretch px-3 py-[0.313rem] bg-[#FB0464] flex-grow md:rounded-[0_16px_16px_0] lg:max-w-[18.9375rem]"
                    >
                      <span
                        class="text-lg font-medium text-white uppercase whitespace-nowrap md:text-2xl lg:text-xl lg:leading-normal xl:text-2xl"
                        >SUBSCRIBE</span
                      >
                    </button>
                  </div>
                </div>
              </div>
            </div>

    <ProfileSubscriptionPopup v-model="profileSubscriptionPopupOpen" />

</template>