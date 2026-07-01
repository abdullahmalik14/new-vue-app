<script setup>
import { computed } from "vue";
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

const uploaderStore = useMediaUploaderStore();

const props = defineProps({
  // 👇 Naya Prop: Batayega ke state mein konsi key update karni hai
  stateKey: {
    type: String,
    required: true, // Zaroori hai
  },
  labelText: {
    type: String,
    default: "Show Preview Trailer",
  },
  paragraphText: {
    type: String,
    default: "Allow non-subscriber to preview your video on your media detail page.",
  },
});

const showPreviewModel = computed({
  get: () => uploaderStore.form[props.stateKey] || false,
  set: (val) => {
    uploaderStore.updateFormField(props.stateKey, val);
  }
});
</script>

<template>
  <div>
    <CheckboxSwitch 
      :label="labelText" 
      id="show-preview-toggle" 
      v-model="showPreviewModel" 
    />
    <p class="ml-10 text-[#303437] text-[14px] font-[400]">
      {{ paragraphText }}
    </p>
  </div>
</template>