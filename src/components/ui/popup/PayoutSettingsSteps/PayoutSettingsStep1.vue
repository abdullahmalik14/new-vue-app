<template>
  <div class="flex flex-col h-full relative md:pt-2">
      <!-- header -->
      <div class="flex justify-between items-center gap-2.5 px-4 py-2 md:py-4">
          <div class="flex items-center gap-1 md:items-start md:gap-2">
              <img src="https://i.ibb.co.com/mCNkDdrh/settings.webp" alt="settings" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)] md:w-6 md:h-6">
              <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">Payout setting</h2>
          </div>

          <button @click="emit('close')" class="flex justify-center items-center w-6 h-6">
              <img src="https://i.ibb.co.com/DPv34WzS/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
          </button>
      </div>

      <!-- content -->
      <div class="flex flex-col gap-4 px-2 pt-4 pb-12 md:gap-6 md:px-4 xl:px-6 xl:pt-2">
          <p class="text-sm text-[#344054] dark:text-[hsl(39,23%,36%)]">Manage your payout details, update payment preferences, and ensure seamless transactions.</p>
      
          <div class="flex flex-col gap-6 md:gap-10">
              <!-- auto-withdraw-settings -->
              <div class="flex flex-col gap-4">
                  <!-- title-section -->
                  <div class="flex justify-between items-start gap-4">
                      <!-- title-container -->
                      <div class="flex lg:items-center gap-2 flex-1 flex-wrap min-w-0 flex-col lg:flex-row lg:gap-1">
                          <h3 class="text-sm font-semibold whitespace-nowrap text-[#0C111D] dark:text-[#dbd8d3]">Auto Withdraw Settings</h3>
                          <template v-if="!engine.state.isSaved">
                              <span class="text-xs leading-normal font-medium truncate flex-1 text-[#667085] dark:text-[#9e9589]">Not set up</span>
                          </template>
                          <template v-else>
                              <div class="flex items-center gap-1 flex-1 flex-wrap">
                                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">Next payout date:</span>
                                  <span v-if="engine.state.autoWithdrawMethod === 'every-month'" class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">Apr-03-2025</span>
                                  <span v-else class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">When earning reaches USD$ {{ engine.state.targetAmount || '0.00' }}.</span>
                              </div>
                          </template>
                      </div>

                      <button @click="goToStep2('auto-withdraw')" class="relative flex justify-center items-center gap-2.5 py-1 px-2 bg-black z-0 shadow-[2px_3px_0_0_#07F468] shrink-0 group/button hover:bg-[#07F468] hover:shadow-[2px_3px_0_0_black] hover:after:bg-[#07F468]
                      after:content-[''] after:absolute after:top-0 after:-left-2.5 after:w-8 after:h-full after:bg-black after:-z-10 after:pointer-events-none after:[transform:skew(20deg)_translateX(2px)] dark:bg-[#181a1b] dark:shadow-[2px_3px_0_0_#06c454] dark:hover:bg-[#06c454] dark:hover:shadow-[2px_3px_0_0_#181a1b] dark:hover:after:bg-[#06c454]">
                          <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">SET UP</span>
                      </button>
                  </div>

                  <p class="text-xs leading-normal text-[#667085] md:text-sm dark:text-[#9e9589]">Setup auto withdraw earnings to your selected payout method by month or by earning amounts.</p>
              </div>

              <!-- auto-withdraw-settings -->
              <div class="flex flex-col gap-4">
                  <!-- title-section -->
                  <div class="flex justify-between items-start gap-4">
                      <!-- title-container -->
                      <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                          <h3 class="text-sm font-semibold whitespace-nowrap text-[#0C111D] dark:text-[#dbd8d3]">
                              <template v-if="!engine.state.isSaved">Saved Payout Method</template>
                              <template v-else>Your saved payout method <sup class="text-[#0C111D] dark:text-[#dbd8d3]">{{ savedMethods.length }}</sup></template>
                          </h3>
                          <span v-if="!engine.state.isSaved" class="text-xs leading-normal font-medium truncate flex-1 text-[#667085] dark:text-[#9e9589]">No saved method</span>
                      </div>

                      <button @click="goToStep2('add-method')" class="relative flex justify-center items-center gap-2.5 py-1 px-2 bg-black z-0 shadow-[2px_3px_0_0_#07F468] group/button hover:bg-[#07F468] hover:shadow-[2px_3px_0_0_black] hover:after:bg-[#07F468]
                      after:content-[''] after:absolute after:top-0 after:-left-2.5 after:w-8 after:h-full after:bg-black after:-z-10 after:pointer-events-none after:[transform:skew(20deg)_translateX(2px)] dark:bg-[#181a1b] dark:shadow-[2px_3px_0_0_#06c454] dark:hover:bg-[#06c454] dark:hover:shadow-[2px_3px_0_0_#181a1b] dark:hover:after:bg-[#06c454]">
                          <img v-if="!engine.state.isSaved" src="https://i.ibb.co.com/VY9Cy6fk/plus.webp" alt="plus" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(80%)_sepia(16%)_saturate(6792%)_hue-rotate(87deg)_brightness(100%)_contrast(98%)] group-hover/button:[filter:brightness(0)_saturate(100%)] dark:group-hover/button:[filter:brightness(0)_saturate(100%)_invert(98%)_sepia(22%)_saturate(106%)_hue-rotate(309deg)_brightness(99%)_contrast(83%)]">
                          <span v-else class="text-xl font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3] pb-[2px]">+</span>
                          <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">ADD</span>
                      </button>
                  </div>

                  <p v-if="!engine.state.isSaved" class="text-xs leading-normal text-[#667085] md:text-sm dark:text-[#9e9589]">Save frequently used payout method for quick earnings withdrawal.</p>

                  <!-- saved-methods-list -->
                  <div v-if="engine.state.isSaved" class="relative z-20 flex flex-col gap-2 mt-2">
                      <div v-for="(method, index) in savedMethods" :key="index" class="relative flex flex-col gap-2 px-4 py-3 rounded-sm border-[1.5px] border-[#D0D5DD] bg-white/50 group/option md:py-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50">
                          <!-- blur-overlay -->
                          <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>
                          
                          <div class="flex justify-between items-center gap-2">
                              <span class="text-lg font-medium text-[#182230] dark:text-[#d1cdc7]">{{ method.type }}</span>
                              
                              <div class="flex items-center gap-2">
                                  <div class="flex items-center gap-1 flex-wrap px-2 py-1 border border-[#E4E7EC] dark:border-[#3b4043] shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                      <img :src="method.globeIcon" alt="globe" class="w-4 h-4 [filter:_brightness(0)_saturate(100%)]" />
                                      <span class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">{{ method.country }} - {{ method.bank }}</span>
                                  </div>

                                  <div class="relative" @click.stop="activeMenu = activeMenu === index ? null : index">
                                      <button class="w-6 h-6 flex justify-center items-center rounded hover:bg-gray-100  transition-colors">
                                          <img src="https://i.ibb.co.com/21cmFC47/settings.webp" alt="more" class="w-4 h-4 " />
                                      </button>
                                      
                                      <!-- menu popup -->
                                      <div v-if="activeMenu === index" class="dash-options-container w-full fixed max-md:!top-[unset] max-md:!bottom-0 max-md:!rounded-none left-0 md:min-w-[9.375rem] md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.5rem)] md:bottom-unset z-[9999] md:w-max origin-top shadow-lg transition-all duration-200 ease-out [transform-origin:50%_0] rounded-[0.625rem] downward open scale-100 opacity-100 pointer-events-auto h-auto overflow-auto" style="top: calc(100% + 0.5rem); bottom: auto;">
                                          <div class="border border-[rgba(186,188,203,0.5)] max-md:!rounded-none rounded-[0.625rem] bg-white dark:border-[rgba(61,71,73)] dark:bg-[#181a1b] overflow-hidden">
                                              <div class="option flex items-center gap-2 [&.selected]:bg-[#f2f4f7] hover:bg-[#f2f4f7] p-4 md:h-max dark:hover:bg-[#1e2022] dark:[&.selected]:bg-[#1e2022] cursor-pointer">
                                                  <img src="https://i.ibb.co.com/wZgQbKp9/svgviewer-png-output-49.webp" alt="edit" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(4%)_sepia(8%)_saturate(6848%)_hue-rotate(191deg)_brightness(101%)_contrast(95%)]">
                                                  <span class="text-base font-medium capitalize text-balance text-[#0c111d] dark:text-[#dbd8d3]">Edit</span>
                                              </div>

                                              <div class="option flex items-center gap-2 [&.selected]:bg-[#f2f4f7] hover:bg-[#f2f4f7] p-4 md:h-max dark:hover:bg-[#1e2022] dark:[&.selected]:bg-[#1e2022] cursor-pointer">
                                                  <img src="https://i.ibb.co.com/wH3Wh66/svgviewer-png-output-53.webp" alt="delete" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(30%)_sepia(84%)_saturate(2115%)_hue-rotate(356deg)_brightness(101%)_contrast(106%)]">
                                                  <span class="text-base font-medium capitalize text-balance text-[#ff4405] dark:text-[#ff571e]">Delete</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div class="flex justify-between items-center gap-2">
                              <span class="text-sm text-[#182230] dark:text-[#d1cdc7]">Pays in <span class="font-medium">{{ method.paysIn }}</span></span>
                              <span class="text-sm text-[#182230] dark:text-[#d1cdc7] mr-8">{{ method.fee }}</span>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- card-design -->
              <div class="flex flex-col gap-4">
              <!-- title-section -->
              <div class="flex justify-between">
                  <!-- title-container -->
                  <div class="flex items-center gap-2">
                      <h3 class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Card Design</h3>
                  </div>

                  <button @click="goToStep2('change-card')" class="relative flex justify-center items-center gap-2.5 py-1 px-2 bg-black z-0 shadow-[2px_3px_0_0_#07F468] group/button hover:bg-[#07F468] hover:shadow-[2px_3px_0_0_black] hover:after:bg-[#07F468]
                  after:content-[''] after:absolute after:top-0 after:-left-2.5 after:w-8 after:h-full after:bg-black after:-z-10 after:pointer-events-none after:[transform:skew(20deg)_translateX(2px)] dark:bg-[#181a1b] dark:shadow-[2px_3px_0_0_#06c454] dark:hover:bg-[#06c454] dark:hover:shadow-[2px_3px_0_0_#181a1b] dark:hover:after:bg-[#06c454]">
                      <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">CHANGE CARD DESIGN</span>
                  </button>
              </div>

              <!-- card-container -->
              <div class="flex justify-center items-center w-[calc(100%+1rem)] -ml-2 sm:w-full sm:ml-0 sm:py-4 md:py-6">
                <!-- card -->
                <div data-card class="flex flex-col gap-2.5 w-full group/card sm:w-max" 
                     :class="[
                        engine.state.cardDesign.mode === 'premium' ? 'card-premium-design' : '',
                        engine.state.cardDesign.mode === 'avatar' ? 'card-user-avatar' : '',
                        engine.state.cardDesign.mode === 'initial' ? 'card-user-initial' : ''
                     ]">
                    <!-- card-outer-wrapper -->
                    <div class="w-full h-[12.875rem] min-h-[12.875rem] relative shadow-[0_0_8px_0_rgba(0,0,0,0.25)] overflow-hidden z-0 sm:w-[23.4375rem] sm:min-w-[23.4375rem] md:w-[26.875rem] md:min-w-[26.875rem] md:h-[14.75rem] md:rounded-lg">
                      <!-- card-background-wrapper -->
                      <div data-premium-bg class="hidden group-[.card-premium-design]/card:flex absolute -top-0.5 -left-0.5 flex justify-center items-center w-[calc(100%+4px)] h-[calc(100%+4px)] bg-cover bg-center bg-no-repeat z-0 pointer-events-none" :style="{ backgroundImage: `url(${engine.state.cardDesign.premiumBg})` }"></div>

                      <!-- card-user-avatar-wrapper -->
                      <div data-avatar-bg class="hidden group-[.card-user-avatar]/card:flex absolute -top-0.5 -left-0.5 flex justify-center items-center w-[calc(100%+4px)] h-[calc(100%+4px)] bg-cover bg-center bg-no-repeat z-0 pointer-events-none" :style="{ backgroundColor: engine.state.cardDesign.color }">
                        <img src="https://i.ibb.co.com/W4xTTSzH/payout-card-user-avatar.webp" alt="payout card user avatar" class="h-[115%] blur-[4px] ml-4">
                      </div>

                      <!-- card-user-initial-wrapper -->
                      <div data-initial-bg class="hidden group-[.card-user-initial]/card:flex absolute -top-0.5 -left-0.5 flex justify-center items-center w-[calc(100%+4px)] h-[calc(100%+4px)] bg-cover bg-center bg-no-repeat z-0 pointer-events-none" :style="{ backgroundColor: engine.state.cardDesign.color }">
                        <span class="text-[11.875rem] leading-[7.7225rem] font-bold text-white blur-[4px] opacity-60 md:text-[15.625rem] dark:text-[#e8e6e3]">CP </span>
                        <img src="https://i.ibb.co.com/7tQrCYRR/payout-card-user-initial-noise.webp" alt="payout card user initial noise" class="absolute inset-0 w-full h-full z-[1] opacity-80 pointer-events-none">
                      </div>

                      <!-- card-border-wrapper -->
                      <div class="hidden absolute top-0 left-0 md:flex justify-center items-center w-full h-full border-solid border-2 [border-image-slice:2] [border-image-source:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(222,222,222,0.25)_100%)] rounded-lg z-[100] pointer-events-none"></div>

                      <!-- card-contents-wrapper -->
                      <div class="flex flex-col w-full h-full relative z-[2]">
                          <!-- card-contents-container -->
                          <div class="flex flex-col h-full justify-between">
                          <!-- card-content__top -->
                          <div class="flex flex-col w-full px-4 pt-4 md:px-5 md:pt-5">
                              <div class="flex justify-between items-start gap-5">
                                <!-- card-content__top--text-container -->
                                <div class="flex flex-col h-9 md:h-auto">
                                    <span class="text-sm font-bold tracking-[-0.056rem] text-white group-[.card-user-initial]/card:text-black md:text-lg md:text-black">OUR WEBSITE</span>
                                    <span class="hidden group-[.card-premium-design]/card:inline text-sm font-bold text-white group-[.card-user-initial]/card:text-black md:text-base md:text-black">PREMIUM</span>
                                    <span class="group-[.card-premium-design]/card:hidden text-sm font-bold text-white group-[.card-user-initial]/card:text-black md:text-base md:text-black">STANDARD</span>
                                </div>

                                <!-- card-logo-icon -->
                                <div class="flex justify-center items-center w-9 h-9">
                                    <img src="https://i.ibb.co.com/nqKrwfwB/our-website-logo.webp" alt="our-website-logo-with-bg" class="w-full h-full opacity-80 group-[.card-user-initial]/card:opacity-100 group-[.card-user-initial]/card:[filter:brightness(0)_saturate(100)] md:opacity-100 md:[filter:brightness(0)_saturate(100)]"/>
                                </div>
                              </div>
                          </div>

                          <!-- card-content__bottom -->
                          <div class="flex flex-col w-full px-4 py-3 gap-0.5 sm:gap-1 md:px-5">
                              <span class="text-sm font-medium text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-[#344054]">BALANCE</span>

                              <div class="flex justify-between items-center gap-1">
                              <div class="flex items-center gap-1">
                                  <span class="text-2xl font-medium tracking-[-0.045rem] text-white group-[.card-user-initial]/card:text-black md:text-4xl md:leading-[2.75rem] md:text-black">$</span>
                                  <span class="text-2xl font-medium tracking-[-0.045rem] text-white group-[.card-user-initial]/card:text-black md:text-4xl md:leading-[2.75rem] md:text-black">
                                    {{ isBalanceVisible ? '30054.40' : '********' }}
                                  </span>
                                  <img v-if="isBalanceVisible" @click="isBalanceVisible = false" src="https://i.ibb.co.com/675rpz03/eye.webp" alt="eye" class="w-6 h-6 cursor-pointer group-[.card-user-initial]/card:[filter:brightness(0)_saturate(100)] md:[filter:brightness(0)_saturate(100)]"/>
                                  <EyeSlashIcon v-else @click="isBalanceVisible = true" class="w-6 h-6 cursor-pointer text-white group-[.card-user-initial]/card:text-black md:text-black" />
                              </div>

                              <!-- credit-card-download-icon -->
                              <div class="flex justify-center items-center w-[1.875rem] h-[1.875rem] rounded bg-white/80 group-[.card-user-initial]/card:bg-[#182230] md:bg-[#182230]">
                                  <img src="https://i.ibb.co.com/p6Ntxgtt/download.webp" alt="download" class="w-[1.125rem] h-[1.125rem] [filter:brightness(0)_saturate(100)] group-[.card-user-initial]/card:[filter:_brightness(0)_saturate(100%)_invert(94%)_sepia(0%)_saturate(7500%)_hue-rotate(124deg)_brightness(115%)_contrast(105%)] md:[filter:_brightness(0)_saturate(100%)_invert(94%)_sepia(0%)_saturate(7500%)_hue-rotate(124deg)_brightness(115%)_contrast(105%)]"/>
                              </div>
                              </div>
                          </div>

                          <!-- card-blur-bottom-section -->
                          <div class="flex justify-center items-center gap-5 h-max md:h-full px-4 md:px-5 py-4 bg-black/10 backdrop-blur-[2px]">
                              <div class="flex justify-between items-start w-full h-full drop-shadow-[0_0_10px_-34px_rgba(0,0,0,0.75)]">
                              <div class="flex flex-col">
                                  <span class="text-xs leading-normal text-white group-[.card-user-initial]/card:text-[#182230]">NAME</span>
                                  <span class="text-sm leading-normal font-medium text-white group-[.card-user-initial]/card:text-black">MAX WANG</span>
                              </div>

                              <div class="flex flex-col">
                                  <div class="flex justify-end items-center gap-1">
                                  <span class="text-xs leading-normal text-right text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-white">Last Withdrawn</span>
                                  <span class="text-xs leading-normal text-right text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-white">11-31-2024</span>
                                  </div>

                                  <div class="flex">
                                  <a href="" class="flex items-center gap-0.5">
                                      <img src="https://i.ibb.co.com/WWphLLQb/history.webp" alt="history" class="w-[1.125rem] h-[1.125rem] group-[.card-user-initial]/card:[filter:brightness(0)_saturate(100%)_invert(9%)_sepia(8%)_saturate(3448%)_hue-rotate(176deg)_brightness(95%)_contrast(90%)]"/>
                                      <span class="text-sm leading-normal font-medium text-right underline text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-white">TRANSCATION HISTORY</span>
                                  </a>
                                  </div>
                              </div>
                              </div>
                          </div>
                          </div>
                      </div>
                    </div>
                </div>
              </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EyeSlashIcon from "@heroicons/vue/24/outline/EyeSlashIcon";

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const isBalanceVisible = ref(true);

const emit = defineEmits(['close']);
const activeMenu = ref(null);

const savedMethods = computed(() => {
    return props.engine.state.savedPayoutMethods || [];
});

const goToStep2 = (mode = 'auto-withdraw') => {
    props.engine.setState('currentMode', mode);
    props.engine.goToStep(2);
};
</script>
