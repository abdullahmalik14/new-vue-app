  <script setup>
  import { onMounted, ref, watch } from "vue";
  import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
  import ButtonComponent from "@/components/button/ButtonComponent.vue";
  import BookingSectionsWrapper from "../BookingForm/HelperComponents/BookingSectionsWrapper.vue";
  import BaseInput from "@/components/input/BaseInput.vue";
  import QuillEditor from "@/components/input/QuillEditor.vue";

  // Accept Engine
  const props = defineProps(['engine']);

  // Data
  const formData = ref({
    eventTitle: props.engine.state.eventTitle || "",
    eventDescription: props.engine.state.eventDescription || "",
    basePrice: props.engine.state.basePrice || "",
    enableLongerDiscount: props.engine.state.enableLongerDiscount || false,
    discountEventsCount: props.engine.state.discountEventsCount || "",
    discountPercentage: props.engine.state.discountPercentage || "",
    enableCancellationFee: props.engine.state.enableCancellationFee || false,
    cancellationFee: props.engine.state.cancellationFee || "",
    allowAdvanceCancellation: props.engine.state.allowAdvanceCancellation || false,
    advanceVoid: props.engine.state.advanceVoid || "",
    setMaxUsers: props.engine.state.setMaxUsers || false,
    maxUsers: props.engine.state.maxUsers || "",
    setReminders: props.engine.state.setReminders || false,
    remindMeTime: props.engine.state.remindMeTime || "",
    allowWaitlist: props.engine.state.allowWaitlist || false,
    waitlistSpots: props.engine.state.waitlistSpots || ""
  });

  watch(formData, (newVal) => {
    Object.keys(newVal).forEach(key => {
      props.engine.setState(key, newVal[key], { silent: true });
    });
  }, { deep: true });



  // Accordion State
  const sectionsState = ref({
    callSettings: true,
    bookingSettings: true
  });

  const toggleSection = (key) => {
    sectionsState.value[key] = !sectionsState.value[key];
  };

  const goToNext = () => {
    props.engine.goToStep(2);
  };


</script>

  <template>
    <form class="flex flex-col gap-6 relative px-6">

      <div class="  inline-flex justify-start items-start gap-4">
        <div class="w-6 h-6 relative overflow-hidden">
          <svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 5H1M18 1H1M18 9H1M14 13H1" stroke="#344054" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
        <div class="flex-1 inline-flex flex-col justify-start items-start gap-4">
          <div class="flex w-full">
            <div class="flex-1">
              <BaseInput type="text" placeholder="Event Title" v-model="formData.eventTitle" wrapperClass="w-full"
                inputClass="px-3.5 text-gray-500 text-gray-500 w-full text-base font-normal outline-none py-2.5 bg-white/30 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300" />
            </div>
            <div
              class="h-[45px] bg-white/50 border-l text-sm px-2 inline-flex flex-col justify-center items-center gap-1.5 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300">
              Todo</div>
          </div>
          <QuillEditor v-model="formData.eventDescription" placeholder="Event Description..." />
          <div class="flex flex-col gap-1.5 w-full">
            <div class="flex flex-col gap-1.5">
              <div class="text-slate-700 text-xs font-normal leading-none">Call Type</div>
              <div
                class=" bg-white/50 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                Todo</div>
            </div>
          </div>
          <div class="flex w-full gap-3">
            <div class="w-full flex flex-col justify-start items-start gap-1.5">
              <div class="w-full flex flex-col justify-start items-start gap-1.5">
                <div class="w-full bg-white/75 px-4 py-2 rounded-tl-sm rounded-tr-sm 
                  shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex 
                  justify-start items-start">Todo</div>
              </div>
            </div>
            <div class="flex justify-start items-center gap-1">
              <img src="https://i.ibb.co/9kQ5CDty/Icon.png" alt="" />
              <div class="justify-start text-slate-700 text-sm font-medium leading-tight">Preview</div>
            </div>
          </div>
        </div>
      </div>

      <BookingSectionsWrapper title="Event Date and time" leftIcon="https://i.ibb.co/Ldw310vp/Icon.png">
        <div class="flex flex-col gap-3 w-full mt-3">
          <div class=" text-gray-900 text-xs font-normal  leading-none">
            GMT +8 Hong Kong Standard time
          </div>

          <div
            class=" bg-white/50 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
            Todo</div>

          <div class="flex flex-col w-full gap-[6px]">
            <div class="w-full flex items-center">

              <div class="flex flex-col gap-[6px] w-full">
                <div class="text-gray-500 text-sm font-medium">Start date</div>
                <div
                  class="px-3 py-2 w-full bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300  gap-2">
                  <div class="flex gap-2 items-center">
                    <img class="w-3.5 h-4" src="https://i.ibb.co/ntP5c3B/Icon-1.png" alt="" />
                    <div
                      class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal">
                      Tue, August 24, 2025
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-[6px] w-full">
                <div class="text-gray-500 text-sm font-medium">End date <span
                    class="text-gray-500 text-sm font-medium italic">Optional</span></div>
                <div
                  class="px-3 py-2 w-full bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300  gap-2">
                  <div class="flex w-full gap-2 items-center">
                    <img class="w-3.5 h-4" src="https://i.ibb.co/ntP5c3B/Icon-1.png" alt="" />
                    <div
                      class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal">
                      To
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div class="text-slate-600 text-sm font-normal"> Your event will repeat on Tuesday weekly.</div>
          </div>

          <div class="flex flex-col gap-[6px]">
            <div class="text-gray-500 font-medium text-sm">Event time</div>
            <div class="flex w-full gap-[6px] items-center">
              <div
                class=" bg-white/50 w-full px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                Todo</div>
              <span> - </span>
              <div
                class=" bg-white/50 w-full px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                Todo</div>
            </div>

          </div>

        </div>

      </BookingSectionsWrapper>


      <BookingSectionsWrapper title="Pricing Settings" leftIcon="https://i.ibb.co/nNmmvwnf/Icon-1.png"
        leftIconClass="mt-[4px]">
        <div class="inline-flex flex-col gap-5 mt-4">
          <div class="flex flex-col justify-start items-start gap-1.5">
            <div class=" bg-white/50 px-4 py-2 rounded-tl-sm rounded-tr-sm 
        shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex 
        w-full">Todo</div>

            <div class="flex items-center gap-2">
              <BaseInput type="number" placeholder="15" v-model="formData.basePrice"
                inputClass="bg-white/50 w-44 px-3 placeholder:text-black py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300" />
              <div class="flex gap-2 items-center">
                <span class="text-black text-base font-medium font-['Poppins'] leading-normal">Tokens </span>

              </div>
            </div>
          </div>

          <div class=" flex flex-col justify-center items-start gap-3">
            <CheckboxGroup v-model="formData.enableLongerDiscount"
              label="Enable discount price for when user pay for recurring events"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] leading-normal" wrapperClass="flex gap-2" />


            <div class=" inline-flex justify-start items-start gap-2">
              <div class="w-6 h-6" />
              <div class="inline-flex flex-col justify-start items-start gap-2">
                <div class="opacity-50 inline-flex justify-end items-center gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.discountEventsCount"
                    :disabled="!formData.enableLongerDiscount"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />

                  <div class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal">
                    events
                  </div>

                </div>


                <div class="opacity-50 inline-flex justify-end items-center gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.discountPercentage"
                    :disabled="!formData.enableLongerDiscount"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />

                  <div class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal">
                    % off base price
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class=" flex flex-col justify-center items-start">
            <div class="flex gap-2">
              <CheckboxGroup v-model="formData.enableCancellationFee" label="Enable cancellation fee"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2" />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>

            <div class="inline-flex justify-start items-start gap-2">
              <div class="w-6 h-10" />
              <div class="inline-flex flex-col justify-center items-start gap-2 ">
                <div class="opacity-50 inline-flex justify-start items-center gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.cancellationFee"
                    :disabled="!formData.enableCancellationFee"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                  <div class="w-14 justify-start text-slate-700 text-base font-medium font-['Poppins'] leading-normal">
                    Tokens
                  </div>
                </div>
                <CheckboxGroup v-model="formData.allowAdvanceCancellation"
                  label="User can cancel in advance to void minimum charge"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 text-[16px] leading-normal" wrapperClass="flex gap-2 opacity-50" />
                <div class="flex items-center opacity-50 gap-2 w-full">
                  <BaseInput type="number" placeholder="15" v-model="formData.advanceVoid"
                    :disabled="!formData.allowAdvanceCancellation"
                    inputClass="bg-white/50 w-36 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </BookingSectionsWrapper>


      <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

      <BookingSectionsWrapper title=" Booking Settings" leftIcon="https://i.ibb.co/nNmmvwnf/Icon-1.png"
        accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png" :is-open="sectionsState.bookingSettings"
        @toggle="toggleSection('bookingSettings')">
        <div v-show="sectionsState.bookingSettings" class="flex flex-col justify-start items-start gap-5 mt-5">

          <div class="flex flex-col gap-3">

            <div class="flex gap-2">
              <CheckboxGroup v-model="formData.setMaxUsers" label="Set maximum users "
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2" />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>
            <div class="flex gap-2 opacity-50">
              <div class="w-6 h-10" />
              <div
                class="bg-white/50 w-44 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex">
                <input v-model="formData.maxUsers" type="number" placeholder="100" :disabled="!formData.setMaxUsers"
                  class="bg-transparent outline-none w-full text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            </div>

          </div>

          <div class=" flex flex-col  gap-3">
            <div class=" flex flex-col justify-center items-start gap-1">
              <div class="flex gap-2">
                <CheckboxGroup v-model="formData.setReminders" label="Set scheduled call reminder"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                  wrapperClass="flex items-center gap-2" />

                <div class="mt-[2px]">
                  <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
                </div>
              </div>
              <div class="flex gap-2">
                <div class="w-6 h-10" />
                <div class="w-full flex flex-col justify-start items-start opacity-50 ">
                  <div class=" inline-flex justify-end items-center gap-2">
                    <div class="justify-center text-slate-700 text-base font-normal leading-normal">Remind me</div>
                    <BaseInput type="number" placeholder="15" v-model="formData.remindMeTime"
                      :disabled="!formData.setReminders"
                      inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                    <div class="flex-1 justify-center text-slate-700 text-base font-normal leading-normal">minutes
                      before a</div>
                  </div>
                  <div class="inline-flex justify-end items-center gap-2">
                    <div class="justify-center text-slate-700 text-base font-normal leading-normal">scheduled call.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div class="flex flex-col  gap-3">
            <div class=" flex flex-col justify-center items-start gap-1">
              <div class="flex gap-2 items-center">
                <CheckboxGroup v-model="formData.allowWaitlist"
                  label="If booking slots are full, allow fans to join waitlist"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                  wrapperClass="flex items-center gap-2" />
                <div class="mt-[2px]">
                  <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
                </div>
              </div>
              <div class=" inline-flex justify-start items-start gap-2">
                <div class="w-6 h-10" />
                <div class="opacity-50 inline-flex flex-col justify-start items-start">
                  <div class="inline-flex justify-end items-center gap-2">
                    <BaseInput type="number" placeholder="15" v-model="formData.waitlistSpots"
                      :disabled="!formData.allowWaitlist"
                      inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                    <div class="justify-center text-slate-700 text-base font-normal leading-normal">waitlist spots</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BookingSectionsWrapper>

    </form>

    <div class="flex items-center pl-6">
      <div class="w-full bg-[#D0D5DD] h-[1px]"></div>
      <div class="flex justify-end">
        <ButtonComponent @click="goToNext" text="Next" variant="polygonLeft"
          :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" :rightIconClass="`
              w-6 h-6 transition duration-200
              filter brightness-0 invert-0   /* Default: black */
              group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
            `" btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468" />
      </div>
    </div>
  </template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1 !important;
  visibility: visible !important;
  -webkit-appearance: inner-spin-button !important;
}
</style>