<template>
  <div class="flex flex-col gap-5 mt-6">
    <h2
      class="text-black text-sm font-normal not-italic leading-none [text-wrap:balance]"
    >
      {{ label }}
    </h2>

    <div class="flex flex-col items-start justify-start flex-1 gap-[0.375rem]">
      <div
        class="flex flex-wrap items-center w-full relative gap-[0.375rem] flex-1 min-w-0 min-h-0"
      >
        <div
          class="flex items-center w-full relative gap-2 px-[0.875rem] py-[0.625rem] bg-white/30 border-b border-radio-border shadow-sm rounded-sm"
          @click="openPicker"
        >
          <div class="cursor-pointer w-[1.3125rem] h-5">
            <img
              src="https://i.ibb.co/N6tb4YSF/svgviewer-png-output-30.webp"
              alt="calendar-icon"
            />
          </div>

          <input
            type="text"
            readonly
            :value="formattedValue"
            placeholder="--/--/----   --:-- --"
            class="text-base leading-6 font-normal w-full text-darker-text border-none outline-none bg-transparent placeholder:text-[#757575] placeholder:text-base placeholder:font-normal placeholder:leading-6"
          />
        </div>

        <Paragraph
            :text="message"
            font-size="text-[14px]"
            font-weight="font-[400]"
            font-color="text-[#FF4405]"
            />
      </div>
    </div>

    <!-- Hidden date-time input -->
    <input
      ref="picker"
      type="datetime-local"
      class="hidden"
      @input="updateValue"
    />
  </div>
</template>

<script>
import Paragraph from '@/components/dev/default/Paragraph.vue';

export default {
  name: "PublishDatePicker",
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: "Set date and time for publishing:"
    },
     message: {
    type: String,
    default: ""
  }
  },
  components: {
    Paragraph
  },
  computed: {
    formattedValue() {
      if (!this.modelValue) return "";
      const date = new Date(this.modelValue);

      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };

      return date.toLocaleString("en-US", options).replace(",", "   ");
    }
  },
  methods: {
    openPicker() {
      this.$refs.picker.showPicker();
    },
    updateValue(event) {
      this.$emit("update:modelValue", event.target.value);
    }
  }
};
</script>

<style scoped>
/* No custom CSS needed — all Tailwind classes preserved */
</style>
