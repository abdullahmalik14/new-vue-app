<script setup>
import { computed } from 'vue';
import { settingConfig } from '../assets/data/settingConfig.js'; // Make sure path is correct

const props = defineProps({
  userRole: {
    type: String,
    default: 'creator', // 'creator', 'vendor', 'fan', 'agent'
  }
});

// Config pick based on role
const menuGroups = computed(() => {
  return settingConfig[props.userRole] || settingConfig['creator'];
});
</script>

<template>

    <div class="flex flex-col md:flex-row">
      <div
        class=" relative z-[2] bg-transparent md:h-auto before:content-[''] before:fixed before:bg-[url('https://i.ibb.co.com/dw910Z5b/gradient-main-bg.webp')] dark:bg-background-dark-app/70 before:bg-cover before:w-full before:bg-no-repeat before:h-full before:left-0 before:top-0 before:pointer-events-none"
      >
        <div class="flex flex-col h-full">
          <div
            class="flex flex-col w-full h-full bg-gradient-to-b from-[rgba(255,255,255,0.3)] from-0% to-[rgba(255,255,255,0)] to-8% to:from-[rgba(24,26,27,0)] dark:bg-none "
          >
            <div class="flex flex-col relative flex-grow">
              <div class="flex flex-col h-full">
                <div
                  class="flex flex-col justify-start items-end w-full h-[calc(5.12px * 100 - 3rem)] max-w-full border border-white/50 dark:border-[#575757] dark:[background:var(--background-dark-app)] [background:linear-gradient(180deg,rgba(255,255,255,0.50)_0%,rgba(255,255,255,0.00)_50%,rgba(255,255,255,0.50)_100%),rgba(255,255,255,0.01)] flex-1 overflow-y-auto lg:max-w-[26.6875rem]"
                >
                  <div
                    class="flex flex-col justify-center items-center self-stretch gap-4 border-b border-white dark:border-[#575757] px-2 py-4 md:px-4 md:pt-10 md:pb-6 xl:p-6"
                  >
                    <div class="relative rounded-full w-[7.5rem] h-[7.5rem]">
                      <div
                        class="absolute top-0 left-0 w-[7.5rem] h-[7.5rem] border border-black rounded-full opacity-[0.08]"
                      ></div>

                      <div class="w-full h-full relative overflow-hidden">
                        <img
                          src="https://i.ibb.co.com/cKFHZbnm/placeholder-headshot-creator-trans-bg.webp"
                          alt="placeholder-headshot-creator-trans-bg"
                          class="w-full h-full object-cover rounded-full"
                        />
                      </div>

                      <div
                        class="absolute block rounded-full w-4 h-4 top-[7.125rem] left-[7.125rem] bg-[#07F468]"
                      ></div>
                    </div>

                    <div
                      class="flex flex-col justify-center items-center gap-1 self-stretch text-center"
                    >
                      <div
                        class="text-xl leading-normal font-semibold text-[#0c111d] dark:text-text"
                      >
                        lindenMay
                      </div>
                      <div class="text-base text-[#0c111d] dark:text-text">
                        @linden
                      </div>
                      <div
                        class="text-sm text-center self-stretch text-[#344054] dark:text-[#B9D1E9]"
                      >
                        developer@contactlinden.com
                      </div>
                    </div>

                    <div class="inline-flex justify-start items-center gap-0.5">
                      <a
                        href="#"
                        class="inline-flex justify-start items-center gap-0.5"
                      >
                        <div
                          class="text-xs leading-normal font-medium text-[#155eef] dark:text-[#7897FF]"
                        >
                          Edit Profile
                        </div>
                        <div class="w-4 h-4 relative">
                          <img
                            src="https://i.ibb.co.com/hRx6tshS/svgviewer-png-output-5.webp"
                            alt="svgviewer-png-output-5 "
                            class="w-4 h-4 dark:[filter:brightness(0)_saturate(100%)_invert(57%)_sepia(58%)_saturate(2850%)_hue-rotate(210deg)_brightness(103%)_contrast(101%)]"
                          />
                        </div>
                      </a>
                    </div>
                  </div>

                  <div
                    class="flex flex-col justify-start items-start gap-4 self-stretch h-full px-2 py-4 md:gap-6 md:px-4 md:pt-10 md:pb-6 xl:p-6"
                  >
                    <div
                      v-for="(group, groupIndex) in menuGroups"
                      :key="groupIndex"
                      class="flex flex-col justify-start items-start self-stretch gap-1 md:gap-2"
                    >
                      <div
                        class="text-xs leading-normal font-medium text-[#667085]"
                      >
                        {{ group.categoryName }}
                      </div>

                      <div
                        v-for="(item, itemIndex) in group.items"
                        :key="itemIndex"
                        class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group"
                        :class="{
                           'active': item.isActive,
                           'disabled [&.disabled]:pointer-events-none': item.isDisabled
                        }"
                      >
                        <div
                          class="text-base font-medium flex-grow text-[#0c111d] dark:text-text group-[.active]:text-black  lg:group-[.active]:text-[#004eeb] dark:lg:group-[.active]:text-[#7897FF] group-[.disabled]:text-[#667085] "
                        >
                          {{ item.label }}
                          <span
                            v-if="item.badge"
                            class="text-sm text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] dark:lg:group-[.active]:text-[#7897FF] group-[.disabled]:text-[#667085]"
                          >
                            {{ item.badge }}
                            </span
                          >
                        </div>

                        <div class="w-6 h-6 relative">
                          <img
                            :src="item.icon"
                            alt="icon"
                            class="w-6 h-6 
                            dark:[filter:brightness(0)_saturate(100%)_invert(100%)]
                            lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)]
                             group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
                          />
                        </div>
                      </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>