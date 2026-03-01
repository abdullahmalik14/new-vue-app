<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { createStepStateEngine, attachEngineLogging } from '@/utils/stateEngine';
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import TierCard from '../../card/dashboard/TierCard.vue';
import PlanDetail from './PlanDetail.vue';
import PlanVariation from './PlanVariation.vue';
import PlanSharing from './PlanSharing.vue';
import PlanPublishSetting from './PlanPublishSetting.vue';

// --- 1. SETUP STATE ENGINE ---
const publishFlow = createStepStateEngine({
  flowId: 'publishFlow',
  initialStep: 1, 
  urlSync: 'query', 
  defaults: {
    // --- Existing Defaults ---
    activeDiscountPlan: '6m',
    isDraftPopupOpen: false,
    publishDate: '',
    publishEndDate: '',
    postToX: false,             
    postMessage: '',            
    socialThumbnailMode: 'useOriginal',
    invitedPerformers: [],      
    verifiedFanOnly: false,
    
    // ✅ Substep Management
    planDetailSubstep: 'free-tier',       // Default for Step 1
    publishSettingSubstep: 'publish-immediately', // Default for Step 4

    // --- ✅ NEW: Fields for PlanDetail.vue (State Sync) ---
    tierName: 'Basic Lounge ❤️️️',
    description: 'Welcome to Jenny’s basic lounge. You will get the most basic things in this tier.',   // Quill Editor Content
    bgImage: null,     // Background Image URL
    isFeaturedTier: false,
    
    // Price Setting
    priceDuration: 'month',
    basePrice: '29.5',
    
    // Discounts
    subscriberDiscount: '',
    unsubscribeDiscount: '',
    
    // Benefits & Tokens
    tierAudience: 'everyone',
    maxSubscribers: '',
    freeTokensDiscount: '',
    
    // Merch & Custom Requests
    merchDiscount: '',
    applyMerchToSale: false,
    payToViewDiscount: '',
    applyPayToViewToSale: false,
    customRequestDiscount: '', // Added if needed
    applyCustomToSale: false,  // Added if needed
    
    // Media Options
    selectedMediaOptions: [] 
  }
});

attachEngineLogging(publishFlow);

// Ensure default substep logic on load
if (publishFlow.step === 1 && !publishFlow.state.planDetailSubstep) {
  publishFlow.setState('planDetailSubstep', 'free-tier'); // Fixed: use setState for custom fields
}

if (publishFlow.step === 4 && !publishFlow.state.publishSettingSubstep) {
  publishFlow.setState('publishSettingSubstep', 'publish-immediately');
}

// --- 2. LOGIC & HELPERS ---

const isLargeScreen = ref(true);
const isPreviewPopupOpen = ref(false);

function checkScreenSize() {
  isLargeScreen.value = window.innerWidth >= 1365;
  if (isLargeScreen.value) {
    isPreviewPopupOpen.value = false;
  }
}

// Navigation Handlers
function handleMainTab(stepNumber) {
  publishFlow.goToStep(stepNumber);
  
  if (stepNumber === 1 && !publishFlow.state.planDetailSubstep) {
     publishFlow.setState('planDetailSubstep', 'free-tier');
  }
  if (stepNumber === 4 && !publishFlow.state.publishSettingSubstep) {
     publishFlow.setState('publishSettingSubstep', 'publish-immediately');
  }
}

function toggleDraftPopup() {
  const currentVal = publishFlow.state.isDraftPopupOpen;
  publishFlow.setState('isDraftPopupOpen', !currentVal);
}

// ✅ MAIN NEXT / PUBLISH LOGIC
function handleNextStep() {
    if (publishFlow.step < 4) {
        const nextStep = publishFlow.step + 1;
        publishFlow.goToStep(nextStep);

        // Auto-set substep for step 4
        if (nextStep === 4) {
            publishFlow.setState('publishSettingSubstep', 'publish-immediately');
        }
    } else {
        // ✅ FINAL SUBMISSION LOGIC (Updated)
        // 1. Create a clean copy of the data to view in Console
        const finalData = JSON.parse(JSON.stringify(publishFlow.state));
        
        console.group("🚀 FORM SUBMITTED - FINAL STATE");
        console.log(finalData);
        console.groupEnd();

        // Optional: Alert for quick debug
        // alert("Check Console for Data!");

        // 2. Reset or Redirect
        publishFlow.forceStep(1);
    }
}

// ✅ BUTTON LABEL COMPUTED
const buttonLabel = computed(() => {
    if (publishFlow.step < 4) return 'SAVE & PUBLISH';
    // Check Step 4 Specific Substep using the custom state field
    return publishFlow.state.publishSettingSubstep === 'schedule-publish-time' ? 'SCHEDULE PUBLISH' : 'PUBLISH NOW';
});


// --- 3. CONFIG FOR PREVIEW POPUP ---
const previewPopupConfig = {
  actionType: "slidein",
  from: "right",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: true,
  escToClose: true,
  width: { default: "auto", "<500" : "100%" },
  height: { default: "100%", "<768": "100%" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const currentTierData = 
  {
    id: 1,
    title: "My VVIP Lounge ❤️️️",
    backgroundImage: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    isFeatured: true,
    stats: { video: 100, image: 80, audio: 70 },
    theme: {
      textPrimary: '#07F468',
      textSecondary: "text-[#FFED29] dark:text-[#ffee37]",
      shadow: "shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]",
      barColor: "bg-[#FFED29]",
      barTextColor: "text-[#FFED29]",
      featuredBg: "bg-[#000]",
        buttonBgImage: "url('https://i.ibb.co.com/B5M5ccbD/union-green.webp')",
      flashLabel: "text-[#07F468]",
      flashText: "#07F468",
      textReNew:"text-[#07F468] dark:text-[#e8e6e3]",
      featuredText:"text-[#07F468] dark:text-[#06c454]"
    },
    plans: [
      { id: '1d', label: '1 day', price: '55.86', discount: null },
      { id: '1m', label: '1 month', price: '55.86', discount: '-5%' },
      { id: '6m', label: '6 month', price: '55.86', discount: '-50%', isMostValue: true },
      { id: '1y', label: '1 year', price: '55.86', discount: '-5%' },
    ],
    defaultPlan: '6m',
    flashSale: {
      active: true,
      endsIn: "02:13:07",
      originalPrice: "$111.72"
    },
    description: "Welcome to Jenny’s VIP Lounge!...",
    footer: {
      type: 'standard',
      buttonText: "CLAIM<br>OFFER",
      progress: { visible: true, width: "5%", leftText: "5 Left!", rightText: "95/100 Offer" }
    }
  }

// --- LIFECYCLE ---
onMounted(() => {
  publishFlow.initialize();
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<template>
  <div class="bg-[#EAECF0] [&.dark]:bg-[#222526] pb-2">
    
    <div :class="{ 'schedule-publish-time': publishFlow.state.publishSettingSubstep === 'schedule-publish-time' && publishFlow.step === 4 }">
        <div class="relative before:content-[''] before:fixed before:inset-0 before:pointer-events-none before:bg-cover before:bg-center before:bg-no-repeat before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] md:before:bg-[url('https://i.ibb.co.com/dw910Z5b/gradient-main-bg.webp')]">
            
            <div class="flex flex-col gap-6 min-h-screen md:gap-8">
                
                <div class="flex flex-col gap-2 backdrop-blur-[25px] [background:linear-gradient(180deg,#F0F0F0_0%,rgba(240,240,240,0.75)_100%)] md:gap-6 md:px-4 md:bg-white/5 md:backdrop-blur-[50px] xl:px-10 dark:[background:linear-gradient(#202325_0%,rgba(32,35,37,0.75)_100%)] md:dark:bg-[#181a1b0d]">
                    
                    <div class="flex justify-between items-center p-2 md:hidden">
                        <img v-if="publishFlow.step > 1" @click="publishFlow.goToStep(publishFlow.step - 1)" src="https://i.ibb.co.com/Zpm5jfZ9/chevron-left.webp" alt="back" class="w-6 h-6 [filter:brightness(0)] cursor-pointer dark:[filter:brightness(100%)]">
                        <img v-else src="https://i.ibb.co.com/Zpm5jfZ9/chevron-left.webp" alt="back" class="w-6 h-6 [filter:brightness(0)] cursor-pointer dark:[filter:brightness(100%)]">
                        
                        <h1 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">New Tier</h1>
                        <img @click.stop="toggleDraftPopup" src="https://i.ibb.co.com/xtn4YLHF/3-dots.webp" alt="settings" class="w-6 h-6 [filter:brightness(0)] cursor-pointer dark:[filter:brightness(100%)]">
                    </div>

                    <div class="hidden justify-between items-center pt-10 md:flex md:pt-6 xl:pt-10">
                        <div class="flex justify-center items-center gap-1 cursor-pointer" @click="publishFlow.step > 1 ? publishFlow.goToStep(publishFlow.step - 1) : null">
                            <img src="https://i.ibb.co.com/HLCwss7q/arrow-left.webp" alt="back" class="w-4 h-4 [filter:brightness(0)] dark:[filter:brightness(100%)]">
                            <span class="text-xs leading-normal font-medium text-[#344054] dark:text-[#bdb8af]">Back</span>
                        </div>

                        <div class="flex items-center gap-[1.625rem]">
                            <div @click="toggleDraftPopup" class="flex items-center gap-0.5 cursor-pointer">
                                <img src="https://i.ibb.co.com/JWNPWKRW/upload-02.webp" alt="upload" class="w-5 h-5">
                                <span class="text-sm font-medium text-[#155EEF]">Save as draft</span>
                            </div>

                            <button @click="handleNextStep" class="flex justify-center items-center gap-2 px-2 h-10 bg-[#07F468] cursor-pointer group/button hover:bg-[#0C111D] [&.disabled]:pointer-events-none [&.disabled]:bg-[#3440540D] dark:[&.disabled]:bg-[#323e520d] w-full md:w-max">
                          
                                    <img v-if="publishFlow.state.publishSettingSubstep === 'publish-immediately'" src="https://i.ibb.co.com/YTZ7WYpZ/upload.webp" alt="upload" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]">
                                    <img v-else src="https://i.ibb.co.com/VW1DtcdC/Time-1.webp" alt="Time" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]">
                           

                                <span class="text-base font-medium text-[#0C111D] group-hover/button:text-[#07F468] group-[.disabled]/button:text-[#98A2B3] dark:group-[.disabled]/button:text-[#b0a99e]">
                                    {{ buttonLabel }}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 px-0">
                        <ul class="flex items-center gap-6 px-2 sm:px00 w-full overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                            
                            <li @click="handleMainTab(1)" 
                                :class="publishFlow.step === 1 ? 'border-[#FB5BA2] border-b-[2px] dark:border-[#950444] active' : ''"
                                class="flex justify-center items-center gap-2 px-1 pb-3 grow min-w-max max-w-[calc((100%/3)-1rem)] cursor-pointer md:w-max md:grow-0">
                                <div class="w-full flex justify-center items-center gap-2 px-1">
                                    <img src="https://i.ibb.co.com/qYw4qbtR/info-square.webp" class="w-5 h-5" :class="publishFlow.step === 1 ? '[filter:brightness(0)_saturate(100%)_invert(15%)_sepia(77%)_saturate(6803%)_hue-rotate(330deg)_brightness(100%)_contrast(108%)]' : '[filter:brightness(0)_saturate(100%)_invert(44%)_sepia(18%)_saturate(467%)_hue-rotate(183deg)_brightness(93%)_contrast(86%)]'">
                                    <span class="text-sm font-semibold whitespace-nowrap" :class="publishFlow.step === 1 ? 'dark:text-[#ff1a76] text-[#FF0066]' : 'text-[#667085] dark:text-[#9e9689]'">Plan Detail</span>
                                </div>
                            </li>

                            <li @click="handleMainTab(2)" 
                                :class="publishFlow.step === 2 ? 'border-[#FB5BA2] border-b-[2px] dark:border-[#950444] active' : ''"
                                class="flex justify-center items-center gap-2 px-1 pb-3 grow min-w-max max-w-[calc((100%/3)-1rem)] cursor-pointer md:w-max md:grow-0">
                                <div class="w-full flex justify-center items-center gap-2 px-1">
                                    <img src="https://i.ibb.co.com/NghXmqwT/dollar.webp" class="w-5 h-5" :class="publishFlow.step === 2 ? '[filter:brightness(0)_saturate(100%)_invert(15%)_sepia(77%)_saturate(6803%)_hue-rotate(330deg)_brightness(100%)_contrast(108%)]' : '[filter:brightness(0)_saturate(100%)_invert(44%)_sepia(18%)_saturate(467%)_hue-rotate(183deg)_brightness(93%)_contrast(86%)]'">
                                    <span class="text-sm font-semibold whitespace-nowrap" :class="publishFlow.step === 2 ? 'dark:text-[#ff1a76] text-[#FF0066]' : 'text-[#667085] dark:text-[#9e9689]'">Plan Variations & Promotion</span>
                                </div>
                            </li>

                             <li @click="handleMainTab(3)" 
                                :class="publishFlow.step === 3 ? 'border-[#FB5BA2] border-b-[2px] dark:border-[#950444] active' : ''"
                                class="flex justify-center items-center gap-2 px-1 pb-3 grow min-w-max max-w-[calc((100%/3)-1rem)] cursor-pointer md:w-max md:grow-0">
                                <div class="w-full flex justify-center items-center gap-2 px-1">
                                    <img src="https://i.ibb.co/ycjs2rZ2/share.webp" class="w-5 h-5" :class="publishFlow.step === 3 ? '[filter:brightness(0)_saturate(100%)_invert(15%)_sepia(77%)_saturate(6803%)_hue-rotate(330deg)_brightness(100%)_contrast(108%)]' : '[filter:brightness(0)_saturate(100%)_invert(44%)_sepia(18%)_saturate(467%)_hue-rotate(183deg)_brightness(93%)_contrast(86%)]'">
                                    <span class="text-sm font-semibold whitespace-nowrap" :class="publishFlow.step === 3 ? 'dark:text-[#ff1a76] text-[#FF0066]' : 'text-[#667085] dark:text-[#9e9689]'">Sharing</span>
                                </div>
                            </li>

                            <li @click="handleMainTab(4)" 
                                :class="publishFlow.step === 4 ? 'border-[#FB5BA2] border-b-[2px] dark:border-[#950444] active' : ''"
                                class="flex justify-center items-center gap-2 px-1 pb-3 grow min-w-max max-w-[calc((100%/3)-1rem)] cursor-pointer md:w-max md:grow-0">
                                <div class="w-full flex justify-center items-center gap-2 px-1">
                                    <img src="https://i.ibb.co.com/YTZ7WYpZ/upload.webp" class="w-5 h-5" :class="publishFlow.step === 4 ? '[filter:brightness(0)_saturate(100%)_invert(15%)_sepia(77%)_saturate(6803%)_hue-rotate(330deg)_brightness(100%)_contrast(108%)]' : '[filter:brightness(0)_saturate(100%)_invert(44%)_sepia(18%)_saturate(467%)_hue-rotate(183deg)_brightness(93%)_contrast(86%)]'">
                                    <span class="text-sm font-semibold whitespace-nowrap" :class="publishFlow.step === 4 ? 'dark:text-[#ff1a76] text-[#FF0066]' : 'text-[#667085] dark:text-[#9e9689]'">Publish Setting</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="flex gap-6 grow md:gap-10 xl:px-10">
                    
                    <div class="flex flex-col gap-6 grow md:gap-8 md:pb-6 xl:pb-6">

                        <div>
                            <PlanDetail v-if="publishFlow.step === 1" :publishFlow="publishFlow" />
                            <PlanVariation v-else-if="publishFlow.step === 2" :publishFlow="publishFlow" />
                            <PlanSharing v-else-if="publishFlow.step === 3" :publishFlow="publishFlow" />
                            <PlanPublishSetting v-else-if="publishFlow.step === 4" :publishFlow="publishFlow" />
                        </div>

                        <div class="flex items-center gap-2 p-2 sticky bottom-0 mt-auto md:static md:gap-6 md:px-4 md:py-0 md:justify-end xl:px-0">
                            <div @click="toggleDraftPopup" class="hidden items-center gap-0.5 cursor-pointer md:flex">
                                <img src="https://i.ibb.co.com/JWNPWKRW/upload-02.webp" alt="upload" class="w-5 h-5">
                                <span class="text-sm font-medium text-[#155EEF]">Save as draft</span>
                            </div>

                            <button @click="handleNextStep" class="flex justify-center items-center gap-2 px-2 h-10 bg-[#07F468] cursor-pointer group/button hover:bg-[#0C111D] [&.disabled]:pointer-events-none [&.disabled]:bg-[#3440540D] dark:[&.disabled]:bg-[#323e520d] w-full md:w-max">
                                
                                <template>
                                    <img v-if="publishFlow.state.publishSettingSubstep === 'publish-immediately'" src="https://i.ibb.co.com/YTZ7WYpZ/upload.webp" alt="upload" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]">
                                    <img v-else src="https://i.ibb.co.com/VW1DtcdC/Time-1.webp" alt="Time" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]">
                                </template>

                                <span class="text-base font-medium text-[#0C111D] group-hover/button:text-[#07F468] group-[.disabled]/button:text-[#98A2B3] dark:group-[.disabled]/button:text-[#b0a99e]">
                                     {{ buttonLabel }}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div v-if="isLargeScreen" >
                        <div class="shadow-[0px_0px_80px_0px_#07F46840,0px_0px_20px_0px_#07F46880]">
                            <TierCard :tier="currentTierData" />
                        </div>
                    </div>
                </div>
            </div>

            <button
                v-if="!isLargeScreen"
                @click="isPreviewPopupOpen = !isPreviewPopupOpen"
                :class="isPreviewPopupOpen
                    ? 'sm:right-[25rem] md:right-[26rem] right-[-2rem] bg-black hover:bg-[#07F468]'
                    : 'right-[-2.0625rem] bg-[#07F468] hover:bg-black'"
                class="fixed top-1/2 translate-y-[-50%] -rotate-90
                flex items-center gap-2 px-2 py-1
                shadow-[0px_1px_2px_0px_#1018280F,0px_1px_3px_0px_#1018281A]
                z-[9999] transition-all duration-300 ease-out cursor-pointer group
                xl:hidden"
                >
                <img
                    v-if="!isPreviewPopupOpen"
                    src="https://i.ibb.co.com/nspLNGBK/eye-01.webp"
                    class="w-4 h-4 rotate-90 transition-all duration-300
                    group-hover:brightness-0 group-hover:invert"
                />

                <img
                    v-else
                    src="https://i.ibb.co.com/vvPDzMxj/close-green.webp"
                    alt="close"
                    class="w-4 h-4 transition-all duration-300
                    group-hover:brightness-0"
                />

                <span
                    class="text-sm transition-all duration-300"
                    :class="isPreviewPopupOpen
                    ? 'text-[#07F468] group-hover:text-black'
                    : 'text-black group-hover:text-[#07F468]'"
                >
                    Preview
                </span>
            </button>


            <div v-if="publishFlow.state.isDraftPopupOpen" class="fixed bottom-0 left-0 w-full rounded-t-[0.625rem] bg-white shadow-lg backdrop-blur-[50px] z-[7] md:hidden dark:bg-[#181a1b]" @click.stop>
                <div class="flex flex-col py-1 w-full">
                    <div class="flex justify-center items-center h-10 px-1.5 py-0.5 cursor-pointer hover:bg-[#F2F4F7]">
                        <div class="flex justify-center items-center px-2.5 py-2">
                            <span class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">Save as draft</span>
                        </div>
                    </div>
                </div>
            </div>

            <PopupHandler
                :modelValue="isPreviewPopupOpen"
                @update:modelValue="val => isPreviewPopupOpen = val"
                :config="previewPopupConfig"
            >
                <div class="h-full w-full flex items-center justify-center p-2 sm:px-6 bg-black/80 backdrop-blur-md">
                    <div class="shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880] "> 
                    <TierCard :tier="currentTierData" />
                    </div>
                </div>
            </PopupHandler>

        </div>
    </div>
  </div>

  <div class="debugSection grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-100 rounded-lg">
      <div class="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">Flow State</h3>
          <pre class="max-h-96 overflow-auto bg-slate-900 text-slate-200 p-4 rounded-md text-xs leading-relaxed">{{ JSON.stringify(publishFlow.state, null, 2) }}</pre>
      </div>
      <div class="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 border-b-2 border-green-500 pb-2 mb-4">Flow Logs</h3>
          <pre class="max-h-96 overflow-auto bg-slate-900 text-green-400 p-4 rounded-md text-xs leading-relaxed font-mono">{{ publishFlow.logs.slice(-50).join("\n") }}</pre>
      </div>
  </div>
</template>