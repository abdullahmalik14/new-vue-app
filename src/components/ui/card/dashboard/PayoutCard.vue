<template>
      <div class="flex flex-col justify-start items-start gap-4 w-full sm:gap-2.5 sm:px-2 sm:py-4 md:gap-6 md:px-0 lg:py-6 xl:py-8 min-[1250px]:flex-row">
                    <div class="flex flex-col gap-2.5 w-full">
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
                                  <span class="text-2xl font-medium tracking-[-0.045rem] text-white md:text-4xl md:leading-[2.75rem] md:text-black">
                                    {{ isBalanceVisible ? '30054.40' : '********' }}
                                  </span>
                                  <img v-if="isBalanceVisible" @click="isBalanceVisible = false" src="https://i.ibb.co.com/675rpz03/eye.webp" alt="eye" class="w-6 h-6 cursor-pointer md:[filter:brightness(0)_saturate(100)]"/>
                                  <EyeSlashIcon v-else @click="isBalanceVisible = true" class="w-6 h-6 cursor-pointer text-white md:text-black" />
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
    
                    <!-- progress-section -->
                    <!-- <div class="flex flex-col gap-4 w-full sm:px-2 lg:px-0 xl:px-6">
                    </div> -->
                  </div>
</template>

<script setup>
import { ref } from 'vue';
import EyeSlashIcon from "@heroicons/vue/24/outline/EyeSlashIcon";

const isBalanceVisible = ref(true);
</script>