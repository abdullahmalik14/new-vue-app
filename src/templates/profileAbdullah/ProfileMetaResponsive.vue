<template>
  <div class="flex gap-2 md:hidden">
    <!-- Avatar Wrapper -->
    <div class="relative">
      <!-- avatar -->
      <div
        class="bg-[#2970FF] w-16 h-16 aspect-square rounded-[25%_75%_50%_51%_/_45%_65%_36%_55%] relative overflow-hidden"
      >
        <img
          data-src="/images/featured-media-bg.webp"
          alt="featured-media-bg"
          class="lazyload w-full h-full absolute top-0 left-0 object-cover"
        />
      </div>

      <!-- Online-user-signal -->
      <span
        class="block absolute right-[0.313rem] bottom-[0.188rem] w-2 h-2 bg-[#07F468] rounded-full"
      ></span>
    </div>
  </div>

  <div class="flex flex-col gap-1 md:hidden">
    <h1
      class="hidden items-center gap-1 text-xl leading-normal font-semibold text-white md:flex md:text-5xl md:leading-[3.75rem] xl:text-6xl xl:leading-[4.5rem] xl:mb-5"
    >
      Sukii19
      <div class="flex w-3.5 h-3.5 md:hidden">
        <img
          data-src="/images/svgviewer-png-output-22.webp"
          alt="verified-tick"
          class="lazyload w-3.5 h-3.5"
        />
      </div>
    </h1>

    <!-- profile-info-list -->
    <div class="flex items-start gap-3 opacity-70">
      <div class="flex items-center gap-1">
        <span class="flex items-center">
          <img
            data-src="/images/profile.webp"
            alt="profile"
            class="lazyload w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)]"
          />
        </span>
        <span class="text-sm font-light text-[#EAECF0]">35</span>
      </div>

      <div class="flex items-center gap-1">
        <span class="flex items-center">
          <img
            data-src="/images/heart.webp"
            alt="heart"
            class="lazyload w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)]"
          />
        </span>
        <span class="text-sm font-light text-[#EAECF0]">14</span>
      </div>

      <div class="flex items-center gap-1">
        <span class="flex items-center">
          <img
            data-src="/images/logo.webp"
            alt="logo"
            class="lazyload w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)]"
          />
        </span>
        <span class="text-sm font-light text-[#EAECF0]">2</span>
      </div>
    </div>

    <div class="flex gap-1">
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1"
        >@sukii19</span
      >
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1">/</span>
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1">22</span>
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1">/</span>
      <span class="text-xs leading-normal text-[#FCFCFD] line-clamp-1"
        >Hong Kong</span
      >
    </div>
  </div>
</template>
