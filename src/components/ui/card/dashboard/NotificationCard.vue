<template>
  <transition name="fade" mode="out-in">
    <div v-if="isOpen" 
      class="relative flex justify-center items-center self-stretch border-b border-gray-200 dark:border-gray-700 transition-all duration-150 ease-in-out"
      :class="variantConfig.borderLeftClass">
      
      <div 
        class="flex-1 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out"
        :class="variantConfig.bgClass">
        
        <div class="relative flex justify-start items-start self-stretch gap-5">
          <!-- Close button -->
          <a v-if="closable" @click="handleClose"
            class="absolute right-0 top-0 flex justify-center items-center w-6 h-6 cursor-pointer z-10">
            <img src="https://i.ibb.co/jvsPTy91/svgviewer-png-output-81.webp" alt="close"
              class="w-4 h-4 pointer-events-none opacity-40 hover:opacity-100 transition-opacity" />
          </a>

          <!-- Icon with Badge -->
          <div v-if="showIcon" class="relative">
            <div class="relative flex justify-center items-center w-10 h-10 rounded-lg"
              :class="variantConfig.iconBgClass">
              <!-- Main Icon -->
              <component v-if="icon && typeof icon !== 'string'" :is="icon" class="w-6 h-6" :class="variantConfig.iconColorClass" />
              <img v-else-if="icon" :src="icon" class="w-6 h-6" :class="variantConfig.iconColorClass" />
              <img v-else src="https://i.ibb.co.com/27y6kPNB/placeholder-jpeg.webp" class="w-full h-full rounded-lg" />

              <!-- Badge Icon -->
              <div v-if="badgeIcon"
                class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg"
                :class="variantConfig.badgeBgClass">
                <component v-if="badgeIcon && typeof badgeIcon !== 'string'" :is="badgeIcon" class="w-4 h-4 text-white" />
                <img v-else :src="badgeIcon" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 self-stretch flex flex-col items-start min-w-0">
            <div class="self-stretch flex flex-col items-start min-h-0">
              <!-- Text -->
              <div class="self-stretch flex justify-start items-start pr-6 pt-1 min-w-0">
                <p class="text-sm leading-5 font-normal text-gray-900 dark:text-gray-100 break-words">
                  <span v-if="title" class="font-semibold block mb-0.5">{{ title }}</span>
                  <slot>{{ description }}</slot>
                </p>
              </div>

              <!-- Bottom Content: Time & Actions -->
              <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                <!-- Timestamp -->
                <div v-if="timestamp" class="flex justify-start items-end">
                  <span class="text-xs leading-[1.125rem] text-gray-400 font-medium">{{ timestamp }}</span>
                </div>

                <!-- Actions -->
                <div class="flex items-end gap-2" v-if="finalActionLabel || dismissLabel || $slots.actions">
                  <slot name="actions">
                    <!-- Dismiss Link -->
                    <a v-if="dismissLabel" @click.prevent="handleClose"
                      class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out cursor-pointer">
                      <span class="text-xs leading-[1.125rem] font-medium text-gray-500 hover:text-indigo-600 transition-colors">{{ dismissLabel }}</span>
                      <img src="https://i.ibb.co/TD1xRhhB/svgviewer-png-output-75.webp" 
                        class="h-4 w-4 [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(31%)_saturate(534%)_hue-rotate(179deg)_brightness(93%)_contrast(90%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                    </a>

                    <!-- Action Link (support both action and link) -->
                    <a v-if="finalActionLabel" :href="linkHref || '#'" @click.prevent="handleAction"
                      class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out cursor-pointer">
                      <span class="text-xs leading-[1.125rem] font-medium" :class="variantConfig.actionTextClass">{{ finalActionLabel }}</span>
                      <img src="https://i.ibb.co/TD1xRhhB/svgviewer-png-output-75.webp" 
                        class="h-4 w-4" :class="variantConfig.actionIconFilterClass" />
                    </a>
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "info",
    // Adding backward compatibility variants: notice, alert, limit-exceeded
    validator: (value) => ["info", "success", "warning", "error", "destructive", "notice", "alert", "limit-exceeded"].includes(value),
  },
  title: String,
  description: String,
  timestamp: String,
  icon: [Object, Function, String],
  badgeIcon: [Object, Function, String],
  showIcon: { type: Boolean, default: true },
  closable: { type: Boolean, default: true },
  modelValue: { type: Boolean, default: true },
  actionLabel: String,
  dismissLabel: String,
  // Backward compatibility props
  linkLabel: String,
  linkHref: String,
});

const emit = defineEmits(["update:modelValue", "close", "action", "link"]);

const isOpen = ref(props.modelValue);
watch(() => props.modelValue, (v) => isOpen.value = v);
watch(isOpen, (v) => emit("update:modelValue", v));

// Computed labels for backward compatibility
const finalActionLabel = computed(() => props.actionLabel || props.linkLabel);

const basePalettes = {
  info: {
    border: "border-l-3 border-l-[#22CCEE] dark:border-l-[#0e98b4]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(34,204,238,0.15)_0,rgba(34,204,238,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(14,152,180,0.15)_0px,rgba(14,152,180,0.15)_100%)]",
    iconBg: "bg-[rgba(34,204,238,0.1)] dark:bg-[rgba(14,152,180,0.1)]",
    iconColor: "[filter:brightness(0)_saturate(100%)_invert(67%)_sepia(37%)_saturate(913%)_hue-rotate(145deg)_brightness(95%)_contrast(97%)]",
    badgeBg: "bg-[#2ce] dark:bg-[#0e98b4]",
    actionText: "text-[#2ce] dark:text-[#0e98b4] group-hover:text-indigo-600 transition-colors",
    actionFilter: "[filter:brightness(0)_saturate(100%)_invert(39%)_sepia(96%)_saturate(762%)_hue-rotate(157deg)_brightness(88%)_contrast(94%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]",
  },
  success: {
    border: "border-l-3 border-l-[#2ed3b7] dark:border-l-[#23a897]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(46,211,183,0.15)_0,rgba(46,211,183,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(35,168,151,0.15)_0px,rgba(35,168,151,0.15)_100%)]",
    iconBg: "bg-[rgba(46,211,183,0.1)] dark:bg-[rgba(35,168,151,0.1)]",
    iconColor: "",
    badgeBg: "bg-[#2ed3b7] dark:bg-[#23a897]",
    actionText: "text-[#2ed3b7] dark:text-[#23a897] group-hover:text-indigo-600 transition-colors",
    actionFilter: "[filter:brightness(0)_saturate(100%)_invert(34%)_sepia(63%)_saturate(508%)_hue-rotate(123deg)_brightness(94%)_contrast(97%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]",
  },
  warning: {
    border: "border-l-3 border-l-[#fdb022] dark:border-l-[#b77702]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(253,176,34,0.15)_0,rgba(253,176,34,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(183,119,2,0.15)_0px,rgba(183,119,2,0.15)_100%)]",
    iconBg: "bg-[rgba(253,176,34,0.1)] dark:bg-[rgba(183,119,2,0.1)]",
    iconColor: "[filter:brightness(0)_saturate(100%)_invert(81%)_sepia(13%)_saturate(5746%)_hue-rotate(341deg)_brightness(102%)_contrast(98%)]",
    badgeBg: "bg-[#fdb022] dark:bg-[#b77702]",
    actionText: "text-[#fdb022] dark:text-[#b77702] group-hover:text-indigo-600 transition-colors",
    actionFilter: "[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(100%)_saturate(1622%)_hue-rotate(10deg)_brightness(98%)_contrast(94%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]",
  },
  error: {
    border: "border-l-3 border-l-[#ff4405] dark:border-l-[#c93300]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(255,68,5,0.1)_0,rgba(255,68,5,0.1)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(201,51,0,0.1)_0px,rgba(201,51,0,0.1)_100%)]",
    iconBg: "bg-[rgba(255,68,5,0.1)] dark:bg-[rgba(201,51,0,0.1)]",
    iconColor: "[filter:brightness(0)_saturate(100%)_invert(42%)_sepia(53%)_saturate(6174%)_hue-rotate(356deg)_brightness(98%)_contrast(105%)]",
    badgeBg: "bg-[#ff4405] dark:bg-[#c93300]",
    actionText: "text-[#ff4405] dark:text-[#c93300] group-hover:text-indigo-600 transition-colors",
    actionFilter: "[filter:brightness(0)_saturate(100%)_invert(12%)_sepia(50%)_saturate(4284%)_hue-rotate(351deg)_brightness(115%)_contrast(102%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]",
  },
};

// Aliases for compatibility
const palettes = {
  ...basePalettes,
  notice: basePalettes.info,
  alert: basePalettes.warning,
  'limit-exceeded': basePalettes.error,
  destructive: basePalettes.error,
};

const variantConfig = computed(() => {
  const p = palettes[props.variant] || palettes.info;
  return {
    borderLeftClass: p.border,
    bgClass: p.bg,
    iconBgClass: p.iconBg,
    iconColorClass: p.iconColor,
    badgeBgClass: p.badgeBg,
    actionTextClass: p.actionText,
    actionIconFilterClass: p.actionFilter,
  };
});

function handleClose() {
  isOpen.value = false;
  emit("close");
}

function handleAction() {
  if (props.linkHref) {
    emit("link");
    // If it's a real link and not just an action, let browser handle it if needed
  }
  emit("action");
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
