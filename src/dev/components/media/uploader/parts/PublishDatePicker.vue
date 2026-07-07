<template>

  <div class="flex flex-col gap-5 mt-6">

    <h2

      class="text-black text-sm font-normal not-italic leading-none [text-wrap:balance]"

    >

      {{ resolvedLabel }}

    </h2>



    <div class="flex flex-col items-start justify-start flex-1 gap-[0.375rem]">

      <div

        class="flex flex-wrap items-center w-full relative gap-[0.375rem] flex-1 min-w-0 min-h-0"

      >

        <div

          class="flex items-center w-full relative gap-2 px-[0.875rem] py-[0.625rem] bg-white/30 border-b border-radio-border shadow-sm rounded-sm"

          @click="openPicker"

        >

          <div class="cursor-pointer w-[1.3125rem] h-5">

            <img

              :src="assets.calendarIcon"

              alt="calendar-icon"

            />

          </div>



          <input

            type="text"

            readonly

            :value="formattedValue"

            :placeholder="t('mediaUploader.publishDatePicker.placeholder')"

            class="text-base leading-6 font-normal w-full text-darker-text border-none outline-none bg-transparent placeholder:text-[#757575] placeholder:text-base placeholder:font-normal placeholder:leading-6"

          />

        </div>



        <BaseParagraph

            :text="message"

            font-size="text-[14px]"

            font-weight="font-[400]"

            font-color="text-[#FF4405]"

            />

      </div>

    </div>



    <input

      ref="picker"

      type="datetime-local"

      class="hidden"

      @input="updateValue"

    />

  </div>

</template>



<script setup>

import { computed, ref } from 'vue';

import { useI18n } from 'vue-i18n';

import BaseParagraph from '@/components/ui/typography/BaseParagraph.vue';

import { useMediaUploaderAssets } from '@/dev/composables/useMediaUploaderAssets.js';



const props = defineProps({

  modelValue: {

    type: String,

    default: ''

  },

  label: {

    type: String,

    default: ''

  },

  message: {

    type: String,

    default: ''

  }

});



const emit = defineEmits(['update:modelValue']);



const { t } = useI18n();

const { assets } = useMediaUploaderAssets();

const picker = ref(null);



const resolvedLabel = computed(() => props.label || t('mediaUploader.publishDatePicker.defaultLabel'));



const formattedValue = computed(() => {

  if (!props.modelValue) return '';

  const date = new Date(props.modelValue);



  const options = {

    year: 'numeric',

    month: '2-digit',

    day: '2-digit',

    hour: '2-digit',

    minute: '2-digit',

  };



  return date.toLocaleString('en-US', options).replace(',', '   ');

});



function openPicker() {

  picker.value?.showPicker();

}



function updateValue(event) {

  emit('update:modelValue', event.target.value);

}

</script>



<style scoped>

/* No custom CSS needed — all Tailwind classes preserved */

</style>

