<template>
     <div class="flex flex-end pl-0">
          <div
            class="inline-flex items-center gap-4 pl-4 border-l border-white"
          >
            <div class="flex flex-col items-start gap-2">
              <!-- user-name-title -->
              <div class="flex items-start gap-4 self-stretch h-6">
                <div class="flex items-center gap-2 flex-grow">
                  <div
                    class="text-sm font-semibold text-[#e7e5e4] line-clamp-1"
                  >
                    @sukii19
                  </div>
                  <img
                    data-src="/images/verified-green.webp"
                    alt="verified-green"
                    class="lazyload w-4 h-4"
                  />
                </div>
              </div>

              <!-- profile-links-options -->
              <div class="flex justify-end items-center gap-2 w-full">
                <span
                  class="flex justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] cursor-pointer"
                >
                  <img
                    data-src="/images/add-normal.webp"
                    alt="add-normal"
                    class="lazyload w-4 h-4"
                  />
                </span>

                <span
                  class="hidden justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] active [.active]:bg-[#e9e5d3bf] max-[580px]:[.active]:bg-black/75 max-[580px]:[.active]:shadow-[0_0_10px_0_rgba(7,244,104,0.30),0_0_10px_0_rgba(7,244,104,0.10)] max-[580px]:[.active]:backdrop-blur-[25px] max-[580px]:[.active]:text-[#07F468] max-[580px]:[.active]:border-transparent cursor-pointer"
                >
                  <img
                    data-src="/images/add-active.webp"
                    alt="add-active"
                    class="lazyload w-4 h-4"
                  />
                </span>

                <span
                  class="flex justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] cursor-pointer"
                >
                  <img
                    data-src="/images/like-normal.webp"
                    alt="like-normal"
                    class="lazyload w-4 h-4"
                  />
                </span>

                <span
                  class="hidden justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] active [.active]:bg-black/75 max-[580px]:[.active]:bg-black/75 max-[580px]:[.active]:shadow-[0_0_10px_0_rgba(7,244,104,0.30),0_0_10px_0_rgba(7,244,104,0.10)] max-[580px]:[.active]:backdrop-blur-[25px] max-[580px]:[.active]:text-[#07F468] max-[580px]:[.active]:border-transparent cursor-pointer"
                > 
                  <img
                    data-src="/images/like-active.webp"
                    alt="like-active"
                    class="lazyload w-4 h-4"
                  />
                </span>

                <div class="relative cursor-pointer">
                  <span
                    class="flex justify-center items-center w-8 h-8 bg-[#e9e5d30d] [transition:all_0.3s_ease-in-out] rounded-full border border-[#e9e5d340] cursor-pointer"
                  >
                    <img
                      data-src="/images/3-dot.webp"
                      alt="3-dot"
                      class="lazyload w-4 h-4"
                    />
                  </span>

                  <!-- add-dropdown-menu-here -->
                </div>
              </div>
            </div>

            <div
              class="flex flex-col justify-center items-center cursor-pointer"
            >
              <img
                data-src="/images/featured-media-bg.webp"
                alt="featured-media-bg"
                class="lazyload w-[2.813rem] h-[2.813rem] rounded-[12.5rem] object-cover"
              />
            </div>
          </div>
        </div>
</template>