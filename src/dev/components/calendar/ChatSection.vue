<template>
    <div class="w-full md:w-72 py-1.5 bg-[#F2F4F7] rounded-t-[0.625rem] md:rounded-[0.625rem] inline-flex flex-col justify-center items-center overflow-hidden shadow-[0_0_8px_0_rgba(0,0,0,0.25)]">
  <div class="self-stretch px-2 py-1 inline-flex justify-center items-center gap-2.5">
    <div class="flex-1 justify-start text-gray-500 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.chat.title') }}</div>
    <div>
      <img :src="editIconUrl" :alt="t('calendar.chat.icons.edit')" class="w-5 h-5"/>
    </div>
    <div>
      <img :src="dropdownIconUrl" :alt="t('calendar.chat.icons.dropdown')" class="w-5 h-5"/>
    </div>
  </div>
  <div class="self-stretch flex flex-col justify-start items-start">
    <div class="self-stretch pl-3 pr-2 py-3 backdrop-blur-xl inline-flex justify-start items-center gap-2">
      <div class="size-9 relative">
        <div data-svg-wrapper class="left-0 top-[-0.90px] overflow-hidden rounded-[25%_75%_50%_51%/45%_65%_36%_55%]">
            <img :src="avatarUrl" :alt="t('calendar.chat.icons.avatar')" class="w-9 h-9 object-cover" />
        </div>
        <div data-svg-wrapper data-online="True" data-size="sm" class="left-[1.688rem] top-[1.688rem] absolute">
          <div class="size-2 rounded-full bg-[#14E04D]"></div>
        </div>
      </div>

      <div class="flex-1 inline-flex flex-col justify-start items-start">
        <div class="justify-start text-gray-900 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.chat.contacts.oliviaRhye') }}</div>

        <!-- lastmessage -->
        <div class="self-stretch inline-flex justify-start items-center gap-1">
          <div class="flex-1 justify-start text-gray-900 text-xs font-medium font-['Poppins'] leading-4 line-clamp-1">{{ t('calendar.chat.messages.jennyBackTonight') }}</div>
          <div data-svg-wrapper data-unread-message="True" data-size="sm" class="relative">
            <div class="size-2 rounded-full bg-[#FF0464]"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="self-stretch pl-3 pr-2 py-3 bg-white/90 backdrop-blur-xl inline-flex justify-start items-center gap-2">
      <div class="size-9 relative">
        <div data-svg-wrapper class="left-[0.24px] top-[2.18px] absolute overflow-hidden  rounded-[40%_60%_55%_45%/55%_45%_60%_40%]">
            <img :src="avatarUrl" :alt="t('calendar.chat.icons.avatar')" class="w-9 h-9 object-cover" />
        </div>
        <div data-svg-wrapper data-online="True" data-size="sm" class="left-[1.688rem] top-[1.688rem] absolute">
          <div class="size-2 rounded-full bg-[#14E04D]"></div>
        </div>
      </div>
      <div class="flex-1 inline-flex flex-col justify-start items-start">
        <div class="justify-start text-gray-900 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.chat.contacts.portiaRhye') }}</div>
        <div class="self-stretch inline-flex justify-start items-center gap-1">
          <div class="flex-1 justify-start text-gray-900 text-xs font-medium font-['Poppins'] leading-4 line-clamp-1">{{ t('calendar.chat.messages.jamBackInStock') }}</div>
          <div data-svg-wrapper data-online="True" data-size="sm" class="relative">
            <div class="size-2 rounded-full bg-[#FF0464]"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="self-stretch pl-3 pr-2 py-3 backdrop-blur-xl inline-flex justify-start items-center gap-2">
      <div class="size-9 relative">
        <div data-svg-wrapper class="left-0 top-[-0.90px] overflow-hidden rounded-[25%_75%_50%_51%/45%_65%_36%_55%]">
            <img :src="avatarUrl" :alt="t('calendar.chat.icons.avatar')" class="w-9 h-9 object-cover" />
        </div>
        <div data-svg-wrapper data-online="True" data-size="sm" class="left-[1.688rem] top-[1.688rem] absolute">
          <div class="size-2 rounded-full bg-[#14E04D]"></div>
        </div>
      </div>
      <div class="flex-1 inline-flex flex-col justify-start items-start">
        <div class="justify-start text-gray-900 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.chat.contacts.oliviaRhye') }}</div>
        <div class="self-stretch inline-flex justify-start items-center gap-1">
          <div class="flex-1 justify-start text-gray-900 text-xs font-medium font-['Poppins'] leading-4 line-clamp-1">{{ t('calendar.chat.messages.checkOutNewContent') }}</div>
          <div data-svg-wrapper data-online="True" data-size="sm" class="relative">
            <div class="size-2 rounded-full bg-[#FF0464]"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="self-stretch pl-3 pr-2 py-3 bg-white/90 backdrop-blur-xl inline-flex justify-start items-center gap-2">
      <div class="size-9 relative">
        <div data-svg-wrapper class="left-[0.46px] top-[0.39px] overflow-hidden  rounded-[40%_60%_55%_45%/55%_45%_60%_40%]">
            <img :src="avatarUrl" :alt="t('calendar.chat.icons.avatar')" class="w-9 h-9 object-cover" />
        </div>
        <div data-svg-wrapper data-online="True" data-size="sm" class="left-[1.688rem] top-[1.688rem] absolute">
          <div class="size-2 rounded-full bg-[#14E04D]"></div>
        </div>
      </div>
      <div class="flex-1 inline-flex flex-col justify-start items-start">
        <div class="justify-start text-gray-900 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.chat.contacts.oliviaRhye') }}</div>
        <div class="self-stretch inline-flex justify-start items-center gap-1">
          <div class="flex-1 justify-start text-gray-900 text-xs font-medium font-['Poppins'] leading-4 line-clamp-1">{{ t('calendar.chat.messages.jamBackInStock') }}</div>
          <div data-svg-wrapper data-online="True" data-size="sm" class="relative">
            <div class="size-2 rounded-full bg-[#FF0464]"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="self-stretch pl-3 pr-2 py-3 inline-flex justify-start items-center gap-2">
      <div class="size-9 relative">
        <div data-svg-wrapper class="left-[0.46px] top-[0.39px] overflow-hidden rounded-[25%_75%_50%_51%/45%_65%_36%_55%]">
        <img :src="avatarUrl" :alt="t('calendar.chat.icons.avatar')" class="w-9 h-9 object-cover" />
        </div>
        <div data-svg-wrapper data-online="True" data-size="sm" class="left-[1.688rem] top-[1.688rem] absolute">
          <div class="size-2 rounded-full bg-[#14E04D]"></div>
        </div>
      </div>
      <div class="flex-1 inline-flex flex-col justify-start items-start">
        <div class="justify-start text-gray-900 text-sm font-normal font-['Poppins'] leading-5">{{ t('calendar.chat.contacts.samanthaRhye') }}</div>
        <div class="self-stretch justify-start text-slate-600 text-xs font-normal font-['Poppins'] leading-4 line-clamp-2">{{ t('calendar.chat.messages.jennyBack') }}</div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: editIconUrl } = useAssetUrl('icon.calendar.edit');
const { url: dropdownIconUrl } = useAssetUrl('icon.calendar.chevronDownGray');
const { url: avatarUrl } = useAssetUrl('calendar.chat.avatar');
</script>
