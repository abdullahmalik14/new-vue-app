<template>
  <div class="relative md:py-[16px] md:px-[10px] lg:px-[24px]">
    
    <div
      @click="uploader.goToStep(4, { intent: 'user' })"
      class="flex gap-2 items-center cursor-pointer py-[16px]"
    >
      <img src="/images/backIcon.png" alt="" srcset="" />
      <button class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
        Back
      </button>
    </div>

    <div class="mb-[50px]">
      <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic py-[8px]">
        By clicking the boxes below, I certify and confirm that:
      </h4>

      <div class="flex flex-col gap-[20px]">
        
        <CheckboxGroup
          v-model="term1"
          label="All individuals appearing in the piece of content I am presently uploading on Fansocial (the Content):"
          checkboxClass="appearance-none flex-shrink-0 mt-[1px] bg-white border border-gray-300 rounded-[4px] w-2 h-3 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
          labelClass="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
          wrapperClass="flex"
        />

        <ul class="pl-2 list-none text-[12px] sm:text-[14px] font-normal leading-5 text-dark-text">
          <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-[#0d1320] before:absolute before:left-[0.188rem] before:top-[0.438rem]">
            consent to appear in the Content.
          </li>
          <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-[#0d1320] before:absolute before:left-[0.188rem] before:top-[0.438rem]">
            agree for this Content to be uploaded.
          </li>
          <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-[#0d1320] before:absolute before:left-[0.188rem] before:top-[0.438rem]">
            were at least 18 years of age at the time the Content was produced, or the age of majority in the jurisdiction or country where Content was produced.
          </li>
        </ul>

        <CheckboxGroup
          v-model="term2"
          label="I have verified, preserved and currently hold all identification cards and documents required under Record Keeping Requirements, 18 U.S.C. 2257 and 28 C.F.R. 75, or applicable laws in any other jurisdictions, countries, and territories (“2257 documentation”), for all individuals appearing in the Content."
          checkboxClass="appearance-none mt-[1px] bg-white border border-gray-300 rounded-[4px] w-4 h-3 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
          labelClass="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
          wrapperClass="flex gap-2"
        />
        
        <CheckboxGroup
          v-model="term3"
          label="I have verified, preserved and currently hold all identification cards and documents required under Record Keeping Requirements, 18 U.S.C. 2257 and 28 C.F.R. 75, or applicable laws in any other jurisdictions, countries, and territories (“2257 documentation”), for all individuals appearing in the Content."
          checkboxClass="appearance-none mt-[1px] bg-white border border-gray-300 rounded-[4px] w-4 h-3 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
          labelClass="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
          wrapperClass="flex gap-2"
        />
        
        <CheckboxGroup
          v-model="term4"
          label="The Content does not violate Fansocial’s Terms of Service, and any of its related policies namely but without limitation, its Child Sexual Abuse Material Policy, or Anti-Sexual Exploitation Policies, all of which I have read and expressly agree to."
          checkboxClass="appearance-none mt-[1px] bg-white border border-gray-300 rounded-[4px] w-4 h-3 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
          labelClass="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
          wrapperClass="flex gap-2"
        />

        <CheckboxGroup
          v-model="term5"
          label="The Content does not violate Fansocial’s Terms of Service, and any of its related policies namely but without limitation, its Child Sexual Abuse Material Policy, or Anti-Sexual Exploitation Policies, all of which I have read and expressly agree to."
          checkboxClass="appearance-none mt-[1px] bg-white border border-gray-300 rounded-[4px] w-4 h-3 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
          labelClass="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
          wrapperClass="flex gap-2"
        />

        <NotificationCard
          variant="warning"
          :icon="ExclamationTriangleIcon"
          description="WARNING: Uploading (or attempting to upload) content that violates any laws or criminal laws (ex: child pornography or non-consensual content), our Child Sexual Abuse Material Policy or Anti-Sexual Exploitation Policies, will result in related accounts to be immediately terminated and reported to law enforcement authorities."
        />

      </div>
    </div>


    <div
      class="flex justify-end md:mt-0 mt-4"
      @click="handleSubmit"
    >
      <ButtonComponent
        text="SUBMIT MEDIA FOR APPROVAL"
        variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'"
        btnBg="#07f468"
        btnHoverBg="black"
        btnText="black"
        btnHoverText="#07f468"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ButtonComponent from "@/components/dev/button/ButtonComponent.vue";
import NotificationCard from "@/components/dev/card/notification/NotificationCard.vue";
import CheckboxGroup from "@/components/ui/form/checkbox/CheckboxGroup.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
  uploader: {
    type: Object,
    required: true
  }
});

// ===========================================
// STATE CONNECTIONS (Terms & Conditions)
// ===========================================

// Term 1
const term1 = computed({
  get: () => props.uploader.state.termsCheckbox1 || false,
  set: (val) => props.uploader.setState("termsCheckbox1", val, { reason: "user:agree1" })
});

// Term 2
const term2 = computed({
  get: () => props.uploader.state.termsCheckbox2 || false,
  set: (val) => props.uploader.setState("termsCheckbox2", val, { reason: "user:agree2" })
});

// Term 3
const term3 = computed({
  get: () => props.uploader.state.termsCheckbox3 || false,
  set: (val) => props.uploader.setState("termsCheckbox3", val, { reason: "user:agree3" })
});

// Term 4
const term4 = computed({
  get: () => props.uploader.state.termsCheckbox4 || false,
  set: (val) => props.uploader.setState("termsCheckbox4", val, { reason: "user:agree4" })
});

// Term 5
const term5 = computed({
  get: () => props.uploader.state.termsCheckbox5 || false,
  set: (val) => props.uploader.setState("termsCheckbox5", val, { reason: "user:agree5" })
});

// ===========================================
// SUBMIT LOGIC
// ===========================================

function handleSubmit() {
  const { termsCheckbox1, termsCheckbox2, termsCheckbox3, termsCheckbox4, termsCheckbox5 } = props.uploader.state;
  
  if (!termsCheckbox1 || !termsCheckbox2 || !termsCheckbox3 || !termsCheckbox4 || !termsCheckbox5) {
    alert("Please accept all terms and conditions before submitting.");
    return;
  }

  console.log("🚀 FINAL PAYLOAD:", JSON.parse(JSON.stringify(props.uploader.state)));
  alert("Media Submitted Successfully! Check Console for JSON.");
  
}
</script>