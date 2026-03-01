<script setup>
import CheckboxGroup from '../ui/form/checkbox/CheckboxGroup.vue';
// Agar aap chahein to yahan props define kar sakte hain future mein data pass karne ke liye
</script>

<template>
  <div class="w-[240px] sm:w-[340px] bg-white rounded-[5px] inline-flex flex-col justify-start items-start shadow-lg border border-gray-100 z-50">
    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        label="Video Call"
        checkboxClass="m-0 [appearance:none] w-4 h-4 relative bg-white rounded border border-indigo-600 relative cursor-pointer checked:bg-indigo-600 checked:border-indigo-600 checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:w-[0.30rem] checked:[&::after]:h-[0.6rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
        labelClass="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
        wrapperClass="flex items-center gap-2"
      />
      <div class="flex-1 flex justify-between items-center">
        <div class="flex justify-start items-center gap-2">
          <div class="w-2 h-2 bg-indigo-600 rounded-full" />
        </div>
        <div class="w-5 h-5 relative overflow-hidden">
          <img src="/images/edit.png" alt="editIcon" />
        </div>
      </div>
    </div>

    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        label="Audio Call"
        checkboxClass="m-0 [appearance:none] w-4 h-4 relative bg-white rounded border border-cyan-500 relative cursor-pointer checked:bg-cyan-500 checked:border-cyan-500 checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:w-[0.30rem] checked:[&::after]:h-[0.6rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
        labelClass="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
        wrapperClass="flex items-center gap-2"
      />
      <div class="flex-1 flex justify-between items-center">
        <div class="flex justify-start items-center gap-2">
          <div class="w-2 h-2 bg-cyan-500 rounded-full" />
        </div>
        <div class="w-5 h-5 relative overflow-hidden">
                    <img src="/images/edit.png" alt="editIcon" />
        </div>
      </div>
    </div>

    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        label="Group Call"
        checkboxClass="m-0 [appearance:none] w-4 h-4 relative bg-white rounded border border-rose-600 relative cursor-pointer checked:bg-rose-600 checked:border-rose-600 checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:w-[0.30rem] checked:[&::after]:h-[0.6rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
        labelClass="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
        wrapperClass="flex items-center gap-2"
      />
      <div class="flex-1 flex justify-between items-center">
        <div class="flex justify-start items-center gap-2">
          <div class="w-2 h-2 bg-rose-600 rounded-full" />
        </div>
        <div class="w-5 h-5 relative overflow-hidden">
                    <img src="/images/edit.png" alt="editIcon" />
        </div>
      </div>
    </div>

    <div class="self-stretch h-14 px-3 py-2 border-t border-gray-300 inline-flex justify-start items-center gap-4 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        label="Show booking schedule availability"
        checkboxClass="m-0 [appearance:none] w-4 h-4 relative bg-white rounded border border-gray-900 relative cursor-pointer checked:bg-gray-900 checked:border-gray-900 checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:w-[0.30rem] checked:[&::after]:h-[0.6rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
        labelClass="text-slate-700 sm:text-[16px] text-[12px]  cursor-pointer font-medium leading-6"
        wrapperClass="flex items-center gap-2"
      />
    </div>
  </div>
</template>