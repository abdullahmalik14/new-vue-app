<template>
     <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="addTierPopupConfig"
  >
   <div class="w-[640px] p-6 relative bg-white/90 inline-flex flex-col justify-start items-start gap-8">
    <div class="self-stretch backdrop-blur-xl flex flex-col justify-start items-start gap-6">
       <div class="w-full">
           <div class="w-full flex justify-between items-center">
               <div class="flex-1 justify-center text-gray-500 text-lg font-medium font-['Poppins'] leading-7">Add New Tier</div>
              
               <div >
                   <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M17 1L1 17M1 1L17 17" stroke="#98A2B3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
               </div>
   
            </div>
            <div class="flex items-center">
                <InformationCircleIcon class="w-5 h-5 text-orange-500" />
                <div class="justify-start text-orange-500 text-sm font-normal font-['Poppins'] leading-5">You've used all available published tier slots; the new tier will be saved as a draft.</div>
            </div>
       </div>

        <div class="self-stretch flex flex-col justify-start items-start gap-2">
          <div class="w-full">
            <InputComponentDashboard 
              placeholder="Tier Name..." 
              v-model="tierName"
            />
          </div>

          <!-- Quill Editor for Description -->
          <div v-if="showDescriptionEditor" class="w-full">
            <QuillEditor 
              v-model="tierDescription" 
              placeholder="Tier description..." 
            />
          </div>

          <div v-if="!showDescriptionEditor || !showBackgroundImageUploader" class="inline-flex justify-start items-start gap-6">
            <div 
              v-if="!showDescriptionEditor"
              class="flex justify-start items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              @click="showDescriptionEditor = true"
            >
              <div class="w-4 h-4 relative overflow-hidden">
                <img src="https://i.ibb.co.com/Sw3WhF1p/svgviewer-png-output-9.webp" alt="">
              </div>
              <div class="justify-start text-slate-700 text-xs font-medium font-['Poppins'] leading-4">Description</div>
            </div>
            <div 
              v-if="!showBackgroundImageUploader"
              class="flex justify-start items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              @click="showBackgroundImageUploader = true"
            >
              <div class="w-4 h-4 relative overflow-hidden">
                <img src="https://i.ibb.co.com/Sw3WhF1p/svgviewer-png-output-9.webp" alt="">
              </div>
              <div class="justify-start text-slate-700 text-xs font-medium font-['Poppins'] leading-4">Background Image</div>
            </div>
          </div>

          <!-- Background Image Uploader or Preview -->
          <div v-if="showBackgroundImageUploader" class="w-full flex flex-col gap-2 mt-2">
            <div class="text-slate-700 text-xs font-medium font-['Poppins'] leading-4">Background image</div>
            
            <!-- Image Preview -->
            <div v-if="uploaderStore.form.tier_backgroundUrl" class="relative w-[126px] h-[201px] rounded-[4px] overflow-hidden group">
              <img :src="uploaderStore.form.tier_backgroundUrl" class="w-full h-full object-cover" alt="background preview" />
              
              <!-- Delete Button -->
              <div 
                class="absolute top-0 right-0 w-7 h-7 bg-[#FF4405] flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-sm"
                @click="removeBackgroundImage"
              >
                <img src="https://i.ibb.co/wH3Wh66/svgviewer-png-output-53.webp" class="w-4 h-4" alt="delete" />
              </div>
            </div>

            <!-- Uploader -->
            <ThumbnailUploader 
              v-else
              title="Click here"
              subtitle="to select image or drag and drop image here"
              fileInfo="(Allowed formats: JPEG, PNG. Max size: 10MB)"
              stateUrlKey="tier_backgroundUrl"
              stateFileKey="tier_backgroundFile"
            >
              <template #icon>
                <svg width="60" height="60" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 30C34.4772 30 30 34.4772 30 40V80C30 85.5228 34.4772 90 40 90H80C85.5228 90 90 85.5228 90 80V40C90 34.4772 85.5228 30 80 30H40ZM40 35H80C82.7614 35 85 37.2386 85 40V70.8359L71.4922 56.4023C70.6211 55.4805 69.1758 55.4805 68.3047 56.4023L35 90V40C35 37.2386 37.2386 35 40 35ZM85 77.293L75.4062 67.043L69.8984 72.8828L78.3359 81.8984C72.0156 81.8984 66.8281 77.3477 65.418 71.3984L59.8164 77.0273C65.5703 82.5 73.082 85.3125 80.5 85.3125C82.2539 85.3125 83.8438 85.1602 85 84.8789V77.293ZM40 85H41.5938L64.3164 60.7188L71.4922 68.3984L58.2148 82.4766C52.7305 84.3281 46.4219 85.6484 40 85.3125V85ZM75 42.5C72.2386 42.5 70 44.7386 70 47.5C70 50.2614 72.2386 52.5 75 52.5C77.7614 52.5 80 50.2614 80 47.5C80 44.7386 77.7614 42.5 75 42.5Z" fill="#667085"/>
                </svg>
              </template>
            </ThumbnailUploader>
          </div>
        </div>
    </div>


    <div class="self-stretch flex flex-col justify-start items-start gap-4">
            <div class=" justify-center text-gray-900 text-xl font-semibold font-['Poppins'] leading-8">SUBSCRIPTION FEE</div>
       
        <div class="self-stretch bg-gray-50 rounded-[5px] outline outline-1 outline-gray-200 inline-flex justify-start items-center overflow-hidden">
            <div  class="flex-1 min-h-10 px-4 py-2 border-r border-gray-300 flex justify-center items-center gap-2">
                <div class="w-5 h-5 relative overflow-hidden">
                    <img src="https://i.ibb.co.com/Y49kymq4/alert-icon.webp" alt="">
                </div>
                <div class="justify-start text-gray-400 text-sm font-medium font-['Poppins'] leading-5">Free Tier </div>
            </div>
            <div class="flex-1 min-h-10 px-4 py-2 bg-gray-900 border-r border-gray-300 flex justify-center items-center gap-2">
                <div class="justify-start text-white text-sm font-semibold font-['Poppins'] leading-5">Paid Tier</div>
            </div>
        </div>

        <div class="self-stretch inline-flex justify-start items-start gap-1">
            <div class=" md:flex md:justify-between md:items-start mt-4 gap-4">
        <div class="flex-1">
          <InputComponentDashboard id="original_price" type="number" show-label 
            v-model="originalPrice"
            label-text="Original Price" leftSpan leftSpanText="USD$"
            description="Price must be between USD$ 1.95 to 500." 
            description-class="text-[#475467]" labelClass="text-gray-900 text-xs" />
        </div>
        <div class="flex-1">
          <InputComponentDashboard id="discount_price" type="number" show-label 
            v-model="discountPrice"
            label-text="Discounted Price (optional)" leftSpan leftSpanText="USD$"
            description="Leave blank to disable discount display." 
            description-class="text-[#475467]" labelClass="text-gray-900 text-xs" />
        </div>
      </div>
        </div>
    </div>
   
    <div class="w-full flex flex-col gap-4 py-4 bg-white/25 dark:bg-[#181a1b40]">
      <div class="flex items-center gap-2 opacity-80">
        <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Subscriber Benefits</h2>
        <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">Optional</span>
      </div>

      <div class="flex flex-col gap-4 backdrop-blur-[25px] md:gap-6">

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="relative flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Free tokens</h3>
              <BaseTooltip>
                <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">Set amount of free tokens
                  given to member of this tier every recurring billing cycle. Frequency is based on your based
                  subscription plan setting.</p>
              </BaseTooltip>
            </div>
          </div>
          <InputDefaultComponent id="input_free_tokens" type="number" v-model="freeTokens" rightSpan
            :rightSpanText="'% off'"
            wrapper3Class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :showLabel="false" :error="freeTokensError" error-message="Value must be between 1-99"
            rightSpanClass="text-sm font-semibold whitespace-nowrap px-3 text-[#344054] dark:text-[#bdb7af]"
            inputClass="text-[#0C111D] font-600 text-base flex-1 min-w-0" errorMessageClass="text-[#FF4405] dark:text-[#ff571e]" />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <h3 class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Merch Discount</h3>
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
            <CheckboxGroup label="Apply to items already on sale" v-model="applyMerch"
              checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3" />
          </div>
          <InputDefaultComponent id="input_merch" type="number" v-model="merchDiscount" rightSpan
            :rightSpanText="'% off'"
            wrapper3Class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :showLabel="false" :error="merchError" error-message="Value must be between 1-99"
            rightSpanClass="text-sm font-semibold whitespace-nowrap px-3 text-[#344054] dark:text-[#bdb7af]"
            inputClass="text-[#0C111D] font-600 text-base flex-1 min-w-0" errorMessageClass="text-[#FF4405] dark:text-[#ff571e]" />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <h3 class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Pay to View Discount</h3>
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
            <CheckboxGroup label="Apply to items already on sale" v-model="applyPayToView"
              checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3" />
          </div>
          <InputDefaultComponent id="input_p2v" type="number" v-model="payToViewDiscount" rightSpan
            :rightSpanText="'% off'"
            wrapper3Class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :showLabel="false" 
            rightSpanClass="text-sm font-semibold whitespace-nowrap px-3 text-[#344054] dark:text-[#bdb7af]"
            inputClass="text-[#0C111D] font-600 text-base flex-1 min-w-0" />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <h3 class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Custom Request Discount</h3>
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
            <CheckboxGroup label="Apply to items already on sale" v-model="applyCustom"
              checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3" />
          </div>
          <InputDefaultComponent id="input_custom" type="number" v-model="customRequestDiscount" rightSpan
            :rightSpanText="'% off'"
            wrapper3Class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :showLabel="false" 
            rightSpanClass="text-sm font-semibold whitespace-nowrap px-3 text-[#344054] dark:text-[#bdb7af]"
            inputClass="text-[#0C111D] font-600 text-base flex-1 min-w-0" />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="relative flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Unsubscribe discount</h3>
              <BaseTooltip>
                <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">Set amount of free tokens
                  given to member of this tier every recurring billing cycle. Frequency is based on your based
                  subscription plan setting.</p>
              </BaseTooltip>
            </div>
          </div>
          <InputDefaultComponent id="input_free_tokens" type="number" v-model="freeTokens" rightSpan
            :rightSpanText="'% off'"
            wrapper3Class="h-11 flex items-center bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :showLabel="false" :error="freeTokensError" error-message="Value must be between 1-99"
            rightSpanClass="text-sm font-semibold whitespace-nowrap px-3 text-[#344054] dark:text-[#bdb7af]"
            inputClass="text-[#0C111D] font-600 text-base flex-1 min-w-0" errorMessageClass="text-[#FF4405] dark:text-[#ff571e]" />
        </div>
      </div>
    </div>

    <div class="w-full flex justify-end items-center absolute bottom-0 right-0">
        <ButtonComponent 
          text="CANCEL"
          variant="none"
          customClass="w-20 h-10 bg-white text-black flex items-center justify-center text-lg font-medium font-['Poppins'] leading-7"
          @click="emit('update:modelValue', false)"
        />
        <ButtonComponent 
          text="SAVE"
          variant="simpleBtn"
          btnBg="#07F468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#22c55e"
          customClass="!h-10 !w-20 !text-lg !font-medium !font-['Poppins'] !leading-7 rounded-none"
        />
    </div>
</div>
</PopupHandler>
</template>

<script setup>
import { computed, ref } from "vue";
import PopupHandler from "./PopupHandler.vue";
import ButtonComponent from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import InputComponentDashboard from "@/components/forms/inputs/DashboardTextInput.vue";
import InputDefaultComponent from "@/components/forms/inputs/BaseTextInput.vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import BaseTooltip from "@/dev/components/plan/parts/BaseTooltip.vue";
import QuillEditor from "@/components/forms/inputs/QuillEditor.vue";
import ThumbnailUploader from "@/dev/components/media/uploader/parts/ThumbnailUploader.vue";
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["update:modelValue"]);
const uploaderStore = useMediaUploaderStore();

// --- STATE (UI) ---
const showDescriptionEditor = ref(false);
const showBackgroundImageUploader = ref(false);

// --- STATE (STORE BINDINGS) ---
const tierName = computed({
  get: () => uploaderStore.form.tier_name,
  set: (val) => uploaderStore.updateFormField('tier_name', val)
});
const tierDescription = computed({
  get: () => uploaderStore.form.tier_description,
  set: (val) => uploaderStore.updateFormField('tier_description', val)
});
const originalPrice = computed({
  get: () => uploaderStore.form.tier_originalPrice,
  set: (val) => uploaderStore.updateFormField('tier_originalPrice', val)
});
const discountPrice = computed({
  get: () => uploaderStore.form.tier_discountPrice,
  set: (val) => uploaderStore.updateFormField('tier_discountPrice', val)
});
const freeTokens = computed({
  get: () => uploaderStore.form.tier_freeTokens,
  set: (val) => uploaderStore.updateFormField('tier_freeTokens', val)
});
const merchDiscount = computed({
  get: () => uploaderStore.form.tier_merchDiscount,
  set: (val) => uploaderStore.updateFormField('tier_merchDiscount', val)
});
const applyMerch = computed({
  get: () => uploaderStore.form.tier_applyMerch,
  set: (val) => uploaderStore.updateFormField('tier_applyMerch', val)
});
const payToViewDiscount = computed({
  get: () => uploaderStore.form.tier_payToViewDiscount,
  set: (val) => uploaderStore.updateFormField('tier_payToViewDiscount', val)
});
const applyPayToView = computed({
  get: () => uploaderStore.form.tier_applyPayToView,
  set: (val) => uploaderStore.updateFormField('tier_applyPayToView', val)
});
const customRequestDiscount = computed({
  get: () => uploaderStore.form.tier_customRequestDiscount,
  set: (val) => uploaderStore.updateFormField('tier_customRequestDiscount', val)
});
const applyCustom = computed({
  get: () => uploaderStore.form.tier_applyCustom,
  set: (val) => uploaderStore.updateFormField('tier_applyCustom', val)
});

const mediaOptions = ref([]);

function removeBackgroundImage() {
  uploaderStore.updateFormField('tier_backgroundUrl', '');
  uploaderStore.updateFormField('tier_backgroundFile', null);
}

// --- VALIDATION ---
const freeTokensError = computed(() => {
  const val = Number(freeTokens.value);
  if (freeTokens.value !== "" && (val < 1 || val > 99)) return true;
  return false;
});

const merchError = computed(() => {
  const val = Number(merchDiscount.value);
  if (merchDiscount.value !== "" && (val < 1 || val > 99)) return true;
  return false;
});

const addTierPopupConfig = computed(() => ({
  actionType: "popup",
  position: "center",
  customEffect: "scale",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: true,
  closeOnOutside: true,
  escToClose: true,
  width: { default: "auto", "<480": "95%" },
  height: { default: "90%" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
}));
</script>