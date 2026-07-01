<script setup>
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import { preloadIcons } from "@/utils/preload.js";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();

// Props
const props = defineProps({
  bgImage: { type: String, default: "" }, // background image
  deleteIcon: { type: String, default: "" }, // delete button icon
  expandIcon: { type: String, default: "" }, // expand button icon
  showLabel: { type: Boolean, default: true }, // show/hide "Thumbnail" label
  labelText: { type: String, default: "" },
  showBlurToggle: { type: Boolean, default: true }, // toggle visibility
  preloadImages: { type: Array, default: () => [] }, // preload images
});

const resolvedLabelText = computed(() => props.labelText || t('mediaUploader.thumbnail.label'));
const blurToggleLabel = computed(() => t('mediaUploader.thumbnail.blurToggle'));

const blurModel = computed({
  get: () => uploaderStore.form.blurThumbnail || false,
  set: (val) => {
    uploaderStore.updateFormField("blurThumbnail", val);
  }
});

onMounted(() => {
  if (props.preloadImages.length > 0) {
    preloadIcons(props.preloadImages);
  }
});
</script>

<template>
  <div
    class="flex flex-col md:flex-row relative self-stretch w-full rounded-sm md:rounded-[1.5rem] gap-2"
  >
    <!-- thumbnail area -->
    <div
      :class="[
        'flex flex-wrap justify-start items-start overflow-hidden w-full gap-2',
        props.showBlurToggle ? 'md:w-1/2' : 'md:w-full',
      ]"
    >
      <div class="relative w-full rounded-lg">
        <!-- Background Image -->
        <div class="block overflow-hidden">
          <div
            class="w-full aspect-[16/9] md:aspect-auto min-h-0 md:min-h-[24.6875rem] h-auto md:h-full bg-cover transition-all duration-300"
            :style="{ 
              backgroundImage: `url('${uploaderStore.form.thumbnailUrl || props.bgImage}')`,
              filter: blurModel ? 'blur(8px)' : 'none'
            }"
          ></div>
        </div>

        <!-- Delete button (only if icon provided) -->
        <span
          v-if="props.deleteIcon"
          @click="uploaderStore.updateFormField('thumbnailUrl', ''); uploaderStore.updateFormField('uploadedThumbnailFile', null)"
          class="absolute top-0 right-0 flex items-center justify-center h-6 w-6 cursor-pointer bg-error hover:bg-error-light"
        >
          <img :src="props.deleteIcon" alt="delete-icon" class="w-5 h-5" />
        </span>

        <!-- Expand button (only if icon provided) -->
        <span
          v-if="props.expandIcon"
          class="absolute bottom-0 left-0 flex items-center justify-center h-6 w-6 cursor-pointer"
        >
          <img :src="props.expandIcon" alt="expand-icon" class="w-5 h-5" />
        </span>

        <!-- Thumbnail Label -->
        <div
          v-if="props.showLabel"
          class="bg-black text-[12px] font-[600] text-white py-[4px] px-[4px] absolute bottom-0 right-0"
        >
          {{ resolvedLabelText }}
        </div>
      </div>
    </div>

    <!-- Blur Toggle (show only if enabled) -->
    <div v-if="props.showBlurToggle" class="w-1/2 relative">
      <div class="absolute bottom-0">
        <div
          class="flex w-full flex-1 flex-row items-end justify-end gap-2 mt-2"
        >
          <CheckboxSwitch
            :label="blurToggleLabel"
            version="dashboard"
            showWrapperLabel
            v-model="blurModel"
          />
        </div>
      </div>
    </div>
  </div>
</template>
