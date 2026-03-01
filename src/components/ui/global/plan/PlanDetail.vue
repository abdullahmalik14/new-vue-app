<script setup>
import NotificationCard from '@/components/dev/card/notification/NotificationCard.vue';
import CheckboxSwitch from '@/components/dev/checkbox/CheckboxSwitch.vue';
import BaseInput from '@/components/dev/input/BaseInput.vue';
import { computed, onMounted, ref } from 'vue';
import BasePlanDropdown from './HelperComponents/BasePlanDropdown.vue';
import BaseTooltip from './HelperComponents/BaseTooltip.vue';
import CheckboxGroup from '../../form/checkbox/CheckboxGroup.vue';
import InputDefaultComponent from '@/components/dev/input/InputDefaultComponent.vue';
import QuillEditor from '@/components/dev/input/QuillEditor.vue';

const props = defineProps({
  publishFlow: {
    type: Object,
    required: true,
  },
});

// --- 1. STATE PROXIES (Connects Child Inputs to Parent State) ---

// Substep Proxy (Tabs: free-tier vs paid-tier)
const substepProxy = computed({
  get: () => props.publishFlow.state.planDetailSubstep, // Default is set in parent ('free-tier')
  set: (val) => props.publishFlow.setState('planDetailSubstep', val)
});

// Basic Info
const tierNameProxy = computed({
  get: () => props.publishFlow.state.tierName,
  set: (val) => props.publishFlow.setState('tierName', val)
});

const isFeaturedProxy = computed({
  get: () => props.publishFlow.state.isFeaturedTier,
  set: (val) => props.publishFlow.setState('isFeaturedTier', val)
});

const bgImageProxy = computed({
  get: () => props.publishFlow.state.bgImage,
  set: (val) => props.publishFlow.setState('bgImage', val)
});

// Price Settings
const priceDurationProxy = computed({
  get: () => props.publishFlow.state.priceDuration,
  set: (val) => props.publishFlow.setState('priceDuration', val)
});

const basePriceProxy = computed({
  get: () => props.publishFlow.state.basePrice,
  set: (val) => props.publishFlow.setState('basePrice', val)
});

// Audience & Limits
const tierAudienceProxy = computed({
  get: () => props.publishFlow.state.tierAudience,
  set: (val) => props.publishFlow.setState('tierAudience', val)
});

const maxSubscribersProxy = computed({
  get: () => props.publishFlow.state.maxSubscribers,
  set: (val) => props.publishFlow.setState('maxSubscribers', val)
});

// Benefits & Discounts
const freeTokensProxy = computed({
  get: () => props.publishFlow.state.freeTokensDiscount,
  set: (val) => props.publishFlow.setState('freeTokensDiscount', val)
});

const merchDiscountProxy = computed({
  get: () => props.publishFlow.state.merchDiscount,
  set: (val) => props.publishFlow.setState('merchDiscount', val)
});

const applyMerchProxy = computed({
  get: () => props.publishFlow.state.applyMerchToSale,
  set: (val) => props.publishFlow.setState('applyMerchToSale', val)
});

const payToViewDiscountProxy = computed({
  get: () => props.publishFlow.state.payToViewDiscount,
  set: (val) => props.publishFlow.setState('payToViewDiscount', val)
});

const applyPayToViewProxy = computed({
  get: () => props.publishFlow.state.applyPayToViewToSale,
  set: (val) => props.publishFlow.setState('applyPayToViewToSale', val)
});

const customRequestDiscountProxy = computed({
  get: () => props.publishFlow.state.customRequestDiscount,
  set: (val) => props.publishFlow.setState('customRequestDiscount', val)
});

const applyCustomProxy = computed({
  get: () => props.publishFlow.state.applyCustomToSale,
  set: (val) => props.publishFlow.setState('applyCustomToSale', val)
});

const mediaOptionsProxy = computed({
  get: () => props.publishFlow.state.selectedMediaOptions,
  set: (val) => props.publishFlow.setState('selectedMediaOptions', val)
});

const descriptionProxy = computed({
  get: () => props.publishFlow.state?.description || "",
  set: (val) => {
    if (props.publishFlow.setState) {
      props.publishFlow.setState('description', val);
    }
  }
});


// --- 2. VALIDATION LOGIC (Updated to use Proxies) ---

const freeTokensError = computed(() => {
  const val = Number(freeTokensProxy.value);
  if (freeTokensProxy.value !== "" && (val < 1 || val > 99)) return true;
  return false;
});

const merchError = computed(() => {
  const val = Number(merchDiscountProxy.value);
  if (merchDiscountProxy.value !== "" && (val < 1 || val > 99)) return true;
  return false;
});

const payToViewError = computed(() => {
  const val = Number(payToViewDiscountProxy.value);
  if (payToViewDiscountProxy.value !== "" && (val < 1 || val > 99)) return true;
  return false;
});

const customReqError = computed(() => {
  const val = Number(customRequestDiscountProxy.value);
  if (customRequestDiscountProxy.value !== "" && (val < 1 || val > 99)) return true;
  return false;
});


// --- 3. EDITOR & IMAGE LOGIC ---

const fileInputRef = ref(null);

// Image Handlers
const openGallery = () => {
  fileInputRef.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // In real app, upload here. For now, creating object URL and setting state
    const url = URL.createObjectURL(file);
    props.publishFlow.setState('bgImage', url);
  }
};

const removeImage = () => {
  props.publishFlow.setState('bgImage', null);
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Substep Handler
function handleTier(val) {
  // Updates the specific substep for Plan Detail
  props.publishFlow.setState('planDetailSubstep', val);
}

// --- 4. OPTIONS DATA (Static) ---

const durationOptions = [
  { label: 'Per day', value: 'day' },
  { label: 'Per month', value: 'month' },
  { label: 'Per year', value: 'year' }
];

const audienceOptions = [
  { label: 'Everyone', value: 'everyone' },
  { label: 'Only those invited', value: 'invited' }
];

const featureOptions = [
  { value: "some-content", label: "Access to some content", tags: [{ text: "Published Tier", variant: "#D1E0FF", class: "text-[#155EEF]" }], metaText: "16 Media" },
  { value: "more-content", label: "Access to more content", tags: [{ text: "Published Tier", variant: "#D1E0FF", class: "text-[#155EEF]" }], metaText: "24 Media" },
  { value: "some-more-content", label: "Access to some more content", tags: [{ text: "Published Tier", variant: "#D1E0FF", class: "text-[#155EEF]" }], metaText: "100 Media" },
  { value: "even-more-content", label: "Access to even more content", tags: [{ text: "Published Tier", variant: "#D1E0FF", class: "text-[#155EEF]" }], metaText: "5 Media" },
  { value: "even-some-more-content", label: "Access to even some more content", tags: [{ text: "Draft", variant: "", class: "text-[#98A2B3]" }], metaText: "3 Media" },
  { value: "even-most-content", label: "Access to even the most content", tags: [{ text: "Draft", variant: "", class: "text-[#98A2B3]" }], metaText: "0 Media" },
  { value: "even-more-most-content", label: "Access to even more the most content", tags: [{ text: "Draft", variant: "", class: "text-[#98A2B3]" }], },
];
</script>

<template>
  <div class="flex flex-col gap-6 grow md:gap-8 md:pb-6 xl:pb-20">

    <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 backdrop-blur-[25px] md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Tier information</h2>

      <div class="flex flex-col gap-1.5">
        <BaseInput type="text" v-model="tierNameProxy" placeholder="Tier Name..."
          inputClass="w-full h-11 flex px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]" />
      </div>

      <div class="flex flex-col gap-1.5">
        <QuillEditor v-model="descriptionProxy" placeholder="Tier Description..." />
      </div>

      <section class="flex flex-col gap-2">
        <h3 class="text-base font-semibold text-[#0C111D] md:text-lg md:font-medium dark:text-[#dbd8d3]">Background
          Image</h3>
        <input type="file" ref="fileInputRef" class="hidden" accept="image/jpeg, image/png"
          @change="handleFileChange" />

        <div v-if="!bgImageProxy" @click="openGallery"
          class="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-lg p-10 h-[12.1875rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group">
          <div
            class="gap-2 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent">
            <img src="https://i.ibb.co/twQ2CzCL/Images.webp" alt="Images"
              class="w-10 h-10 [filter:brightness(0)] dark:[filter:brightness(100%)]">
            <h4 class="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]">
              <span class="text-sm font-semibold underline text-[#0C111D] dark:text-[#dbd8d3]">Click here</span> to
              select image or drag and drop image here
            </h4>
            <p
              class="text-[#333333] text-sm leading-normal font-medium text-center tracking-[0.00875rem] opacity-70 dark:text-[#c8c3bc]">
              (Allowed formats: JPEG, PNG. Max size: 10MB)</p>
          </div>
        </div>

        <div v-else class="w-full">
          <div class="relative w-[7.876rem] h-[12.5625rem] overflow-hidden">
            <img :src="bgImageProxy" alt="Selected Background" class="h-full w-auto object-cover">
            <button @click="removeImage"
              class="absolute top-0 right-0 w-6 h-6 flex justify-center items-center bg-[#FF0066] cursor-pointer hover:bg-[#FDB022] dark:bg-[#cc0052] dark:hover:bg-[#b77702]">
              <img src="https://i.ibb.co.com/YMvbDsR/trash-03.webp" alt="trash" class="w-5 h-5">
            </button>
          </div>
        </div>
      </section>

      <div class="flex flex-col gap-2">
        <CheckboxSwitch v-model="isFeaturedProxy" label="This is a Featured Tier" id="featured-tier"
          track-class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
          knob-class="absolute left-[0.125rem] top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
          label-class="text-base font-semibold text-black dark:text-[#e8e6e3]" switchWrapperClass="w-9 h-5" />
        <div class="ml-12 flex flex-col gap-1">
          <p class="text-sm text-[#0C111D] dark:text-[#dbd8d3]">Featured tier will be displayed first by default on your
            subscription tier page.</p>
          <NotificationCard v-if="isFeaturedProxy" variant="alert" :showIcon="false" :closable="false"
            title="Your ‘VIP Lounge tier’ will not longer be a featured tier."
            description="This tier will be updated as the feature tier in your profile after saving." />
        </div>
      </div>
    </section>

    <section
      class="flex flex-col gap-4 px-2 py-4 bg-white/25 group/price-container paid-tier md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Price Setting</h2>

      <ul
        class="flex w-full h-10 whitespace-nowrap rounded-[0.3125rem] overflow-hidden border border-[#D0D5DD] bg-[#F9FAFB] dark:border-[#3b4043] dark:bg-[#1b1d1e]">

        <li @click="handleTier('free-tier')"
          class="flex flex-1 justify-center items-center gap-2 border-r border-[#D0D5DD] cursor-pointer group/tab [&.active]:bg-[#0C111D] dark:border-[#3b4043] dark:[&.active]:bg-[#162036]"
          :class="substepProxy === 'free-tier' ? 'active' : ''">
          <div class="w-full flex justify-center items-center gap-2 px-4">
            <span
              class="text-sm font-medium text-[#98A2B3] whitespace-nowrap group-[.active]/tab:text-white group-[.active]/tab:font-semibold dark:text-[#b0a99e] dark:group-[.active]/tab:text-[#e8e6e3]">
              Free Tier
            </span>
          </div>
        </li>

        <li @click="handleTier('paid-tier')"
          class="flex flex-1 justify-center items-center gap-2 border-r border-[#D0D5DD] cursor-pointer group/tab [&.active]:bg-[#0C111D] dark:border-[#3b4043] dark:[&.active]:bg-[#162036]"
          :class="substepProxy === 'paid-tier' ? 'active' : ''">
          <div class="w-full flex justify-center items-center gap-2 px-4">
            <span
              class="text-sm font-medium text-[#98A2B3] whitespace-nowrap group-[.active]/tab:text-white group-[.active]/tab:font-semibold dark:text-[#b0a99e] dark:group-[.active]/tab:text-[#e8e6e3]">
              Paid Tier
            </span>
          </div>
        </li>
      </ul>

      <div v-if="substepProxy === 'free-tier'" class="flex flex-col gap-4 animate-fade-in">
      </div>

      <div v-if="substepProxy === 'paid-tier'" class="flex flex-col gap-4 animate-fade-in">

        <div class="flex-col gap-4 flex">
          <h3 class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg">Subscription Base Price</h3>

          <div class="flex w-full">
            <div class="flex flex-col gap-1.5 flex-1 min-w-0">
              <div
                class="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]">
                <span class="text-base font-bold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">USD$</span>
                <input type="text" v-model="basePriceProxy"
                  class="text-base bg-transparent border-none outline-none w-full min-w-0 text-[#0C111D] placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]">
              </div>
              <p class="text-sm text-[#475467] dark:text-[#b1aba0]">Price must be between USD$ 1.95 to 500.</p>
            </div>

            <BasePlanDropdown v-model="priceDurationProxy" :options="durationOptions" widthClass="w-[11.25rem]" />
          </div>
        </div>

        <div class="flex-col gap-4 flex">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg">Subscriber Discount</h3>
              <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">Optional</span>
            </div>
            <p class="text-sm text-[#475467] dark:text-[#b1aba0]">Offer first-time subscriber discount when they join
              this tier for the first time.</p>
          </div>

          <div class="flex flex-col gap-4 pb-2">
            <div class="flex items-center gap-2">
              <div>
                <span class="text-base font-medium align-middle text-[#0C111D] dark:text-[#dbd8d3]">USD$</span>
                <span
                  class="text-3xl leading-[2.375rem] font-semibold align-baseline text-[#0C111D] dark:text-[#dbd8d3]">11.69</span>
                <span
                  class="text-xs leading-normal font-medium align-bottom text-[#0C111D] dark:text-[#dbd8d3]">/mo</span>
              </div>
              <div class="flex justify-center items-center px-1 py-0.5 bg-[#FCE40D] dark:bg-[#a19102]">
                <span class="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">-40%</span>
              </div>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:flex-wrap">
              <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 sm:flex-wrap">
                <div class="flex items-center gap-1">
                  <div class="flex justify-center items-center w-5 h-5">
                    <img src="https://i.ibb.co.com/Xx69xSx4/Weather.webp" alt="Weather" class="w-4 h-4">
                  </div>
                  <p class="text-sm text-[#344054] dark:text-[#bdb7af]">23 APR 2025-24 APR 2026</p>
                </div>
                <div class="flex items-center gap-1 pt-1">
                  <div class="flex justify-center items-center w-5 h-5">
                    <img src="https://i.ibb.co.com/vM4gQhD/calender.webp" alt="calender" class="w-4 h-4">
                  </div>
                  <p class="text-sm text-[#344054] dark:text-[#bdb7af]">Discount for 6 billing cycle</p>
                </div>
              </div>
              <div class="flex justify-end items-center gap-4 sm:grow">
                <button class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
                  <img src="https://i.ibb.co.com/d01w6NWF/pen.webp" alt="pen" class="w-5 h-5">
                  <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">EDIT</span>
                </button>
                <button class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
                  <img src="https://i.ibb.co.com/7twNxfc1/trash.webp" alt="trash" class="w-5 h-5">
                  <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">REMOVE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 group/wrapper md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Subscriber Setting</h2>

      <section class="flex flex-col gap-2">
        <h3 class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg">Who can subscribe to this plan
          tier?</h3>
        <div class="flex w-full">
          <BasePlanDropdown v-model="tierAudienceProxy" :options="audienceOptions" widthClass="w-full" />
        </div>
      </section>

      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg">Maximum subscribers</h3>
            <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">Optional</span>
          </div>
          <p class="text-base text-[#344054] dark:text-[#bdb7af]">Limit how many fans can join this tier at once. Leave
            blank to disable feature.</p>

          <div class="flex flex-col gap-1.5">
            <BaseInput type="text" v-model="maxSubscribersProxy" placeholder="Enter amount"
              inputClass="w-full h-11 flex px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]" />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg">Unsubscribe Discount</h3>
            <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">Optional</span>
          </div>
          <p class="text-sm text-[#475467] dark:text-[#b1aba0]">Offer discount to your subscribers when they unsubscribe
            from this tier.</p>
        </div>
        <div class="flex flex-col gap-4 pb-2">
          <div class="flex items-center gap-2">
            <div>
              <span class="text-base font-medium align-middle text-[#0C111D] dark:text-[#dbd8d3]">USD$</span>
              <span
                class="text-3xl leading-[2.375rem] font-semibold align-baseline text-[#0C111D] dark:text-[#dbd8d3]">11.69</span>
              <span
                class="text-xs leading-normal font-medium align-bottom text-[#0C111D] dark:text-[#dbd8d3]">/mo</span>
            </div>
            <div class="flex justify-center items-center px-1 py-0.5 bg-[#FCE40D] dark:bg-[#a19102]">
              <span class="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">-40%</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:flex-wrap">
            <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 sm:flex-wrap">
              <div class="flex items-center gap-1 pt-1">
                <div class="flex justify-center items-center w-5 h-5">
                  <img src="https://i.ibb.co.com/vM4gQhD/calender.webp" alt="calender" class="w-4 h-4">
                </div>
                <p class="text-sm text-[#344054] dark:text-[#bdb7af]">Discount for 6 billing cycle</p>
              </div>
            </div>
            <div class="flex justify-end items-center gap-4 sm:grow">
              <button class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
                <img src="https://i.ibb.co.com/d01w6NWF/pen.webp" alt="pen" class="w-5 h-5">
                <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">EDIT</span>
              </button>
              <button class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
                <img src="https://i.ibb.co.com/7twNxfc1/trash.webp" alt="trash" class="w-5 h-5">
                <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">REMOVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <div class="flex items-center gap-2 opacity-80">
        <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Subscriber Benefits</h2>
        <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">Optional</span>
      </div>

      <div class="flex flex-col gap-4 backdrop-blur-[25px] md:gap-6">

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="relative flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Free tokens</h3>
              <BaseTooltip>
                <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">Set amount of free tokens
                  given to member of this tier every recurring billing cycle. Frequency is based on your based
                  subscription plan setting.</p>
              </BaseTooltip>
            </div>
          </div>
          <InputDefaultComponent id="input_free_tokens" type="number" v-model="freeTokensProxy" rightSpan
            :rightSpanText="'% off'"
            wrapper3Class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :showLabel="false" :error="freeTokensError" error-message="Value must be between 1-99"
            rightSpanClass="text-[16.5px] font-semibold whitespace-nowrap px-[1.125rem] text-[#344054] dark:text-[#bdb7af]"
            inputClass="text-[#0C111D] font-600 text-base" errorMessageClass="text-[#FF4405] dark:text-[#ff571e]" />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <h3 class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Merch Discount</h3>
              <BaseTooltip>
                <ul>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4  before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]">
                    Set percentage discount for all the merch in your shop (e.g. type ‘10’ in the input field if you
                    want 10% off)
                  </li>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4  before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]">
                    Leave blank to disable feature.
                  </li>
                </ul>

              </BaseTooltip>
            </div>
            <CheckboxGroup label="Apply to items already on sale" v-model="applyMerchProxy"
              checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3" />
          </div>
          <InputDefaultComponent id="input_merch" type="number" v-model="merchDiscountProxy" rightSpan
            :rightSpanText="'% off'"
            wrapper3Class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :showLabel="false" :error="merchError" error-message="Value must be between 1-99"
            rightSpanClass="text-[16.5px] font-semibold whitespace-nowrap px-[1.125rem] text-[#344054] dark:text-[#bdb7af]"
            inputClass="text-[#0C111D] font-600 text-base" errorMessageClass="text-[#FF4405] dark:text-[#ff571e]" />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <h3 class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Pay to View Discount
              </h3>
              <BaseTooltip>
                <ul>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4  before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]">
                    Set percentage discount for all pay to view product in your shop(e.g. type ‘10’ in the input field
                    if you want 10% off)
                  </li>
                </ul>
              </BaseTooltip>
            </div>
            <CheckboxGroup label="Apply to items already on sale" v-model="applyPayToViewProxy"
              checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3" />
          </div>
          <div
            class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]">
            <input type="text" v-model="payToViewDiscountProxy"
              class="text-base bg-transparent border-none outline-none w-full min-w-0 px-3.5 text-[#0C111D] placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]">
            <span class="text-base font-semibold whitespace-nowrap px-[1.125rem] text-[#344054] dark:text-[#bdb7af]">%
              off</span>
          </div>
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <h3 class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Custom Request Discount
              </h3>
              <BaseTooltip>
                <ul>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4  before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]">
                    Set percentage discount for custom product request(e.g. type ‘10’ in the input field if you want 10%
                    off)
                  </li>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4  before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]">
                    Leave blank to disable feature.
                  </li>
                </ul>
              </BaseTooltip>
            </div>
            <CheckboxGroup label="Apply to items already on sale" v-model="applyCustomProxy"
              checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3" />
          </div>
          <div
            class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]">
            <input type="text" v-model="customRequestDiscountProxy"
              class="text-base bg-transparent border-none outline-none w-full min-w-0 px-3.5 text-[#0C111D] placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]">
            <span class="text-base font-semibold whitespace-nowrap px-[1.125rem] text-[#344054] dark:text-[#bdb7af]">%
              off</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4 px-2 py-4 bg-white/25 overflow-hidden md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2 opacity-80">
          <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Media Options</h2>
          <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">Optional</span>
        </div>
        <p class="text-sm text-[#475467] dark:text-[#b1aba0] xl:text-base">You can include medias from other
          subscription tiers to this tier. Subscribers will gain access to all content posted to selected tier below.
        </p>
      </div>

      <CheckboxGroup v-for="option in featureOptions" :key="option.value" :label="option.label" :tags="option.tags"
        :metaText="option.metaText" v-model="mediaOptionsProxy"
        checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-shrink-0 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
        labelClass="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3] max-w-[100px] truncate sm:max-w-none md:text-lg"
        wrapperClass="pl-1 flex items-center gap-2 md:gap-6 w-full" />
    </div>

  </div>
</template>