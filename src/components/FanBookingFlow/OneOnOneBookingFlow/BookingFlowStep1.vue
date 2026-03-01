<script setup>
const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div
    class="sm:w-96 h-[556px] max-h-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] flex flex-col items-center justify-center rounded-3xl bg-center bg-cover bg-no-repeat bg-[linear-gradient(180deg,rgba(12,17,29,0)_25%,#0C111D_100%),url('/images/background.png')] backdrop-blur-md"
  >
    <div class="flex flex-col justify-between w-full h-full rounded-3xl bg-black/15">
      <div
        class="card-header flex flex-col justify-center items-center w-[5.438rem] h-[1.75rem] text-sm text-[#0C111D] font-bold bg-[#22CCEE] rounded-tl-3xl rounded-br-sm"
      >
        <p class="header-content p-[0.25rem 0.375rem 0.25rem 1rem]">
          1 on 1 call
        </p>
        <div class="absolute top-0 right-0 p-3">
          <img src="" alt="" />
        </div>
      </div>
      <div
        class="card-content flex flex-col gap-[0.5rem] text-white w-full h-full p-[1rem]"
      >
        <div
          class="flex flex-col justify-end gap-[1rem] min-h-52 h-full pb-[0.5rem]"
        >
          <div class="content-title text-3xl font-semibold">
            High School Life Simulator
          </div>
          <div
            class="content-price flex flex-row justify-start items-end gap-[0.5rem]"
          >
            <div class="price-icon h-full flex justify-center items-center">
              <img src="/images/token.svg" class="w-[2rem] h-[2rem]" />
            </div>
            <p class="price-amount text-4xl font-semibold">500</p>
            <p class="price-currency text-2xl font-semibold">Tokens</p>
            <p class="price-time text-sm">/15 minutes</p>
          </div>
        </div>
        <div class="flex flex-col gap-[1rem]">
          <div class="content-desc">
            <p class="text-ellipsis line-clamp-5">
              Ever wanted a different high school experience? In this private
              1-on-1 call, we'll create our own story. I can be your shy
              classmate, the student council president, or your secret admirer.
              Let's navigate the halls, share secrets, and make this a semester
              you'll never forget.
            </p>
          </div>
          <div class="flex flex-col justify-start gap-[0.25rem] w-full">
            <div class="extra-row flex flex-row justify-between w-full">
              <p class="title text-sm">Record our session</p>
              <p class="price text-sm font-semibold">+50 Tokens</p>
            </div>
            <div class="extra-row flex flex-row justify-between">
              <p class="title text-sm">Call you sensei</p>
              <p class="price text-sm font-semibold">+50 Tokens</p>
            </div>
            <div class="extra-row flex flex-row justify-between">
              <p class="title text-sm">Call you senpai</p>
              <p class="price text-sm font-semibold">+50 Tokens</p>
            </div>
            <div class="extra-row flex flex-row justify-between">
              <p class="title text-sm">Be extra kawaii</p>
              <p class="price text-sm font-semibold">+50 Tokens</p>
            </div>
            <div class="extra-row flex flex-row justify-between">
              <p class="title text-sm">Sing-along</p>
              <p class="price text-sm font-semibold">+500 Tokens</p>
            </div>
          </div>
        </div>
      </div>
      
      <button
        @click="engine.goToStep(2)"
        class="card-footer flex flex-row justify-between items-center text-[#0C111D] bg-[#22CCEE] rounded-b-3xl cursor-pointer transition-colors"
      >
        <div
          class="left flex flex-col justify-center items-center grow gap-[0.5rem] py-2 px-6"
        >
          <p class="left-title text-xl font-bold italic">BOOK NOW</p>
          <p class="left-subtitle text-xs lg:text-sm">
            Next available time:
            <b class="font-semibold text-xs lg:text-sm">Today @5pm</b>
          </p>
        </div>
        <div
          class="right flex relative justify-center items-center bg-[#0C111D] w-[6rem] h-full"
        >
          <img
            class="absolute z-[999] h-full left-[-2px]"
            src="/images/Union.svg"
            alt=""
          />
          <img
            src="/images/arrow-up-right.svg"
            class="right-icon relative left-[10px]"
          />
        </div>
      </button>
    </div>
  </div>
</template>