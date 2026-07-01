<template>
  <div class="flex flex-col justify-start self-stretch w-full rounded-sm gap-4 md:gap-6">
    <div class="flex flex-wrap items-start justify-start gap-2">
      <div class="w-full relative cursor-pointer" @click="$emit('placeholder-click')">
        <div class="block overflow-hidden">
          <div
            :class="['flex flex-col justify-center items-center gap-[0.875rem] w-full rounded', bgLightClass, darkBgClass]"
            :style="{ height: height }"
          >
            <img
              :src="resolvedImageUrl"
              :alt="resolvedAltText"
              class="max-h-full "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaUploaderAssets } from '@/dev/composables/useMediaUploaderAssets.js';

const props = defineProps({
  imageUrl: {
    type: String,
    default: '',
  },
  altText: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '14.375rem',
  },
  bgColorLight: {
    type: String,
    default: 'bg-light-bg',
  },
  bgColorDark: {
    type: String,
    default: 'bg-dark-gray-bg-2',
  },
});

defineEmits(['placeholder-click']);

const { t } = useI18n();
const { assets } = useMediaUploaderAssets();

const resolvedImageUrl = computed(() => props.imageUrl || assets.value.uploadPlaceholderIcon);
const resolvedAltText = computed(() => props.altText || t('mediaUploader.fileUploadPlaceholder.alt'));
const bgLightClass = computed(() => props.bgColorLight);
const darkBgClass = computed(() => `dark:${props.bgColorDark}`);
</script>
