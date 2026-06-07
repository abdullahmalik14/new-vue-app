<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
  volumeImg: {
    type: String,
    default: "",
  },
  // Dynamic Background Image
  image: {
    type: String,
    required: true,
  },
  // Creator Details
  creatorName: {
    type: String,
    default: "",
  },
  creatorHandle: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div
    class="flex flex-col justify-between aspect-[1.586/1] bg-cover bg-center relative before:absolute before:inset-0 before:content-[''] before:bg-[linear-gradient(180deg,rgba(0,0,0,0)_60%,rgba(0,0,0,0.45)_100%)] before:z-[1] md:aspect-[unset] md:w-1/2 md:h-screen sm:justify-end md:before:bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_100%)]"
    :style="{ backgroundImage: `url(${image})` }"
  >
    <div
      class="flex justify-between gap-1 px-2 py-1 mb-auto sm:p-4 md:[background:linear-gradient(180deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_100%)] z-[2]"
    >
      <div
        @click="emit('update:modelValue', false)"
        class="w-10 h-10 flex justify-center items-center cursor-pointer sm:hidden"
      >
        <img
          src="https://i.ibb.co.com/Gvkq58F5/chevron-left.webp"
          alt="chevron-left"
          class="w-6 h-6"
        />
      </div>
      
      <div
        v-if="volumeImg"
        class="w-10 h-10 flex justify-center items-center cursor-pointer md:opacity-70"
      >
        <img :src="volumeImg" alt="volume-x" class="w-6 h-6 md:w-8 md:h-8" />
      </div>
    </div>

    <div
      class="flex flex-col gap-2 p-2 drop-shadow-[0_0_8px_0_#00000080] z-[2] sm:gap-4 sm:p-4"
    >
      <div class="flex flex-col gap-1">
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <h3
              class="text-sm font-medium text-[#FCFAFF] md:drop-shadow-[0_0_8px_0_#00000080]"
            >
              {{ creatorName }}
            </h3>
            <img
              v-if="isVerified"
              src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp"
              alt="verified-tick"
              class="w-2.5 h-2.5"
            />
          </div>

          <span
            v-if="creatorHandle"
            class="text-xs leading-normal font-medium text-[#FCFCFD] md:drop-shadow-[0_0_8px_0_#00000080]"
          >
            {{ creatorHandle }}
          </span>
        </div>
      </div>

      <p
        v-if="description"
        class="text-lg font-medium text-white md:drop-shadow-[0_0_8px_0_#00000080]"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
