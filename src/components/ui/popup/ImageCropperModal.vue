<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="imageCropConfig"
  >
    
      <div
        class="flex flex-col backdrop-blur-[50px] bg-white/70 dark:bg-background-dark-app overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] h-full"
      >
        <div class="flex justify-between items-center p-4">
          <h1
            class="text-xl leading-normal font-semibold opacity-70 text-[#344054] dark:text-text"
          >
            Crop photo
          </h1>
          <img
            @click="closeModal"
            src="https://i.ibb.co.com/zWwvfc1B/close-btn.webp"
            alt="close-btn"
            class="w-6 h-6
            dark:[filter:brightness(0)_invert(100%)]
             [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(24%)_saturate(201%)_hue-rotate(179deg)_brightness(94%)_contrast(83%)] cursor-pointer"
          />
        </div>

        <div
          class="relative flex items-center justify-center w-full aspect-[22/19] overflow-hidden sm:aspect-[90/61]"
        >
          <img
            :src="imageSrc"
            class="w-full h-full object-cover blur-[5px] brightness-50 scale-110 pointer-events-none "
          />
          <div
            :style="cropperStyle"
            class="absolute w-[12.1875rem] aspect-square rounded-full border-[3px] border-white bg-white overflow-hidden bg-center bg-no-repeat dark:bg-[#181a1b] dark:border-[#303436] transition-all duration-200 ease-out"
          ></div>
        </div>

        <div class="flex flex-col gap-4 px-4 py-6">
          <div class="flex justify-center items-center gap-9">
            <img
              @click="flipHorizontal = !flipHorizontal"
              src="https://i.ibb.co.com/p6ng40CG/reflect-01.webp"
              alt="reflect-horizontal"
              class="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity dark:[filter:brightness(0)_invert(100%)]"
              :class="{
                'opacity-50': !flipHorizontal,
                'opacity-100': flipHorizontal,
              }"
            />
            <img
              @click="flipVertical = !flipVertical"
              src="https://i.ibb.co.com/p6ng40CG/reflect-01.webp"
              alt="reflect-vertical"
              class="w-6 h-6 cursor-pointer rotate-90 hover:opacity-80 transition-opacity dark:[filter:brightness(0)_invert(100%)]"
              :class="{
                'opacity-50': !flipVertical,
                'opacity-100': flipVertical,
              }"
            />
          </div>

          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <h3
                class="text-xs leading-normal font-medium text-[#0C111D] dark:text-text"
              >
                Zoom
              </h3>
              <div class="flex justify-between items-center gap-4">
                <img
                  @click="adjustZoom(-5)"
                  src="https://i.ibb.co.com/8pcWQNK/zoom-out.webp"
                  alt="zoom-out"
                  class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
                <div class="w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    v-model.number="zoomValue"
                    :style="{ '--p': zoomPercentage + '%' }"
                    class="w-full h-2 rounded-full appearance-none outline-none cursor-pointer bg-[linear-gradient(to_right,#07F468_0%,#07F468_var(--p),#EAECF0_var(--p),#EAECF0_100%)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-[#181a1b] [&::-webkit-slider-thumb]:shadow-[inset_0_0_0_1px_#DEE5EC,0px_2px_4px_-2px_rgba(16,24,40,0.06),0px_4px_8px_-2px_rgba(16,24,40,0.10)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
                  />
                </div>
                <img
                  @click="adjustZoom(5)"
                  src="https://i.ibb.co.com/W1qpBxC/zoom-in.webp"
                  alt="zoom-in"
                  class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <h3
                class="text-xs leading-normal font-medium text-[#0C111D] dark:text-text"
              >
                Rotate
              </h3>
              <div class="flex justify-between items-center gap-4">
                <img
                  @click="adjustRotate(-5)"
                  src="https://i.ibb.co.com/VYgmfd9T/refresh-ccw-01.webp"
                  alt="rotate-left"
                  class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
                <div class="w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    v-model.number="rotateValue"
                    :style="{ '--p': rotatePercentage + '%' }"
                    class="w-full h-2 rounded-full appearance-none outline-none cursor-pointer bg-[linear-gradient(to_right,#EAECF0_0%,#EAECF0_var(--p),#EAECF0_var(--p),#EAECF0_100%)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-[#181a1b] [&::-webkit-slider-thumb]:shadow-[inset_0_0_0_1px_#DEE5EC,0px_2px_4px_-2px_rgba(16,24,40,0.06),0px_4px_8px_-2px_rgba(16,24,40,0.10)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
                  />
                </div>
                <img
                  @click="adjustRotate(5)"
                  src="https://i.ibb.co.com/VYgmfd9T/refresh-ccw-01.webp"
                  alt="rotate-right"
                  class="w-5 h-5 cursor-pointer scale-x-[-1] hover:scale-x-[-1] hover:scale-y-[1.1] transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center gap-4 p-4">
          <button
            @click="closeModal"
            class="w-full h-10 flex justify-center items-center px-2 py-1 cursor-pointer hover:bg-gray-200 rounded transition-colors"
          >
            <span class="text-lg font-medium text-[#0C111D] dark:text-text"
              >CANCEL</span
            >
          </button>

          <button
            @click="saveChanges"
            class="w-full h-10 flex justify-center items-center bg-black px-2 py-1 group/button cursor-pointer hover:bg-[#07F468] rounded transition-colors"
          >
            <span
              class="text-lg font-medium text-[#07F468] group-hover/button:text-black"
              >SAVE</span
            >
          </button>
        </div>
      </div>
  </PopupHandler>
</template>

<script setup>
import { ref, computed } from "vue";
import PopupHandler from "./PopupHandler.vue";

const props = defineProps({
  imageSrc: {
    type: String,
    default: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
  },
  modelValue: { type: Boolean, default: false },
});

// CHANGE 1: Added "save" to emits
const emit = defineEmits(["update:modelValue", "save"]);

const zoomValue = ref(25);
const rotateValue = ref(50);
const flipHorizontal = ref(false);
const flipVertical = ref(false);

const zoomPercentage = computed(() => (zoomValue.value / 100) * 100);
const rotatePercentage = computed(() => (rotateValue.value / 100) * 100);

const calculatedZoom = computed(() => {
  const minZoom = 100;
  const maxZoom = 500;
  const range = maxZoom - minZoom;
  return minZoom + range * (zoomValue.value / 100);
});

const calculatedRotation = computed(() => (rotateValue.value - 50) * 3.6);

const cropperStyle = computed(() => {
  return {
    backgroundImage: `url('${props.imageSrc}')`,
    backgroundSize: `${calculatedZoom.value}%`,
    transform: `rotate(${calculatedRotation.value}deg) scaleX(${
      flipHorizontal.value ? -1 : 1
    }) scaleY(${flipVertical.value ? -1 : 1})`,
  };
});

const adjustZoom = (amount) => {
  let newValue = zoomValue.value + amount;
  if (newValue < 0) newValue = 0;
  if (newValue > 100) newValue = 100;
  zoomValue.value = newValue;
};

const adjustRotate = (amount) => {
  let newValue = rotateValue.value + amount;
  if (newValue < 0) newValue = 0;
  if (newValue > 100) newValue = 100;
  rotateValue.value = newValue;
};

// CHANGE 2: Helper function to close modal
const closeModal = () => {
  emit("update:modelValue", false);
};

// CHANGE 3: Close modal after saving
const saveChanges = () => {
  emit("save", {
    zoom: zoomValue.value,
    rotate: calculatedRotation.value,
    flipH: flipHorizontal.value,
    flipV: flipVertical.value,
  });
  closeModal(); // Auto close after save
};

const imageCropConfig = {
  actionType: "popup",
  position: "center",
  customEffect: "scale",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "360px", "<768": "100%" },
  height: { default: "90%", "<768": "100%" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};
</script>
