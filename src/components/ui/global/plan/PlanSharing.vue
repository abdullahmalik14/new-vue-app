<script setup>
import { ref, computed } from 'vue'; 
import CheckboxSwitch from '@/components/dev/checkbox/CheckboxSwitch.vue';
import BaseInput from '@/components/dev/input/BaseInput.vue';
import RadioGroup from '@/components/dev/RadioGroup.vue';
import ReusableSearchInput from '../media/uploader/HelperComponents/ReusableSearchInput.vue';
import ButtonComponent from '@/components/dev/button/ButtonComponent.vue';
import CheckboxGroup from '../../form/checkbox/CheckboxGroup.vue';
import { defineProps } from 'vue';

const props = defineProps(['publishFlow']);

// --- PROXIES (State Connection) ---

const postToXProxy = computed({
  get: () => props.publishFlow.state.postToX,
  set: (val) => props.publishFlow.setState('postToX', val)
});

const postMessageProxy = computed({
  get: () => props.publishFlow.state.postMessage,
  set: (val) => props.publishFlow.setState('postMessage', val)
});

const socialThumbnailModeProxy = computed({
  get: () => props.publishFlow.state.socialThumbnailMode,
  set: (val) => props.publishFlow.setState('socialThumbnailMode', val)
});

const invitedPerformersProxy = computed({
  get: () => props.publishFlow.state.invitedPerformers,
  set: (val) => props.publishFlow.setState('invitedPerformers', val)
});

const verifiedFanProxy = computed({
  get: () => props.publishFlow.state.verifiedFanOnly,
  set: (val) => props.publishFlow.setState('verifiedFanOnly', val)
});

// --- CONSTANTS & HELPERS ---

const transferTypeOptions = [
  { value: "useOriginal", label: "Use original thumbnail and preview" },
  { value: "useCustom", label: "Upload a different thumbnail and preview" },
  { value: "none", label: "Do not attach thumbnail and preview" },
];

// Mock Data for Search Input (Taake component render ho sake)
const performersList = ref([
    { id: 1, name: 'User One', username: 'user1' },
    { id: 2, name: 'User Two', username: 'user2' },
]);

const inviteLink = ref('ourwebsite.com/invitelinkwww');
const copied = ref(false);

const copyLink = async () => {
  if (!inviteLink.value) return;
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 1500);
  } catch (err) {
    alert('Failed to copy');
  }
};
</script>

<template>
    <div class="flex flex-col gap-6 grow md:gap-8 md:pb-6 xl:pb-6">
  <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
                        <h2 class="text-xl leading-normal font-semibold opacity-80 text-[#667085] md:text-2xl dark:text-[#9e9689]">Sharing Options</h2>
                    
                        <div class="flex flex-col gap-4 sm:justify-between sm:gap-6 min-[615px]:flex-row">
                            <div class="flex flex-col gap-4 md:grow">
                                <div class="flex items-center gap-2">
                                    <div class="flex items-center gap-2 relative">
                                        
                                     <CheckboxSwitch
                                        v-model="postToXProxy"
                                        label="Post updates of this tier to X"
                                        id="post-to-x"
                                        track-class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                                        knob-class="absolute left-[0.125rem] top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                                        label-class="text-base font-medium text-black dark:text-[#e8e6e3]"
                                        switchWrapperClass="w-9 h-5"
                                     />

                                        <span class="flex items-center justify-center">
                                            <div class="md:relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible">
                                                <img src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp" alt="tooltip icon" class="w-4 h-4">

                                                <div class="absolute z-[2] flex flex-col items-start w-max md:w-max max-w-[22.4375rem] md:max-w-[21.5rem]
                                                    opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                                                    text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg
                                                    bg-[#101828B2] dark:bg-[rgba(14,19,32,0.9)] dark:text-[#dbd8d3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]
                                                    -right-2 bottom-full -translate-y-2 md:bottom-[unset] md:left-auto md:top-1/2 md:-right-2 md:translate-y-[-50%] md:translate-x-full
                                                    before:content-[''] before:absolute before:w-0 before:h-0 before:left-[92%] before:bottom-[-5px] before:translate-x-[-50%] before:border-[6px] before:border-b-0 before:border-l-transparent before:border-r-transparent before:border-t-[rgba(16,24,40,0.7)]
                                                    md:before:top-1/2 md:before:left-[-6px] md:before:translate-y-[-50%] md:before:border-[6px] md:before:border-r-[rgba(16,24,40,0.7)] md:before:border-t-transparent md:before:border-b-transparent md:before:border-l-transparent"
                                                >
                                                    <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">Post updates of this tier to X </p>
                                                </div>
                                            </div>
                                        </span>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-4">
                                    <section class="flex flex-col gap-1.5">
                                        <h3 class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Post Message (Leave blank to use system default message.)</h3>
                                        
                                        <BaseInput
                                        type="text"
                                        v-model="postMessageProxy" 
                                        placeholder="Custom message..."
                                        inputClass="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] 
                                        rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]
                                        text-base bg-transparent outline-none w-full min-w-0 text-[#0C111D] 
                                        placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]"
                                        />
                                        <span class="text-sm text-[#475467] dark:text-[#b1aba0]">66/72 characters</span>
                                    </section>

                                    <section class="flex flex-col gap-2">
                                        <RadioGroup 
                                         v-model="socialThumbnailModeProxy"
                                         name="socialMode"
                                         label="Attach Media"
                                         labelClass="font-[600]"
                                         :options="transferTypeOptions" version="dashboard" 
                                         :radioLabelClass="`relative pl-8 cursor-pointer text-[16px] font-medium
                                                    text-black dark:text-[#e8e6e3] font-bolder
                                                    before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                                                    before:w-5 before:h-5 before:rounded-full before:border
                                                    before:border-[#d0d5dd] dark:before:border-[#3b4043]
                                                    before:bg-[#ffffff] dark:before:bg-[#181a1b]
                                                    peer-checked:before:bg-[#000000] dark:peer-checked:before:bg-[#000000]
                                                    after:content-[''] after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2
                                                    after:w-[0.375rem] after:h-[0.375rem] after:rounded-full
                                                    after:bg-[#07f468] dark:after:bg-[#07f468]
                                                    after:hidden peer-checked:after:block
                                                 `" />
                                    </section>
                                </div>
                            </div>
                            
                            <div class="flex flex-col gap-2 shrink-0 sm:min-w-[17.625rem]">
                                <h3 class="text-xs leading-normal text-right text-[#667085] dark:text-[#9e9689]">POST PREVIEW</h3>

                                <div class="flex gap-2 px-2 py-4 rounded-[0.3125rem] bg-white/70 w-[calc(100%+1rem)] -ml-2 dark:bg-[#181a1bb3] sm:max-w-[17.625rem] sm:self-end sm:w-full sm:ml-0">
                                    <div class="w-6 h-6 rounded-md overflow-hidden min-w-[1.5rem]">
                                        <img src="https://i.ibb.co.com/70sHrpv/featured-media-bg.webp" alt="featured-media-bg" class="w-full h-full object-cover">
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <div class="flex flex-col gap-1">
                                            <div class="flex items-center gap-2">
                                                <div class="flex items-center gap-1">
                                                    <h4 class="text-xs leading-normal font-semibold text-[#0C111D] truncate dark:text-[#dbd8d3]">Jelly FISH</h4>
                                                    <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" alt="verified-tick" class="w-3 h-3"/>
                                                </div>

                                                <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9689]">@jellyf1sh</span>

                                                <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9689]">Jul 31</span>
                                            </div>

                                            <p class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">Watch me eat 10 family size fried chicken bucket...you don’t wanna miss this:</p>
                                            
                                            <a href="our-website.app/model/jellyskitchen/media/198386476" class="max-w-full text-xs leading-normal font-medium line-clamp-1 break-all underline text-[#0C111D] dark:text-[#dbd8d3]">our-website.app/model/jellyskitchen/media/198386476</a>
                                        </div>

                                        <div class="flex gap-0.5 rounded-[0.625rem] overflow-hidden">
                                            <div class="flex justify-center items-center w-full aspect-[1.63636373/1] relative">
                                                <img src="https://i.ibb.co.com/2Yg9hKBv/checkout-header.webp" alt="checkout-header" class="w-full h-full object-cover">
                                            
                                                <div class="absolute flex justify-center items-center p-1.5 w-[1.875rem] aspect-square rounded-full bg-black/60 cursor-pointer dark:bg-[#181a1b]/60">
                                                    <img src="https://i.ibb.co.com/cKp3rc0B/play-icon.webp" alt="play icon" class="w-full h-full">
                                                </div>
                                            </div>

                                            <div class="flex justify-center items-center w-full aspect-[1.63636373/1] relative">
                                                <img src="https://i.ibb.co.com/2Yg9hKBv/checkout-header.webp" alt="checkout-header" class="w-full h-full object-cover">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                        <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 opacity-80 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
                        <h2 class="text-xl leading-normal font-semibold text-[#667085] md:text-2xl dark:text-[#9e9689]">Invite Fans</h2>

                        <div class="flex items-end w-full">
                         
                         <ReusableSearchInput
                        subtitle="Invite list"
                        placeholder="Search fan by username..."
                        type="performer"
                        :results="performersList"
                        v-model="invitedPerformersProxy"
                        :max-items="5"
                        parentClass="w-full"
                        searchWrapperClass="bg-white/75 dark:bg-[#181a1b]/75"
                        inputClass="h-7"
                        subTitleClass="text-[#0C111D] dark:text-[#dbd8d3] text-base font-medium"
                    />
                            <ButtonComponent
                            text="Send invite"
                            variant="simpleBtn"
                            :leftIcon="'https://i.ibb.co.com/PZcHd96N/send-01.webp'"
                            :leftIconClass="`w-6 h-6 group-hover/button:[filter:brightness(0)_saturate(100%)_invert(74%)_sepia(36%)_saturate(5644%)_hue-rotate(95deg)_brightness(111%)_contrast(94%)] group-[.disabled]/button:[filter:brightness(0)_saturate(100%)_invert(76%)_sepia(27%)_saturate(176%)_hue-rotate(179deg)_brightness(81%)_contrast(87%)]`"
                            btnBg="#07f468"
                            btnHoverBg="black"
                            btnText="black"
                            btnHoverText="#07f468"
                        />
                            </div>

                        <div class="flex flex-col gap-2">
                            <div class="flex flex-col gap-1.5">
                                <p class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Send invite to specific fans, or share it on your social media:</p>

                                <div
                                    class="w-full h-10 flex gap-3.5 bg-white/75 border-b border-[#D0D5DD] rounded-t-sm
                                    shadow-[0px_1px_2px_0px_#1018280D] sm:h-12 dark:bg-[#181a1bbf]
                                    dark:border-[#3b4043] overflow-hidden"
                                >
                                    <input
                                    ref="inviteInput"
                                    type="text"
                                    placeholder="Enter amount"
                                    class="w-full text-base bg-transparent border-none outline-none truncate flex-1
                                    min-w-0 pl-3.5 text-[#101828] placeholder:text-[#667085]
                                    pointer-events-none dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]"
                                    :value="inviteLink"
                                    readonly
                                    />

                                    <button
                                    @click="copyLink"
                                    class="flex items-center gap-1 px-3.5 shrink-0 cursor-pointer"
                                    >
                                    <img
                                        src="https://i.ibb.co.com/jvvTYfmR/copy-01.webp"
                                        alt="copy-01"
                                        class="w-5 h-5"
                                    />
                                    <span
                                        class="text-sm font-semibold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]"
                                    >
                                        {{ copied ? 'Copied!' : 'Copy Link' }}
                                    </span>
                                    </button>
                                </div>
                            </div>

                            <CheckboxGroup 
                            label="Verified fan only" 
                            v-model="verifiedFanProxy"
                            checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
                            labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]" 
                            wrapperClass="pl-1 flex items-center gap-3" />
                        </div>
                    </section>
                    </div>
            </template>