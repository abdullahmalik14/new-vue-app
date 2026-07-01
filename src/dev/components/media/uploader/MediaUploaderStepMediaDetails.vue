<script setup>
import { ref, computed } from "vue"; // 'computed' import karna zaroori hai
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import BaseInput from "@/components/forms/inputs/BaseInput.vue";
import DashboardTextInput from "@/components/forms/inputs/DashboardTextInput.vue";
import ReusableSearchInput from "./parts/ReusableSearchInput.vue";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

const uploaderStore = useMediaUploaderStore();

// ==========================================
// STATE CONNECTIONS (Magic Yahan Hai)
// ==========================================

// 1. Title Connection
const titleModel = computed({
  get: () => uploaderStore.form.mediaTitle || "", // State se read karo
  set: (val) => {
    // State me write karo
    uploaderStore.updateFormField("mediaTitle", val);
  },
});

// 2. Description Connection
const descriptionModel = computed({
  get: () => uploaderStore.form.description || "",
  set: (val) => {
    uploaderStore.updateFormField("description", val);
  },
});

// 3. Tags Connection
const tagsModel = computed({
  get: () => uploaderStore.form.tags || [],
  set: (val) => {
    // Note: Depends on what ReusableSearchInput returns (array of objects or strings)
    uploaderStore.updateFormField("tags", val);
  },
});

// 4. Performers Connection
const performersModel = computed({
  get: () => uploaderStore.form.coPerformerIds || [],
  set: (val) => {
    uploaderStore.updateFormField("coPerformerIds", val);
  },
});


// ==========================================
// DATA FOR DROPDOWNS (Static Data)
// ==========================================

// History tags (recently used)
const historyTags = ref([
  { id: "h1", name: "Bluebettle" },
  { id: "h2", name: "dhdt" },
  { id: "h3", name: "Hello" },
]);

// All available tags
const tagsList = ref([
  { id: 1, name: "Apple" },
  { id: 2, name: "April" },
  { id: 3, name: "Apricote" },
  { id: 4, name: "Big smile" },
  { id: 5, name: "Big Energy" },
  { id: 6, name: "Bluebettle" },
  { id: 7, name: "Cantonese" },
  { id: 8, name: "Chinese" },
  { id: 9, name: "Dumplings" },
  { id: 10, name: "EEEEE" },
]);

const handleTagSearch = (query) => {
  console.log("Search:", query);
};

const openManageTags = () => {
  console.log("Open manage tags modal");
};

const performersList = ref([
  {
    id: 1,
    name: "Jelly's Jam",
    username: "sommijellyll67",
    avatar: "https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp",
  },
  {
    id: 2,
    name: "Sammi's Jelly",
    username: "sommijellyll67",
    avatar: "https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp",
  },
]);

const handlePerformerSearch = (query) => {
  console.log("Searching performers:", query);
  // API call here
};
</script>

<template>
  <div class="relative py-[16px] px-[10px] lg:px-[24px]">
    <div
      @click="uploaderStore.setStep(2)"
      class="flex gap-2 items-center cursor-pointer"
    >
      <img src="/images/backIcon.png" alt="" srcset="" />
      <button
        class="text-xs font-medium leading-[1.125rem] text-medium-text break-words"
      >
        Back
      </button>
    </div>

    
    <div class="flex flex-col gap-6 mt-4">
      
      <BaseInput
        type="text"
        v-model="titleModel" 
        placeholder="Video Title (Optional)"
        inputClass="bg-white/50 w-full px-3 py-3 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
      />

      <DashboardTextInput
        id="input_g"
        type="textarea"
        show-label
        v-model="descriptionModel"
        textAreaRows="3"
        label-text=""
        placeholder="Description (Optional)"
      />

      <ReusableSearchInput
        title="Tags"
        subtitle="Add maximum of 10 tags to your media."
        placeholder="Search Tags..."
        type="tags"
        :results="tagsList"
        :history-tags="historyTags"
        v-model="tagsModel"
        :max-items="10"
        :show-language-icon="true"
        @search="handleTagSearch"
        @manage-tags="openManageTags"
      />

      <ReusableSearchInput
        title="Co-performer"
        subtitle="If this media includes other performers, please tag them below."
        placeholder="Jelly"
        type="performer"
        :results="performersList"
        v-model="performersModel"
        :max-items="5"
        @search="handlePerformerSearch"
      />
    </div>

    <div
      class="flex justify-end md:mt-0 mt-4"
      @click="uploaderStore.setStep(4)"
    >
      <DashboardPrimaryButton
        text="Next"
        variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'"
        :rightIconClass="`
          w-6 h-6 transition duration-200
          filter brightness-0 invert-0   /* Default: black */
          group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
        `"
        btnBg="#07f468"
        btnHoverBg="black"
        btnText="black"
        btnHoverText="#07f468"
      />
    </div>
  </div>
</template>