<template>
  <div class="py-2 px-3">
    <div class="flex items-center gap-1.5 relative">
      <img
        v-if="searchIconUrl"
        :src="searchIconUrl"
        :alt="t('demo.premiumOrders.searchAlt')"
        class="w-5 h-5 absolute left-0 top-1/2 -translate-y-1/2 [filter:brightness(0)_saturate(100%)_invert(47%)_sepia(11%)_saturate(772%)_hue-rotate(182deg)_brightness(89%)_contrast(86%)]"
      />
      <input
        :id="inputId"
        :value="modelValue"
        type="text"
        :placeholder="t('demo.premiumOrders.searchPlaceholder')"
        class="bg-transparent border-0 pl-7 outline-none text-base text-[#667085] dark:text-[#ACBACF] placeholder-[#667085] dark:placeholder:text-[#ACBACF]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  inputId: {
    type: String,
    default: 'orders-search',
  },
});

defineEmits(['update:modelValue']);

const { t } = useI18n();
const { url: searchIconUrl } = useAssetUrl('icon.search');
</script>
