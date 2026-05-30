<template>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payout Popup</title>

    <!-- poppins font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Custom CSS -->
    <script>
      tailwind.config = {
          darkMode: 'class',
          theme: {
              extend: {
                  screens: {
                      sm: '480px',
                      md: '768px',
                      lg: '1010px',
                      xl: '1365px',
                  },
                  fontFamily: {
                      sans: ['Poppins', 'Inter', 'Montserrat', 'Open Sans', 'arial', 'sans-serif'],
                  },
              },
          },
      }
    </script>
  </head>
  <body class="bg-white font-sans p-0 m-0 box-border overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#181a1b] !overflow-hidden"> <!-- Add overflow-hidden to body when popup opened -->
    <!-- main-wrapper -->
    <div class="flex flex-col md:flex-row">
      <!-- dashboard-template-main -->
      <div class="w-full relative z-[2] bg-transparent before:content-[''] before:fixed before:bg-[url('https://i.ibb.co.com/Y4zzyNCR/mobile-fansocial-gradient.png')] md:before:bg-[url('https://i.ibb.co.com/spGHXsL9/desktop-fansocial-gradient.png')] before:bg-cover before:bg-center before:w-screen before:h-screen before:bg-no-repeat before:left-0 before:top-0 before:pointer-events-none">
        <!-- template-container -->
        <div class="flex flex-col gap-4 flex-grow md:gap-6">
          <!-- top page header section -->
          <div class="relative flex flex-col gap-6 bg-cover md:backdrop-blur-[5px] md:[background-image:url('https://i.ibb.co.com/RGG4fpDF/header-gradient-bg.webp')] md:px-4 md:pt-4 xl:px-6 xl:pt-6 before:content-[''] md:before:hidden before:fixed before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] before:bg-cover before:w-full before:bg-no-repeat before:h-full before:left-0 before:top-0 before:pointer-events-none">

            <!-- overlay (above image, below content) -->
            <div class="max-md:hidden absolute inset-0 bg-white/10 pointer-events-none"></div> 

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
              <div class="flex flex-col justify-start items-start gap-4 w-full min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-2.5 min-[700px]:px-2 min-[700px]:py-4 md:flex-col md:gap-6 md:px-0 lg:flex-row lg:py-6 xl:py-8 min-[1250px]:flex-row">
                <!-- card -->
                <div class="flex flex-col gap-2.5 w-full lg:w-max">
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
                <div class="flex flex-col gap-4 w-full px-2 min-[700px]:px-0 md:gap-6 lg:gap-10 lg:px-6 xl:py-6">
                  <!-- progress-section__top -->
                  <div class="flex flex-col gap-2 w-full md:gap-4 lg:gap-6">
                    <h2 class="text-xl leading-normal font-medium text-[#0C111D] md:text-3xl md:leading-[2.375rem] lg:text-4xl lg:leading-[2.75rem] lg:tracking-[-0.045rem] dark:text-[#dbd8d3]">Your payout is being processed.</h2>

                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <span class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">EUR€114.48 </span>

                        <div class="flex items-center gap-1 flex-wrap px-2 py-0.5 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white/50 dark:bg-[#181a1b]/50">
                          <div class="w-4 h-4">
                            <img src="https://i.ibb.co.com/zhwwszjh/globe-1.webp" alt="globe-1" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                          </div>

                          <span class="text-sm font-medium text-[#182230] dark:text-[#d1cdc7]">USA - </span>

                          <span class="text-sm font-medium text-[#182230] dark:text-[#d1cdc7]">Bank Deposit</span>
                        </div>
                      </div>
                      <span class="text-base text-[#0C111D] dark:text-[#dbd8d3]">12/12/2024</span>
                    </div>
                  </div>

                  <!-- progress-section__bottom -->
                  <div class="flex flex-col gap-4 w-full lg:max-w-[31.25rem]">
                    <!-- progress-bar -->
                    <div class="rounded-lg overflow-hidden w-full h-[0.375rem] bg-[#EAECF0] dark:bg-[#222526] z-0">
                      <div class="w-1/2 h-full rounded bg-[#0c111d] dark:bg-[#0a0e17]"></div>
                    </div>

                    <div class="w-full flex justify-between">
                      <div class="text-xs leading-[1.125rem] text-[#0c111d] dark:text-[#dbd8d3]">Pending</div>
                      <div class="text-xs leading-[1.125rem] text-[#0c111d] dark:text-[#dbd8d3]">Processing</div>
                      <div class="text-xs leading-[1.125rem] text-[#98A2B3] dark:text-[#b0a993]">Completed</div>
                    </div>
                  </div>
                </div>
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

        <!-- payout-popup -->
        <div class="fixed inset-0 w-screen h-screen overflow-hidden bg-white/10 z-[9999] dark:bg-[#181a1b]/10">
            <!-- blur-overlay -->
            <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>
            
            <!-- popup-inner-wrapper -->
            <div data-popup-inner-wrapper class="absolute top-0 right-0 w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 md:w-[29.1875rem] lg:w-[45rem] dark:bg-[#1b1d1e]/90">
                <!-- blur-overlay -->
                <div class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"></div>
                
                <!-- popup-container -->
                <div class="flex flex-col h-full relative md:pt-4">
                    <!-- back-button -->
                    <button class="max-md:hidden flex justify-center items-center gap-1 w-max px-4">
                      <img src="https://i.ibb.co.com/tPzh072N/chevron-left.webp" alt="chevron left" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]">
                      <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Back</span>
                    </button>

                    <!-- header -->
                    <div class="flex justify-between items-center gap-2.5 px-4 py-2 md:py-4">
                        <div class="flex items-center gap-1 md:gap-2">
                            <img src="https://i.ibb.co.com/SDXwDYLH/auto-cycle.webp" alt="auto cycle" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)] md:w-6 md:h-6">
                            <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">Auto Withdraw Setting</h2>
                        </div>

                        <button class="flex justify-center items-center w-6 h-6 md:hidden">
                            <img src="https://i.ibb.co.com/DPv34WzS/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
                        </button>
                    </div>

                    <!-- content -->
                    <div class="flex flex-col gap-6 px-2 pt-4 pb-12 md:px-4 xl:px-6 xl:pt-2">
                        <p class="text-sm text-[#344054] dark:text-[#bdb8af]">Setup auto withdraw earnings to your selected payout method by month or by earning amounts.</p>
                    
                        <!-- dropdown-section -->
                        <div data-dropdown-section class="flex flex-col gap-2 group/dropdown-section every-month">
                            <label for="payout-method" class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Auto withdraw earnings to my selected payout method :</label>
                            
                            <!-- select-dropdown -->
                            <div class="select-dropdown relative flex w-full lg:max-w-[20rem]">
                                <div class="dropdown-select w-full cursor-pointer border-none">
                                    <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 rounded-t-sm border-b-[1.5px] border-[#0C111D] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#857c6d]">
                                        <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                        Every Month
                                        </span>
                                        <img class="select-arrow h-4 w-4 transition-transform duration-200"
                                        src="https://i.ibb.co.com/XrQjftBq/down.webp" alt="down" />
                                    </div>
                                    <div class="dash-options-container max-md:!fixed max-md:!inset-0 max-md:!flex max-md:!items-end max-md:bg-white/60 max-md:bg-[#181a1b]/60 max-md:backdrop-blur-[2.5px] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                        <div class="flex flex-col gap-1 max-md:w-full max-md:!shadow-[0px_0px_12px_0px_#00000033] backdrop-blur-[50px] shadow-[0px_3px_6px_0px_#00000033] bg-white/90 dark:bg-[#181a1b]/90">
                                            <div data-value="every-month" class="option flex items-center justify-center gap-[0.625rem] border-b border-[#EAECF0] group [&.selected]:bg-[#F9FAFB] hover:bg-[#F9FAFB] dark:border-[#353a3c] dark:hover:bg-[#1b1d1e] dark:[&.selected]:bg-[#1b1d1e]">
                                                <div class="option-inner-container flex flex-col flex-1 gap-1 px-2 py-3 md:p-4">
                                                  <span class="text-base font-medium text-[#0C111D] capitalize text-balance dark:text-[#dbd8d3]">Every Month</span>

                                                  <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Withdraw money to selected payout method every month automatically.</p>
                                                </div>
                                            </div>
                                            <div data-value="by-earning-target" class="option flex items-center justify-center gap-[0.625rem] border-b border-[#EAECF0] group [&.selected]:bg-[#F9FAFB] hover:bg-[#F9FAFB] dark:border-[#353a3c] dark:hover:bg-[#1b1d1e] dark:[&.selected]:bg-[#1b1d1e]">
                                                <div class="option-inner-container flex flex-col flex-1 gap-1 px-2 py-3 md:p-4">
                                                  <span class="text-base font-medium text-[#0C111D] capitalize text-balance dark:text-[#dbd8d3]">By earning target</span>

                                                  <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Withdraw money to selected payout method when your earning hits a specific amount.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <select class="dash-real-select hidden" name="dropdown-select" required>
                                    <option value="every-month">
                                        Every Month
                                    </option>
                                    <option value="by-earning-target">
                                        By earning target
                                    </option>
                                </select>
                            </div>

                            <p class="group-[.every-month]/dropdown-section:inline group-[.by-earning-target]/dropdown-section:hidden text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">Automatic payout requests are processed on the 1st of each month, including earnings from the past 28 days. Fund arrival depends on the payout method you choose.</p>
                        </div>

                        <!-- earning-target-section -->
                        <div data-earning-target-section class="flex flex-col gap-6 group/earning-target-section every-month">
                          <!-- every-month-content -->
                          <div class="flex flex-col gap-2 group-[.every-month]/earning-target-section:flex group-[.by-earning-target]/earning-target-section:hidden">
                            <!-- title-section -->
                            <div class="flex justify-between items-center gap-2">
                              <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Earning targets</h3>

                              <span class="text-xs leading-normal italic text-[#667085] md:text-base dark:text-[#9e9589]">Optional</span>
                            </div>

                            <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">We will not withdraw your money if your monthly earning does not reach your specified amount below.</p>
                          
                            <!-- input-field -->
                            <div class="flex items-center gap-2 px-3 py-2 shadow-[0px_1px_2px_0px_#1018280D] rounded-t-sm border-b border-[#D0D5DD] bg-white/50 lg:max-w-[20rem] dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                                <div class="flex items-center gap-3 w-full">
                                  <span class="text-base text-[#344054] dark:text-[#bdb8af]">USD$</span>
                                  <input type="number" placeholder="Enter Amount" value="" class="text-base placeholder:text-[#667085] text-[#101828] bg-transparent focus:outline-none flex-grow dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd]">
                                </div>
                            </div>
                          </div>

                          <!-- by-earning-target-content -->
                          <div class="flex flex-col gap-2 group-[.every-month]/earning-target-section:hidden group-[.by-earning-target]/earning-target-section:flex">
                            <!-- title-section -->
                            <div class="flex justify-between items-center gap-2">
                              <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Earning targets</h3>
                            </div>

                            <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">Your earnings will be paid out to your selected method every time your accumulated earnings reach the specified amount.</p>
                          
                            <!-- input-field -->
                            <div class="flex items-center gap-2 px-3 py-2 shadow-[0px_1px_2px_0px_#1018280D] rounded-t-sm border-b border-[#D0D5DD] bg-white/50 lg:max-w-[20rem] dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                                <div class="flex items-center gap-3 w-full">
                                  <span class="text-base text-[#344054] dark:text-[#bdb8af]">USD$</span>
                                  <input type="number" placeholder="Enter Amount" value="100.00" class="text-base placeholder:text-[#667085] text-[#101828] bg-transparent focus:outline-none flex-grow dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd]">
                                </div>
                            </div>
                          </div>
                        </div>

                        <!-- payout-method-section -->
                        <div class="flex flex-col gap-4">
                          <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Payout Method</h3>

                          <!-- payout-method-dropdown -->
                          <div data-payout-method-dropdown class="payout-method-dropdown relative flex w-full">
                              <div class="payout-method-dropdown-select w-full cursor-pointer border-none">
                                  <div data-payout-select-trigger-default class="flex items-center gap-2 p-3 rounded-t-sm border-b-[1.5px] border-[#0C111D] bg-white/50 md:h-[5.5rem] dark:bg-[#181a1b]/50 dark:border-[#857c6d]">
                                    <div class="flex items-center gap-2 flex-1">
                                      <img src="https://i.ibb.co.com/Q7mxt12p/plus-square.webp" alt="plus square" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(4414%)_hue-rotate(184deg)_brightness(90%)_contrast(96%)]">
                                      <span class="text-lg font-semibold text-[#101828] dark:text-[#d6d3cd]">Add New...</span>
                                    </div>

                                    <img class="select-arrow h-4 w-4 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(64%)_sepia(15%)_saturate(311%)_hue-rotate(179deg)_brightness(99%)_contrast(85%)]" src="https://i.ibb.co.com/XrQjftBq/down.webp" alt="down" />
                                  </div>

                                  <div data-payout-select-trigger-option class="hidden flex items-center gap-2 p-3 rounded-t-sm border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 md:h-[5.5rem] dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                                      <!-- option__top -->
                                      <div class="flex justify-between items-center gap-2">
                                        <span data-payout-trigger-title class="text-lg font-medium truncate text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">Bank Deposit</span>
                                        <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                            <div class="w-4 h-4">
                                            <img src="https://i.ibb.co.com/21zPFPz7/globe.webp" alt="globe" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                            </div>

                                            <span class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">USA - <span data-payout-trigger-bank> Bank</span></span>
                                        </div>
                                      </div>

                                      <!-- option__bottom -->
                                      <div data-payout-trigger-bottom class="flex justify-between items-center gap-2">
                                        <span data-payout-trigger-pays-text class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">Pays in <span data-payout-trigger-currency class="text-sm font-medium text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">USD</span></span>
                                        <span data-payout-trigger-fee class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                      </div>
                                    </div>

                                    <img class="select-arrow h-4 w-4 shrink-0 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(64%)_sepia(15%)_saturate(311%)_hue-rotate(179deg)_brightness(99%)_contrast(85%)]" src="https://i.ibb.co.com/XrQjftBq/down.webp" alt="down" />
                                  </div>

                                  <div data-payout-select-options class="max-md:!fixed max-md:!inset-0 max-md:!flex max-md:!items-end absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                      <div class="flex flex-col max-md:w-full max-md:!shadow-[0px_0px_12px_0px_#00000033] shadow-[0px_3px_6px_0px_#00000033] bg-white/90 dark:bg-[#181a1b]/90">
                                          <!-- option -->
                                          <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                            <!-- option__top -->
                                            <div class="flex justify-between items-center gap-2">
                                              <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Deposit</span>
                                              <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                                  <div class="w-4 h-4">
                                                    <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                                  </div>

                                                  <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                              </div>
                                            </div>

                                            <!-- option__bottom -->
                                            <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                              <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">EUR</span></span>
                                              <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                            </div>
                                          </div>

                                          <!-- option -->
                                          <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                            <!-- option__top -->
                                            <div class="flex justify-between items-center gap-2">
                                              <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Deposit</span>
                                              <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                                  <div class="w-4 h-4">
                                                    <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                                  </div>

                                                  <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                              </div>
                                            </div>

                                            <!-- option__bottom -->
                                            <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                              <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD</span></span>
                                              <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                            </div>
                                          </div>

                                          <!-- option -->
                                          <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                            <!-- option__top -->
                                            <div class="flex justify-between items-center gap-2">
                                              <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Wire</span>
                                              <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                                  <div class="w-4 h-4">
                                                    <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                                  </div>

                                                  <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                              </div>
                                            </div>

                                            <!-- option__bottom -->
                                            <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                              <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD</span></span>
                                              <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                            </div>
                                          </div>

                                          <!-- option -->
                                          <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                            <!-- option__top -->
                                            <div class="flex justify-between items-center gap-2">
                                              <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Wire</span>
                                              <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                                  <div class="w-4 h-4">
                                                    <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                                  </div>

                                                  <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                              </div>
                                            </div>

                                            <!-- option__bottom -->
                                            <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                              <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">CZK</span></span>
                                              <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                            </div>
                                          </div>

                                          <!-- option -->
                                          <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                            <!-- option__top -->
                                            <div class="flex justify-between items-center gap-2">
                                              <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USDT - Ethereum(ERC20)</span>
                                              <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                                  <div class="w-4 h-4">
                                                    <img src="https://i.ibb.co.com/qFdZMDc2/crypto.webp" alt="crypto" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                                  </div>

                                                  <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Crypto</span>
                                              </div>
                                            </div>

                                            <!-- option__bottom -->
                                            <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                              <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USDT</span></span>
                                              <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                            </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <select class="payout-real-select hidden" name="dropdown-select" required>
                                  
                              </select>
                          </div>
                        </div>
                    </div>

                    
                    <div class="flex justify-between items-center gap-2 fixed bottom-0 right-0 w-full md:w-[29.1875rem] lg:w-[45rem]">
                      <div data-payout-date class="max-md:!hidden hidden flex items-center gap-1 pl-4 group/payout-date every-month">
                        <span class="text-sm text-[#0C111D] dark:text-[#dbd8d3]">Next payout date:</span>
                        <span class="group-[.every-month]/payout-date:inline group-[.by-earning-target]/payout-date:hidden text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">Apr-03-2025</span>
                        <span class="group-[.every-month]/payout-date:hidden group-[.by-earning-target]/payout-date:inline text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">When earning reaches USD$ 100.00.</span>
                      </div>

                      <button data-next-button class="ml-auto flex items-center gap-2.5 pl-[1.48rem] pr-2 h-10 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,0.98rem_0%)] bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#06c454]">
                          <img src="https://i.ibb.co.com/Fb2Xxf9S/tick-circle.webp" alt="tick circle" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]">
                          <span class="text-lg font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">SAVE</span>
                      </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- handle dropdowns -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
    // HELPER FUNCTIONS (shared across all dropdowns)

    /**
     * Positions the dropdown options either below or above the trigger,
     * based on available space in the viewport.
     * @param {HTMLElement} select - The .dropdown-select container element
     */
    function positionDropdown(select) {
        const optionsContainer = select.querySelector('.dash-options-container');
        if (!optionsContainer) return;

        // Get position and dimensions of the select trigger
        const rect = select.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom; // pixels below the trigger
        const spaceAbove = rect.top; // pixels above the trigger
        const optionsHeight = optionsContainer.scrollHeight; // total height of options list

        // Remove any previous positioning classes
        optionsContainer.classList.remove('upward', 'downward');

        // Decide direction: if not enough space below but enough above, place upward
        if (spaceBelow < optionsHeight && spaceAbove > spaceBelow) {
        optionsContainer.classList.add('upward');
        optionsContainer.style.top = 'auto';
        optionsContainer.style.bottom = 'calc(100% + 0.5rem)'; // appear above with a small gap
        } else {
        optionsContainer.classList.add('downward');
        optionsContainer.style.top = 'calc(100% + 0.5rem)'; // appear below with a gap
        optionsContainer.style.bottom = 'auto';
        }
    }

    /**
     * Opens a dropdown: adds open class, rotates arrow, and applies visible state classes.
     * @param {HTMLElement} select - The .dropdown-select container element
     */
    function openDropdown(select) {
        const optionsContainer = select.querySelector('.dash-options-container');
        const arrow = select.querySelector('.select-arrow');
        if (!optionsContainer || !arrow) return;

        // Mark as open (used for state checks)
        optionsContainer.classList.add('open');
        arrow.classList.add('rotate-180'); // rotate arrow icon

        // Transition from hidden to visible (removing hidden classes, adding visible ones)
        optionsContainer.classList.remove('scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden');
        optionsContainer.classList.add('scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto');
    }

    /**
     * Closes a dropdown: removes open class, resets arrow, and applies hidden state classes.
     * @param {HTMLElement} select - The .dropdown-select container element
     */
    function closeDropdown(select) {
        const optionsContainer = select?.querySelector('.dash-options-container');
        const arrow = select?.querySelector('.select-arrow');
        if (!optionsContainer || !arrow) return;

        optionsContainer.classList.remove('open');
        arrow.classList.remove('rotate-180');

        // Hide with smooth transition (scale down, fade out, no pointer events, collapsed height)
        optionsContainer.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto');
        optionsContainer.classList.add('scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden');
    }

    // ==================== INITIALIZE EACH DROPDOWN ====================
    document.querySelectorAll('.dropdown-select').forEach(trendsSelect => {
        // Find related elements within this dropdown
        const selectDropdown = trendsSelect.closest('.select-dropdown');
        const trigger = trendsSelect.querySelector('.dash-select__trigger span');
        const arrow = trendsSelect.querySelector('.select-arrow');
        const options = trendsSelect.querySelectorAll('.option');
        const realSelect = selectDropdown.querySelector('.dash-real-select');
        const optionsContainer = trendsSelect.querySelector('.dash-options-container');

        // --- Initialize selected class based on current trigger text ---
        if (trigger) {
            const currentValue = realSelect?.value;

            options.forEach(opt => {
                if (opt.dataset.value === currentValue) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            });
        }

        // Click on the dropdown trigger toggles open/close
        trendsSelect.addEventListener('click', function(e) {
        e.stopPropagation();

        const isOpening = !optionsContainer.classList.contains('open');

        // Close any other dropdown
        document.querySelectorAll('.dropdown-select').forEach(s => {
            if (s !== trendsSelect) {
            closeDropdown(s);
            }
        });

        if (isOpening) {
            // Position and open this dropdown
            positionDropdown(trendsSelect);
            openDropdown(trendsSelect);
        } else {
            // Close it if already open
            closeDropdown(trendsSelect);
        }
        });

        // Click on an option updates the displayed value and the hidden select
        options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();

            // Get the text of the clicked option
            const selectedText = this.querySelector('span').textContent.trim();
            const selectedValue = this.dataset.value;

            if (trigger) trigger.textContent = selectedText;
            if (realSelect) realSelect.value = selectedValue;

            // --- Update selected class: remove from all, add to this ---
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            // Close the dropdown after selection
            closeDropdown(trendsSelect);

            // Trigger a 'change' event on the hidden select
            if (realSelect) realSelect.dispatchEvent(new Event('change'));
        });
        });
    });

    // ==================== GLOBAL EVENT HANDLERS ====================

    // Close all dropdowns when clicking anywhere outside them
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-select').forEach(select => {
        closeDropdown(select);
        });
    });

    // Reposition any open dropdown when the window is resized
    window.addEventListener('resize', function() {
        document.querySelectorAll('.dropdown-select').forEach(select => {
        const optionsContainer = select.querySelector('.dash-options-container');
        // Only reposition if this dropdown is currently open
        if (optionsContainer && optionsContainer.classList.contains('open')) {
            positionDropdown(select);
        }
        });
    });
    });
    </script>

    <!-- show earning-target sections based on dropdown selection -->
    <script>
    document.addEventListener('DOMContentLoaded', () => {
      const dropdownSection = document.querySelector('[data-dropdown-section]');
      const earningTargetSection = document.querySelector('[data-earning-target-section]');
      const payoutDateSection = document.querySelector('[data-payout-date]');
      const realSelect = dropdownSection?.querySelector('.dash-real-select');

      if (!dropdownSection || !earningTargetSection || !payoutDateSection || !realSelect) return;

      function updateDropdownClasses(value) {
        // remove previous state classes
        dropdownSection.classList.remove('every-month', 'by-earning-target');
        earningTargetSection.classList.remove('every-month', 'by-earning-target');
        payoutDateSection.classList.remove('every-month', 'by-earning-target');

        // add current selected class
        dropdownSection.classList.add(value);
        earningTargetSection.classList.add(value);
        payoutDateSection.classList.add(value);
      }

      // initial state
      updateDropdownClasses(realSelect.value);

      // update on dropdown change
      realSelect.addEventListener('change', (e) => {
        updateDropdownClasses(e.target.value);
      });
    });
    </script>

    <!-- Custom Payout Method Dropdown -->
    <script>
    document.addEventListener('DOMContentLoaded', () => {
      // UTILITY FUNCTIONS

      /**
       * Dynamically positions dropdown menu above or below trigger
       * Prevents dropdown from going off-screen
       * @param {HTMLElement} dropdown - The dropdown container element
       */
      function positionDropdown(dropdown) {
        const selectWrapper = dropdown.querySelector('.payout-method-dropdown-select');
        const optionsContainer = dropdown.querySelector('[data-payout-select-options]');

        if (!optionsContainer || !selectWrapper) return;

        const rect = selectWrapper.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const optionsHeight = optionsContainer.scrollHeight;

        // Reset positioning
        optionsContainer.style.top = '';
        optionsContainer.style.bottom = '';

        // If not enough space below but enough above, show above
        if (spaceBelow < optionsHeight && spaceAbove > spaceBelow) {
          optionsContainer.style.bottom = 'calc(100% + 0.5rem)';
          optionsContainer.style.top = 'auto';
        } else {
          // Default: show below
          optionsContainer.style.top = 'calc(100% + 0.5rem)';
          optionsContainer.style.bottom = 'auto';
        }
      }

      /**
       * Opens dropdown with animation
       * @param {HTMLElement} dropdown - The dropdown container element
       */
      function openDropdown(dropdown) {
        const optionsContainer = dropdown.querySelector('[data-payout-select-options]');
        const arrows = dropdown.querySelectorAll('.select-arrow');

        if (!optionsContainer) return;

        // Remove hidden/closed state classes
        optionsContainer.classList.remove(
          'scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden'
        );
        // Add visible/open state classes
        optionsContainer.classList.add(
          'scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto'
        );
        // Rotate arrow icons
        arrows.forEach(arrow => arrow.classList.add('rotate-180'));
      }

      /**
       * Closes dropdown with animation
       * @param {HTMLElement} dropdown - The dropdown container element
       */
      function closeDropdown(dropdown) {
        const optionsContainer = dropdown.querySelector('[data-payout-select-options]');
        const arrows = dropdown.querySelectorAll('.select-arrow');

        if (!optionsContainer) return;

        // Remove visible/open state classes
        optionsContainer.classList.remove(
          'scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto'
        );
        // Add hidden/closed state classes
        optionsContainer.classList.add(
          'scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden'
        );
        // Reset arrow rotation
        arrows.forEach(arrow => arrow.classList.remove('rotate-180'));
      }

      // DROPDOWN INITIALIZATION

      const dropdowns = document.querySelectorAll('[data-payout-method-dropdown]');

      dropdowns.forEach(dropdown => {
        // DOM element references
        const selectWrapper = dropdown.querySelector('.payout-method-dropdown-select');
        const optionsContainer = dropdown.querySelector('[data-payout-select-options]');
        const defaultTrigger = dropdown.querySelector('[data-payout-select-trigger-default]');
        const optionTrigger = dropdown.querySelector('[data-payout-select-trigger-option]');
        
        // Trigger content containers to be updated when option is selected
        const triggerTitle = dropdown.querySelector('[data-payout-trigger-title]');
        const triggerBank = dropdown.querySelector('[data-payout-trigger-bank]');
        const triggerPaysText = dropdown.querySelector('[data-payout-trigger-pays-text]');
        const triggerCurrency = dropdown.querySelector('[data-payout-trigger-currency]');
        const triggerFee = dropdown.querySelector('[data-payout-trigger-fee]');
        
        // Hidden native select for form submission
        const realSelect = dropdown.querySelector('.payout-real-select');
        const options = dropdown.querySelectorAll('[data-payout-option]');

        // Initial UI state: show default trigger, hide selected option trigger
        if (defaultTrigger) defaultTrigger.classList.remove('hidden');
        if (optionTrigger) optionTrigger.classList.add('hidden');

        if (!selectWrapper) return;

        // DROPDOWN TOGGLE HANDLER

        selectWrapper.addEventListener('click', (e) => {
          e.stopPropagation();

          const isClosed = optionsContainer.classList.contains('pointer-events-none');

          // Close other dropdowns first
          document.querySelectorAll('[data-payout-method-dropdown]').forEach(other => {
            if (other !== dropdown) closeDropdown(other);
          });

          if (isClosed) {
            positionDropdown(dropdown); // Ensure dropdown fits in viewport
            openDropdown(dropdown);
          } else {
            closeDropdown(dropdown);
          }
        });

        // OPTION SELECTION HANDLER

        options.forEach((option, index) => {
          option.addEventListener('click', (e) => {
            e.stopPropagation();

            // highlight selected option
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Switch UI from default to selected state
            if (defaultTrigger) defaultTrigger.classList.add('hidden');
            if (optionTrigger) optionTrigger.classList.remove('hidden');

            // Extract option data from data attributes
            const optionTitle = option.querySelector('[data-payout-option-title]');
            const optionBank = option.querySelector('[data-payout-option-bank]');
            const optionCurrency = option.querySelector('[data-payout-option-currency]');
            const optionFee = option.querySelector('[data-payout-option-fee]');
            const optionPaysText = option.querySelector('[data-payout-option-pays-text]');

            // Update trigger display with selected option data
            if (optionTitle && triggerTitle) {
              triggerTitle.textContent = optionTitle.textContent.trim();
            }

            if (optionBank && triggerBank) {
              triggerBank.textContent = optionBank.textContent.trim();
            }

            if (optionCurrency && triggerCurrency) {
              triggerCurrency.textContent = optionCurrency.textContent.trim();
            }

            if (optionFee && triggerFee) {
              triggerFee.textContent = optionFee.textContent.trim();
            }

            if (optionPaysText && triggerPaysText) {
              triggerPaysText.innerHTML = optionPaysText.innerHTML;
            }

            // Sync with hidden native select for form submission
            if (realSelect) {
              realSelect.selectedIndex = index;
              realSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Close dropdown after selection
            closeDropdown(dropdown);
          });
        });
      });

      // GLOBAL EVENT HANDLERS

      /**
       * Click-outside-to-close pattern
       * Closes any open dropdown when clicking elsewhere on the page
       */
      document.addEventListener('click', (e) => {
        const isInsideDropdown = Array.from(document.querySelectorAll('[data-payout-method-dropdown]'))
          .some(dropdown => dropdown.contains(e.target));

        if (!isInsideDropdown) {
          document.querySelectorAll('[data-payout-method-dropdown]').forEach(dropdown => {
            closeDropdown(dropdown);
          });
        }
      });

      /**
       * Reposition open dropdowns on window resize
       * Prevents dropdown from being cut off or appearing in wrong position
       */
      window.addEventListener('resize', () => {
        document.querySelectorAll('[data-payout-method-dropdown]').forEach(dropdown => {
          const optionsContainer = dropdown.querySelector('[data-payout-select-options]');
          if (optionsContainer && !optionsContainer.classList.contains('pointer-events-none')) {
            positionDropdown(dropdown);
          }
        });
      });

      /**
       * Reposition open dropdowns on scroll
       * UseCapture true to catch scroll events before they bubble
       */
      window.addEventListener('scroll', () => {
        document.querySelectorAll('[data-payout-method-dropdown]').forEach(dropdown => {
          const optionsContainer = dropdown.querySelector('[data-payout-select-options]');
          if (optionsContainer && !optionsContainer.classList.contains('pointer-events-none')) {
            positionDropdown(dropdown);
          }
        });
      }, true);

    });
    </script>

    <!-- show payout date when scrolled to bottom of popup -->
    <script>
      document.addEventListener("DOMContentLoaded", () => {
          const container = document.querySelector("[data-popup-inner-wrapper]");
          const payoutDate = document.querySelector("[data-payout-date]");

          if (!container || !payoutDate) return;

          const checkIfAtBottom = () => {
              const scrollTop = container.scrollTop;
              const clientHeight = container.clientHeight;
              const scrollHeight = container.scrollHeight;

              const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

              if (isAtBottom) {
                  payoutDate.classList.remove("hidden");
              } else {
                  payoutDate.classList.add("hidden");
              }
          };

          // initial state
          checkIfAtBottom();

          // scroll inside container
          container.addEventListener("scroll", checkIfAtBottom);

          // resize window
          window.addEventListener("resize", checkIfAtBottom);
      });
    </script>
  </body>
</html>
</template>