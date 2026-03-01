<template>

  <!-- Header Right Button Group -->
  <div
    class="flex justify-end items-center gap-4 pl-0 pr-2 py-2 h-full relative cursor-pointer z-[10000] sm:pl-12 md:pr-4 md:py-0 md:h-[4.375rem]">
    <!-- before-slaint -->
    <div
      class="hidden absolute right-0 top-0 w-full h-full bg-[#0c111d80] backdrop-blur-[50px] [clip-path:polygon(0%_0%,100%_0,105%_105%,16%_105%)] md:block">
    </div>

    <!-- button-group -->
    <div class="flex justify-end items-center gap-4 cursor-pointer">
      <!-- cart-button-wrapper -->
      <div class="flex justify-center items-center w-10 h-10">
        <div class="relative cursor-pointer">
          <span class="flex justify-center items-center w-10 h-10 relative">
            <img data-src="/images/cart-1.webp" alt="cart-1"
              class=" w-[1.8rem] h-[1.8rem] [filter:brightness(100)_saturate(0)]" />
          </span>

          <!-- add dropdown here -->
        </div>
      </div>

      <!-- notification-button-wrapper -->
      <div class="flex justify-center items-center w-10 h-10">
        <div class="relative cursor-pointer">
          <span class="flex justify-center items-center w-10 h-10 relative">
            <img data-src="/images/bell-1.webp" alt="bell-1"
              class=" w-[1.8rem] h-[1.8rem] [filter:brightness(100)_saturate(0)]" />
          </span>

          <!-- add dropdown here -->
        </div>
      </div>

      <!-- language -->
      <div class="flex justify-center items-center w-10 h-10">
        <div class="relative cursor-pointer">
          <span class="flex justify-center items-center w-10 h-10 relative">
            <img data-src="/images/globe-1.webp" alt="globe-1"
              class=" w-[1.8rem] h-[1.8rem] [filter:brightness(100)_saturate(0)]" />
          </span>

          <!-- add dropdown here -->
        </div>
      </div>
    </div>

    <!-- avatar-section-wrapper -->
    <div class="w-10 h-10 cursor-pointer">
      <div class="relative">
        <!-- avatar -->
        <div class="bg-grey w-9 h-9 aspect-square rounded-[25%_75%_50%_51%_/_45%_65%_36%_55%] relative overflow-hidden">
          <img data-src="/images/featured-media-bg.webp" alt="featured-media-bg"
            class=" w-full h-full absolute top-0 left-0 object-cover" />
        </div>

        <!-- Online-user-signal -->
        <span class="block absolute right-[0.313rem] bottom-[0.188rem] w-2 h-2 bg-[#07F468] rounded-full"></span>
      </div>
    </div>
  </div>
</template>