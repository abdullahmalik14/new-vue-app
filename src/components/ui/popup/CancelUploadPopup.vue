<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="uploadCancelConfig"
  >
    <div
      class="w-full sm:max-w-[23.4375rem] bg-white/90 dark:bg-background-dark-appbu backdrop-blur-[50px] drop-shadow-[0px_-8px_10px_#0000000D] sm:shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] overflow-hidden"
    >
      <div class="flex flex-col gap-6 p-4">
        <p class="text-base font-semibold text-[#344054] dark:text-text">
          Are you sure you want to delete your screenshot?
        </p>

        <div class="flex items-center gap-2">
          <button
            @click="emit('update:modelValue', false)"
            class="w-full h-10 flex justify-center items-center bg-transparent"
          >
            <span class="text-base font-medium text-[#FF4405]">Cancel</span>
          </button>

          <button
            @click="handleDelete"
            class="w-full h-10 flex justify-center items-center bg-[#FF4405] hover:bg-[#ff692e]"
          >
            <span class="text-base font-medium text-white">Cancel</span>
          </button>
        </div>
      </div>
    </div>
  </PopupHandler>
</template>

<script setup>
import PopupHandler from './PopupHandler.vue';


const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

// Added 'delete' to emits so you can listen when user confirms deletion
const emit = defineEmits(["update:modelValue", "delete"]);

const handleDelete = () => {
  // Logic here to delete the screenshot
  emit("delete");
  emit("update:modelValue", false); // Close popup
};

const uploadCancelConfig = {
  actionType: "popup",
  position: "center",
  customEffect: "scale",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: true,
  closeOnOutside: true,
  lockScroll: true,
  escToClose: true,
  width: { default: "auto", "<480": "90%" },
  height: "auto",
  scrollable: false,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};
</script>
