<template>
  <ul 
    class="flex justify-center items-center gap-2 shrink-0 md:gap-6 xl:w-full xl:justify-between xl:gap-0"
  >
    <li
      v-for="avatar in avatars"
      :key="avatar.id"
      @click="$emit('update:modelValue', avatar.id)"
      class="w-20 min-w-[5rem] h-20 rounded-full cursor-pointer transition-all flex justify-center items-center"
      :class="{ 'border-[3px] border-[#98A2B3]': modelValue === avatar.id }"
    >
      <div class="slide-content w-full h-full flex justify-center items-center">
        <img
          :src="avatar.src"
          :alt="avatar.alt"
          class="w-14 h-14 object-cover pointer-events-none"
        />
      </div>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  avatars: {
    type: Array,
    required: true
  },
  modelValue: { // Selected Avatar ID
    type: [Number, String],
    default: null
  }
});

defineEmits(['update:modelValue']);
</script>