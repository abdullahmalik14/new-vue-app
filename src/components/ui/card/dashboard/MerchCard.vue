<template>
  <div
    class="flex flex-col relative justify-end w-full aspect-square rounded-lg bg-white transition duration-300 ease-in overflow-hidden cursor-pointer group bg-cover bg-center bg-no-repeat"
    :style="{ backgroundImage: `url('${bgImage}')` }"
  >
  <!-- discount-tag -->
    <div
    v-if="discountText"
      class="absolute top-0 right-0 bg-[#FFCD29] py-0.5 pl-[1.125rem] pr-2 [clip-path:polygon(0_0,100%_0,100%_100%,16%_100%)] z-10"
    >
      <span class="text-sm font-semibold text-black align-middle"> {{ discountText }}</span>
    </div>
    <!-- overlay -->
    <div
      class="flex justify-end gap-1 w-full h-[max-content] p-4 backdrop-blur-[6px] transition duration-300 ease-in group-hover:h-full"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      :style="{
        background: hover ? overlayHoverBg : overlayBg,
      }"
    >
      <div
        class="flex flex-col justify-end gap-2 drop-shadow-[0px_0px_16px_-34px_#00000080]"
      >
        <!-- Title -->
        <h2
          class="text-lg font-semibold line-clamp-2 text-[#F5F5F4] [text-shadow:0_0_8px_rgba(0,0,0,0.5)]"
        >
          {{ title }}
        </h2>

        <!-- Price -->
        <div class="flex items-end gap-1">
          <span
            class="text-base font-semibold text-white [text-shadow:0_0_8px_rgba(0,0,0,0.5)]"
          >
            {{ currency }}
          </span>
          <span
            class="text-base font-semibold text-white [text-shadow:0_0_8px_rgba(0,0,0,0.5)]"
          >
            {{ price }}
          </span>
          <span
            class="text-3xl leading-[2.375rem] font-semibold text-white [text-shadow:0_0_8px_rgba(0,0,0,0.5)]"
          >
            {{ finalPrice }}
          </span>
        </div>

        <!-- Description -->
        <p
          class="hidden group-hover:[display:-webkit-box] text-sm text-white [text-shadow:0_0_8px_rgba(0,0,0,0.5)] line-clamp-4"
        >
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MerchCard",
  props: {
    bgImage: { type: String, required: true },
    title: { type: String, required: true },
    currency: { type: String, default: "USD" },
    price: { type: String, required: true },
    finalPrice: { type: String, required: true },
    description: { type: String, required: true },
    overlayBg: String,
    overlayHoverBg: String,
      discountText: { type: String, default: "" },

  },
  data() {
    return { hover: false };
  },
};
</script>
