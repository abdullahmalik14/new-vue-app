<template>
  <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="mediaDetailsPopupConfig">
    <div
      class="h-full [background:linear-gradient(180deg,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.10)_50%,rgba(255,255,255,0.02)_100%),#0C111D] 
      md:[0px_0px_10px_-10px_#00000080] font-sans p-0 m-0 box-border overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
      <!-- popup-wrapper -->
      <div class="w-full ">
        <!-- popup__media-section -->
        <div class="flex flex-col w-full relative lg:h-screen lg:bg-[#191919]">
          <!-- mobile-navbar -->
          <div class="flex justify-between items-center gap-2 p-2 md:hidden">
            <img @click="emit('update:modelValue', false)" src="https://i.ibb.co.com/Zpm5jfZ9/chevron-left.webp"
              alt="go-back" class="w-6 h-6 cursor-pointer" />

            <span class="text-sm font-semibold text-white">cheese pizza asmr</span>

            <img src="https://i.ibb.co.com/xtn4YLHF/3-dots.webp" alt="settings" class="w-6 h-6 cursor-pointer" />
          </div>

          <!-- media-container (mobile) -->
          <div class="w-full aspect-[16/9] md:hidden">
            <div class="relative w-full h-full shadow-[0px_0px_10px_-34px_#0000001A] overflow-hidden">
              <!-- Mobile Video Player (Active) -->
              <div v-if="isMobileVideoActive" class="absolute inset-0 w-full h-full z-[20] group">
                <video class="w-full h-full object-cover" autoplay playsinline @ended="isMobileVideoActive = false"
                  @click="isMobileVideoActive = false">
                  <source
                    :src="media.video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'"
                    type="video/mp4">
                </video>

                <!-- Custom Pause Button (Overlay) -->
                <div
                  class="absolute inset-0 flex justify-center items-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  @click="isMobileVideoActive = false">
                  <div
                    class="p-5 sm:p-11 bg-black/10 rounded-[107.65px] backdrop-blur-[10.23px] inline-flex justify-start items-center gap-2.5 pointer-events-auto">
                    <div class=" relative opacity-70 overflow-hidden flex justify-center items-center">
                      <img src="/images/pause.png" class="w-5 h-5 sm:w-11 sm:h-11 " />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Placeholder / Thumbnail State (Inactive) -->
              <template v-else>
                <!-- background image -->
                <div class="absolute inset-0 bg-[url('/images/ai-art.png')] bg-cover bg-center">
                </div>

                <!-- gradient overlay -->
                <div
                  class="absolute inset-0 bg-[linear-gradient(0deg,rgba(239,243,248,0.1),rgba(239,243,248,0.1)),linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)]">
                </div>

                <!-- Custom Play Button (Mobile) -->
                <div class="absolute inset-0 flex justify-center items-center z-[10] cursor-pointer"
                  @click="isMobileVideoActive = true">
                  <div
                    class="p-5 sm:p-11 bg-black/10 rounded-[107.65px] backdrop-blur-[10.23px] inline-flex justify-start items-center gap-2.5">
                    <div class="relative opacity-70 overflow-hidden flex justify-center items-center">
                      <img src="/images/play.png" class="w-5 h-5  sm:w-11 sm:h-11 " />
                    </div>
                  </div>
                </div>
              </template>

              <!-- media-overlay-items-wrapper -->
              <div class="w-full h-full flex flex-col justify-between gap-2 relative z-[1]">
                <!-- overlay-items__top -->
                <div class="w-full flex justify-between items-center gap-3 p-1">
                  <!-- media-type-container -->
                  <div
                    class="flex justify-center items-center gap-[0.1875rem] bg-[#18223080] px-1 py-[0.0625rem] rounded">
                    <img src="https://i.ibb.co.com/tTDV6Ms1/play-square.webp" alt="video" class="w-4 h-4" />
                    <span
                      class="text-xs leading-normal font-medium text-white tracking-[0.015rem] align-middle">15:00:03</span>
                  </div>

                  <!-- likes and views -->
                  <div class="flex items-center gap-3 px-1 opacity-70">
                    <!-- likes -->
                    <div class="flex items-center gap-[0.1875rem] drop-shadow-[0px_0px_5px_0px_#000000]">
                      <img src="https://i.ibb.co.com/YFwpWQnM/heart.webp" alt="likes" class="w-3 h-3" />
                      <span
                        class="text-xs leading-normal font-medium text-white tracking-[0.015rem] align-middle">12k</span>
                    </div>

                    <!-- views -->
                    <div class="flex items-center gap-[0.1875rem] drop-shadow-[0px_0px_5px_0px_#000000]">
                      <img src="https://i.ibb.co.com/rB3cvGp/eye.webp" alt="views" class="w-3 h-3" />
                      <span
                        class="text-xs leading-normal font-medium text-white tracking-[0.015rem] align-middle">40</span>
                    </div>
                  </div>
                </div>

                <!-- overlay-items__bottom -->
                <div class="flex justify-end items-center">
                  <!-- logo -->
                  <img src="https://i.ibb.co.com/wr75MHTr/logo.webp" alt="logo" class="h-16" />
                </div>
              </div>
            </div>
          </div>

          <!-- media-thumb-container (desktop) -->
          <div class="hidden w-full md:block">
            <!-- Video Player Section -->
            <div class="absolute inset-0 w-full h-full group">
              <!-- Video Element -->
              <video ref="videoPlayer" class="w-full h-full object-cover" playsinline @timeupdate="updateProgress"
                @loadedmetadata="onLoadedMetadata" @ended="onVideoEnded" @click="togglePlay">
                <source
                  :src="media.video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'"
                  type="video/mp4">
              </video>

              <!-- Thumbnail Overlay (Visible when paused) -->
              <div v-if="!isPlaying"
                class="absolute inset-0 bg-[url('/images/ai-art.png')] bg-cover bg-center pointer-events-none">
              </div>
              <!-- !-- Gradient Overlay -->
              <div
                class="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%),linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2))]">
              </div>



              <!-- Custom Controls -->
              <div class="absolute bottom-0 left-0 w-full px-6 py-4 flex flex-col gap-2 z-[20]">
                <!-- Progress Bar -->
                <div class="w-full h-1 bg-white/30 rounded-full cursor-pointer relative" @click="seek">
                  <div class="h-full bg-[#07f468] rounded-full relative" :style="{ width: progress + '%' }">
                    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#07f468] rounded-full shadow-md">
                    </div>
                  </div>
                </div>

                <!-- Control Buttons -->
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-6 w-full">
                    <button @click="togglePlay" class="text-white hover:text-[#07f468] transition">
                      <img :src="isPlaying ? '/images/pause.png' : '/images/play.png'" class="w-5 h-5" />
                    </button>

                    <button @click="skip(-10)" class="text-white/80 hover:text-white transition">
                      <img src="/images/10spre.png" class="w-6 h-6" />
                    </button>

                    <button @click="skip(10)" class="text-white/80 hover:text-white transition">
                      <img src="/images/10snext.png" class="w-6 h-6" />
                    </button>

                    <span class="text-xs text-white font-medium ml-2">
                      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                    </span>
                  </div>

                  <!-- Volume/Fullscreen Controls -->
                  <div class="flex items-center gap-3">
                    <button @click="toggleMute" class="text-white/80 hover:text-white">
                      <img v-if="isMuted" src="https://i.ibb.co.com/bMbk5v87/x-close.webp" class="w-5 h-5" />
                      <img v-else src="/images/mute.png" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>



            <!-- media-details-wrapper (desktop) -->
            <div
              class="hidden w-full aspect-[16/9] flex-col justify-between gap-4 h-full p-4 md:flex lg:h-screen lg:p-6">
              <!-- close-button -->
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-[20px] cursor-pointer">
                <img @click="emit('update:modelValue', false)" src="https://i.ibb.co.com/bMbk5v87/x-close.webp"
                  alt="back" class="w-8 h-8 block lg:hidden" />
                <img @click="emit('update:modelValue', false)" src="https://i.ibb.co.com/HLCwss7q/arrow-left.webp"
                  alt="back" class="w-8 h-8 hidden lg:block" />
              </div>

              <!-- media-details-container -->
              <div class="flex flex-col gap-12 z-[1]">
                <div class="flex flex-col gap-2 w-[31.625rem] lg:gap-5 lg:w-[42rem]">
                  <!-- avatar & user-info -->
                  <div class="flex items-center gap-2 py-1 w-80">
                    <!-- avatar-container -->
                    <div class="w-10 h-9 flex items-center">
                      <img src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp" alt="avatar" class="w-9 h-9" />
                    </div>

                    <!-- user-info -->
                    <div class="flex flex-col">
                      <!-- name & verified-tick -->
                      <div class="flex items-center gap-1 lg:hidden">
                        <span class="text-xs leading-normal font-semibold text-white">Princess Carrot Pop</span>
                        <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" alt="verified-tick"
                          class="w-2.5 h-2.5" />
                      </div>

                      <!-- username -->
                      <div class="flex items-center gap-2">
                        <span
                          class="text-xs leading-normal font-medium text-[#EAECF0] dark:text-[#dddad5] lg:text-sm lg:leading-normal lg:font-semibold lg:text-[#E7E5E4]">@sammisjelly187</span>
                        <img src="https://i.ibb.co.com/KxpZRPLz/check-verified-03-filled.webp" alt="verified-filled"
                          class="w-4 h-4 hidden lg:block" />
                      </div>

                      <!-- followers & likes -->
                      <div class="flex items-center gap-3 lg:hidden">
                        <!-- followers -->
                        <div class="flex items-center gap-1 h-[1.125rem]">
                          <img src="https://i.ibb.co.com/MkhnCTJK/user-02.webp" alt="followers"
                            class="w-3.5 h-3.5 [filter:brightness(100%)_saturate(0)]" />
                          <span
                            class="text-xs leading-normal text-[#EAECF0] dark:text-[#dddad5] align-middle">15.2K</span>
                        </div>

                        <!-- likes -->
                        <div class="flex items-center gap-1 h-[1.125rem]">
                          <img src="https://i.ibb.co.com/YFwpWQnM/heart.webp" alt="likes" class="h-3.5" />
                          <span
                            class="text-xs leading-normal text-[#EAECF0] dark:text-[#dddad5] align-middle">99K</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- text-container -->
                  <div class="flex flex-col gap-2 pl-6 border-l-[0.5px] mb-10 border-white lg:gap-5">
                    <p
                      class="text-base font-semibold line-clamp-2 text-white lg:text-[1.75rem] lg:leading-normal lg:line-clamp-3">
                      {{ media.title || 'Record breaking fried chicken eating ! See my attempt to break world’s record!  Watch now!' }}
                    </p>

                    <!-- date -->
                    <div
                      class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] w-max min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                      <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-white">11/12/23</span>
                    </div>

                    <p class="text-xs leading-loose tracking-[0.0075rem] text-white lg:text-base">
                      Lorem Ipsum I hate the color orange so much I have to close
                      my eyes while I eat them
                    </p>

                    <!-- categories-container -->
                    <div class="flex flex-wrap gap-2">
                      <!-- category -->
                      <div
                        class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                        <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Fried
                          Chicken</span>
                      </div>

                      <!-- category -->
                      <div
                        class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                        <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Mostly
                          Eating</span>
                      </div>

                      <!-- category -->
                      <div
                        class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                        <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Seasonal
                          Fruits</span>
                      </div>

                      <!-- category -->
                      <div
                        class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                        <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Mostly
                          Eating</span>
                      </div>
                    </div>

                    <!-- likes & upload -->
                    <div class="flex items-center gap-2">
                      <div
                        class="flex justify-center items-center w-6 h-6 border-[0.5px] border-[#E9E5D340] rounded-full bg-[#E9E5D30D] cursor-pointer">
                        <img src="https://i.ibb.co.com/2wTKJq2/like-normal.webp" alt="like" class="h-4" />
                      </div>

                      <div
                        class="flex justify-center items-center w-6 h-6 border-[0.5px] border-[#E9E5D340] rounded-full bg-[#E9E5D30D] cursor-pointer">
                        <img src="https://i.ibb.co.com/pjr9G8tn/upload.webp" alt="upload" class="h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- buttons-wrapper -->
                <!-- <div class="hidden items-center lg:flex">
                 
                  <div class="flex justify-center px-4">
                    <button
                      class="relative flex-grow max-w-[27.5rem] h-14 px-6 border-[3px] border-[#FFE1FC] bg-[#F600FEB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0_0_10px_0_#F600FEB2,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,inset_0_0_1px_0_#FF97F3E5] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-65 md:shadow-[0_0_10px_0_#F600FEB2,0_0_40px_0_#E803AE80_inset,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,0_0_1px_0_#FF97F3E5_inset] min-[1100px]:w-[27.5rem]">
                    
                      <div
                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                        <div class="flex items-baseline gap-0.5">
                          <div class="pt-1.5">
                            <span
                              class="text-[0.625rem] leading-normal font-semibold align-middle text-white drop-shadow-[0px_0px_30px_0px_#10182880]">$
                            </span>
                          </div>
                          <span
                            class="text-2xl font-semibold align-bottom text-white drop-shadow-[0px_0px_30px_0px_#10182880]">0.99</span>
                          <span
                            class="text-[0.5rem] leading-normal font-medium align-bottom tracking-[-0.01rem] text-white drop-shadow-[0px_0px_30px_0px_#10182880]">/month</span>
                        </div>

                        <span
                          class="text-lg font-medium align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap">Subscribe
                          now</span>
                      </div>
                    </button>
                  </div>

              
                  <div class="flex justify-center px-4">
                    <button
                      class="relative flex-grow max-w-[20.3125rem] h-14 px-6 border-[3px] border-white bg-[#1EBBFFB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_40px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-90 md:shadow-[0_0_40px_0_#0D71FC80_inset,0_0_1px_0_#1B45FF_inset,0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] min-[1100px]:w-[20.3125rem]">
                     
                      <div
                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                        <div class="flex items-baseline gap-0.5">
                          <div class="pt-1.5">
                            <span
                              class="text-[0.625rem] leading-normal font-semibold align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880]">$
                            </span>
                          </div>
                          <span
                            class="text-2xl font-semibold align-bottom text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880]">100.99</span>
                          <span
                            class="text-[0.625rem] leading-6 font-medium align-bottom text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] line-through">1000.99</span>
                        </div>

                        <span
                          class="text-lg font-medium align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap">Buy
                          now</span>
                      </div>

                     
                      <div
                        class="absolute left-[-1.5rem] top-[-3px] px-0.5 bg-white h-[1.125rem] hidden justify-center items-center skew-x-[24deg] shadow-[inset_5px_0_18px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_0px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] lg:flex lg:top-4 lg:-left-4">
                        <span class="text-[0.625rem] leading-none font-bold align-middle text-[#1B45FF] text-center">10%
                          off</span>
                      </div>
                    </button>

                    <button
                      class="hidden lg:flex relative w-[13.75rem] h-14 border-[3px] -ml-[3px] border-white transform skew-x-[-24deg] [background:linear-gradient(0deg,rgba(0,51,255,0.05),rgba(0,51,255,0.05)),linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.8))] shadow-[0_0_10px_0_#1EBBFFB2,0_0_40px_0_#0D71FC80_inset,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D,0_0_1px_0_#1B45FF_inset]">
                    
                      <div
                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                        <span
                          class="text-lg font-medium align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap">Add
                          to Cart</span>
                      </div>
                    </button>
                  </div>
                </div> -->

              </div>
            </div>
          </div>

          <!-- media-details-wrapper (mobile) -->
          <div class="flex flex-col gap-4 px-2 pt-3 pb-6 md:gap-6 md:px-4 md:py-6 lg:hidden">
            <!-- media-details__top-container -->
            <div class="flex flex-col gap-2 md:hidden">
              <h2 class="text-base tracking-[0.01rem] line-clamp-3 text-[#F5F5F4]">
                {{ media.title || 'Lorem Ipsum I hate the color orange so much I have to close my eyes while I eat them'
                }}
              </h2>

              <p class="text-xs leading-normal line-clamp-2 text-white">
                Lorem Ipsum I hate the color orange so much I have to close my
                eyes while I eat them
              </p>

              <!-- avatar & user-info -->
              <div class="flex items-center gap-2 h-9">
                <!-- avatar-container -->
                <div class="w-6 h-6">
                  <img src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp" alt="avatar" class="w-full h-full" />
                </div>

                <!-- user-info -->
                <div class="flex flex-col">
                  <!-- name & verified-tick -->
                  <div class="flex items-center gap-1">
                    <span class="text-xs leading-normal font-medium text-white">Princess Carrot Pop</span>

                    <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" alt="verified-tick"
                      class="w-2.5 h-2.5" />
                  </div>

                  <!-- followers & likes -->
                  <div class="flex items-center gap-4">
                    <!-- followers -->
                    <div class="flex items-center gap-[0.1875rem] drop-shadow-[0px_0px_5px_0px_#000000] h-[1.125rem]">
                      <img src="https://i.ibb.co.com/MkhnCTJK/user-02.webp" alt="followers"
                        class="w-3.5 h-3.5 [filter:brightness(100%)_saturate(0)]" />
                      <span
                        class="text-xs leading-[0.875rem] font-medium text-[#EAECF0] dark:text-[#dddad5] align-middle">15.2K</span>
                    </div>

                    <!-- likes -->
                    <div class="flex items-center gap-[0.1875rem] drop-shadow-[0px_0px_5px_0px_#000000] h-[1.125rem]">
                      <img src="https://i.ibb.co.com/YFwpWQnM/heart.webp" alt="likes" class="h-3.5" />
                      <span
                        class="text-xs leading-[0.875rem] font-medium text-[#EAECF0] dark:text-[#dddad5] align-middle">99K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- categories-container -->
            <div class="flex flex-wrap gap-2 md:hidden">
              <!-- category -->
              <div
                class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Fried
                  Chicken</span>
              </div>

              <!-- category -->
              <div
                class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Mostly
                  Eating</span>
              </div>

              <!-- category -->
              <div
                class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Seasonal
                  Fruits</span>
              </div>

              <!-- category -->
              <div
                class="flex justify-center items-center py-1 px-[0.3125rem] rounded-sm h-[1.375rem] min-w-[3rem] max-w-[9.375rem] bg-white/20 cursor-pointer">
                <span class="text-xs leading-normal capitalize tracking-[0.01875rem] text-[#E7E5E4]">Mostly
                  Eating</span>
              </div>
            </div>

            <!-- buttons-wrapper -->
            <!-- <div class="flex flex-col gap-6 lg:hidden">
            <div class="flex justify-center px-4">
              <button
                class="relative flex-grow h-14 border-[3px] border-[#FFE1FC] bg-[#F600FEB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0_0_10px_0_#F600FEB2,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,inset_0_0_1px_0_#FF97F3E5] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-65 md:shadow-[0_0_10px_0_#F600FEB2,0_0_40px_0_#E803AE80_inset,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,0_0_1px_0_#FF97F3E5_inset]"
              >
                <div
                  class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                >
                  <div class="flex items-baseline gap-0.5">
                    <div class="pt-1.5">
                      <span
                        class="text-[0.625rem] leading-normal font-semibold align-middle text-white drop-shadow-[0px_0px_30px_0px_#10182880]"
                        >$
                      </span>
                    </div>
                    <span
                      class="text-2xl font-semibold align-bottom text-white drop-shadow-[0px_0px_30px_0px_#10182880]"
                      >0.99</span
                    >
                    <span
                      class="text-[0.5rem] leading-normal font-medium align-bottom tracking-[-0.01rem] text-white drop-shadow-[0px_0px_30px_0px_#10182880]"
                      >/month</span
                    >
                  </div>

                  <span
                    class="text-lg font-medium align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap"
                    >Subscribe now</span
                  >
                </div>
              </button>
            </div>

            <div class="flex justify-center px-4 md:hidden">
              <button
                class="relative flex-grow h-14 border-[3px] border-[#FFFADD] bg-[rgba(242,242,3,0.7)] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_1px_0_#FFF3A1,0_0_10px_0_#FFB909B2,0_0px_10px_0_#FFB909B2,0_5px_50px_0_#F2F20380,0px_0px_10px_0px_#F2F2030D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75"
              >
                <div
                  class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                >
                  <div class="flex items-baseline gap-0.5">
                    <div class="pt-1.5">
                      <span
                        class="text-[0.625rem] leading-normal font-semibold align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880]"
                        >$
                      </span>
                    </div>
                    <span
                      class="text-2xl font-semibold align-bottom text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880]"
                      >100.99</span
                    >
                    <span
                      class="text-[0.625rem] leading-6 font-medium align-bottom text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] line-through"
                      >1000.99</span
                    >
                  </div>

                  <span
                    class="text-lg font-medium align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap"
                    >Buy now</span
                  >
                </div>

                <div
                  class="absolute left-[-1.5rem] top-[-3px] px-0.5 bg-black/90 h-[1.125rem] flex justify-center items-center skew-x-[24deg] shadow-[inset_0_0_1px_0_#FFF3A1,0_0_10px_0_#FFB909B2,0_0px_10px_0_#FFB909B2,0_5px_50px_0_#F2F20380,0px_0px_10px_0px_#F2F2030D]"
                >
                  <span
                    class="text-[0.625rem] leading-none font-bold align-middle text-[#FCE40D] text-center"
                    >10% off</span
                  >
                </div>
              </button>

              <button
                class="relative w-[3.5rem] h-14 border-[3px] -ml-[3px] border-[#FFFADD] bg-[rgba(242,242,3,0.7)] [background-blend-mode:overlay] transform skew-x-[-24deg] shadow-[0px_0px_1px_0px_#FFF3A1,0px_0px_20px_0px_#FFB90940,0px_5px_50px_0px_#F2F20380] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75"
              >
                <div
                  class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                >
                  <div class="w-5 h-5 flex justify-center items-center">
                    <img
                      src="https://i.ibb.co.com/pjyBJ5Jm/add-to-cart.webp"
                      alt="add-to-cart"
                      class="w-full h-full"
                    />
                  </div>
                </div>
              </button>
            </div>

            <div class="flex justify-center px-4">
              <button
                class="relative flex-grow h-14 border-[3px] border-white bg-[#1EBBFFB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_40px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-90 md:shadow-[0_0_40px_0_#0D71FC80_inset,0_0_1px_0_#1B45FF_inset,0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D]"
              >
                <div
                  class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                >
                  <div class="flex items-baseline gap-0.5">
                    <div class="pt-1.5">
                      <span
                        class="text-[0.625rem] leading-normal font-semibold align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880]"
                        >$
                      </span>
                    </div>
                    <span
                      class="text-2xl font-semibold align-bottom text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880]"
                      >100.99</span
                    >
                    <span
                      class="text-[0.625rem] leading-6 font-medium align-bottom text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] line-through"
                      >1000.99</span
                    >
                  </div>

                  <span
                    class="text-lg font-medium align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap"
                    >Buy now</span
                  >
                </div>

                <div
                  class="absolute left-[-1.5rem] top-[-3px] px-0.5 bg-white h-[1.125rem] flex justify-center items-center skew-x-[24deg] shadow-[inset_5px_0_18px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_0px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] md:hidden"
                >
                  <span
                    class="text-[0.625rem] leading-none font-bold align-middle text-[#1B45FF] text-center"
                    >10% off</span
                  >
                </div>
              </button>

              <button
                class="relative w-[3.5rem] h-14 border-[3px] -ml-[3px] border-white bg-[#1EBBFFB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_40px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:hidden"
              >
                <div
                  class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                >
                  <div class="w-5 h-5 flex justify-center items-center">
                    <img
                      src="https://i.ibb.co.com/pjyBJ5Jm/add-to-cart.webp"
                      alt="add-to-cart"
                      class="w-full h-full"
                    />
                  </div>
                </div>
              </button>

              <button
                class="hidden md:flex relative w-[13.75rem] h-14 border-[3px] -ml-[3px] border-white transform skew-x-[-24deg] [background:linear-gradient(0deg,rgba(0,51,255,0.05),rgba(0,51,255,0.05)),linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.8))] shadow-[0_0_10px_0_#1EBBFFB2,0_0_40px_0_#0D71FC80_inset,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D,0_0_1px_0_#1B45FF_inset]"
              >
                <div
                  class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                >
                  <span
                    class="text-lg font-medium align-middle text-[#FFFADD] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap"
                    >Add to Cart</span
                  >
                </div>
              </button>
            </div>
          </div> -->


          </div>
        </div>

        <!-- popup__more-media-section -->
        <div class="flex my-4 w-full px-2 overflow-x-hidden">
          <div class="flex flex-col gap-2 w-full">
            <!-- title-container -->
            <div class="flex justify-between items-center py-1 gap-4 min-[580px]:justify-start">
              <span class="text-sm font-semibold text-white">More from
                <a href="" class="text-sm font-semibold text-[#FB5BA2]">Princess Carrot Pop</a></span>

              <span class="text-xs leading-[1.25rem] font-bold text-[#FB5BA2]">View All</span>
            </div>

            <!-- grid-container -->
            <div
              class="flex overflow-x-auto gap-2 sm:grid sm:grid-cols-2 
            md:grid-cols-3 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] overflow-y-hidden">
              <div v-for="item in gridMediaList" :key="item.id" class="flex-shrink-0 w-[45%] sm:w-auto">
                <MediaCardV1 :media="item" variant="grid" titleColor="white" :actionLabel="item.actionLabel"
                  :actionBgColor="item.actionBgColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PopupHandler>
</template>

<script setup>
import MediaCardV1 from "@/components/mediaCardsVariations/MediaCardV1.vue";
import PopupHandler from "./PopupHandler.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";

// Video Player Logic
const videoPlayer = ref(null);
const isPlaying = ref(false);
const isMobileVideoActive = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const isMuted = ref(false);

const togglePlay = () => {
  if (videoPlayer.value) {
    if (isPlaying.value) {
      videoPlayer.value.pause();
    } else {
      videoPlayer.value.play();
    }
    isPlaying.value = !isPlaying.value;
  }
};

const updateProgress = () => {
  if (videoPlayer.value && Number.isFinite(videoPlayer.value.duration)) {
    currentTime.value = videoPlayer.value.currentTime;
    duration.value = videoPlayer.value.duration;
    progress.value = (currentTime.value / duration.value) * 100;
  }
};

const onLoadedMetadata = () => {
  if (videoPlayer.value && Number.isFinite(videoPlayer.value.duration)) {
    duration.value = videoPlayer.value.duration;
  }
};

const onVideoEnded = () => {
  isPlaying.value = false;
  progress.value = 0;
  currentTime.value = 0;
  if (videoPlayer.value) videoPlayer.value.currentTime = 0;
};

const seek = (event) => {
  if (videoPlayer.value && Number.isFinite(duration.value) && duration.value > 0) {
    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const clickPercentage = clickPosition / progressBarWidth;
    const newTime = clickPercentage * duration.value;

    if (Number.isFinite(newTime)) {
      videoPlayer.value.currentTime = newTime;
      currentTime.value = newTime;
      progress.value = clickPercentage * 100;
    }
  }
};

const skip = (seconds) => {
  if (videoPlayer.value && Number.isFinite(videoPlayer.value.duration)) {
    let newTime = videoPlayer.value.currentTime + seconds;
    newTime = Math.max(0, Math.min(newTime, videoPlayer.value.duration));
    videoPlayer.value.currentTime = newTime;
  }
};

const toggleMute = () => {
  if (videoPlayer.value) {
    videoPlayer.value.muted = !videoPlayer.value.muted;
    isMuted.value = videoPlayer.value.muted;
  }
};

const formatTime = (time) => {
  if (!time || !Number.isFinite(time) || isNaN(time)) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  media: {
    type: Object,
    default: () => ({}),
  }
});
const emit = defineEmits(["update:modelValue"]);

const mediaDetailsPopupConfig = {
  actionType: "slidein",
  from: "right",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "90%", "<768": "100%" },
  height: { default: "100%", "<768": "100%" },
  scrollable: false,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const gridMediaList = ref([
  {
    id: 101,
    type: 'video',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Record breaking fried chicken eating ! See my attempt to break world’s record! Watch now!',
    duration: '14:55',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    creatorName: 'Mistress Jessica',
    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',
    actionLabel: '10% off',
    actionBgColor: '#f093fb'
  },
  {
    id: 102,
    type: 'video',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Record breaking fried chicken eating ! See my attempt to break world’s record! Watch now!',
    duration: '14:55',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    creatorName: 'Mistress Jessica',
    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',
    actionLabel: '10% off',
    actionBgColor: '#f093fb'
  },
  {
    id: 103,
    type: 'video',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Record breaking fried chicken eating ! See my attempt to break world’s record! Watch now!',
    duration: '14:55',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    creatorName: 'Mistress Jessica',
    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',
    actionLabel: '10% off',
    actionBgColor: '#f093fb'
  },
  {
    id: 104,
    type: 'video',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Record breaking fried chicken eating ! See my attempt to break world’s record! Watch now!',
    duration: '14:55',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    creatorName: 'Mistress Jessica',
    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',
    actionLabel: '10% off',
    actionBgColor: '#f093fb'
  },
]);
</script>