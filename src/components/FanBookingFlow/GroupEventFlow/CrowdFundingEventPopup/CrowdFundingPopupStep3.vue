<script setup>
import SuccessEventCard from '../../HelperComponents/SuccessEventCard.vue';

const props = defineProps({
  engine: { type: Object, required: true }
});

const emit = defineEmits(['close-popup']);

// --- Button Configuration ---
const actionButtons = [
  {
    text: "Tell your friends to fund",
    icon: "/images/shareBlack.png",
    bgColor: "bg-[#FFED29]", // Green
    textColor: "text-black",
    action: () => console.log("View Calendar Clicked")
  },
  {
    text: "Go to group chat",
    icon: "/images/chatyellow.png",
    bgColor: "bg-[#0C111D]", // Dark
    textColor: "text-[#FFED29]", // Green Text
    action: () => console.log("Go to Chat Clicked")
  }
];
</script>

<template>
  <SuccessEventCard 
  :is-crowd-funding="true"
  current-tokens="1,200"
   total-tokens="8,000"
   :progress-percent="15"
    success-icon="/images/heartSuccessIcon.png"
    heading-text="Thanks for your contribution!"
    sub-heading-text="We will let you know once this event reaches event goals!"
    event-title="J&B’s Cooking show"
    event-date="Wednesday, August 24, 2025"
    event-time="9:30pm-10:30pm"
    :buttons="actionButtons"
    @close="emit('close-popup')"
  />
</template>