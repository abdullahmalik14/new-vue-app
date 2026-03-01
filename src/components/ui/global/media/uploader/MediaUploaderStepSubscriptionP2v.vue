<template>
  <div class="relative md:py-[16px] md:px-[10px] lg:px-[24px]">
    <div @click="uploader.goToStep(1, { intent: 'user' })" class="flex gap-2 items-center cursor-pointer py-[16px]">
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
        <ButtonComponent text="Add Tier" variant="polygonLeft" customClass="gap-[2px] text-sm"
          :leftIcon="'https://i.ibb.co/N2xH2QVV/svgviewer-png-output-13.webp'" btnBg="#000" btnHoverBg="#07f468"
          btnText="#07f468" btnHoverText="#000" />
      </div>

      <div>
        <CheckboxSwitch label="Link this media to subscription plan" id="link-subscription-toggle"
          v-model="linkSubscriptionModel" />
      </div>

      <div class="md:flex md:gap-6 gap-2 mt-4">

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

      <div class=" md:flex md:justify-between md:items-center mt-4 gap-4">
        <div class="flex-1">
          <InputComponentDashbaord id="original_price" type="number" show-label v-model="originalPriceModel"
            label-text="Original Price" leftSpan leftSpanText="USD$"
            description="Price must be between USD$ 1.95 to 500." />
        </div>
        <div class="flex-1">
          <InputComponentDashbaord id="discount_price" type="number" show-label v-model="discountPriceModel"
            label-text="Discounted Price (optional)" leftSpan leftSpanText="USD$"
            description="Leave blank to disable discount display." label-class="text-lg text-[red]"
            description-class="text-xs text-blue-500" />
        </div>
      </div>
    </div>

    <div class="mb-[50px] mt-8 flex flex-col gap-4">
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

    <div class="flex justify-end md:mt-0 mt-4" @click="uploader.goToStep(3, { intent: 'user' })">
      <ButtonComponent text="Next" variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" btnBg="#07f468" btnHoverBg="black"
        btnText="black" btnHoverText="#07f468" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ButtonComponent from "@/components/dev/button/ButtonComponent.vue";
import CheckboxSwitch from "@/components/dev/checkbox/CheckboxSwitch.vue";
import CheckboxGroup from "@/components/ui/form/checkbox/CheckboxGroup.vue";
import InputComponentDashbaord from "../../../../../components/dev/input/InputComponentDashboard.vue";

const props = defineProps({
  uploader: {
    type: Object,
    required: true,
  },
});

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
  get: () => props.uploader.state.linkToSubscriptionPlan || false,
  set: (val) => props.uploader.setState("linkToSubscriptionPlan", val, { reason: "user:linkSub" })
});

// 2. Pay To View
const payToViewModel = computed({
  get: () => props.uploader.state.payToViewEnabled || false,
  set: (val) => props.uploader.setState("payToViewEnabled", val, { reason: "user:p2vEnable" })
});

// 3. Discovery Page
const discoveryPageModel = computed({
  get: () => props.uploader.state.showOnDiscoveryPage || false,
  set: (val) => props.uploader.setState("showOnDiscoveryPage", val, { reason: "user:discovery" })
});

// 4. Profile Page
const profilePageModel = computed({
  get: () => props.uploader.state.showOnProfilePage || false,
  set: (val) => props.uploader.setState("showOnProfilePage", val, { reason: "user:profile" })
});

// ============================================
// STATE CONNECTIONS (Inputs - Prices)
// ============================================

const originalPriceModel = computed({
  get: () => props.uploader.state.payToViewOriginalPrice,
  set: (val) => props.uploader.setState("payToViewOriginalPrice", val, { reason: "user:priceOrig" })
});

const discountPriceModel = computed({
  get: () => props.uploader.state.payToViewDiscountedPrice,
  set: (val) => props.uploader.setState("payToViewDiscountedPrice", val, { reason: "user:priceDisc" })
});

// ============================================
// LOGIC: SUBSCRIPTION PLANS (Array)
// ============================================

// Check karein ke kya ye ID array mein hai?
const isPlanSelected = (id) => {
  const currentList = props.uploader.state.subscriptionPlanIds || [];
  return currentList.includes(id);
};

// Tick karne par add karein, untick par remove karein
const togglePlan = (id, isChecked) => {
  let currentList = [...(props.uploader.state.subscriptionPlanIds || [])];

  if (isChecked) {
    if (!currentList.includes(id)) currentList.push(id);
  } else {
    currentList = currentList.filter(item => item !== id);
  }

  props.uploader.setState("subscriptionPlanIds", currentList, { reason: "user:togglePlan" });
};
</script>