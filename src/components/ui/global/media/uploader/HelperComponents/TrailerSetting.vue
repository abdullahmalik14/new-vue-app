<script setup>
import { computed } from "vue";
import CheckboxSwitch from "@/components/dev/checkbox/CheckboxSwitch.vue";

const props = defineProps({
  uploader: {
    type: Object,
    required: true,
  },
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
  get: () => props.uploader.state[props.stateKey] || false,
  set: (val) => {
    props.uploader.setState(props.stateKey, val, { reason: `user:toggle:${props.stateKey}` });
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