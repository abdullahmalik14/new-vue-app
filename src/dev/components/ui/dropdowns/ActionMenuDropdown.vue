<template>
  <div class="flex flex-col gap-4">
    <h3 v-if="showTitle && titleKey" class="text-lg font-semibold text-[#344054]">
      {{ t(titleKey) }}
    </h3>

    <!-- card variant (booking-style) -->
    <div
      v-if="variant === 'card'"
      class="bg-white rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden w-full max-w-[280px] font-['Poppins']"
    >
      <div class="flex flex-col">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="flex items-center gap-4 px-4 py-4 hover:bg-[#F2F4F7] transition-colors text-left group"
          @click="$emit('select', item.id)"
        >
          <div class="flex-shrink-0">
            <img
              v-if="iconUrls[item.id]"
              :src="iconUrls[item.id]"
              :alt="t(item.iconAltKey)"
              class="w-6 h-6 object-contain"
            />
          </div>
          <span
            class="text-lg font-semibold"
            :class="item.danger ? 'text-[#FF4848]' : 'text-[#344054]'"
          >
            {{ t(item.labelKey) }}
          </span>
        </button>
      </div>
    </div>

    <!-- list variant (avatar-style) -->
    <ul
      v-else
      class="flex flex-col rounded-lg bg-white border-[#BABCCB80] shadow-[0px_0px_10px_0px_#0000001A] w-max dark:bg-[#181a1b] dark:border-[#41474980]"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="h-12 flex items-center gap-2.5 p-2 border-b-[#DEE5EC] cursor-pointer dark:border-b-[#2b3b4b]"
        @click="$emit('select', item.id)"
      >
        <img
          v-if="iconUrls[item.id]"
          :src="iconUrls[item.id]"
          :alt="t(item.iconAltKey)"
          class="w-6 h-6 [filter:brightness(0)] dark:[filter:invert(1)]"
        >
        <span class="text-base font-medium capitalize text-[#303437] dark:text-[#c8c3bb]">
          {{ t(item.labelKey) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAssetUrl } from '@/systems/assets/assetLibrary.js';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  variant: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'list'].includes(value),
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  titleKey: {
    type: String,
    default: '',
  },
});

defineEmits(['select']);

const { t } = useI18n();
const iconUrls = ref({});

async function resolveIconUrls() {
  const urls = {};

  await Promise.all(
    props.items.map(async (item) => {
      urls[item.id] = await getAssetUrl(item.iconKey);
    }),
  );

  iconUrls.value = urls;
}

onMounted(resolveIconUrls);
watch(() => props.items, resolveIconUrls, { deep: true });
</script>

<style scoped>
div {
  font-family: 'Poppins', sans-serif;
}
</style>
