<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import BaseHeading from '@/components/ui/typography/BaseHeading.vue'
import BasePopup from './BasePopup.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
const { url: iconChevronDown } = useAssetUrl('dashboard.analytics.chevronDown')
const { url: iconClosePopup } = useAssetUrl('dashboard.analytics.closePopup')


const props = defineProps({
  modelValue: Boolean,
  title: String,
  logo: String,
  period: String,
})

const emit = defineEmits(['update:modelValue', 'update:period'])

const config = {
  actionType: 'popup',
  showOverlay: true,
  closeOnOutside: true,
  escToClose: true,
  width: {
    default: '90%',
    '<640': '100%',
    // '640-1024': '500px',
  },
  height: {
    default: '90%',
    '<640': '100%'
  },
  speed: '200ms',
  effect: 'ease',
  customEffect: 'fade',
  scrollable: true,
}

// ================= DROPDOWN =================
import { DASHBOARD_ANALYTICS_PERIODS, dashboardAnalyticsTrendPeriodTabs } from '@/systems/analytics/analyticsPeriodsConfig.js'
const options = computed(() => {
  return [
    ...dashboardAnalyticsTrendPeriodTabs.map(tab => ({ label: t(tab.labelKey), value: tab.id })),
    { label: t('dashboard.analytics.periods.allTime', 'All Time'), value: DASHBOARD_ANALYTICS_PERIODS.ALL_TIME }
  ]
})

const selected = computed({
  get: () => props.period || DASHBOARD_ANALYTICS_PERIODS.DAILY.id,
  set: (val) => emit('update:period', val)
})
const isOpen = ref(false)
const dropdownDirection = ref('downward')
const optionsRef = ref(null)

const selectedLabel = computed(() => {
  return options.value.find((o) => o.value === selected.value)?.label || 'Select'
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) positionDropdown()
}

function selectOption(option) {
  selected.value = option.value
  isOpen.value = false
}

function positionDropdown() {
  if (!optionsRef.value) return
  const rect = optionsRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const optionsHeight = optionsRef.value.scrollHeight

  dropdownDirection.value =
    spaceBelow < optionsHeight && spaceAbove > spaceBelow ? 'upward' : 'downward'
}

function handleClickOutside(e) {
  if (!optionsRef.value) return
  if (!optionsRef.value.closest('.select-dropdown')?.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', positionDropdown)
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', positionDropdown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <BasePopup
    :modelValue="props.modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="config"
  >
    <div
      class="w-full flex flex-col gap-4 bg-white/90 dark:bg-[#181a1b]/90 md:p-6 py-6 px-4 rounded-none h-auto scrollbar-hide"
    >
      <!-- popup-header -->
      <div
        class="flex flex-col justify-between items-start relative gap-4 md:gap-2 md:flex-row md:items-center"
      >
        <!-- title -->
        <div class="flex items-center gap-2">
          <img :src="props.logo" alt="logo" class="w-6 h-6" />
          <h3 class="text-lg md:text-2xl font-semibold text-[#0c111d] dark:text-[#dbd8d3] m-0">{{ props.title }}</h3>
        </div>

        <div class="flex items-center gap-4 w-full md:w-auto md:justify-end">
          <!-- select-dropdown -->
          <div class="select-dropdown w-full md:w-auto relative z-[10000]" id="select-dropdown">
            <div
              class="trends-select cursor-pointer min-w-[5.75rem] rounded-[0.5rem] border-none bg-white/30 dark:bg-[#181a1b]/30"
              @click.stop="toggleDropdown"
            >
              <div
                class="dash-select__trigger flex items-center justify-between md:justify-center gap-1 rounded-[0.5rem] bg-white/50 px-[0.875rem] py-[0.625rem] dark:bg-[#181a1b]/50"
              >
                <span
                  class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]"
                >
                  {{ selectedLabel }}
                </span>
                <img
                  class="select-arrow h-6 w-6 transition-transform duration-200"
                  :class="{ 'rotate-180': isOpen }"
                  :src="iconChevronDown || ''"
                  alt="arrow-down"
                />
              </div>

              <!-- Options container -->
              <div
                ref="optionsRef"
                class="dash-options-container absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full min-w-[15rem] origin-top scale-95 opacity-0 h-0 overflow-hidden pointer-events-none shadow-lg transition-all duration-200 ease-out [transform-origin:50%_0]"
                :class="{
                  open: isOpen,
                  'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto': isOpen,
                  'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden': !isOpen,
                  upward: dropdownDirection === 'upward',
                  downward: dropdownDirection === 'downward',
                }"
                :style="
                  dropdownDirection === 'upward'
                    ? { bottom: 'calc(100% + 0.5rem)', top: 'auto' }
                    : { top: 'calc(100% + 0.5rem)', bottom: 'auto' }
                "
              >
                <div
                  class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white/90 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/90"
                >
                  <div
                    v-for="option in options"
                    :key="option.value"
                    class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#e8e6e3]"
                    @click.stop="selectOption(option)"
                  >
                    <div
                      class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]"
                    >
                      <span
                        class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]"
                      >
                        {{ option.label }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Real select (hidden) -->
            <select
              v-model="selected"
              class="dash-real-select hidden"
              name="trends-select"
              required
            >
              <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- close-button -->
          <div
            @click="emit('update:modelValue', false)"
            class="close-button cursor-pointer absolute top-4 right-4 p-2.5 bg-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.1),0px_1px_2px_0px_rgba(16,24,40,0.06)] rounded-full flex justify-center items-center dark:bg-[#181a1b] dark:shadow-[0px_1px_3px_0px_rgba(13,19,32,0.1),0px_1px_2px_0px_rgba(13,19,32,0.06)] md:static z-[10005]"
          >
            <img
              :src="iconClosePopup || ''"
              alt="close-button"
              class="w-6 h-6"
            />
          </div>
        </div>
      </div>

      <!-- body (slot for dynamic content) -->
      <div>
        <slot />
      </div>
    </div>
  </BasePopup>
</template>
