<template>
  <div class="group/container relative flex flex-col flex-grow flex-shrink [flex-basis:auto] gap-4 p-4 rounded-sm min-w-0 min-h-0 [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl overflow-hidden">
    <div class="flex flex-col flex-grow flex-shrink [flex-basis: auto] gap-4 min-w-0 min-h-0">
      <!-- hover-overlay -->
      <div v-if="hasTrend"
        class="absolute hidden group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000]">
        <DashboardPrimaryButton 
          variant="none"
          @click="$emit('openTrend')"
          customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
          :text="$te('dashboard.analytics.page.trend') ? $t('dashboard.analytics.page.trend') : 'Trend'"
          textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
          <template #rightIcon>
            <span>
              <img :src="trendIconUrl || ''" alt="expand"
                class="w-[.875rem] h-[.875rem]" />
            </span>
          </template>
        </DashboardPrimaryButton>
      </div>

      <!-- title -->
      <div class="flex items-center gap-2">
        <h3 class="m-0 font-medium font-sans text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">
          {{ title }}
        </h3>
      </div>

      <!-- data-content -->
      <slot></slot>

    </div>
  </div>
</template>

<script setup>
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'

const { url: trendIconUrl } = useAssetUrl('dashboard.analytics.trendExpand')

defineProps({
  title: {
    type: String,
    required: true
  },
  hasTrend: {
    type: Boolean,
    default: true
  }
})

defineEmits(['openTrend'])
</script>
