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
                      <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                          <h3 class="text-sm font-semibold whitespace-nowrap text-[#0C111D] dark:text-[#dbd8d3]">Auto Withdraw Settings</h3>
                          <span class="text-xs leading-normal font-medium truncate flex-1 text-[#667085] dark:text-[#9e9589]">Not set up</span>
                      </div>

                      <button @click="goToStep2" class="relative flex justify-center items-center gap-2.5 py-1 px-2 bg-black z-0 shadow-[2px_3px_0_0_#07F468] shrink-0 group/button hover:bg-[#07F468] hover:shadow-[2px_3px_0_0_black] hover:after:bg-[#07F468]
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
                          <h3 class="text-sm font-semibold whitespace-nowrap text-[#0C111D] dark:text-[#dbd8d3]">Saved Payout Method</h3>
                          <span class="text-xs leading-normal font-medium truncate flex-1 text-[#667085] dark:text-[#9e9589]">No saved method</span>
                      </div>

                      <button @click="goToStep2" class="relative flex justify-center items-center gap-2.5 py-1 px-2 bg-black z-0 shadow-[2px_3px_0_0_#07F468] group/button hover:bg-[#07F468] hover:shadow-[2px_3px_0_0_black] hover:after:bg-[#07F468]
                      after:content-[''] after:absolute after:top-0 after:-left-2.5 after:w-8 after:h-full after:bg-black after:-z-10 after:pointer-events-none after:[transform:skew(20deg)_translateX(2px)] dark:bg-[#181a1b] dark:shadow-[2px_3px_0_0_#06c454] dark:hover:bg-[#06c454] dark:hover:shadow-[2px_3px_0_0_#181a1b] dark:hover:after:bg-[#06c454]">
                          <img src="https://i.ibb.co.com/VY9Cy6fk/plus.webp" alt="plus" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(80%)_sepia(16%)_saturate(6792%)_hue-rotate(87deg)_brightness(100%)_contrast(98%)] group-hover/button:[filter:brightness(0)_saturate(100%)] dark:group-hover/button:[filter:brightness(0)_saturate(100%)_invert(98%)_sepia(22%)_saturate(106%)_hue-rotate(309deg)_brightness(99%)_contrast(83%)]">
                          <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">ADD</span>
                      </button>
                  </div>

                  <p class="text-xs leading-normal text-[#667085] md:text-sm dark:text-[#9e9589]">Save frequently used payout method for quick earnings withdrawal.</p>
              </div>

              <!-- card-design -->
              <div class="flex flex-col gap-4">
              <!-- title-section -->
              <div class="flex justify-between">
                  <!-- title-container -->
                  <div class="flex items-center gap-2">
                      <h3 class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Card Design</h3>
                  </div>

                  <button @click="goToStep2" class="relative flex justify-center items-center gap-2.5 py-1 px-2 bg-black z-0 shadow-[2px_3px_0_0_#07F468] group/button hover:bg-[#07F468] hover:shadow-[2px_3px_0_0_black] hover:after:bg-[#07F468]
                  after:content-[''] after:absolute after:top-0 after:-left-2.5 after:w-8 after:h-full after:bg-black after:-z-10 after:pointer-events-none after:[transform:skew(20deg)_translateX(2px)] dark:bg-[#181a1b] dark:shadow-[2px_3px_0_0_#06c454] dark:hover:bg-[#06c454] dark:hover:shadow-[2px_3px_0_0_#181a1b] dark:hover:after:bg-[#06c454]">
                      <span class="text-base font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">CHANGE CARD DESIGN</span>
                  </button>
              </div>

              <!-- card-container -->
              <div class="flex justify-center items-center w-[calc(100%+1rem)] -ml-2 sm:w-full sm:ml-0 sm:py-4 md:py-6">
                  <!-- card -->
                  <div class="flex flex-col gap-2.5 w-full sm:w-max">
                  <!-- card-outer-wrapper -->
                  <div class="w-full h-[12.875rem] min-h-[12.875rem] relative shadow-[0_0_8px_0_rgba(0,0,0,0.25)] overflow-hidden z-0 sm:w-[23.4375rem] sm:min-w-[23.4375rem] md:w-[26.875rem] md:min-w-[26.875rem] md:h-[14.75rem] md:rounded-lg">
                      <!-- card-background-wrapper -->
                      <div class="absolute -top-0.5 -left-0.5 flex justify-center items-center w-[calc(100%+4px)] h-[calc(100%+4px)] [background-image:url(https://i.ibb.co.com/6RbpTFYw/card-gradient-bg-mobile.webp)] bg-cover bg-center bg-no-repeat z-0 pointer-events-none md:[background-image:url(https://i.ibb.co.com/r2mg80bZ/card-gradient-bg.webp)]"></div>

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
                              <span class="text-sm font-bold tracking-[-0.056rem] text-white md:text-lg md:text-black">OUR WEBSITE</span>
                              <span class="text-sm font-bold text-white md:text-base md:text-black">PREMIUM</span>
                              </div>

                              <!-- card-logo-icon -->
                              <div class="flex justify-center items-center w-9 h-9">
                              <img src="https://i.ibb.co.com/nqKrwfwB/our-website-logo.webp" alt="our-website-logo-with-bg" class="w-full h-full opacity-80 md:opacity-100 md:[filter:brightness(0)_saturate(100)]"/>
                              </div>
                          </div>
                          </div>

                          <!-- card-content__bottom -->
                          <div class="flex flex-col w-full px-4 py-3 gap-0.5 sm:gap-1 md:px-5">
                          <span class="text-sm font-medium text-[#F2F4F7] md:text-[#344054]">BALANCE</span>

                          <div class="flex justify-between items-center gap-1">
                              <div class="flex items-center gap-1">
                              <span class="text-2xl font-medium tracking-[-0.045rem] text-white md:text-4xl md:leading-[2.75rem] md:text-black">$</span>
                              <span class="text-2xl font-medium tracking-[-0.045rem] text-white md:text-4xl md:leading-[2.75rem] md:text-black">30054.40</span>
                              <img src="https://i.ibb.co.com/675rpz03/eye.webp" alt="eye" class="w-6 h-6 md:[filter:brightness(0)_saturate(100)]"/>
                              </div>

                              <!-- credit-card-download-icon -->
                              <div class="flex justify-center items-center w-[1.875rem] h-[1.875rem] rounded bg-white/80 md:bg-[#182230]">
                              <img src="https://i.ibb.co.com/p6Ntxgtt/download.webp" alt="download" class="w-[1.125rem] h-[1.125rem] md:[filter:_brightness(0)_saturate(100%)_invert(94%)_sepia(0%)_saturate(7500%)_hue-rotate(124deg)_brightness(115%)_contrast(105%)]"/>
                              </div>
                          </div>
                          </div>

                          <!-- card-blur-bottom-section -->
                          <div class="flex justify-center items-center gap-5 h-max md:h-full px-4 md:px-5 py-4 bg-black/10 backdrop-blur-[2px]">
                          <div class="flex justify-between items-start w-full h-full drop-shadow-[0_0_10px_-34px_rgba(0,0,0,0.75)]">
                              <div class="flex flex-col">
                              <span class="text-xs leading-normal text-white">NAME</span>
                              <span class="text-sm leading-normal font-medium text-white">MAX WANG</span>
                              </div>

                              <div class="flex flex-col">
                              <div class="flex justify-end items-center gap-1">
                                  <span class="text-xs leading-normal text-right text-[#F2F4F7] md:text-white">Last Withdrawn</span>
                                  <span class="text-xs leading-normal text-right text-[#F2F4F7] md:text-white">11-31-2024</span>
                              </div>

                              <div class="flex">
                                  <a href="" class="flex items-center gap-0.5">
                                  <img src="https://i.ibb.co.com/WWphLLQb/history.webp" alt="history" class="w-[1.125rem] h-[1.125rem]"/>
                                  <span class="text-sm leading-normal font-medium text-right underline text-[#F2F4F7] md:text-white">TRANSCATION HISTORY</span>
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
const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const goToStep2 = () => {
    props.engine.goToStep(2);
};
</script>
