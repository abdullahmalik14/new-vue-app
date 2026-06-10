<template>
  <div
    :class="['flex flex-col items-start self-stretch relative', parentClass]"
  >
    <!-- Header Section -->
    <div class="flex flex-col gap-[0.375rem] w-full">
      <div class="flex flex-col gap-[0.375rem]">
        <div class="text-sm font-bold leading-5 text-[#667085]">
          {{ title }}
        </div>
        <span  
         :class="[
          'text-base text-dark-text ',
          subTitleClass,
        ]"
        >
          {{ subtitle }}
        </span>
      </div>

      <!-- Search Input -->
      <div
        :class="[
          'flex items-start self-stretch relative border-b border-radio-border bg-white/30 pl-3',
          searchWrapperClass,
        ]"
      >
        <div class="flex items-center self-stretch pt-2 pb-3 gap-2 flex-1">
          <div class="flex items-center gap-2 flex-1">
            <img :src="iconUrl" :alt="iconAlt" class="w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="placeholder"
              @input="handleSearch"
              @focus="showResults = true"
              :class="[
                'w-full text-base leading-6 font-normal text-darker-text bg-transparent border-none outline-none',
                inputClass,
              ]"
            />
          </div>

          <!-- Language/Filter Icon (Optional) -->
          <button
            v-if="showLanguageIcon"
            class="flex items-center gap-1 text-sm text-[#667085]"
          >
            繁體中文
            <svg
              class="h-4 w-4 text-gray-400 transition-transform duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Selected Items (Tags/Co-performers) -->

    <!-- Search Results Dropdown -->
    <div
      v-if="showResults && type === 'tags'"
      class="absolute top-full left-0 right-0 bg-[#f3f5f7] border-t border-dark-text shadow-[0_0_8px_0px_rgba(0,0,0,0.10)] z-50 rounded-b-lg overflow-hidden"
    >
      <!-- Tabs Header -->
      <ul
        class="flex flex-row items-stretch items-center overflow-x-auto whitespace-nowrap list-none border-b border-[#E4E7EC] [scrollbar-width:none]"
      >
        <li
          v-for="(tab, index) in tabs"
          :key="tab.id"
          :class="[
            'flex flex-1 basis-0',
            activeTab === tab.id
              ? 'bg-[#3440541a] border-b border-dark-text'
              : '',
          ]"
        >
          <button
            @click="activeTab = tab.id"
            :class="[
              'flex flex-col items-center justify-center w-full gap-0.5 whitespace-nowrap pt-[.563rem] pb-[.563rem] px-4 min-w-[5rem]',
              activeTab !== tab.id ? 'opacity-70' : 'opacity-100',
            ]"
          >
            <img :src="tab.icon" :alt="tab.label" class="w-5 h-5" />
            <span
              v-if="tab.label"
              class="text-[#667085] text-xs leading-[1.125rem] font-medium"
            >
              {{ tab.label }}
            </span>
          </button>
        </li>
      </ul>

      <!-- Tags Content -->
      <div
        class="flex flex-col flex-1 w-full overflow-y-auto max-h-[400px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div class="flex flex-col w-full self-stretch">
          <div
            class="relative flex flex-col justify-start pt-4 pb-4 px-4 gap-6"
          >
            <!-- Alphabetical Sections -->
            <div
              v-for="section in alphabeticalSections"
              :key="section.letter"
              class="flex justify-start gap-4"
            >
              <div class="text-dark-text w-18 leading-6 text-base uppercase">
                {{ section.letter }}
              </div>
              <div class="flex flex-wrap gap-2 flex-1 basis-0">
                <label
                  v-for="tag in section.tags"
                  :key="tag.id"
                  :for="`tag-checkbox-${tag.id}`"
                  class="inline-flex cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :id="`tag-checkbox-${tag.id}`"
                    :checked="isSelected(tag.id)"
                    @change="selectItem(tag)"
                    class="appearance-none w-3 h-3 border border-[#999] rounded-sm bg-transparent hidden"
                  />
                  <span
                    :class="[
                      'flex items-center gap-1 whitespace-normal break-words py-1 rounded-none px-2 min-w-[3.5rem] leading-5 text-sm font-medium',
                      isSelected(tag.id)
                        ? 'bg-[#0C111D] text-white'
                        : 'bg-white text-[#344054]',
                    ]"
                  >
                    {{ tag.name }}

                    <!-- Cross icon only when selected -->
                    <button
                      v-if="isSelected(tag.id)"
                      @click.stop="removeItem(tag.id)"
                      class="text-white text-xs ml-1 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Co-performers Results Dropdown -->
    <div
      v-if="showResults && type === 'performer' && filteredResults.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-[#f3f5f7] border border-[#E4E7EC] rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50"
    >
      <div class="py-2">
        <button
          v-for="performer in filteredResults"
          :key="performer.id"
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fff]"
        >
          <img
            :src="performer.avatar"
            :alt="performer.name"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex-1 text-left">
            <div class="text-sm font-medium text-darker-text">
              {{ performer.name }}
            </div>
            <div class="text-xs text-[#667085]">@{{ performer.username }}</div>
          </div>
          <div
            class="flex items-center gap-1 text-xs leading-[1.125rem] font-medium cursor-pointer"
            :class="
              isSelected(performer.id)
                ? 'text-secondary-text'
                : 'text-[#004EEB]'
            "
            @click.stop="
              isSelected(performer.id)
                ? removeItem(performer.id)
                : selectItem(performer)
            "
          >
            <img
              :src="
                isSelected(performer.id)
                  ? 'https://i.ibb.co/4ZhsKf1R/svgviewer-png-output-27.webp' // MINUS ICON
                  : 'https://i.ibb.co/SLFjFwP/svgviewer-png-output-26.webp' // PLUS ICON
              "
              class="w-4 h-4"
            />

            {{ isSelected(performer.id) ? "Remove" : "Add" }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

// Props
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search...",
  },
  iconUrl: {
    type: String,
    default: "https://i.ibb.co.com/jvc93MC4/search.webp",
  },
  iconAlt: {
    type: String,
    default: "search",
  },
  type: {
    type: String,
    default: "tags", // 'tags' or 'performer'
    validator: (value) => ["tags", "performer"].includes(value),
  },
  results: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  maxItems: {
    type: Number,
    default: 10,
  },
  showLanguageIcon: {
    type: Boolean,
    default: false,
  },
  historyTags: {
    type: Array,
    default: () => [],
  },
  subTitleClass: {
    type: String,
    default: "",
  },
  parentClass: {
    type: String,
    default: "",
  },
  searchWrapperClass: {
    type: String,
    default: "",
  },
  inputClass: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "search", "manage-tags"]);

// State
const searchQuery = ref("");
const showResults = ref(false);
const selectedItems = ref([...props.modelValue]);
const activeTab = ref("az");

// Tabs configuration with actual image URLs
const tabs = ref([
  {
    id: "az",
    icon: "https://i.ibb.co/Kz93m55z/svgviewer-png-output-18.webp",
    label: "A-Z",
  },
  {
    id: "sort",
    icon: "https://i.ibb.co/jkjtwC9C/svgviewer-png-output-17.webp",
    label: "",
  },
  {
    id: "hobby",
    icon: "https://i.ibb.co/WNRLqNhJ/svgviewer-png-output-19.webp",
    label: "癖好",
  },
  {
    id: "clothing",
    icon: "https://i.ibb.co/39N92CGq/svgviewer-png-output-20.webp",
    label: "服裝",
  },
  {
    id: "scene",
    icon: "https://i.ibb.co/NdgG4wHg/svgviewer-png-output-21.webp",
    label: "場景",
  },
  {
    id: "identity",
    icon: "https://i.ibb.co/JWBKYGH1/svgviewer-png-output-22.webp",
    label: "身分",
  },
  {
    id: "body",
    icon: "https://i.ibb.co/DDps3vy4/svgviewer-png-output-23.webp",
    label: "身型",
  },
]);

// Computed
const filteredResults = computed(() => {
  if (!searchQuery.value) return props.results;

  const query = searchQuery.value.toLowerCase();
  return props.results.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(query);
    const usernameMatch = item.username?.toLowerCase().includes(query);
    return nameMatch || usernameMatch;
  });
});

// History sections
const historySections = computed(() => {
  return props.historyTags;
});

// Alphabetical sections for tags
const alphabeticalSections = computed(() => {
  const sections = {};

  filteredResults.value.forEach((tag) => {
    const firstLetter = tag.name.charAt(0).toUpperCase();
    if (!sections[firstLetter]) {
      sections[firstLetter] = [];
    }
    sections[firstLetter].push(tag);
  });

  return Object.keys(sections)
    .sort()
    .map((letter) => ({
      letter,
      tags: sections[letter],
    }));
});

// Methods
const handleSearch = () => {
  showResults.value = true;
  emit("search", searchQuery.value);
};

const isSelected = (id) => {
  return selectedItems.value.some((item) => item.id === id);
};

const selectItem = (item) => {
  const index = selectedItems.value.findIndex(
    (selected) => selected.id === item.id
  );

  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    if (selectedItems.value.length >= props.maxItems) {
      alert(`Maximum ${props.maxItems} items allowed`);
      return;
    }
    selectedItems.value.push(item);
  }

  emit("update:modelValue", selectedItems.value);

  if (props.type === "performer") {
    searchQuery.value = "";
    showResults.value = false;
  }
};

const removeItem = (id) => {
  selectedItems.value = selectedItems.value.filter((item) => item.id !== id);
  emit("update:modelValue", selectedItems.value);
};

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedItems.value = [...newValue];
  },
  { deep: true }
);

// Click outside to close dropdown
const handleClickOutside = (event) => {
  const container = event.target.closest(
    ".flex.flex-col.items-start.self-stretch"
  );
  if (!container) {
    showResults.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
</style>
