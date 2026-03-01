<template>
  <div
    class="flex flex-col justify-between w-full aspect-square bg-black/20 overflow-hidden group cursor-pointer"
  >
    <!-- date -->
    <div class="pt-6 px-6 shrink-0">
      <div class="flex gap-1 drop-shadow-[0px_0px_10px_-34px_#0000001A]">
        <h2
          class="text-[2rem] leading-6 font-medium text-[#E7E5E4] group-hover:text-[#07F468]"
        >
          {{ day }}
        </h2>
        <span
          class="text-sm leading-none font-medium uppercase text-[#E7E5E4] group-hover:text-[#07F468]"
          >{{ suffix }}</span
        >
      </div>
    </div>

    <!-- poll-section -->
    <section class="flex flex-col gap-2.5 p-4 flex-grow min-h-0">
      <h2
        class="text-base font-medium tracking-[0.005rem] text-[#E7E5E4] drop-shadow-[0px_0px_10px_-34px_#0000001A] line-clamp-2 shrink-0 group-hover:text-[#07F468]"
      >
        {{ title }}
      </h2>

      <!-- poll-wrapper -->
      <div
        class="flex flex-col gap-4 flex-grow overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <!-- poll-item loop -->
        <div
          v-for="(option, index) in options"
          :key="index"
          class="flex flex-col gap-2"
        >
          <!-- poll-top -->
          <div class="flex justify-between items-center gap-2">
            <span
              class="text-xs leading-normal tracking-[0.005rem] text-[#E7E5E4] flex-grow group-hover:text-[#07F468]"
              >{{ option.label }}</span
            >
            <img
              v-if="option.checked"
              src="/images/check-circle-broken.webp"
              alt="check-circle-broken"
              class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(70%)_sepia(47%)_saturate(1521%)_hue-rotate(87deg)_brightness(100%)_contrast(98%)]"
            />
            <span
              class="text-xs leading-normal tracking-[0.005rem] text-[#E7E5E4] group-hover:text-[#07F468]"
              >{{ option.percent }}% ({{ option.votes }} vote)</span
            >
          </div>

          <!-- poll-progress -->
          <div
            class="w-full border-[0.5px] border-[#E7E5E4] h-[0.58rem] group-hover:border-[#07F468]"
          >
            <div
              class="h-full bg-[#E7E5E4] group-hover:bg-[#07F468]"
              :style="{ width: option.percent + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- poll-detail -->
      <div class="flex items-center gap-[0.3125rem] shrink-0 h-6">
        <div class="flex items-center gap-1 min-w-[5.5rem]">
          <img
            src="/images/dashboard.webp"
            alt="dashboard"
            class="w-6 h-6 group-hover:[filter:brightness(0)_saturate(100%)_invert(70%)_sepia(47%)_saturate(1521%)_hue-rotate(87deg)_brightness(100%)_contrast(98%)]"
          />
          <span
            class="text-xs leading-normal tracking-[0.005rem] text-[#E7E5E4] whitespace-nowrap group-hover:text-[#07F468]"
            >{{ totalVotes }} votes</span
          >
        </div>
        <span
          class="text-xs leading-normal tracking-[0.005rem] text-[#E7E5E4] align-middle group-hover:text-[#07F468]"
          >.</span
        >
        <span
          class="text-xs leading-normal tracking-[0.005rem] text-[#E7E5E4] align-middle truncate group-hover:text-[#07F468]"
          >{{ timeLeft }}</span
        >
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  day: { type: [String, Number], required: true },
  suffix: { type: String, default: '' },
  title: { type: String, required: true },
  options: {
    type: Array,
    required: true,
    // [{ label: 'Orange', percent: 70, votes: 25, checked: true }]
  },
  totalVotes: { type: Number, required: true },
  timeLeft: { type: String, required: true },
})
</script>
