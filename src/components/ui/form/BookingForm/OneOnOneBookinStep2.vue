<script setup>
import { ref, watch } from "vue";
import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
import CheckboxSwitch from "@/components/checkbox/CheckboxSwitch.vue";
import InputComponentDashbaord from "@/components/input/InputComponentDashboard.vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import BookingSectionsWrapper from "@/components/ui/form/BookingForm/HelperComponents/BookingSectionsWrapper.vue";
import BaseInput from "@/components/input/BaseInput.vue";

const props = defineProps(["engine"]);

const formData = ref({
  allowRecording: props.engine.state.allowRecording || false,
  recordingPrice: props.engine.state.recordingPrice || "",
  allowPersonalRequest: props.engine.state.allowPersonalRequest || false,
  blockedUserSearch: props.engine.state.blockedUserSearch || "",
  coPerformerSearch: props.engine.state.coPerformerSearch || "",
  xPostLive: props.engine.state.xPostLive || false,
  xPostBooked: props.engine.state.xPostBooked || false,
  xPostInSession: props.engine.state.xPostInSession || false,
  xPostTipped: props.engine.state.xPostTipped || false,
  xPostPurchase: props.engine.state.xPostPurchase || false,
});

watch(formData, (newVal) => {
  Object.keys(newVal).forEach(key => {
    props.engine.setState(key, newVal[key], { silent: true });
  });
}, { deep: true });

// Accordion State for Step 2 Sections
const sectionsState = ref({
  additionalRequest: true, // Section 8
  audienceSettings: true, // Section 9
  coPerformer: true, // Section 10
  xRepost: true, // Section 11
});

const toggleSection = (key) => {
  sectionsState.value[key] = !sectionsState.value[key];
};

const goToBack = () => {
  props.engine.goToStep(1);
};

const publishSchedule = async () => {
  const result = await props.engine.validate(2);

  if (result.valid) {
    console.log("Form Valid! Payload:", props.engine.state);
    alert("Schedule Published Successfully! (Check Console for Payload)");
  } else {
    console.log("Validation Errors:", result.errors);
    alert("Please fix errors before publishing:\n" + result.errors.map(e => "- " + e.message).join("\n"));
  }
};
</script>

<template>
  <div class="flex flex-col gap-6 relative px-6">
    <div class="flex items-center gap-2 cursor-pointer px-2" @click="goToBack">
      <img src="https://i.ibb.co/CsWd11xX/Icon-2.png" alt="" />
      <div class="text-[12px] font-medium">Back</div>
    </div>


    <BookingSectionsWrapper title="Additional Request" leftIcon="https://i.ibb.co/39kq5wcX/Icon-3.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png" :is-open="sectionsState.additionalRequest"
      @toggle="toggleSection('additionalRequest')">
      <div v-show="sectionsState.additionalRequest" class="inline-flex flex-col gap-5 w-full mt-5">
        <div class="flex flex-col justify-center items-start gap-1">
          <div class="flex gap-2">
            <CheckboxGroup v-model="formData.allowRecording" label="Allow fan record the session"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[2px] leading-normal"
              wrapperClass="flex items-center gap-2 mb-3" />
            <div class="mt-[2px]">
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
          </div>
          <div class="inline-flex gap-2">
            <div class="w-6" />
            <div class="opacity-50 inline-flex flex-col">
              <div class="inline-flex justify-end items-center gap-2">
                <BaseInput type="number" placeholder="15" v-model="formData.recordingPrice"
                  :disabled="!formData.allowRecording"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                <div class="justify-center text-slate-700 text-base font-normal leading-normal">
                  Tokens
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-start gap-3">
          <div class="flex flex-col justify-center items-start gap-1">
            <div class="flex gap-2">
              <CheckboxGroup v-model="formData.allowPersonalRequest" label="Allow personal request"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[2px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3" />
              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>
            <div class="h-10 inline-flex justify-start items-center gap-2">
              <div class="w-6" />
              <div class="flex-1 inline-flex flex-col">
                <div class="inline-flex justify-end items-center gap-2">
                  <div class="flex-1 justify-center text-slate-700 text-base font-normal leading-normal">
                    Let user add personal request in their booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="justify-start text-gray-900 text-base font-normal leading-normal">
            Customise your event with add-on service like offer to wear
            different outfits and do different actions in the call.
          </div>

          <ButtonComponent text="add-on service" variant="none"
            customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1
        text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight hover:text-black hover:bg-[#07F468]"
            :leftIcon="'https://i.ibb.co.com/RpWmJkcb/plus.webp'" :leftIconClass="`
        w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]
        rounded-sm  outline outline-[1.50px] outline-offset-[-0.75px] `" />
        </div>
      </div>
    </BookingSectionsWrapper>

    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <BookingSectionsWrapper title="Audience Settings" leftIcon="https://i.ibb.co/5hNw0yjJ/Icon.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png" :is-open="sectionsState.audienceSettings"
      @toggle="toggleSection('audienceSettings')">
      <div v-show="sectionsState.audienceSettings" class="flex flex-col gap-5 mt-5">
        <div class="flex flex-col gap-1.5">
          <div class="flex flex-col gap-1.5">
            <div class="justify-start text-slate-700 text-base font-normal leading-normal">
              Who can book a call?
            </div>
            <div
              class="bg-white/75 px-4 py-2 w-full rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex">
              Todo
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-2">
            <div class="inline-flex justify-start items-center gap-1">
              <div class="text-slate-700 text-base font-normal leading-normal">
                Spending requirement
              </div>
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
            <div
              class="w-full bg-white/75 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300">
              Todo
            </div>
          </div>
          <ButtonComponent text="add-on service" variant="none"
            customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1
        text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight hover:text-black hover:bg-[#07F468]"
            :leftIcon="'https://i.ibb.co/bRYvsTVs/Icon.png'" :leftIconClass="`
        w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]
       `" />
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex flex-col gap-1.5">
            <div class="justify-start text-slate-700 text-base font-normal leading-normal">
              Blocked user
            </div>
            <div class="w-full">
              <InputComponentDashbaord id="input_b" placeholder="Search by username & email"
                v-model="formData.blockedUserSearch" label-text="Co-performer (Optional)"
                :left-icon="MagnifyingGlassIcon" optionalLabel class="w-full" />
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <BookingSectionsWrapper title="Co-performer" leftIcon="https://i.ibb.co/cKdNTc43/Icon-1.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png" :is-open="sectionsState.coPerformer"
      @toggle="toggleSection('coPerformer')">
      <div v-show="sectionsState.coPerformer" class="w-full mt-3">
        <InputComponentDashbaord id="input_b" placeholder="Search by username & email"
          v-model="formData.coPerformerSearch" label-text="Co-performer (Optional)" :left-icon="MagnifyingGlassIcon"
          optionalLabel class="w-full" />
      </div>
    </BookingSectionsWrapper>

    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <BookingSectionsWrapper title="X Repost Settings" leftIcon="https://i.ibb.co/7t7vR7n8/Vector.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png" :is-open="sectionsState.xRepost"
      @toggle="toggleSection('xRepost')">
      <div v-show="sectionsState.xRepost" class="flex flex-col gap-5 mt-5">

        <div class="inline-flex gap-2 justify-between">
          <CheckboxSwitch v-model="formData.xPostLive" label="Post to X when my booking schedule is live"
            version="dashboard" wrapper-label="Dark Mode" />
          <div class="flex justify-end">
            <img class="w-4 h-5 mr-[4px]" src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
          </div>
        </div>

        <div class="inline-flex gap-2  justify-between">
          <CheckboxSwitch v-model="formData.xPostBooked" label="Post to X when a booking is received"
            version="dashboard" wrapper-label="Dark Mode" />
          <div class="flex justify-end">
            <img class="w-4 h-5 mr-[4px]" src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
          </div>
        </div>

        <div class="inline-flex gap-2 justify-between">
          <CheckboxSwitch v-model="formData.xPostInSession" label="Post to X when I am in a session" version="dashboard"
            wrapper-label="Dark Mode" />
          <div class="flex justify-end">
            <img class="w-4 h-5 mr-[4px]" src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
          </div>
        </div>

        <div class="inline-flex gap-2 justify-between">
          <CheckboxSwitch v-model="formData.xPostTipped" label="Post to X when I am tipped in a session"
            version="dashboard" wrapper-label="Dark Mode" />
          <div class="flex justify-end">
            <img class="w-4 h-5 mr-[4px]" src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
          </div>
        </div>

        <div class="inline-flex gap-2 justify-between w-full">
          <CheckboxSwitch v-model="formData.xPostPurchase" label="Post to X when someone made a purchase in a session"
            version="dashboard" wrapper-label="Dark Mode" />
          <div class="flex justify-end">
            <img class="w-4 h-5 mr-[4px]" src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <div class="w-full bg-[#D0D5DD] h-[1px] mb-[80px]"></div>

  </div>
  <div class="absolute right-0 bottom-0">
    <ButtonComponent @click="publishSchedule" text="PUBLISH SCHEDULE" variant="polygonLeft"
      :leftIcon="'https://i.ibb.co/S74jfvBw/Icon-1.png'" :leftIconClass="`
        w-6 h-6 transition duration-200
        filter brightness-0
        group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
      `" />
  </div>
</template>
