<template>
  <div class="flex gap-4 relative">
    <!-- Left Icon -->
    <div v-if="leftIcon" :class="leftIconClass">
      <img :src="leftIcon" alt="left icon" />
    </div>

    <!-- Title + Body + Optional Accordion Icon -->
    <div class="flex w-full relative">
      <div class='w-full'>
        <div class="flex gap-2">
          <div
            class="justify-start text-slate-700 text-base font-medium leading-normal"
          >
            {{ title }}
          </div>
          <div v-if="titleIcon">
            <img :src="titleIcon" alt="titleIcon" />
          </div>
        </div>

        <!-- Slot for body content -->
        <slot></slot>
      </div>

      <!-- Optional Accordion Icon -->
      <div v-if="accordionIcon" class="cursor-pointer absolute top-0 right-0"
      @click="$emit('toggle')">
        <img :src="accordionIcon" alt="accordion icon" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WrapperContainer",
  props: {
    title: {
      type: String,
      required: true,
    },
    leftIcon: {
      type: String,
      default: null,
    },
    accordionIcon: {
      type: String,
      default: null, // optional icon
    },
    titleIcon: {
      type: String,
      default: null, // optional icon next to title
    },
    leftIconClass:{
       type: String,
      default: null,
    }
  },
};
</script>
