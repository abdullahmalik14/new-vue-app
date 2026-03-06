  <script setup>
  import { onMounted, ref, watch } from "vue";
  import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
  import ButtonComponent from "@/components/button/ButtonComponent.vue";
  import BookingSectionsWrapper from "@/components/ui/form/BookingForm/HelperComponents/BookingSectionsWrapper.vue";
  import BaseInput from "@/components/input/BaseInput.vue";
  import ThumbnailUploader from "@/components/ui/global/media/uploader/HelperComponents/ThumbnailUploader.vue";
  import QuillEditor from "@/components/input/QuillEditor.vue";
  import NotificationCard from "@/components/ui/card/dashboard/NotificationCard.vue";
  import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";

  // Accept Engine
  const props = defineProps(['engine']);

  // Refs
  const showTitleError = ref(false);
  const titleErrorMessage = ref('');
  // Refs
  // Initialize from engine state (deep copy to avoid reactivity issues with v-model on props)
  const formData = ref({
    eventTitle: props.engine.state.eventTitle || "",
    eventDescription: props.engine.state.eventDescription || "",
    duration: props.engine.state.duration || "",
    maxSessionDuration: props.engine.state.maxSessionDuration || "",
    basePrice: props.engine.state.basePrice || "",
    sessionMinimum: props.engine.state.sessionMinimum || "",
    discountPercentage: props.engine.state.discountPercentage || "",
    bookingFee: props.engine.state.bookingFee || "",
    waitlistSpots: props.engine.state.waitlistSpots || "",
    advanceVoid: props.engine.state.advanceVoid || "",
    offHourSurcharge: props.engine.state.offHourSurcharge || "",
    calendarDuration: props.engine.state.calendarDuration || "",
    remindMeTime: props.engine.state.remindMeTime || "",
    bufferTime: props.engine.state.bufferTime || "",
    maxBookingsPerDay: props.engine.state.maxBookingsPerDay || "",
    waitlistSlots: props.engine.state.waitlistSlots || "",
    rescheduleFee: props.engine.state.rescheduleFee || "",
    cancellationFee: props.engine.state.cancellationFee || "",
    extendSessionMax: props.engine.state.extendSessionMax || "",
    allowLongerSessions: props.engine.state.allowLongerSessions || false,
    enableLongerDiscount: props.engine.state.enableLongerDiscount || false,
    enableBookingFee: props.engine.state.enableBookingFee || false,
    allowInstantBooking: props.engine.state.allowInstantBooking || false,
    disableChatBeforeCall: props.engine.state.disableChatBeforeCall || false,
    enableRescheduleFee: props.engine.state.enableRescheduleFee || false,
    enableCancellationFee: props.engine.state.enableCancellationFee || false,
    allowAdvanceCancellation: props.engine.state.allowAdvanceCancellation || false,
    addOffHourSurcharge: props.engine.state.addOffHourSurcharge || false,
    disableChatDuringCall: props.engine.state.disableChatDuringCall || false,
    requestExtendSession: props.engine.state.requestExtendSession || false,
    setBufferTime: props.engine.state.setBufferTime || false,
    setMaxBookings: props.engine.state.setMaxBookings || false,
    allowWaitlist: props.engine.state.allowWaitlist || false
  });

  // Watch for changes and update engine state
  // Watch for changes and update engine state
  const eventTitleConfig = {
    scope: 'oneOnOneBooking',
    id: 'eventTitle',
    validation: {
      required: true,
      requiredMessage: "Event Title is required."
    }
  };

  watch(formData, (newVal) => {
    Object.keys(newVal).forEach(key => {
      props.engine.setState(key, newVal[key], { silent: true });
    });
  }, { deep: true });

  onMounted(() => {
    // BaseInput wrapper gets the ID, we need to pass the actual <input> child 
    // to interactionsEngine for setCustomValidity and reportValidity to work.
    const wrapper = document.getElementById('eventTitle');
    const titleElement = wrapper ? wrapper.querySelector('input') : null;

    console.log("[DEBUG] Registering eventTitle:", { wrapper, titleElement });
    interactionsEngine.register(eventTitleConfig, formData.value.eventTitle, titleElement);
  });


  // Accordion State
  const sectionsState = ref({
    callSettings: true,
    bookingSettings: true
  });

  const toggleSection = (key) => {
    sectionsState.value[key] = !sectionsState.value[key];
  };

  const goToNext = async () => {
    // 1. Run interactionsEngine validation to trigger UI side-effects
    const interactionValidation = await interactionsEngine.validateScope('oneOnOneBooking');

    if (interactionValidation && !interactionValidation.isValid) {
      // Instead of browser default error, let's use the UI NotificationCard
      titleErrorMessage.value = "Event Title is required.";
      showTitleError.value = true;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        showTitleError.value = false;
      }, 5000);

      const wrapper = document.getElementById('eventTitle');
      if (wrapper) {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return; // Stop here if UI validation fails
    }

    // 2. Clear error if valid
    showTitleError.value = false;
    // 3. Let stateEngine handle the step transition
    props.engine.goToStep(2);
  };



  // Configuration for each day row
  const weekDays = ref([
    {
      name: 'Sun',
      unavailable: true,
      icons: ['https://i.ibb.co/7J7qwz6H/Icon-3.png']
    },
    {
      name: 'Mon',
      slots: [1], // 1 Slot
      icons: ['https://i.ibb.co/3yZjgcNV/Icon.png', 'https://i.ibb.co/7J7qwz6H/Icon-3.png', 'https://i.ibb.co/xqh8KkBk/Icon-1.png']
    },
    {
      name: 'Tue',
      slots: [1, 2], // 3 Slots (Tuesday wapis 3 rows mein ayega)
      icons: ['https://i.ibb.co/3yZjgcNV/Icon.png', 'https://i.ibb.co/7J7qwz6H/Icon-3.png', 'https://i.ibb.co/xqh8KkBk/Icon-1.png']
    },
    {
      name: 'Wed',
      slots: [1],
      icons: ['https://i.ibb.co/3yZjgcNV/Icon.png', 'https://i.ibb.co/7J7qwz6H/Icon-3.png', 'https://i.ibb.co/xqh8KkBk/Icon-1.png']
    },
    {
      name: 'Thu',
      slots: [1],
      icons: ['https://i.ibb.co/3yZjgcNV/Icon.png', 'https://i.ibb.co/7J7qwz6H/Icon-3.png', 'https://i.ibb.co/xqh8KkBk/Icon-1.png']
    },
    {
      name: 'Fri',
      slots: [1],
      icons: ['https://i.ibb.co/3yZjgcNV/Icon.png', 'https://i.ibb.co/7J7qwz6H/Icon-3.png', 'https://i.ibb.co/TqB49zLj/cloud-moon.png']
    },
    {
      name: 'Sat',
      slots: [1],
      icons: ['https://i.ibb.co/3yZjgcNV/Icon.png', 'https://i.ibb.co/7J7qwz6H/Icon-3.png', 'https://i.ibb.co/TqB49zLj/cloud-moon.png']
    }
  ]);

  // Helper to get tooltip text based on Icon Index (0, 1, 2)
  const getTooltipText = (index) => {
    if (index === 0) return "Remove availability";
    if (index === 1) return "Add another period to this day";
    if (index === 2) return "Mark as off hours";
    return "";
  };
</script>

  <template>
    <form class="flex flex-col gap-6 relative px-6">

      <!-- Validation Error Notification -->
      <NotificationCard v-model="showTitleError" variant="error" :title="'Validation Error'"
        :description="titleErrorMessage" class="mb-4" />

      <div class=" self-stretch inline-flex justify-start items-start gap-4">
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
                id="eventTitle" name="eventTitle"
                @input="interactionsEngine.processFieldChange(eventTitleConfig, $event.target.value)" :inputClass="[
                  'px-3.5 w-full text-base font-normal outline-none py-2.5 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b transition-colors',
                  interactionsEngine.getFieldState(eventTitleConfig) && !interactionsEngine.getFieldState(eventTitleConfig).isValid
                    ? 'border-red-500 bg-red-50/50 text-red-900'
                    : 'text-gray-900 bg-white/30 border-gray-300'
                ].join(' ')" />
            </div>
            <div
              class=" bg-white/50 border-l text-sm px-2 inline-flex flex-col justify-center items-center gap-1.5 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300">
              Todo</div>
          </div>
          <QuillEditor v-model="formData.eventDescription" placeholder="Event Description..." />
          <div class="flex flex-col gap-1.5 w-full">
            <div class="flex flex-col gap-1.5">
              <div class="text-slate-700 text-xs font-normal leading-none">Call Type</div>
              <div
                class="self-stretch bg-white/50 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                Todo</div>
            </div>
          </div>
          <div class="flex w-full gap-3">
            <div class="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
              <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div class="self-stretch bg-white/75 px-4 py-2 rounded-tl-sm rounded-tr-sm 
                  shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex 
                  justify-start items-start">Todo</div>
              </div>
            </div>
            <div class="flex justify-start items-center gap-1">
              <img src="https://i.ibb.co/9kQ5CDty/Icon.png" alt="" />
              <div class="justify-start text-slate-700 text-sm font-medium leading-tight">Preview</div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div class=""><span class="text-slate-700 text-xs font-normal leading-none">Event Image </span><span
                class="text-gray-500 text-xs italic font-normal leading-none">Optional</span></div>
            <div class="w-full">
              <ThumbnailUploader subtitle="or drag and drop" fileInfo="SVG, PNG, JPG or GIF (max. 800x400px)" />
            </div>
          </div>
        </div>
      </div>

      <BookingSectionsWrapper title="Session Duration" leftIcon="https://i.ibb.co/cSjDYSdk/Icon.png">
        <div class='flex flex-col gap-[30px]'>
          <div class="flex items-center gap-2 mt-3 ">
            <BaseInput type="number" placeholder="15" v-model="formData.duration"
              inputClass="px-3.5 text-gray-900 placeholder:text-gray-900 w-full text-base font-normal outline-none py-2.5 bg-white/30 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300" />
            <div class=" text-black text-base font-medium leading-normal">Minutes</div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-2">
            <CheckboxGroup v-model="formData.allowLongerSessions" label="Allow user to book longer sessions"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal" wrapperClass="flex items-center gap-2" />
            <div class="opacity-50 ml-6">
              <div class="w-full text-gray-500 text-sm font-medium leading-tight">Maximum Session Allowed</div>
              <div class="flex items-center gap-1.5 ">
                <div class="">
                  <BaseInput type="number" placeholder="15" v-model="formData.maxSessionDuration"
                    :disabled="!formData.allowLongerSessions"
                    inputClass="px-3.5 w-44 text-gray-900 placeholder:text-gray-900 text-base font-normal outline-none py-2.5 bg-white/30 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                <div class="flex flex-col">
                  <div class="justify-center text-black text-base font-medium leading-normal">Sessions</div>
                  <div class="justify-center text-black text-xs font-medium leading-none">(15 minutes)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BookingSectionsWrapper>

      <BookingSectionsWrapper title="Pricing Settings" leftIcon="https://i.ibb.co/F47R5CqG/Icon-1.png"
        leftIconClass="mt-[4px]">
        <div class="flex-1 inline-flex flex-col justify-start items-start gap-5 mt-4">
          <div class="flex flex-col justify-start items-start gap-1.5">
            <div class="justify-start text-gray-500 text-sm font-medium font-['Poppins'] leading-tight">
              Base Price
            </div>
            <div class="flex items-center gap-2">
              <BaseInput type="number" placeholder="15" v-model="formData.basePrice"
                inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300" />
              <div class="flex gap-2 items-center">
                <span class="text-black text-base font-medium font-['Poppins'] leading-normal">Tokens </span><span
                  class="text-black text-sm font-normal font-['Poppins'] leading-tight">/session</span>
              </div>
            </div>
          </div>

          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <CheckboxGroup v-model="formData.enableLongerDiscount" label="Enable discount price for longer sessions"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
              wrapperClass="flex items-center gap-2 mb-3" />

            <div class="self-stretch inline-flex justify-start items-start gap-2">
              <div class="w-6 h-6" />
              <div class="inline-flex flex-col justify-start items-start gap-2">
                <div class="opacity-50 inline-flex justify-end items-center gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.sessionMinimum"
                    :disabled="!formData.enableLongerDiscount"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                  <div class="h-10 inline-flex flex-col justify-between items-start">
                    <div class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal">
                      sessions minimum
                    </div>
                    <div class="justify-center text-black text-xs font-medium font-['Poppins'] leading-none">
                      (2 x 15 minutes)
                    </div>
                  </div>
                </div>
                <div class="opacity-50 inline-flex justify-end items-center gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.discountPercentage"
                    :disabled="!formData.enableLongerDiscount"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                  <div class="h-10 inline-flex flex-col justify-between items-start">
                    <div class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal">
                      % off base price
                    </div>
                    <div class="justify-center text-black text-xs font-medium font-['Poppins'] leading-none">
                      (800 tokens/session)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="flex gap-2">
              <CheckboxGroup v-model="formData.enableBookingFee" label="Enable booking fee"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3" />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>

            <div class="inline-flex justify-start items-start gap-2">
              <div class="w-6 h-10" />
              <div class="inline-flex flex-col justify-center items-start gap-2">
                <div class="opacity-50 inline-flex justify-start items-center gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.bookingFee"
                    :disabled="!formData.enableBookingFee"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                  <div class="w-14 justify-start text-black text-base font-medium font-['Poppins'] leading-normal">
                    Tokens
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-2">
              <div class="flex gap-2">
                <CheckboxGroup v-model="formData.allowInstantBooking" label="Allow instant booking"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 mt-[1px] text-[16px] leading-normal"
                  wrapperClass="flex items-center gap-2 mb-3" midImg="https://i.ibb.co/G418dSPz/Icon.png" />

                <div class="mt-[2px]">
                  <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
                </div>
              </div>

              <div class="self-stretch inline-flex justify-start items-start gap-2">
                <div class="w-6 h-6" />
                <div class="flex-1 opacity-50 inline-flex flex-col justify-start items-start gap-2">
                  <div class="self-stretch inline-flex justify-end items-center gap-2">
                    <div
                      class="flex-1 justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal">
                      Approve sessions instantly after bookings.
                    </div>
                  </div>

                  <CheckboxGroup v-model="formData.disableChatBeforeCall" label="Disable chat before call"
                    checkboxClass="m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded bg-transparent relative cursor-pointer checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.2rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45 "
                    labelClass="text-slate-700 text-[16px] leading-normal"
                    wrapperClass="flex items-center gap-2 mb-3 mt-2" />
                </div>
              </div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-1">
              <div class="flex gap-2">
                <CheckboxGroup v-model="formData.enableRescheduleFee" label="Enable reschedule  fee"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                  wrapperClass="flex items-center gap-2 mb-3" />

                <div class="mt-[2px]">
                  <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
                </div>
              </div>

              <div class="self-stretch inline-flex justify-start items-start gap-2">
                <div class="w-6 h-10" />
                <div class="opacity-50 inline-flex flex-col justify-start items-start">
                  <div class="inline-flex justify-end items-center gap-2">
                    <BaseInput type="number" placeholder="15" v-model="formData.rescheduleFee"
                      :disabled="!formData.enableRescheduleFee"
                      inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />

                    <div class="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal">
                      Tokens
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-1">
              <div class="flex gap-2">
                <CheckboxGroup v-model="formData.enableCancellationFee" label="Enable cancellation fee"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                  wrapperClass="flex items-center gap-2 mb-3" />

                <div class="mt-[2px]">
                  <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
                </div>
              </div>
              <div class="self-stretch inline-flex justify-start items-start gap-2">
                <div class="w-6 h-10" />
                <div class="opacity-50 inline-flex flex-col justify-start items-start">
                  <div class="inline-flex justify-end items-center gap-2">
                    <BaseInput type="number" placeholder="15" v-model="formData.cancellationFee"
                      :disabled="!formData.enableCancellationFee"
                      inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                    <div class="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal">
                      Tokens
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="ml-7 opacity-50 flex flex-col justify-start items-start gap-2">
              <CheckboxGroup v-model="formData.allowAdvanceCancellation"
                label="User can cancel in advance to void minimum charge"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3" />
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.advanceVoid"
                    :disabled="!formData.allowAdvanceCancellation"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                <div class="justify-center text-slate-700 text-base font-normal leading-normal">
                  in advance
                </div>
              </div>
            </div>
          </div>
        </div>
      </BookingSectionsWrapper>

      <BookingSectionsWrapper title="Off-hour Surcharge" leftIcon="https://i.ibb.co/k6kzjyCp/Icon-2.png"
        titleIcon="https://i.ibb.co/HD78k3Sf/Icon.png">
        <div class="self-stretch inline-flex justify-start items-center gap-2 mt-5">
          <CheckboxGroup v-model="formData.addOffHourSurcharge" label="Add"
            checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
            labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal" wrapperClass="flex items-center gap-2" />
          <div class="flex-1 opacity-50 inline-flex flex-col justify-start items-start">
            <div class="inline-flex justify-end items-center gap-2">
              <BaseInput type="number" placeholder="15" v-model="formData.offHourSurcharge"
                :disabled="!formData.addOffHourSurcharge"
                inputClass="px-3.5 w-44 text-gray-900 placeholder:text-gray-900 text-base font-normal outline-none py-2.5 bg-white/30 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
              <div class="h-10 inline-flex flex-col justify-between items-start">
                <div class="justify-center text-black text-base font-medium leading-normal">% from base price</div>
                <div class="justify-center text-black text-xs font-medium leading-none">(1,600 tokens/session)</div>
              </div>
            </div>
          </div>
        </div>
      </BookingSectionsWrapper>

      <BookingSectionsWrapper title="Calendar Availability" leftIcon="https://i.ibb.co/Ldw310vp/Icon.png">
        <div class="w-full flex flex-col gap-5 mt-5">
          <div class="flex flex-col gap-3 w-full">
            <div class="self-stretch justify-start text-gray-900 text-xs font-normal font-['Poppins'] leading-none">
              GMT +8 Hong Kong Standard time
            </div>

            <BaseInput type="number" placeholder="15" v-model="formData.calendarDuration"
              inputClass="bg-white/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300" />
            <div class="self-stretch inline-flex justify-start items-end">
              <div class="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div class="justify-start">
                    <span class="text-gray-500 text-sm font-medium font-['Poppins'] leading-tight">Duration </span><span
                      class="text-gray-500 text-xs italic font-normal font-['Poppins'] leading-none">Optional</span>
                  </div>
                  <div
                    class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-center gap-2">
                    <div class="flex-1 flex justify-start items-center gap-2">
                      <img src="https://i.ibb.co/ntP5c3B/Icon-1.png" alt="" />
                      <div
                        class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal">
                        From
                      </div>
                    </div>

                    <div class="w-4 h-4 relative" />
                  </div>
                </div>
              </div>

              <div class="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div
                    class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-center gap-2">
                    <div class="flex-1 flex justify-start items-center gap-2">
                      <img src="https://i.ibb.co/ntP5c3B/Icon-1.png" alt="" />

                      <div
                        class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal">
                        To
                      </div>
                    </div>
                    <div class="w-4 h-4 relative" />
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div class="flex flex-col gap-4 w-full">

            <div v-for="(day, index) in weekDays" :key="index"
              class="self-stretch inline-flex justify-start items-start gap-1"
              :class="{ 'items-center min-h-10 gap-3': day.unavailable }">

              <div class="justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
                :class="day.unavailable ? 'w-12' : 'w-10 h-10 flex items-center justify-center'">
                {{ day.name }}
              </div>

              <template v-if="day.unavailable">
                <div class="flex-1 justify-start text-gray-500 text-base font-normal leading-normal">
                  Not Available
                </div>
                <img v-if="day.icons" :src="day.icons[0]" alt="" class="w-5 h-5 object-contain" />
              </template>

              <template v-else>
                <div class="flex-1 inline-flex flex-col justify-center items-start gap-1">

                  <div v-for="(slot, sIdx) in day.slots" :key="sIdx"
                    class="self-stretch inline-flex justify-start items-center gap-1">

                    <div class="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                      <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
                        <div
                          class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                          <div
                            class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal">
                            Todo
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal">
                      -
                    </div>

                    <div class="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                      <div
                        class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                        <div
                          class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal">
                          Todo
                        </div>
                      </div>
                    </div>

                    <div class="pl-1 flex justify-start items-center gap-2">
                      <div v-for="(icon, iIdx) in day.icons" :key="iIdx"
                        class="group relative flex justify-center items-center cursor-pointer">
                        <img :src="icon" alt="icon" />

                        <div
                          class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center whitespace-nowrap z-50">
                          <div class="bg-zinc-700/90 text-white text-xs font-medium py-1 px-2 rounded shadow-lg">
                            {{ getTooltipText(iIdx) }}
                          </div>
                          <div class="w-2 h-2 bg-slate-700 rotate-45 -mt-1"></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </template>

            </div>
          </div>
        </div>
      </BookingSectionsWrapper>

      <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

      <BookingSectionsWrapper title=" Call Settings" leftIcon="https://i.ibb.co/xq0ZdVmP/Icon.png"
        accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png" :is-open="sectionsState.callSettings"
        @toggle="toggleSection('callSettings')">
        <div v-show="sectionsState.callSettings" class="flex flex-col justify-start items-start gap-5 mt-5">
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-1">
              <div class="self-stretch inline-flex justify-start items-center gap-1">
                <div class="justify-start text-slate-700 text-base font-normal leading-normal">Offer discount if call
                  starts
                  late</div><img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>
            <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
              <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                  <div class="flex-1 justify-start text-gray-900 text-base font-normal leading-normal">Todo</div>
                </div>
              </div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-1">
              <div class="self-stretch justify-start text-slate-700 text-base font-normal leading-normal">Call functions
              </div>
              <CheckboxGroup v-model="formData.disableChatDuringCall" label="Disable chat during call"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3 mt-2" />
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-1">
              <div class="self-stretch inline-flex justify-start items-center gap-1">
                <div class="justify-start text-slate-700 text-base font-normal leading-normal">
                  Fan can request to extend session in call</div>
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
              <div class="inline-flex justify-start items-center gap-2">
                <CheckboxGroup v-model="formData.requestExtendSession"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                  wrapperClass="flex items-center gap-2" />
                <div class="opacity-50 flex justify-start items-end gap-2">
                  <BaseInput type="number" placeholder="15" v-model="formData.extendSessionMax"
                    :disabled="!formData.requestExtendSession"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                  <div class="h-10 inline-flex flex-col justify-between items-start">
                    <div class="justify-center text-black text-base font-medium leading-normal">sessions maximum</div>
                    <div class="justify-center text-black text-xs font-medium leading-none">(30 minutes)</div>
                  </div>
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
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-1">
              <div class="self-stretch inline-flex justify-start items-center gap-1">
                <div class="justify-start text-slate-700 text-base font-normal leading-normal">Call reminder</div>
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
              <div class="self-stretch flex flex-col justify-start items-start">
                <div class=" inline-flex justify-end items-center gap-2">
                  <div class="justify-center text-slate-700 text-base font-normal leading-normal">Remind me</div>
                  <BaseInput type="number" placeholder="15" v-model="formData.remindMeTime"
                    :disabled="!formData.remindMeTime"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                  <div class="flex-1 justify-center text-slate-700 text-base font-normal leading-normal">minutes before
                    a
                  </div>
                </div>
                <div class="inline-flex justify-end items-center gap-2">
                  <div class="justify-center text-slate-700 text-base font-normal leading-normal">scheduled call.</div>
                </div>
              </div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="flex gap-2">
              <CheckboxGroup v-model="formData.setBufferTime" label="Set buffer time between booked appointments"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2" />
              <div class="mt-[2px]"><img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" /></div>
            </div>
            <div class="inline-flex justify-start items-center gap-2">
              <div class="w-6 h-6" />
              <div class="opacity-50 flex justify-start items-end gap-2">
                <BaseInput type="number" placeholder="15" v-model="formData.bufferTime"
                  :disabled="!formData.setBufferTime"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
                <div class="w-44 inline-flex flex-col justify-start items-start gap-1.5">
                  <div class="self-stretch flex flex-col justify-start items-start gap-1.5">
                    <div
                      class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start">
                      <div class="flex-1 justify-start text-gray-900 text-base font-normal leading-normal">Todo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="flex gap-2 items-center">
              <CheckboxGroup v-model="formData.setMaxBookings" label="Set maximum bookings per day"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2" />
              <div class="mt-[2px]"><img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" /></div>
            </div>
            <div class="inline-flex justify-start items-center gap-2">
              <div class="w-6 h-6" />
              <div class="opacity-50 flex justify-start items-end gap-2">
                <BaseInput type="number" placeholder="15" v-model="formData.maxBookingsPerDay"
                  :disabled="!formData.setMaxBookings"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            </div>
          </div>
          <div class="self-stretch flex flex-col justify-center items-start gap-3">
            <div class="self-stretch flex flex-col justify-center items-start gap-1">
              <div class="flex gap-2">
                <CheckboxGroup v-model="formData.allowWaitlist"
                  label="If booking slots are full, allow fans to join waitlist"
                  checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                  wrapperClass="flex items-center gap-2" />
                <div class="mt-[2px]"><img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" /></div>
              </div>
              <div class="self-stretch inline-flex justify-start items-start gap-2">
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

      <div class="w-full bg-[#D0D5DD] h-[1px] mb-[50px] mt-[10px]"></div>


    </form>
    <div class="flex justify-end">
      <ButtonComponent @click="goToNext" text="Next" variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" :rightIconClass="`
          w-6 h-6 transition duration-200
          filter brightness-0 invert-0   /* Default: black */
          group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
        `" btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468" />
    </div>
  </template>

