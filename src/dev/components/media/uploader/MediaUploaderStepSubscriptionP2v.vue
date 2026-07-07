<script setup>
import { computed, ref } from "vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import CheckboxSwitch from "@/components/forms/checkboxes/CheckboxSwitch.vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import DashboardTextInput from "@/components/forms/inputs/DashboardTextInput.vue";
import AddTierPopup from "@/dev/components/popup/AddTierPopup.vue";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

const uploaderStore = useMediaUploaderStore();

// ============================================
// POPUP STATE
// ============================================
const showAddTierPopup = ref(false);

// ============================================
// DATA: PLANS LIST (Must be defined here)
// ============================================
const allCheckboxes = [
  { id: 'plan_free', label: "FREE library of LOREM LPSUM ATIER dolor sit amet." },
  { id: 'plan_amazing', label: "Amazing library of LOREM LPSUM ATIER dolor sit amet." },
  { id: 'plan_complete', label: "Complete library of LOREM LPSUM ATIER dolor sit amet." },
  { id: 'plan_featured', label: "Featured library of LOREM LPSUM ATIER dolor sit amet." },
  { id: 'plan_basic', label: "Basic library of LOREM LPSUM ATIER dolor sit amet." },
  { id: 'plan_premium', label: "Premium library of LOREM LPSUM ATIER dolor sit amet." },
  { id: 'plan_nsfw', label: "NSFW library of LOREM LPSUM ATIER dolor sit amet." },
];

const column1 = allCheckboxes.slice(0, 4);
const column2 = allCheckboxes.slice(4);

// ============================================
// STATE CONNECTIONS (Simple Toggles)
// ============================================

// 1. Link Subscription
const linkSubscriptionModel = computed({
  get: () => uploaderStore.form.linkToSubscriptionPlan || false,
  set: (val) => uploaderStore.updateFormField("linkToSubscriptionPlan", val)
});

// 2. Pay To View
const payToViewModel = computed({
  get: () => uploaderStore.form.payToViewEnabled || false,
  set: (val) => uploaderStore.updateFormField("payToViewEnabled", val)
});

// 3. Discovery Page
const discoveryPageModel = computed({
  get: () => uploaderStore.form.showOnDiscoveryPage || false,
  set: (val) => uploaderStore.updateFormField("showOnDiscoveryPage", val)
});

// 4. Profile Page
const profilePageModel = computed({
  get: () => uploaderStore.form.showOnProfilePage || false,
  set: (val) => uploaderStore.updateFormField("showOnProfilePage", val)
});

// ============================================
// STATE CONNECTIONS (Inputs - Prices)
// ============================================

const originalPriceModel = computed({
  get: () => uploaderStore.form.payToViewOriginalPrice,
  set: (val) => uploaderStore.updateFormField("payToViewOriginalPrice", val)
});

const discountPriceModel = computed({
  get: () => uploaderStore.form.payToViewDiscountedPrice,
  set: (val) => uploaderStore.updateFormField("payToViewDiscountedPrice", val)
});

// ============================================
// LOGIC: SUBSCRIPTION PLANS (Array)
// ============================================

// Check karein ke kya ye ID array mein hai?
const isPlanSelected = (id) => {
  const currentList = uploaderStore.form.subscriptionPlanIds || [];
  return currentList.includes(id);
};

// Tick karne par add karein, untick par remove karein
const togglePlan = (id, isChecked) => {
  let currentList = [...(uploaderStore.form.subscriptionPlanIds || [])];

  if (isChecked) {
    if (!currentList.includes(id)) currentList.push(id);
  } else {
    currentList = currentList.filter(item => item !== id);
  }

  uploaderStore.updateFormField("subscriptionPlanIds", currentList);
};
 
// ============================================
// DYNAMIC DESCRIPTIONS (Logical)
// ============================================
const originalPriceDescription = computed(() => {
  const val = parseFloat(uploaderStore.form.payToViewOriginalPrice);
  if (val > 500) {
    return "Price must be between USD$ 1.95 to 500.";
  }
  return "";
});
 
const discountPriceDescription = computed(() => {
  const orig = parseFloat(uploaderStore.form.payToViewOriginalPrice);
  const disc = parseFloat(uploaderStore.form.payToViewDiscountedPrice);
  if (disc && orig && disc >= orig) {
    return "Discounted price must be lower than original price.";
  }
  return "";
});
</script>

<template>
  <div class="relative py-[16px] px-[10px] lg:px-[24px]">
    <div @click="uploaderStore.setStep(1)" class="flex gap-2 items-center cursor-pointer ">
      <img src="/images/backIcon.png" alt="" srcset="" />
      <button class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
        Back
      </button>
    </div>

    <div class="mb-4 mt-2">
      <div class="flex justify-between items-center mb-2">
        <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic py-[8px]">
          Subscription Settings
        </h4>
      </div>
 
      <div class="flex justify-between items-center">
        <CheckboxSwitch label="Link this media to subscription plan" id="link-subscription-toggle"
          v-model="linkSubscriptionModel" />
        
        <DashboardPrimaryButton 
          v-if="linkSubscriptionModel"
          text="Add Tier" variant="polygonLeft" customClass="gap-[2px] text-sm"
          :leftIcon="'https://i.ibb.co/N2xH2QVV/svgviewer-png-output-13.webp'" 
          leftIconClass="w-4 h-4 [filter:invert(72%)_sepia(94%)_saturate(464%)_hue-rotate(85deg)_brightness(101%)_contrast(105%)] group-hover:filter-none"
          btnBg="#000" btnHoverBg="#07f468"
          btnText="#07f468" btnHoverText="#000" 
          @click="showAddTierPopup = true" />
      </div>

      <div v-if="linkSubscriptionModel" class="md:flex md:gap-6 gap-2 mt-4">
        <div class="flex flex-col gap-2">
          <CheckboxGroup v-for="(item) in column1" :key="item.id" :label="item.label"
            :modelValue="isPlanSelected(item.id)" @update:modelValue="(val) => togglePlan(item.id, val)"
            checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
            labelClass="text-[14px] text-[#0C111D] font-[400] cursor-pointer truncate whitespace-nowrap overflow-hidden md:max-w-[270px] lg:max-w-[400px] max-w-[250px]"
            wrapperClass="flex items-center" />
        </div>

        <div class="flex flex-col gap-2">
          <CheckboxGroup v-for="(item) in column2" :key="item.id" :label="item.label"
            :modelValue="isPlanSelected(item.id)" @update:modelValue="(val) => togglePlan(item.id, val)"
            checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
            labelClass="text-[14px] text-[#0C111D] font-[400] cursor-pointer truncate whitespace-nowrap overflow-hidden md:max-w-[270px] lg:max-w-[400px] max-w-[250px]"
            wrapperClass="flex items-center" />
        </div>
      </div>
    </div>

    <div class="mb-4 mt-8">
      <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic py-[8px]">
        Pay to View Settings
      </h4>

      <CheckboxSwitch label="Make this media available for pay to view" id="p2v-toggle" v-model="payToViewModel" />

      <div v-if="payToViewModel" class=" md:flex md:justify-between md:items-start mt-4 gap-4">
        <div class="flex-1">
          <DashboardTextInput id="original_price" type="number" show-label v-model="originalPriceModel"
            label-text="Original Price" leftSpan leftSpanText="USD$"
            :description="originalPriceDescription" 
            description-class="text-[#FF4405]" />
        </div>
        <div class="flex-1">
          <DashboardTextInput id="discount_price" type="number" show-label v-model="discountPriceModel"
            label-text="Discounted Price (optional)" leftSpan leftSpanText="USD$"
            :description="discountPriceDescription" 
            description-class="text-[#FF4405]" />
        </div>
      </div>
    </div>

    <div class="mt-[24px] flex flex-col gap-4">
      <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic">
        Display this media on:
      </h4>

      <CheckboxGroup label="Discovery Page" v-model="discoveryPageModel"
        checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
        labelClass="text-[16px] text-[#0C111D] font-[600] cursor-pointer" wrapperClass="flex items-center" />

      <CheckboxGroup label="My Profile Page" v-model="profilePageModel"
        checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
        labelClass="text-[16px] text-[#0C111D] font-[600] cursor-pointer" wrapperClass="flex items-center" />
    </div>

    <div class="flex justify-end md:mt-0 mt-4" @click="uploaderStore.setStep(3)">
      <DashboardPrimaryButton text="Next" variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" btnBg="#07f468" btnHoverBg="black"
        btnText="black" btnHoverText="#07f468" />
    </div>

    <AddTierPopup v-model="showAddTierPopup" />
  </div>
</template>