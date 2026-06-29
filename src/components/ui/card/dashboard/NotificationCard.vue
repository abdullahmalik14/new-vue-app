<template>
  <transition name="fade" mode="out-in">
    <div v-if="isOpen" class="w-full border-b border-[#E5E7EB] flex relative">
      <!-- Left border color -->
      <div class="toast-border w-[0.188rem] absolute h-full left-0 top-0" :class="variantConfig.leftBorderClass" />

      <!-- Card body -->
      <div class="dashboard-toast-inner-wrapper flex gap-4 py-3 px-3 flex-1 min-w-0 min-h-0"
        :class="variantConfig.bgClass">
        <div class="dashboard-toast-inner-container relative w-full flex gap-5"
          :class="isSingleLineContent ? 'items-center' : 'items-start'">
          <!-- Close button -->
          <div v-if="closable"
            class="absolute right-0 p-3 cursor-pointer"
            :class="isSingleLineContent ? 'top-1/2 -translate-y-1/2' : 'top-0'"
            @click="handleClose">
            <div class="w-6 h-6 flex justify-center items-center">
              <img v-if="closeIconUrl" :src="closeIconUrl" alt="" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(92%)_sepia(5%)_saturate(392%)_hue-rotate(182deg)_brightness(94%)_contrast(92%)]">
            </div>
          </div>

          <!-- Icon -->
          <div v-if="showIconComputed" class="relative">
            <div class="toast-icon-container w-10 h-10 flex justify-center items-center rounded-lg"
              :class="variantConfig.iconBgClass">
              <component v-if="icon && typeof icon !== 'string'" :is="icon" class="w-7 h-7" :class="variantConfig.iconStrokeClass" />
              <img v-else-if="icon" :src="icon" class="w-7 h-7" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none" class="w-7 h-7"
                :class="variantConfig.iconStrokeClass">
                <path
                  d="M25.666 24.5V22.167c0-2.175-1.487-4.002-3.5-4.52M18.083 3.839A4.666 4.666 0 0 1 21 8.167a4.667 4.667 0 0 1-2.917 4.327M19.833 24.5c0-2.174 0-3.262-.355-4.12a4.666 4.666 0 0 0-2.526-2.525c-.858-.355-1.945-.355-4.12-.355H9.333c-2.174 0-3.262 0-4.12.355A4.666 4.666 0 0 0 2.688 20.38C2.333 21.238 2.333 22.326 2.333 24.5M15.75 8.167a4.667 4.667 0 1 1-9.334 0 4.667 4.667 0 0 1 9.334 0Z"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

              <!-- Badge Icon -->
              <div v-if="badgeIcon"
                class="absolute -bottom-2.5 -right-2.5 flex justify-center items-center w-[23px] h-[22px] rounded-lg"
                :class="variantConfig.badgeBgClass">
                <component v-if="badgeIcon && typeof badgeIcon !== 'string'" :is="badgeIcon" class="h-4 text-white" />
                <img v-else :src="badgeIcon" class="h-4 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(97%)_contrast(100%)]" />
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex flex-col flex-1 min-w-0 min-h-0 pr-[1.125rem] md:pr-0"
            :class="isSingleLineContent ? 'justify-center' : ''">
            <div v-if="title" class="flex flex-col gap-2" :class="hasDescription ? 'pb-2' : ''">
              <div class="flex justify-between items-center pr-1" :class="hasDescription ? 'pt-1' : ''">
                <span v-if="title" class="toast-heading text-sm" :class="variantConfig.titleTextClass">{{ title
                }}</span>
                <slot name="title" />
              </div>
            </div>
            <div class="flex gap-4 w-full" :class="description ? 'justify-between items-center' : 'items-start'">
              <span v-if="description"
                class="text-sm flex-1 [text-shadow:0_0_10px_rgba(0,0,0,0.10)] text-[#0F172A] pr-5">{{ description
                }}</span>
              <slot />

              <a v-if="linkHref && linkLabel" :href="linkHref" class="flex gap-0.5 items-center"
                @click.prevent="onLink">
                <span class="toast-link text-xs font-medium whitespace-nowrap" :class="variantConfig.linkTextClass">{{
                  linkLabel }}</span>
              </a>
              <slot name="actions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useAssetUrl } from "@/composables/useAssetUrl.js";

const { url: closeIconUrl } = useAssetUrl("icon.notification.close");

const props = defineProps({
  variant: {
    type: String,
    default: "notice",
    validator: (value) => ["notice", "alert", "success", "error", "info", "warning", "limit-exceeded", "success-teal"].includes(value),
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  linkLabel: {
    type: String,
    default: "",
  },
  linkHref: {
    type: String,
    default: "",
  },
  icon: {
    type: [Object, Function, String],
  },
  badgeIcon: {
    type: [Object, Function, String],
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
  closable: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "close", "link"]);

// Local open state to support both controlled and uncontrolled usages
const isOpen = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => {
    isOpen.value = v;
  }
);
watch(isOpen, (v) => emit("update:modelValue", v));

const showIconComputed = computed(() => props.showIcon !== false);

const hasTitle = computed(() => Boolean(props.title));
const hasDescription = computed(() => Boolean(props.description));
const isSingleLineContent = computed(() => hasTitle.value !== hasDescription.value);

const palettes = {
  notice: {
    left: "bg-[#22CCEE]",
    bg: "[background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255))] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-[rgba(46,211,183,0.15)] before:to-[rgba(255,255,255,0.9)] relative",
    title: "text-[#088AB2] font-semibold",
    link: "text-[#22CCEE] ",
    iconBg: "bg-[rgba(34,204,238,0.1)]",
    iconStroke: "stroke-[#22CCEE] text-[#22CCEE]",
    badgeBg: "bg-[#22CCEE]",
  },
  alert: {
    left: "bg-[#FDB022]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(253,176,34,0.15)_0,rgba(253,176,34,0.15)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#B54708] font-semibold",
    link: "text-[#FDB022]",
    iconBg: "bg-[rgba(253,176,34,0.15)]",
    iconStroke: "stroke-[#FDB022] text-[#FDB022]",
  },
  success: {
    left: "bg-[#07f468]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(7,244,104,0.15)_0,rgba(7,244,104,0.15)_100%),rgba(255,255,255,0.9)]",
    title: "text-[#07f468] ",
    link: "text-[#07f468] ",
    iconBg: "bg-[rgba(7,244,104,0.15)]",
    iconStroke: " text-[#07f468]",
    // stroke-[#07f468]
  },
  "success-teal": {
    left: "bg-teal-400",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(45,212,191,0.15)_0,rgba(45,212,191,0.15)_100%),rgba(255,255,255,0.9)]",
    title: "text-teal-700 font-semibold",
    link: "text-teal-400",
    iconBg: "bg-teal-400/10",
    iconStroke: "text-teal-400 stroke-teal-400",
  },
  error: {
    left: "bg-[#FF4405] ",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(255,68,5,0.12)_0,rgba(255,68,5,0.12)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#FF4405] ",
    link: "text-[#FF4405] ",
    iconBg: "bg-[rgba(255,68,5,0.12)]",
    iconStroke: "stroke-[#FF4405] text-[#FF4405]",
  },
  warning: {
    left: "bg-[#FF4405] ",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(255,68,5,0.10)_0,rgba(255,68,5,0.10)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#FF4405] ",
    link: "text-[#FF4405] ",
    iconBg: "bg-[rgba(255,68,5,0.10)]",
    iconStroke: " text-[#FF4405]",
    // stroke-[#FF4405]
  },
  info: {
    left: "bg-[#3B82F6]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(59,130,246,0.12)_0,rgba(59,130,246,0.12)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#3B82F6]",
    link: "text-[#3B82F6]",
    iconBg: "bg-[rgba(59,130,246,0.12)]",
    iconStroke: "stroke-[#3B82F6] text-[#3B82F6]",
  },
  "limit-exceeded": {
    left: "bg-[#FF4405]",
    bg: " bg-[#242424] [background:linear-gradient(0deg,rgba(255,68,5,0.3),rgba(255,68,5,0.3)),linear-gradient(90deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.9)100%)] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-[linear-gradient(90deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.9)100%)]",
    title: "text-[#FF4405] text-sm font-semibold",
    link: "text-[#FF4405] text-xs font-medium",
    iconBg: "bg-transparent", // Transparent since we might use a custom icon or no bg
    iconStroke: "stroke-[#FF4405] text-[#FF4405]",
  },
};

const variantConfig = computed(() => {
  const p = palettes[props.variant];
  return {
    leftBorderClass: p.left,
    bgClass: p.bg,
    titleTextClass: p.title,
    linkTextClass: p.link,
    iconBgClass: p.iconBg,
    iconStrokeClass: p.iconStroke,
    badgeBgClass: p.badgeBg,
    closeColor: "#D0D5DD",
  };
});

function handleClose() {
  isOpen.value = false;
  emit("close");
}

function onLink() {
  emit("link");
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
