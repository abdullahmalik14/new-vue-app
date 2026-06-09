<template>
  <div class="flex gap-4 pt-2 border-t border-[#DEE5EC] w-full">
    <div class="flex gap-4 border-t border-transparent w-full">
      <div class="flex justify-between items-end gap-1 w-full">
        <h3 class="text-base font-semibold flex-grow text-[#F9FAFB]">
          {{ label }}
        </h3>

        <h2
          class="text-2xl font-semibold align-middle"
          :class="amountClass"
        >
          {{ amount }}
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: "Total",
  },
  amount: {
    type: String,
    required: true,
  },
  amountClass: {
    type: String,
    default: "text-[#07F468]",
  },
});
</script>
