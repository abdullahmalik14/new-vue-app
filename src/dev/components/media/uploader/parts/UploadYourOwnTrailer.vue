<template>
  <div
    class="relative sm:w-[415px]"
  >
    <div class="flex overflow-hidden">
      <input
        type="checkbox"
        class="relative appearance-none w-3 h-3 border border-[#999] rounded-[2px] hidden"
      />
      <div
        class="aspect-[16/9] w-full bg-no-repeat bg-center bg-cover"
        style="
          background-image: url('/images/slide-2.webp');
        "
      ></div>
    </div>

    <div
      class="absolute top-0 right-0 w-6 h-6  flex items-center justify-center cursor-pointer"
    >
      <img
        src="/images/delete.png"
        alt="svgviewer-png-output-35"
        class="w-5 h-5"
      />
    </div>

    <div
      class="absolute bottom-0 left-0 w-6 h-6  flex items-center justify-center cursor-pointer"
    >
      <img
        src="/images/video-icon.png"
        alt="svgviewer-png-output-35"
        class="w-5 h-5"
      />
    </div>
  </div>
</template>
