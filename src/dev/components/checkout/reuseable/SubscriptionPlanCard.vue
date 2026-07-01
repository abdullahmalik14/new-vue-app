<script setup>
import { computed } from "vue";

const props = defineProps({
  // Variant Control
  variant: {
    type: String,
    default: "default", // 'default' (Old) or 'new' (New)
  },

  // Main Content
  title: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    default: "/mo",
  },

  // Images
  backgroundImage: {
    type: String,
    required: true,
  },
  logoImage: {
    type: String,
    default: "https://i.ibb.co.com/PvS68T8W/logo-no-bg.webp",
  },

  // Styling & Colors
  accentColor: {
    type: String,
    default: "#FFCC01", // Default Yellow Border/Shadow
  },

  // ✅ NEW PROP: Gradient for the left section overlay
  leftSectionGradient: {
    type: String,
    // Default Gold Gradient (jo aapne diya tha)
    default:
      "linear-gradient(109.27deg, #D8AF0D 8.76%, #EFCA38 29.78%, #C6A00C 55.76%, #9F8009 91.24%)",
  },
  logoGradient: { type: String, default: '' },

  // Footer Text (Optional)
  footerText: {
    type: String,
    default: "",
  },
  footerColor: {
    type: String,
    default: "",
  },
});

// --- OLD STYLE LOGIC ---
const oldCardStyle = computed(() => {
  return {
    backgroundImage: `url(${props.backgroundImage})`,
    boxShadow: `4px 4px 0 0 ${props.accentColor}, 4px 4px 4px 0 rgba(0,0,0,0.15)`,
  };
});

// --- NEW STYLE LOGIC ---
const newCardStyle = computed(() => {
  return {
    backgroundImage: `url(${props.backgroundImage})`,
    boxShadow: `4px 4px 0px 0px ${props.accentColor}, 4px 4px 4px 0px #00000026`,
  };
});

// Background image for the left small box
const newLeftSectionBgImage = computed(() => {
  return {
    backgroundImage: `url(${props.backgroundImage})`,
  };
});

const computedFooterColor = computed(() => {
  if (props.footerColor) return props.footerColor;
  return props.variant === "new" ? "#98A2B3" : "#FFCC01";
});
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <div
      v-if="variant === 'new'"
      class="flex h-[4.9375rem] w-full bg-cover bg-center bg-no-repeat"
      :style="newCardStyle"
    >
      <div
        class="w-[4.75rem] min-w-[4.75rem] pl-[0.4375rem] flex items-center relative bg-cover bg-center"
        :style="newLeftSectionBgImage"
      >
        <div
          class="absolute inset-0 opacity-75 z-0"
          :style="{ background: leftSectionGradient }"
        ></div>

        <img
          :src="logoImage"
          alt="logo"
          class="w-[3.125rem] h-[3.125rem] object-contain z-10"
        />
      </div>

      <div
        class="flex grow h-full -ml-5 pl-5 [background:linear-gradient(0deg,rgba(0,0,0,0.75),rgba(0,0,0,0.75)),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)] backdrop-blur-[5px] [clip-path:polygon(20px_0,100%_0,100%_100%,0_100%)]"
      >
        <div
          class="flex flex-col justify-center gap-1 p-2 grow drop-shadow-[0px_0px_4px_#00000066]"
        >
          <h3
            class="text-sm font-semibold line-clamp-2 text-white dark:text-[#e8e6e3]"
          >
            {{ title }}
          </h3>

          <div class="flex items-center h-[1.1875rem]">
            <h3
              class="text-lg font-semibold align-middle text-white dark:text-[#e8e6e3]"
            >
              {{ price }}
            </h3>
            <span
              class="text-sm font-medium mt-1 text-white dark:text-[#e8e6e3]"
            >
              {{ period }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex w-full h-[4.9375rem] bg-center bg-cover shrink-0"
      :style="oldCardStyle"
    >
      <div class="w-32 min-w-[8rem] relative shrink-0">
        <img
          :src="backgroundImage"
          alt="background"
          class="w-full h-full object-cover"
        />

        <div
          class="w-8 h-8 flex justify-center items-center absolute top-0 left-0 z-[1]"
        >
          <img :src="logoImage" alt="logo" class="w-full h-full" />
        </div>
      </div>

      <div
        class="w-[calc(100%+1.5rem)] h-full flex-grow pl-6 -ml-6 [clip-path:polygon(24px_0,100%_0,100%_100%,0_100%)] [background:linear-gradient(0deg,rgba(0,0,0,0.35),rgba(0,0,0,0.35)),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%),linear-gradient(0deg,rgba(255,204,1,0.1),rgba(255,204,1,0.1))] relative z-[2] backdrop-blur-[100px]"
      >
        <div class="flex flex-col gap-1 p-2">
          <h3
            class="text-sm font-semibold line-clamp-2 text-white drop-shadow-[0px_0px_4px_0px_#00000066]"
          >
            {{ title }}
          </h3>

          <h4
            class="h-[1.1875rem] flex justify-start items-center text-lg font-semibold text-white drop-shadow-[0px_0px_4px_0px_#00000066]"
          >
            {{ price }}
            <span
              class="text-sm font-medium text-white drop-shadow-[0px_0px_4px_0px_#00000066]"
            >
              {{ period }}
            </span>
          </h4>
        </div>
      </div>
    </div>

    <p
      v-if="footerText"
      class="text-xs leading-normal dark:text-[#b0a993]"
      :style="{ color: computedFooterColor }"
    >
      {{ footerText }}
    </p>
  </div>
</template>
