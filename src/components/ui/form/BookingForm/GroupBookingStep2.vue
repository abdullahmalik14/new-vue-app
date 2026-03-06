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
  spendingRequirement: props.engine.state.spendingRequirement || "",
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
    console.log("Group Form Valid! Payload:", props.engine.state);
    alert("Group Schedule Published! (Check Console for Payload)");
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

    <BookingSectionsWrapper title="Audience Settings" leftIcon="https://i.ibb.co/5hNw0yjJ/Icon.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png" :is-open="sectionsState.audienceSettings"
      @toggle="toggleSection('audienceSettings')">
      <div v-show="sectionsState.audienceSettings" class="flex flex-col gap-5 mt-5">
        <div class="flex flex-col gap-1.5">
          <div class="flex flex-col gap-1.5">
            <div class="justify-start text-slate-700 text-base font-normal leading-normal">
              Who can join this event?
            </div>
            <div
              class="bg-white/75 px-4 py-2 w-full rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex">
              Todo
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-3">

            <div class="inline-flex justify-start items-center gap-1">
              <div class="text-slate-700 text-base font-normal leading-normal">
                Spending requirement
              </div>
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>

            <div class="flex gap-[2px] items-center">
              <div
                class="border border-blue-600 w-3.5 h-3.5 rounded-sm text-xs flex justify-center items-center text-blue-600">
                +
              </div>
              <div class="text-blue-600 text-sm font-medium">
                Add
              </div>
            </div>

          </div>

        </div>


        <div class="flex flex-col gap-1.5">
          <div class="flex flex-col gap-1.5">
            <div class="justify-start text-slate-700 text-base font-normal leading-normal">
              Blocked user
            </div>
            <div class="w-full">
              <InputComponentDashbaord id="input_b" placeholder="Search by username & email"
                v-model="formData.blockedUserSearch" label-text="Blocked user" :left-icon="MagnifyingGlassIcon"
                optionalLabel class="w-full" />
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <BookingSectionsWrapper title="Collaborator" leftIcon="https://i.ibb.co/cKdNTc43/Icon-1.png"
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

        <div class="inline-flex gap-2 justify-between">
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


        <div class="inline-flex gap-2 justify-between">
          <CheckboxSwitch v-model="formData.xPostPurchase" label="Post to X when someone made a purchase in a session"
            version="dashboard" wrapper-label="Dark Mode" />
          <div class="flex justify-end">
            <img class="w-4 h-5 mr-[4px]" src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <div class="w-full bg-[#D0D5DD] h-[1px] mb-[80px]"></div>

    <div class="absolute right-0 bottom-0">
      <ButtonComponent @click="publishSchedule" text="PUBLISH SCHEDULE" variant="polygonLeft"
        :leftIcon="'https://i.ibb.co/S74jfvBw/Icon-1.png'" :leftIconClass="`
          w-6 h-6 transition duration-200
          filter brightness-0
          group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
        `" />
    </div>
  </div>
</template>
