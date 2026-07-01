<script setup>
import { computed } from "vue";
import { useI18n } from 'vue-i18n';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();

const props = defineProps({
  stateKey: {
    type: String,
    required: true,
  },
  labelText: {
    type: String,
    default: "",
  },
  paragraphText: {
    type: String,
    default: "",
  },
});

const showPreviewModel = computed({
  get: () => uploaderStore.form[props.stateKey] || false,
  set: (val) => {
    uploaderStore.updateFormField(props.stateKey, val);
  }
});

const resolvedLabel = computed(() => props.labelText || t('mediaUploader.trailerSetting.label'));
const resolvedParagraph = computed(() => props.paragraphText || t('mediaUploader.trailerSetting.paragraph'));
</script>

<template>
  <div>
    <CheckboxSwitch 
      :label="resolvedLabel" 
      id="show-preview-toggle" 
      v-model="showPreviewModel" 
    />
    <p class="ml-10 text-[#303437] text-[14px] font-[400]">
      {{ resolvedParagraph }}
    </p>
  </div>
</template>