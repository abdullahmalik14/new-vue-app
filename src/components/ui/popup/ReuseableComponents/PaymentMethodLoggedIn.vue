<script setup>
import { computed } from "vue";

const props = defineProps({
  // Variant Control
  variant: {
    type: String,
    default: "default", // 'default' (Old) or 'large' (New)
  },

  // Data Props
  holderName: { type: String, default: "" },
  cardNumber: { type: String, default: "" },
  expiry: { type: String, default: "" },
});

const emit = defineEmits(["remove"]);

// Logic: Always format as **** **** **** 3507 (Last 4)
// Agar card number nahi hai, toh default **** 0000 dikhaye
const maskedNumber = computed(() => {
  if (!props.cardNumber || props.cardNumber.length < 4)
    return "**** **** **** 0000";
  // Last 4 digits nikal kar format karna
  const last4 = props.cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
});
</script>

<template>
  <div>
    <div v-if="variant === 'large'" class=" lg:block w-full">
      <div
        class="flex w-full max-w-[29.6875rem] min-h-[12.5rem] aspect-[1.715/1] bg-[#1D1D1D] [background-image:url('https://i.ibb.co.com/jvrYTGkd/card-bg.webp')] bg-cover bg-center border border-[#EAECF0]/50 dark:border-[#353a3c]/50 rounded-xl"
      >
        <div
          class="px-4 py-5 flex flex-col justify-between w-full sm:p-6 rounded-xl"
        >
          <div class="flex justify-between items-center gap-[0.625rem] h-4">
            <button
              class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
              @click="$emit('remove')"
            >
              <img
                src="https://i.ibb.co.com/YMvbDsR/trash-03.webp"
                alt="trash-03"
                class="w-4 h-4"
              />
              <span
                class="text-xs leading-normal font-medium text-[#EAECF0] dark:text-[#dddad5]"
                >Edit Card</span
              >
            </button>

            <img
              src="https://i.ibb.co.com/pr2VM4zR/svgviewer-png-output-32.png"
              alt="visa"
              class="h-[1.002rem]"
            />
          </div>

          <div class="flex flex-col gap-10">
            <h2
              class="text-[2.5rem] leading-[2.75rem] font-semibold tracking-[-0.05rem] bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(248,248,248,0.81)_100%)] bg-clip-text text-transparent drop-shadow-[0px_0.83px_3.34px_#00000029]"
            >
              {{ maskedNumber }}
            </h2>

            <div class="flex w-full h-[2.875rem]">
              <div class="flex flex-col justify-between h-full w-1/2">
                <span
                  class="text-xs leading-normal font-medium drop-shadow-[0px_-0.83px_0.83px_0px_#51515166_inset] text-[#f3f3f3]/80 dark:text-[#dddad5]/80"
                  >Card Holder Name</span
                >
                <div class="py-0.5">
                  <span
                    class="text-base font-bold text-[#F3F3F3] dark:text-[#e5e3df]"
                  >
                    {{ holderName || "No Name" }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col justify-between h-full w-1/2">
                <span
                  class="text-xs leading-normal font-medium drop-shadow-[0px_-0.83px_0.83px_0px_#51515166_inset] text-[#f3f3f3]/80 dark:text-[#dddad5]/80"
                  >Expiry Date</span
                >
                <div class="py-0.5">
                  <span
                    class="text-base font-bold text-[#F3F3F3] dark:text-[#e5e3df]"
                  >
                    {{ expiry || "MM/YY" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex items-center gap-6 bg-black/25 rounded-md px-4 py-2 border border-[#EAECF080]"
    >
      <div class="flex justify-between items-center gap-2 py-2 w-full">
        <div class="flex items-center gap-2 flex-grow">
          <div class="flex items-center gap-2 flex-grow">
            <span
              class="text-base font-medium truncate whitespace-nowrap text-white flex-grow max-w-[100px] sm:max-w-none"
            >
              {{ holderName || "No Name" }}
            </span>
            <span
              class="text-base font-medium whitespace-nowrap text-white flex-grow"
            >
              {{ maskedNumber }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs leading-normal whitespace-nowrap text-white">
              EXP {{ expiry || "MM/YY" }}
            </span>
            <img
              src="https://i.ibb.co.com/pr2VM4zR/svgviewer-png-output-32.png"
              alt="visa-logo"
              class="h-3"
            />
          </div>
        </div>

        <img
          src="https://i.ibb.co.com/3YVrnBJz/trash-bin.webp"
          alt="delete"
          @click="$emit('remove')"
          class="w-[1.125rem] [filter:brightness(0)_saturate(100%)_invert(98%)_sepia(2%)_saturate(335%)_hue-rotate(184deg)_brightness(97%)_contrast(95%)] cursor-pointer hover:opacity-80"
        />
      </div>
    </div>
  </div>
</template>
