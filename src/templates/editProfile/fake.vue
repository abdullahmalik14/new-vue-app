<template>

  <div class="bg-white font-sans p-0 m-0 box-border overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#181a1b]">
    <!-- main-wrapper -->
    <div class="flex flex-col md:flex-row">
      <!-- dashboard-template-main -->
      <div class="w-full relative z-[2] bg-transparent before:content-[''] before:fixed before:bg-[url('https://i.ibb.co.com/Y4zzyNCR/mobile-fansocial-gradient.png')] md:before:bg-[url('https://i.ibb.co.com/spGHXsL9/desktop-fansocial-gradient.png')] before:bg-cover before:bg-center before:w-screen before:h-screen before:bg-no-repeat before:left-0 before:top-0 before:pointer-events-none">
        <div class="flex flex-col gap-4 flex-grow md:gap-6">
          <!-- top page header section -->
          <div class="relative flex flex-col gap-6 bg-cover md:backdrop-blur-[5px] md:[background-image:url('https://i.ibb.co.com/RGG4fpDF/header-gradient-bg.webp')] md:px-4 md:pt-4 xl:px-6 xl:pt-6 before:content-[''] md:before:hidden before:fixed before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] before:bg-cover before:w-full before:bg-no-repeat before:h-full before:left-0 before:top-0 before:pointer-events-none">

            <!-- overlay (above image, below content) -->
            <div class="absolute inset-0 bg-white/10 pointer-events-none"></div> 

            <!-- custom-title -->
            <div class="hidden md:flex justify-between items-center gap-4 w-full z-[1] xl:gap-6">
              <h1 class="text-3xl leading-[2.375rem] font-medium tracking-[-0.045rem] text-[#475467] dark:text-[#b1aaa0]">Your Earnings</h1>
            
              <!-- payout-settings-button -->
              <button class="flex justify-center items-center gap-2.5 pl-1 pr-2 h-10">
                <img src="https://i.ibb.co.com/xt47cMfQ/settings-02.webp" alt="settings 02" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(49%)_sepia(5%)_saturate(1614%)_hue-rotate(183deg)_brightness(85%)_contrast(84%)]">
                <span class="text-lg font-medium text-[#667085] dark:text-[#9e9589]">Payout Settings</span>
              </button>
            </div>

            <!-- top-page-settings -->
            <div class="flex flex-col items-start gap-2 z-[1] sm:gap-4 md:gap-2 lg:flex-row lg:gap-4">
              <!-- card-section -->
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

                <!-- progress-section -->
                <!-- <div class="flex flex-col gap-4 w-full sm:px-2 lg:px-0 xl:px-6">
                </div> -->
              </div>
            </div>
          </div>

          <!-- payout-history section -->
          <div class="flex flex-col gap-2 md:gap-4">
            <!-- title-container -->
            <div class="flex justify-between items-center gap-2.5 px-2 md:px-4">
              <h2 class="text-lg font-medium text-[#667085] md:text-xl md:leading-normal dark:text-[#9e9589]">Payout History</h2>
            </div>

            <!-- table-wrapper -->
            <div class="flex flex-col">
              <!-- table-wrapper (desktop) -->
              <div class="hidden md:flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                <div class="flex flex-col w-full">
                  <!-- table-header -->
                  <div class="flex items-center w-full">
                    <!-- Period -->
                    <div class="flex items-center pl-6 pr-2.5 py-2.5 min-w-[11.75rem] min-h-[2.625rem] border-b border-[#667085] dark:border-[#655e53]">
                      <span class="text-sm text-[#667085] dark:text-[#9e9589]">Period</span>
                    </div>

                    <!-- Status -->
                    <div class="flex items-center p-2.5 min-w-[7.375rem] min-h-[2.625rem] border-b border-[#667085] lg:min-w-[8.875rem] dark:border-[#655e53]">
                      <span class="text-sm text-[#667085] dark:text-[#9e9589]">Status</span>
                    </div>

                    <!-- Total Earned -->
                    <div class="flex justify-end items-center pl-2.5 pr-6 py-2.5 min-w-[7.625rem] min-h-[2.625rem] border-b border-[#667085] lg:min-w-[9.8125rem] xl:min-w-[12.125rem] dark:border-[#655e53]">
                      <span class="text-sm text-right text-[#667085] dark:text-[#9e9589]">Total Earned</span>
                    </div>

                    <!-- Rollover -->
                    <div class="flex justify-end items-center pl-2.5 pr-6 py-2.5 min-w-[6.4375rem] min-h-[2.625rem] border-b border-[#667085] lg:min-w-[8.5625rem] dark:border-[#655e53]">
                      <span class="text-sm text-right text-[#667085] dark:text-[#9e9589]">Rollover</span>
                    </div>

                    <!-- Transfer Fee -->
                    <div class="flex justify-end items-center pl-2.5 pr-6 py-2.5 min-w-[7.5rem] min-h-[2.625rem] border-b border-[#667085] lg:min-w-[8.5625rem] dark:border-[#655e53]">
                      <span class="text-sm text-right text-[#667085] dark:text-[#9e9589]">Transfer Fee</span>
                    </div>

                    <!-- Commission % -->
                    <div class="flex justify-end items-center pl-2.5 pr-6 py-2.5 min-w-[8.5625rem] min-h-[2.625rem] border-b border-[#667085] dark:border-[#655e53]">
                      <span class="text-sm text-right text-[#667085] dark:text-[#9e9589]">Commission %</span>
                    </div>

                    <!-- Final Payout -->
                    <div class="flex justify-end items-center pl-2.5 pr-6 py-2.5 min-w-[9.8125rem] min-h-[2.625rem] border-b border-[#667085] xl:min-w-[12.125rem] dark:border-[#655e53]">
                      <span class="text-sm text-right text-[#667085] dark:text-[#9e9589]">Final Payout</span>
                    </div>

                    <!-- action -->
                    <div class="flex justify-end items-center pl-2.5 pr-6 py-2.5 flex-grow min-w-[5rem] min-h-[2.625rem] border-b border-[#667085] dark:border-[#655e53]"></div>
                  </div>

                  <!-- table-row-container -->
                  <div class="flex flex-col w-full">
                    <!-- row -->
                    <div class="flex items-center w-full min-h-[4.5rem]">
                      <!-- Period -->
                      <div class="flex items-center pl-6 pr-3 py-2 min-w-[11.75rem] h-full">
                        <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">1 Jan 2024 - 31 Jan 2024</span>
                      </div>

                      <!-- Status -->
                      <div class="flex items-center pl-3 py-2 min-w-[7.375rem] h-full lg:min-w-[8.875rem]">
                        <div class="flex h-6">
                          <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#FFE500] dark:bg-[#a99700]">
                            <img src="https://i.ibb.co.com/qP4Jr6q/clock.webp" alt="clock" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                          </div>
                          <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                            <span class="text-xs leading-normal font-medium text-[#FFE500] dark:text-[#ffe81a]">Pending</span>
                          </div>
                        </div>
                      </div>

                      <!-- Total Earned -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.625rem] h-full lg:min-w-[9.8125rem] xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">USD$ 130.86</span>
                      </div>

                      <!-- Rollover -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[6.4375rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Transfer Fee -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.5rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Commission % -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[8.5625rem] h-full">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">88.8%</span>
                      </div>

                      <!-- Final Payout -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[9.8125rem] h-full xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-bold text-right text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                      </div>

                      <div class="flex justify-end items-center pl-3 pr-6 py-2.5 flex-grow min-w-[5rem] h-full">
                        <button class="flex justify-center items-center w-8 h-8">
                          <img src="https://i.ibb.co.com/qMVbj8VQ/search-icon.webp" alt="search icon" class="w-6 h-6">
                        </button>
                      </div>
                    </div>

                    <!-- row -->
                    <div class="flex items-center w-full min-h-[4.5rem]">
                      <!-- Period -->
                      <div class="flex items-center pl-6 pr-3 py-2 min-w-[11.75rem] h-full">
                        <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">1 Jan 2024 - 31 Jan 2024</span>
                      </div>

                      <!-- Status -->
                      <div class="flex items-center pl-3 py-2 min-w-[7.375rem] h-full lg:min-w-[8.875rem]">
                        <div class="flex h-6">
                          <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                            <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                          </div>
                          <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                            <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                          </div>
                        </div>
                      </div>

                      <!-- Total Earned -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.625rem] h-full lg:min-w-[9.8125rem] xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">USD$ 130.86</span>
                      </div>

                      <!-- Rollover -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[6.4375rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Transfer Fee -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.5rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Commission % -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[8.5625rem] h-full">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">88.8%</span>
                      </div>

                      <!-- Final Payout -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[9.8125rem] h-full xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-bold text-right text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                      </div>

                      <div class="flex justify-end items-center pl-3 pr-6 py-2.5 flex-grow min-w-[5rem] h-full">
                        <button class="flex justify-center items-center w-8 h-8">
                          <img src="https://i.ibb.co.com/qMVbj8VQ/search-icon.webp" alt="search icon" class="w-6 h-6">
                        </button>
                      </div>
                    </div>
                    
                    <!-- row -->
                    <div class="flex items-center w-full min-h-[4.5rem]">
                      <!-- Period -->
                      <div class="flex items-center pl-6 pr-3 py-2 min-w-[11.75rem] h-full">
                        <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">1 Jan 2024 - 31 Jan 2024</span>
                      </div>

                      <!-- Status -->
                      <div class="flex items-center pl-3 py-2 min-w-[7.375rem] h-full lg:min-w-[8.875rem]">
                        <div class="flex h-6">
                          <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                            <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                          </div>
                          <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                            <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                          </div>
                        </div>
                      </div>

                      <!-- Total Earned -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.625rem] h-full lg:min-w-[9.8125rem] xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">USD$ 130.86</span>
                      </div>

                      <!-- Rollover -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[6.4375rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Transfer Fee -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.5rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Commission % -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[8.5625rem] h-full">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">88.8%</span>
                      </div>

                      <!-- Final Payout -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[9.8125rem] h-full xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-bold text-right text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                      </div>

                      <div class="flex justify-end items-center pl-3 pr-6 py-2.5 flex-grow min-w-[5rem] h-full">
                        <button class="flex justify-center items-center w-8 h-8">
                          <img src="https://i.ibb.co.com/qMVbj8VQ/search-icon.webp" alt="search icon" class="w-6 h-6">
                        </button>
                      </div>
                    </div>

                    <!-- row -->
                    <div class="flex items-center w-full min-h-[4.5rem]">
                      <!-- Period -->
                      <div class="flex items-center pl-6 pr-3 py-2 min-w-[11.75rem] h-full">
                        <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">1 Jan 2024 - 31 Jan 2024</span>
                      </div>

                      <!-- Status -->
                      <div class="flex items-center pl-3 py-2 min-w-[7.375rem] h-full lg:min-w-[8.875rem]">
                        <div class="flex h-6">
                          <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                            <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                          </div>
                          <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                            <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                          </div>
                        </div>
                      </div>

                      <!-- Total Earned -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.625rem] h-full lg:min-w-[9.8125rem] xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">USD$ 130.86</span>
                      </div>

                      <!-- Rollover -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[6.4375rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Transfer Fee -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.5rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Commission % -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[8.5625rem] h-full">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">88.8%</span>
                      </div>

                      <!-- Final Payout -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[9.8125rem] h-full xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-bold text-right text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                      </div>

                      <div class="flex justify-end items-center pl-3 pr-6 py-2.5 flex-grow min-w-[5rem] h-full">
                        <button class="flex justify-center items-center w-8 h-8">
                          <img src="https://i.ibb.co.com/qMVbj8VQ/search-icon.webp" alt="search icon" class="w-6 h-6">
                        </button>
                      </div>
                    </div>

                    <!-- row -->
                    <div class="flex items-center w-full min-h-[4.5rem]">
                      <!-- Period -->
                      <div class="flex items-center pl-6 pr-3 py-2 min-w-[11.75rem] h-full">
                        <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">1 Jan 2024 - 31 Jan 2024</span>
                      </div>

                      <!-- Status -->
                      <div class="flex items-center pl-3 py-2 min-w-[7.375rem] h-full lg:min-w-[8.875rem]">
                        <div class="flex h-6">
                          <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                            <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                          </div>
                          <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                            <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                          </div>
                        </div>
                      </div>

                      <!-- Total Earned -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.625rem] h-full lg:min-w-[9.8125rem] xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">USD$ 130.86</span>
                      </div>

                      <!-- Rollover -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[6.4375rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Transfer Fee -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[7.5rem] h-full lg:min-w-[8.5625rem]">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">$0</span>
                      </div>

                      <!-- Commission % -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[8.5625rem] h-full">
                        <span class="text-xs leading-normal font-medium text-right text-[#0C111D] dark:text-[#dbd8d3]">88.8%</span>
                      </div>

                      <!-- Final Payout -->
                      <div class="flex justify-end items-center pl-3 pr-6 py-2 min-w-[9.8125rem] h-full xl:min-w-[12.125rem]">
                        <span class="text-xs leading-normal font-bold text-right text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                      </div>

                      <div class="flex justify-end items-center pl-3 pr-6 py-2.5 flex-grow min-w-[5rem] h-full">
                        <button class="flex justify-center items-center w-8 h-8">
                          <img src="https://i.ibb.co.com/qMVbj8VQ/search-icon.webp" alt="search icon" class="w-6 h-6">
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- table-wrapper (mobile) -->
              <div class="flex flex-col gap-1 sm:px-2 md:hidden">
                <!-- row -->
                <div class="flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50">
                  <div class="flex justify-between gap-0.5 w-full">
                    <!-- row-left -->
                    <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5">
                      <span class="text-sm font-medium py-0.5 text-[#182230] dark:text-[#d1cdc7]">1 Jan 2024 - 31 Jan 2024</span>
                    
                      <!-- table -->
                      <div class="flex flex-col gap-0.5 sm:gap-1">
                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Rollover</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Transfer Fee</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Commission %</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">88.8%</span>
                        </div>
                      </div>
                    </div>

                    <!-- row-right -->
                    <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
                      <!-- status -->
                      <div class="flex h-6">
                        <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#FFE500] dark:bg-[#a99700]">
                          <img src="https://i.ibb.co.com/qP4Jr6q/clock.webp" alt="clock" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                        </div>
                        <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                          <span class="text-xs leading-normal font-medium text-[#FFE500] dark:text-[#ffe81a]">Pending</span>
                        </div>
                      </div>

                      <div class="flex flex-col sm:gap-1">
                        <!-- total-earned -->
                        <div class="flex items-center gap-1">
                          <span class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Total Earned</span>
                          <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">USD$ 130.86</span>
                        </div>

                        <!-- final-payout -->
                        <div class="flex flex-col">
                          <span class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]">Final Payout</span>
                          <span class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- row -->
                <div class="flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50">
                  <div class="flex justify-between gap-0.5 w-full">
                    <!-- row-left -->
                    <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5">
                      <span class="text-sm font-medium py-0.5 text-[#182230] dark:text-[#d1cdc7]">1 Jan 2024 - 31 Jan 2024</span>
                    
                      <!-- table -->
                      <div class="flex flex-col gap-0.5 sm:gap-1">
                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Rollover</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Transfer Fee</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Commission %</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">88.8%</span>
                        </div>
                      </div>
                    </div>

                    <!-- row-right -->
                    <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
                      <!-- status -->
                      <div class="flex h-6">
                        <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                          <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                        </div>
                        <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                          <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                        </div>
                      </div>

                      <div class="flex flex-col sm:gap-1">
                        <!-- total-earned -->
                        <div class="flex items-center gap-1">
                          <span class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Total Earned</span>
                          <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">USD$ 130.86</span>
                        </div>

                        <!-- final-payout -->
                        <div class="flex flex-col">
                          <span class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]">Final Payout</span>
                          <span class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- row -->
                <div class="flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50">
                  <div class="flex justify-between gap-0.5 w-full">
                    <!-- row-left -->
                    <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5">
                      <span class="text-sm font-medium py-0.5 text-[#182230] dark:text-[#d1cdc7]">1 Jan 2024 - 31 Jan 2024</span>
                    
                      <!-- table -->
                      <div class="flex flex-col gap-0.5 sm:gap-1">
                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Rollover</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Transfer Fee</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Commission %</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">88.8%</span>
                        </div>
                      </div>
                    </div>

                    <!-- row-right -->
                    <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
                      <!-- status -->
                      <div class="flex h-6">
                        <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                          <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                        </div>
                        <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                          <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                        </div>
                      </div>

                      <div class="flex flex-col sm:gap-1">
                        <!-- total-earned -->
                        <div class="flex items-center gap-1">
                          <span class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Total Earned</span>
                          <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">USD$ 130.86</span>
                        </div>

                        <!-- final-payout -->
                        <div class="flex flex-col">
                          <span class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]">Final Payout</span>
                          <span class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- row -->
                <div class="flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50">
                  <div class="flex justify-between gap-0.5 w-full">
                    <!-- row-left -->
                    <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5">
                      <span class="text-sm font-medium py-0.5 text-[#182230] dark:text-[#d1cdc7]">1 Jan 2024 - 31 Jan 2024</span>
                    
                      <!-- table -->
                      <div class="flex flex-col gap-0.5 sm:gap-1">
                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Rollover</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Transfer Fee</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Commission %</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">88.8%</span>
                        </div>
                      </div>
                    </div>

                    <!-- row-right -->
                    <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
                      <!-- status -->
                      <div class="flex h-6">
                        <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                          <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                        </div>
                        <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                          <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                        </div>
                      </div>

                      <div class="flex flex-col sm:gap-1">
                        <!-- total-earned -->
                        <div class="flex items-center gap-1">
                          <span class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Total Earned</span>
                          <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">USD$ 130.86</span>
                        </div>

                        <!-- final-payout -->
                        <div class="flex flex-col">
                          <span class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]">Final Payout</span>
                          <span class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- row -->
                <div class="flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50">
                  <div class="flex justify-between gap-0.5 w-full">
                    <!-- row-left -->
                    <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5">
                      <span class="text-sm font-medium py-0.5 text-[#182230] dark:text-[#d1cdc7]">1 Jan 2024 - 31 Jan 2024</span>
                    
                      <!-- table -->
                      <div class="flex flex-col gap-0.5 sm:gap-1">
                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Rollover</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Transfer Fee</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">$0</span>
                        </div>

                        <!-- row -->
                        <div class="flex justify-between items-center gap-0.5">
                          <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Commission %</span>
                          <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">88.8%</span>
                        </div>
                      </div>
                    </div>

                    <!-- row-right -->
                    <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
                      <!-- status -->
                      <div class="flex h-6">
                        <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px] bg-[#07F468] dark:bg-[#06c454]">
                          <img src="https://i.ibb.co.com/pBCPJv0c/tick-mark.webp" alt="tick mark" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                        </div>
                        <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                          <span class="text-xs leading-normal font-medium text-[#07F468] dark:text-[#23f97b]">Paid</span>
                        </div>
                      </div>

                      <div class="flex flex-col sm:gap-1">
                        <!-- total-earned -->
                        <div class="flex items-center gap-1">
                          <span class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Total Earned</span>
                          <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">USD$ 130.86</span>
                        </div>

                        <!-- final-payout -->
                        <div class="flex flex-col">
                          <span class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]">Final Payout</span>
                          <span class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]">USD$ 123.08</span>
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