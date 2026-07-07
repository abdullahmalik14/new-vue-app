<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
      <div
        class="flex justify-between items-center border-b border-transparent"
      >
        <div class="flex items-center gap-2">
          <div class="flex justify-center items-center w-5 h-5">
            <img
              :src="assets.financeIcon"
              alt="coins"
              class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(98%)_sepia(1%)_saturate(934%)_hue-rotate(29deg)_brightness(120%)_contrast(100%)]"
            />
          </div>
          <h3 class="text-base font-semibold text-[#F9FAFB] align-middle">
            {{ t('demo.checkoutReusable.notes.title') }}
            <span
              class="text-xs font-normal leading-normal italic text-[#98A2B3]"
              >{{ t('demo.checkoutReusable.notes.optional') }}</span
            >
          </h3>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div v-if="showAvatars" class="flex items-center gap-2">
          <div class="px-1 border-b border-[#07F468] cursor-pointer">
            <div class="flex items-center gap-1 py-1">
              <div class="w-6 h-6 relative">
                <img
                  :src="assets.creatorAvatar"
                  alt="avatar"
                />
                <div
                  class="absolute right-0 bottom-0 w-1.5 h-1.5 bg-[#14E04D] rounded-full"
                ></div>
              </div>
              <div>
                <div class="flex gap-1">
                  <span class="text-xs leading-normal text-[#07F468]"
                    >{{ t('demo.checkoutReusable.notes.creatorName') }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="px-1 border-b-[0.5px] border-transparent cursor-pointer">
            <div class="flex justify-center items-center gap-1 py-1">
              <div class="w-6 h-6 relative">
            <img
              :src="assets.creatorAvatar"
              alt="avatar"
            />
            <div
              class="absolute right-0 bottom-0 w-1.5 h-1.5 bg-[#14E04D] rounded-full"
            ></div>
          </div>
            </div>
          </div>

          <div class="px-1 border-b-[0.5px] border-transparent cursor-pointer">
            <div class="flex justify-center items-center gap-1 py-1">
              <div class="w-6 h-6">
                <img
                  :src="assets.creatorAvatar"
                  alt="avatar"
                />
              </div>
            </div>
          </div>

          <div class="px-1 border-b-[0.5px] border-transparent cursor-pointer">
            <div class="flex justify-center items-center gap-1 py-1">
              <div class="w-6 h-6">
                <img
                  :src="assets.creatorAvatar"
                  alt="avatar"
                />
              </div>
            </div>
          </div>

          <div class="px-1 border-b-[0.5px] border-transparent cursor-pointer">
            <div class="flex justify-center items-center gap-1 py-1">
              <div class="w-6 h-6">
                <img
                  :src="assets.creatorAvatar"
                  alt="avatar"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="relative h-[6.25rem]">
          <textarea
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            class="w-full p-2 bg-white/10 border-b border-[#EAECF0] min-h-[6.25rem] text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans peer focus:outline-none"
          ></textarea>

          <div
            class="absolute top-2 left-2 flex justify-start items-start gap-2.5 min-h-[3.125rem] w-[calc(100%-1rem)] pointer-events-none peer-focus:hidden"
            v-show="!modelValue"
          >
            <div class="w-6 h-6">
              <img
                :src="assets.creatorAvatar"
                alt="avatar"
              />
            </div>
            <span class="text-base text-[#98A2B3]"
              >{{ t('demo.checkoutReusable.notes.placeholder') }}</span
            >
          </div>

          <div
            class="absolute bottom-2 right-2 flex items-center gap-2.5 min-h-[1.5rem] pointer-events-none peer-focus:hidden"
          >
            <span
              class="text-xs leading-loose text-right tracking-[0.0075rem] opacity-70 text-[#F9FAFB]"
            >
              {{ t('demo.checkoutReusable.notes.charactersLeft', { count: modelValue ? 300 - modelValue.length : 300 }) }}
            </span>
            <div class="flex justify-center items-center cursor-pointer">
              <img
                :src="assets.faceSmile"
                alt="face-smile"
                class="w-5 h-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { t } = useI18n();
const { assets } = useCheckoutDemoAssets();

defineProps({
  showAvatars: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue"]);
</script>
