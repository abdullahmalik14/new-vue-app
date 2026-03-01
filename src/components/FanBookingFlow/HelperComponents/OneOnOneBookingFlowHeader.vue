<script setup>
defineProps({
  timeDisplay: {
    type: String,
    default: '-'
  },
  subtotal: {
    type: Number,
    default: 0
  },
  duration: {
    type: [Number, String],
    default: 0
  },
  // Date prop (e.g. "Tomorrow April 27, 2025")
  dateDisplay: {
    type: String,
    default: '-'
  }
});
</script>

<template>
  <div class="flex-none max-w-screen bg-cyan-400/20 backdrop-blur-[5px] rounded-t-[20px]">
    <div class="w-full flex flex-col">
      <div class="flex flex-row items-center">
        <div class="bg-[#22CCEE] rounded-tl-[20px] p-[0.25rem_0.375rem_0.25rem_1rem] w-fit min-h-[28px] flex justify-center items-center">
          <p class="text-sm leading-[20px] text-[#0C111D] font-bold">1 on 1 call</p>
        </div>
        <div class="bg-[#0C111D] hidden lg:flex rounded-[6px] p-[0.3125rem_0.375rem] w-fit min-h-[28px] lg:flex justify-center items-center gap-2">
          <div class="w-4 h-4 flex justify-center items-center">
            <img src="/images/dots.svg" alt="status-icon" />
          </div>
          <div class="text-[11px] text-[#FFED29] font-semibold leading-[18px] italic">APPROVAL NEEDED</div>
        </div>
      </div>

      <div class="w-full flex justify-between items-stretch gap-6 px-4 py-[12px] sm:flex-nowrap flex-wrap md:!justify-start">
        <div class="flex flex-col sm:flex-row gap-6 w-full">
          
          <div class="flex flex-col text-white md:w-1/2 w-full gap-1">
            <h1 class="no-underline text-xl md:text-2xl font-semibold text-[#F2F4F7] leading-[32px]">High School Life Simulator</h1>
            <div class="flex flex-row items-center gap-2">
              <div class="w-6 h-6 flex justify-center items-center">
                <img src="/images/ex-profile.png" alt="profile-image" class="w-full h-full object-cover" style="border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%" />
              </div>
              <div class="flex flex-row items-center gap-1">
                <p class="text-xs font-medium leading-[18px]">Princess Carrot Pop</p>
                <div class="w-4 h-4 flex justify-center items-center">
                  <img src="/images/verified-blue-white.svg" alt="verified-icon" />
                </div>
              </div>
            </div>
            <div class="bg-[#0C111D] rounded-[6px] lg:hidden p-[0.3125rem_0.375rem] w-fit min-h-[28px] flex justify-center items-center gap-2">
              <div class="w-4 h-4 flex justify-center items-center"><img src="/images/dots.svg" alt="status-icon" /></div>
              <div class="text-[11px] text-[#FFED29] font-semibold leading-[18px] italic">APPROVAL NEEDED</div>
            </div>
          </div>

          <div class="flex flex-row md:items-start w-full items-end md:w-1/2 gap-6">
            
            <div class="flex flex-col gap-1 md:w-1/2 w-[170px]">
              <h3 class="text-xs text-[#22CCEE] font-semibold leading-[18px]">TIME</h3>
              <div class="flex flex-col text-white">
                <p class="text-[12px] font-semibold leading-[20px]">
                  {{ dateDisplay }}
                </p>
                <div class="flex flex-row gap-2 items-center">
                  <p class="text-[12px] font-medium leading-[20px]">{{ timeDisplay }}</p>
                  <p v-if="duration" class="text-sm text-[#98A2B3] font-medium leading-[20px]">
                    {{ duration }} min.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1 md:w-1/2 w-[170px]">
              <h3 class="text-xs text-[#22CCEE] font-semibold leading-[18px]">SUBTOTAL</h3>
              <div class="flex flex-row items-center gap-0.5 text-white">
                <div class="w-6 h-6 flex justify-center items-center" v-if="subtotal > 0">
                  <img src="/images/token.svg" alt="price-icon" />
                </div>
                <p class="text-lg font-semibold leading-[28px]">{{ subtotal > 0 ? subtotal : '-' }}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>