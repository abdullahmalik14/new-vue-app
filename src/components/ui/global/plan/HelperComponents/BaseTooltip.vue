<template>
  <span class="flex items-center justify-center">
    <div class="md:relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible">
      
      <img src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp" alt="tooltip icon" class="w-4 h-4">

      <div class="absolute z-[2] flex flex-col items-start w-full md:w-max max-w-[22.4375rem] md:max-w-[21.5rem]
          opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
          text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg
          bg-[#101828B2] dark:bg-[rgba(14,19,32,0.9)] dark:text-[#dbd8d3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]
          left-1/2 top-full translate-x-[-50%] translate-y-2 md:left-auto md:top-1/2 md:-right-2 md:translate-y-[-50%] md:translate-x-full
          before:content-[''] before:absolute before:w-0 before:h-0 before:left-1/2 before:top-[-6px] before:translate-x-[-50%] before:border-[6px] before:border-t-0 before:border-l-transparent before:border-r-transparent before:border-b-[rgba(16,24,40,0.7)]
          md:before:top-1/2 md:before:left-[-6px] md:before:translate-y-[-50%] md:before:border-[6px] md:before:border-r-[rgba(16,24,40,0.7)] md:before:border-t-transparent md:before:border-b-transparent md:before:border-l-transparent"
      >
        <slot />
      </div>
    </div>
  </span>
</template>

<script setup>
// No props needed, fully generic
</script>