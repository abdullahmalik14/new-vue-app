<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Select Button -->
    <button
      @click="toggleDropdown"
      :class="buttonClasses"
      :style="buttonStyles"
      type="button"
      ref="selectButton"
    >
      <!-- Color Picker Layout -->
      <div v-if="variant === 'color-picker'" class="flex items-center justify-between w-full">
        <!-- Left side text -->
        <span class="text-gray-700 text-sm font-medium">{{ inputText }}</span>

        <!-- Right side container (selected color + arrow in parallel) -->
        <div class="flex items-center justify-end w-18 gap-2 border-l border-gray-300 pl-2">
          <!-- Selected color display -->
          <div
            v-if="selectedOption"
            class="w-5 h-5 rounded-full border border-gray-300"
            :style="{ backgroundColor: selectedOption.color || selectedOption.value }"
          ></div>

          <!-- Arrow -->
          <svg
            class="h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0"
            :class="{ 'rotate-180': isOpen }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Default Layout for other variants -->
      <template v-else>
        <!-- Multi-select with text and cross icon -->
        <template v-if="multiple && Array.isArray(modelValue) && modelValue.length > 0">
          <span class="block truncate text-left pr-16">
            {{ displayText }}
          </span>

          <!-- Cross icon positioned absolutely -->
          <span class="pointer-events-none absolute inset-y-0 right-8 flex items-center">
            <button
              @click.stop="removeLastSelectedItem"
              class="pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              title="Clear all selected items"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>

          <!-- Arrow positioned absolutely (same as single select) -->
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              class="h-5 w-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': isOpen }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </template>

        <!-- Single select or empty multi-select -->
        <template v-else>
          <span class="block truncate text-left">
            {{ displayText }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              class="h-5 w-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': isOpen }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </template>
      </template>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      :class="dropdownClasses"
      @click.stop
    >
      <!-- Search Input (only if searchable) -->
      <div v-if="searchable" :class="searchContainerClasses">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            ref="searchInput"
            type="text"
            :placeholder="searchPlaceholder"
            :class="searchInputClasses"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Options Container -->
      <div :class="optionsContainerClasses">
        <!-- No Results -->
        <div v-if="filteredOptions.length === 0" class="text-center py-8 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.431-.93-5.96-2.44" />
          </svg>
          <p class="text-sm">No items found</p>
        </div>

        <!-- Card Layout -->
        <div v-else-if="variant === 'cards'" class="grid grid-cols-2 gap-3">
          <div
            v-for="option in filteredOptions"
            :key="option.id || option.value"
            @click="selectOption(option)"
            :class="cardClasses(option)"
            :data-selected="isSelected(option)"
          >
            <!-- Card Content -->
            <div class="p-3">
              <!-- Image Layout (for image grid) -->
              <div v-if="option.image" class="mb-3">
                <img
                  :src="option.image"
                  :alt="option.name"
                  class="w-full h-20 object-cover rounded-md shadow-sm"
                  @error="$event.target.style.display='none'"
                />
              </div>

              <div class="flex items-center mb-2">
                <!-- Checkbox for multiple selection -->
                <input
                  v-if="multiple"
                  type="checkbox"
                  :checked="isSelected(option)"
                  @click.stop
                  @change="selectOption(option)"
                  class="mr-3 h-4 w-4 custom-checkbox"
                />

                <div
                  v-if="option.icon"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3"
                  :style="{ backgroundColor: option.color || '#6366f1' }"
                >
                  {{ option.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-gray-900 truncate">
                    {{ getOptionLabel(option) }}
                  </h4>
                </div>
              </div>

              <p v-if="option.description" class="text-xs text-gray-600 line-clamp-2">
                {{ option.description }}
              </p>

              <div v-if="option.price" class="mt-2 flex items-center justify-between">
                <span class="text-xs font-medium text-green-600">
                  {{ option.price }}
                </span>
                <span v-if="option.category" class="text-xs text-gray-400">
                  {{ option.category }}
                </span>
              </div>
            </div>

            <!-- Selected Indicator -->
            <div
              v-if="isSelected(option)"
              class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Users Layout -->
        <div v-else-if="variant === 'users'" class="py-1">
          <div
            v-for="option in filteredOptions"
            :key="option.id || option.value"
            :class="userItemClasses(option)"
            :data-selected="isSelected(option)"
          >
            <!-- User Content -->
            <div
              class="flex items-center flex-1 cursor-pointer"
              @click="selectOption(option)"
            >
              <!-- Checkbox for multiple selection -->
              <input
                v-if="multiple"
                type="checkbox"
                :checked="isSelected(option)"
                @click.stop
                @change="selectOption(option)"
                class="mr-3 h-4 w-4 custom-checkbox"
              />

              <!-- User Avatar -->
              <div class="flex-shrink-0 mr-3">
                <img
                  :src="option.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(option.name || option.label) + '&background=random'"
                  :alt="option.name || option.label"
                  class="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900 truncate">
                    {{ option.name || option.label }}
                  </span>
                  <!-- Blue Checkmark -->
                  <svg
                    v-if="option.verified"
                    class="ml-2 w-4 h-4 text-blue-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <p v-if="option.email" class="text-xs text-gray-500 truncate">
                  {{ option.email }}
                </p>
                <p v-if="option.role" class="text-xs text-gray-400 truncate">
                  {{ option.role }}
                </p>
              </div>
            </div>

            <!-- Action Dropdown -->
            <div class="relative ml-2" v-if="option.actions && option.actions.length > 0">
              <button
                @click.stop="toggleUserActions(option.id)"
                class="p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                :class="{ 'bg-gray-100': openActionDropdown === option.id }"
              >
                <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              <!-- Actions Dropdown -->
              <div
                v-if="openActionDropdown === option.id"
                class="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20"
                @click.stop
              >
                <button
                  v-for="action in option.actions"
                  :key="action.id"
                  @click="handleUserAction(option, action)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  :class="{
                    'text-red-600 hover:bg-red-50': action.destructive,
                    'text-blue-600 hover:bg-blue-50': action.primary
                  }"
                >
                  <span v-if="action.icon" class="mr-2">{{ action.icon }}</span>
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Themed Layout -->
        <div v-else-if="variant === 'themed'" class="py-2">
          <div
            v-for="option in filteredOptions"
            :key="option.id || option.value"
            @click="selectOption(option)"
            :class="themedItemClasses(option)"
            :style="themedItemStyles(option)"
            :data-selected="isSelected(option)"
          >
            <!-- Before Icon -->
            <span
              v-if="option.iconBefore"
              :class="themedIconClasses('before')"
              :style="themedIconStyles('before')"
            >
              {{ option.iconBefore }}
            </span>

            <!-- Main Content with Inline Icon -->
            <div class="flex items-center flex-1">
              <!-- Checkbox for multiple selection -->
              <input
                v-if="multiple"
                type="checkbox"
                :checked="isSelected(option)"
                @click.stop
                @change="selectOption(option)"
                class="mr-3 h-4 w-4 custom-checkbox"
              />

              <!-- Inline Icon -->
              <span
                v-if="option.iconInline"
                :class="themedIconClasses('inline')"
                :style="themedIconStyles('inline')"
              >
                {{ option.iconInline }}
              </span>

              <!-- Text Content -->
              <span
                :class="themedTextClasses(option)"
                :style="themedTextStyles(option)"
              >
                {{ getOptionLabel(option) }}
              </span>
            </div>

            <!-- After Icon -->
            <span
              v-if="option.iconAfter"
              :class="themedIconClasses('after')"
              :style="themedIconStyles('after')"
            >
              {{ option.iconAfter }}
            </span>

            <!-- Badge/Secondary Info -->
            <span
              v-if="option.badge"
              :class="themedBadgeClasses(option)"
              :style="themedBadgeStyles(option)"
            >
              {{ option.badge }}
            </span>
          </div>
        </div>

        <!-- Color Picker Layout -->
        <div v-else-if="variant === 'color-picker'" class="py-3 px-2">
          <div
            v-for="(option, index) in filteredOptions"
            :key="option.id || option.value"
            @click="selectOption(option)"
            class="w-5 h-5 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md mx-auto my-4"
            :class="isSelected(option) ? 'border-gray-800 shadow-md' : 'border-gray-300'"
            :style="{ backgroundColor: option.color || option.value }"
            :title="option.label || option.name"
          ></div>
        </div>

        <!-- List Layout -->
        <div v-else class="py-1">
          <!-- No results message -->
          <div v-if="filteredOptions.length === 0" class="px-4 py-8 text-center text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.431-.93-5.96-2.44" />
            </svg>
            <p class="text-sm">{{ noResultsMessage || 'No results found' }}</p>
          </div>

          <div
            v-for="(option, index) in filteredOptions"
            :key="option.id || option.value"
            @click="selectOption(option)"
            :class="[
              listItemClasses(option),
              option.bgColor ? '' : '',
              option.isCustomButton ? option.buttonClass : ''
            ]"
            :style="option.bgColor ? { backgroundColor: option.bgColor } : {}"
            :data-selected="isSelected(option)"
          >
            <!-- Custom Button Layout -->
            <div v-if="option.isCustomButton" class="text-center">
              {{ getOptionLabel(option) }}
            </div>
            <!-- Checkbox for multiple selection -->
            <div v-else-if="multiple" class="flex items-center">
              <input
                type="checkbox"
                :checked="isSelected(option)"
                @click.stop
                @change="selectOption(option)"
                class="mr-3 h-4 w-4 custom-checkbox"
              />
              <span class="flex-1">{{ getOptionLabel(option) }}</span>
            </div>
            <!-- Regular text for single selection -->
            <span v-else>{{ getOptionLabel(option) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  searchable: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  variant: {
    type: String,
    default: 'list', // 'list', 'cards', 'users', 'themed', or 'color-picker'
    validator: (value) => ['list', 'cards', 'users', 'themed', 'color-picker'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  optionLabelKey: {
    type: String,
    default: 'label' // For simple options, use 'name' for card options
  },
  optionValueKey: {
    type: String,
    default: 'value'
  },
  customTheme: {
    type: Object,
    default: () => ({})
  },
  multiple: {
    type: Boolean,
    default: false
  },
  inputText: {
    type: String,
    default: 'Color'
  },
  noResultsMessage: {
    type: String,
    default: 'No results found'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'user-action'])

const isOpen = ref(false)
const searchQuery = ref('')
const selectButton = ref(null)
const searchInput = ref(null)
const dropdownRef = ref(null)
const openActionDropdown = ref(null)

// Computed properties
const selectedOption = computed(() => {
  if (!props.modelValue) return null

  if (typeof props.modelValue === 'object') {
    return props.modelValue
  }

  return props.options.find(option =>
    option[props.optionValueKey] === props.modelValue
  )
})

const displayText = computed(() => {
  if (props.multiple) {
    const selectedItems = Array.isArray(props.modelValue) ? props.modelValue : []
    if (selectedItems.length === 0) {
      return props.placeholder
    } else if (selectedItems.length === 1) {
      return getOptionLabel(selectedItems[0])
    } else {
      // Show comma-separated names of selected items
      const names = selectedItems.map(item => getOptionLabel(item))
      return names.join(', ')
    }
  } else {
    if (selectedOption.value) {
      return getOptionLabel(selectedOption.value)
    }
    return props.placeholder
  }
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => {
    const label = getOptionLabel(option).toLowerCase()
    const description = option.description?.toLowerCase() || ''
    const category = option.category?.toLowerCase() || ''

    return label.includes(query) || description.includes(query) || category.includes(query)
  })
})

// Dynamic classes based on props
const buttonClasses = computed(() => {
  const baseClasses = [
    'relative w-full cursor-pointer rounded-lg border text-left shadow-sm transition-all duration-300'
  ]

  const sizeClasses = {
    sm: props.variant === 'color-picker' ? 'py-2 pl-3 pr-2 text-sm' : 'py-2 pl-3 pr-10 text-sm',
    md: props.variant === 'color-picker' ? 'py-3 pl-3 pr-2 text-base' : 'py-3 pl-3 pr-10 text-base',
    lg: props.variant === 'color-picker' ? 'py-4 pl-4 pr-2 text-lg' : 'py-4 pl-4 pr-12 text-lg'
  }

  // Custom styling for themed variant
  if (props.variant === 'themed' && props.customTheme.button) {
    baseClasses.push(props.customTheme.button.classes || '')
  } else {
    // Default styling for other variants
    baseClasses.push(
      'border-gray-300 bg-white',
      'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
      'hover:border-gray-400'
    )
  }

  if (props.disabled) {
    baseClasses.push('opacity-50 cursor-not-allowed')
  }

  return [...baseClasses, sizeClasses[props.size]]
})

const buttonStyles = computed(() => {
  if (props.variant === 'themed' && props.customTheme.button) {
    return props.customTheme.button.styles || {}
  }
  return {}
})

const dropdownClasses = computed(() => [
  'absolute z-10 mt-1 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden',
  props.variant === 'color-picker' ? 'w-18 right-0' : 'w-full',
  props.variant === 'cards' ? 'max-h-80' :
  props.variant === 'themed' ? 'max-h-96' :
  props.variant === 'color-picker' ? 'max-h-60' :
  'max-h-60'
])

const searchContainerClasses = computed(() => [
  'p-3 border-b border-gray-200',
  props.variant === 'cards' ? 'bg-gray-50' : 'bg-white'
])

const searchInputClasses = computed(() => [
  'w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  props.size === 'sm' ? 'px-3 py-1.5 pl-9 text-sm' : 'px-3 py-2 pl-9 text-sm'
])

const optionsContainerClasses = computed(() => {
  let baseClasses

  if (props.variant === 'cards') {
    baseClasses = 'p-3 max-h-64 overflow-y-auto'
  } else if (props.variant === 'themed') {
    baseClasses = 'max-h-80 overflow-y-auto bg-transparent pb-2'
  } else {
    baseClasses = 'max-h-52 overflow-y-auto'
  }

  return [baseClasses]
})

const cardClasses = (option) => [
  'relative bg-white border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md',
  'hover:border-gray-300 hover:-translate-y-0.5',
  props.multiple
    ? 'border-gray-200' // No selected background for multi-select
    : isSelected(option)
      ? 'border-blue-500 bg-blue-50 shadow-md'
      : 'border-gray-200',
  'group'
]

const listItemClasses = (option) => [
  'cursor-pointer select-none relative py-2 pl-3 pr-9',
  'hover:bg-gray-100 transition-colors duration-150',
  props.multiple
    ? 'text-gray-900' // No selected background for multi-select
    : isSelected(option)
      ? 'bg-blue-600 text-white'
      : 'text-gray-900'
]

const userItemClasses = (option) => [
  'flex items-center px-3 py-3 hover:bg-gray-50 transition-colors duration-150',
  'border-b border-gray-100 last:border-b-0',
  props.multiple
    ? 'bg-white' // No selected background for multi-select
    : isSelected(option)
      ? 'bg-blue-50 border-blue-200'
      : 'bg-white'
]

// Themed styling methods
const themedItemClasses = (option) => {
  const baseClasses = [
    'flex items-center cursor-pointer transition-all duration-200',
    props.customTheme.item?.baseClasses || 'px-4 py-3 border-b border-gray-100 last:border-b-0'
  ]

  // Add hover classes
  if (props.customTheme.item?.hoverClasses) {
    baseClasses.push(props.customTheme.item.hoverClasses)
  }

  // Add selected classes
  if (isSelected(option) && props.customTheme.item?.selectedClasses) {
    baseClasses.push(props.customTheme.item.selectedClasses)
  }

  return baseClasses
}

const themedItemStyles = (option) => {
  const styles = {}

  // Base styles
  if (props.customTheme.item?.background) {
    styles.backgroundColor = props.customTheme.item.background
  }

  // Selected styles
  if (isSelected(option)) {
    if (props.customTheme.item?.selectedBackground) {
      styles.backgroundColor = props.customTheme.item.selectedBackground
    }
    if (props.customTheme.item?.selectedBorder) {
      styles.borderColor = props.customTheme.item.selectedBorder
    }
  }

  // Custom styles from option
  if (option.customStyles) {
    Object.assign(styles, option.customStyles)
  }

  return styles
}

const themedIconClasses = (position) => {
  return [
    'flex-shrink-0',
    props.customTheme.icon?.baseClasses || '',
    props.customTheme.icon?.[position]?.classes || '',
    position === 'before' ? 'mr-3' : position === 'inline' ? 'mr-2' : 'ml-3'
  ]
}

const themedIconStyles = (position) => {
  const styles = {}

  // Base icon styles
  if (props.customTheme.icon?.color) {
    styles.color = props.customTheme.icon.color
  }
  if (props.customTheme.icon?.fontSize) {
    styles.fontSize = props.customTheme.icon.fontSize
  }

  // Position-specific styles
  if (props.customTheme.icon?.[position]) {
    Object.assign(styles, props.customTheme.icon[position].styles || {})
  }

  return styles
}

const themedTextClasses = (option) => {
  const classes = [
    props.customTheme.text?.baseClasses || 'flex-1'
  ]

  if (isSelected(option) && props.customTheme.text?.selectedClasses) {
    classes.push(props.customTheme.text.selectedClasses)
  }

  return classes
}

const themedTextStyles = (option) => {
  const styles = {}

  // Font styles
  if (props.customTheme.text?.fontFamily) {
    styles.fontFamily = props.customTheme.text.fontFamily
  }
  if (props.customTheme.text?.fontSize) {
    styles.fontSize = props.customTheme.text.fontSize
  }
  if (props.customTheme.text?.fontWeight) {
    styles.fontWeight = props.customTheme.text.fontWeight
  }
  if (props.customTheme.text?.color) {
    styles.color = props.customTheme.text.color
  }

  // Selected styles
  if (isSelected(option)) {
    if (props.customTheme.text?.selectedColor) {
      styles.color = props.customTheme.text.selectedColor
    }
    if (props.customTheme.text?.selectedFontWeight) {
      styles.fontWeight = props.customTheme.text.selectedFontWeight
    }
  }

  return styles
}

const themedBadgeClasses = (option) => [
  props.customTheme.badge?.baseClasses || 'px-2 py-1 rounded-full text-xs font-medium ml-2',
  isSelected(option) && props.customTheme.badge?.selectedClasses || ''
]

const themedBadgeStyles = (option) => {
  const styles = {}

  if (props.customTheme.badge?.background) {
    styles.backgroundColor = props.customTheme.badge.background
  }
  if (props.customTheme.badge?.color) {
    styles.color = props.customTheme.badge.color
  }

  // Badge-specific colors
  if (option.badgeColor) {
    styles.backgroundColor = option.badgeColor
  }
  if (option.badgeTextColor) {
    styles.color = option.badgeTextColor
  }

  return styles
}

// Helper functions
const getOptionLabel = (option) => {
  if (props.variant === 'cards') {
    return option.name || option[props.optionLabelKey] || option.label
  }
  return option[props.optionLabelKey] || option.label || option.name
}

const isSelected = (option) => {
  if (!props.modelValue) return false

  // Handle multiple selection
  if (props.multiple) {
    const selectedItems = Array.isArray(props.modelValue) ? props.modelValue : []
    return selectedItems.some(selectedItem => {
      if (typeof selectedItem === 'object') {
        if (props.variant === 'cards') {
          return option.id === selectedItem.id
        }
        return option[props.optionValueKey] === selectedItem[props.optionValueKey] ||
               JSON.stringify(option) === JSON.stringify(selectedItem)
      }
      return option[props.optionValueKey] === selectedItem
    })
  }

  // Single selection logic
  if (typeof props.modelValue === 'object') {
    // For cards, compare by id
    if (props.variant === 'cards') {
      return option.id === props.modelValue.id
    }
    // For lists, compare by value key or the entire option
    else {
      return option[props.optionValueKey] === props.modelValue[props.optionValueKey] ||
             JSON.stringify(option) === JSON.stringify(props.modelValue)
    }
  }

  // If modelValue is a primitive value
  return option[props.optionValueKey] === props.modelValue
}

// Methods
const toggleDropdown = () => {
  if (props.disabled) return

  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    searchQuery.value = ''
  }
}

const selectOption = (option) => {
  if (props.multiple) {
    const currentSelected = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const isCurrentlySelected = isSelected(option)

    if (isCurrentlySelected) {
      // Remove from selection
      const updatedSelection = currentSelected.filter(item => {
        if (typeof item === 'object') {
          if (props.variant === 'cards') {
            return item.id !== option.id
          }
          return item[props.optionValueKey] !== option[props.optionValueKey]
        }
        return item !== option[props.optionValueKey]
      })
      emit('update:modelValue', updatedSelection)
      emit('change', updatedSelection)
    } else {
      // Add to selection
      currentSelected.push(option)
      emit('update:modelValue', currentSelected)
      emit('change', currentSelected)
    }
    // Don't close dropdown for multiple selection
  } else {
    emit('update:modelValue', option)
    emit('change', option)
    isOpen.value = false
    searchQuery.value = ''
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  openActionDropdown.value = null
}

const handleSearch = () => {
  // Search is reactive through computed property
}

const toggleUserActions = (userId) => {
  openActionDropdown.value = openActionDropdown.value === userId ? null : userId
}

const handleUserAction = (user, action) => {
  openActionDropdown.value = null
  emit('user-action', {
    user,
    action,
    timestamp: new Date().toISOString()
  })
}

const removeLastSelectedItem = () => {
  if (!props.multiple) return

  const currentSelected = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (currentSelected.length === 0) return

  // Remove all selected items
  emit('update:modelValue', [])
  emit('change', [])
}

// Click outside handler
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// Watchers and lifecycle
watch(isOpen, async (newValue) => {
  if (newValue && props.searchable) {
    await nextTick()
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom checkbox styling */
.custom-checkbox {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  background-color: white;
  cursor: pointer;
  position: relative;
  margin-right: 0.75rem;
}

.custom-checkbox:checked {
  background-color: #16a34a;
  border-color: #16a34a;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
  background-size: 12px 12px;
  background-position: center;
  background-repeat: no-repeat;
}

.custom-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}

.custom-checkbox:hover {
  border-color: #16a34a;
}

/* Custom width for 70px */
.w-18 {
  width: 4.5rem; /* 72px ≈ 70px */
}
</style>