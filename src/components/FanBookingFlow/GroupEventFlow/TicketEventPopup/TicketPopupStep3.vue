<script setup>
import SuccessEventCard from '../../HelperComponents/SuccessEventCard.vue';

const props = defineProps({
  engine: { type: Object, required: true }
});

const emit = defineEmits(['close-popup']);

// --- Button Configuration ---
const actionButtons = [
  {
    text: "View events on your calendar",
    icon: "/images/calendar-black.svg",
    bgColor: "bg-[#07F468]", // Green
    textColor: "text-black",
    action: () => console.log("View Calendar Clicked")
  },
  {
    text: "Go to group chat",
    icon: "/images/message-green.svg",
    bgColor: "bg-gray-900", // Dark
    textColor: "text-[#07F468]", // Green Text
    action: () => console.log("Go to Chat Clicked")
  }
];
</script>

<template>
  <SuccessEventCard 
  :is-crowd-funding="false"
    success-icon="/images/success.svg"
    heading-text="You’re in !"
    sub-heading-text="Get ready for your session!"
    event-title="J&B’s Cooking show"
    event-date="Wednesday, August 24, 2025"
    event-time="9:30pm-10:30pm"
    :buttons="actionButtons"
    @close="emit('close-popup')"
  />
</template>