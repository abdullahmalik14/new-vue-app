<template>
  <!-- post preview -->
  <div class="flex flex-col w-[17.625rem] gap-2">
    <span class="text-[0.75rem] leading-[1.125rem] text-[#667085]"
      >POST PREVIEW</span
    >

    <div class="relative flex w-full gap-2 p-2 rounded-[0.313rem] bg-white/70">
      <!-- user-image -->
      <div class="flex items-center justify-center h-6 w-6 rounded-[0.375rem]">
        <img
          src="https://i.ibb.co/jkjtwC9C/svgviewer-png-output-17.webp"
          alt="svgviewer-png-output-17"
          class="w-6 min-w-[1.5rem] rounded-full"
        />
      </div>

      <!-- user-content -->
      <div class="flex flex-col flex-[1_0_0] gap-1">
        <!-- user-info -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- username -->
          <div class="flex items-center gap-1">
            <span
              class="text-dark-text font-semibold text-[0.75rem] leading-[1.125rem] w-[3.5625rem] overflow-hidden text-ellipsis line-clamp-1"
            >
              lindenMay
            </span>
            <img
              src="https://i.ibb.co/TBprHJxy/svgviewer-png-output-32.webp"
              alt="svgviewer-png-output-32"
              class="w-3 h-3"
            />
          </div>

          <span
            class="text-[#667085] text-[0.75rem] leading-[1.125rem] w-[3.5625rem] overflow-hidden text-ellipsis line-clamp-1"
          >
            @linden
          </span>

          <span class="text-[#667085] text-[0.75rem] leading-[1.125rem]"
            >May 16</span
          >
        </div>

        <!-- user-description -->
        <div class="flex">
          <p
            class="text-dark-text dark:text-dark-light-text font-medium text-[0.75rem] leading-[1.125rem]"
          >
            Don’t miss out—check this exclusive content and be the first to
            experience it!
          </p>
        </div>

        <!-- preview-image -->
        <div
          class="relative flex items-center justify-start w-full gap-[0.125rem] min-h-[4.11806rem] rounded-[0.625rem] bg-preview-bg dark:bg-dark-preview-bg overflow-hidden"
        >
          <img
            src="https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp"
            alt=""
            class="w-full h-auto object-cover aspect-[16/9]"
          />
        </div>
      </div>
    </div>
  </div>
</template>
