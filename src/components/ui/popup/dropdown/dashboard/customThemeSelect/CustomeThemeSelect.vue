<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="container mx-auto py-8">
      <h1 class="text-3xl font-bold text-center mb-8">Dropdown Renderer Demo</h1>

      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Simple List Select -->
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Simple List Select</h2>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Choose a fruit:</label>
            <UnifiedSelect
              v-model="selectedValue"
              :options="selectOptions"
              placeholder="Select a fruit..."
              variant="list"
              size="md"
              option-label-key="label"
              option-value-key="value"
              @change="handleSelectChange"
            />
          </div>
        </div>

        <!-- Searchable List Select -->
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Searchable List Select</h2>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search and select:</label>
            <UnifiedSelect
              v-model="selectedSearchValue"
              :options="selectOptions"
              placeholder="Search fruits..."
              variant="list"
              searchable
              search-placeholder="Type to search fruits..."
              size="md"
              option-label-key="label"
              option-value-key="value"
              @change="handleSearchSelectChange"
            />
          </div>
        </div>

        <!-- Card Layout Select -->
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Card Layout Select</h2>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Choose a product:</label>
            <UnifiedSelect
              v-model="selectedProduct"
              :options="productOptions"
              placeholder="Select a product..."
              variant="cards"
              searchable
              search-placeholder="Search products..."
              size="md"
              option-label-key="name"
              option-value-key="id"
              @change="handleProductChange"
            />
          </div>
        </div>

        <!-- Large Card Select -->
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Large Card Select</h2>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Choose a product (large):</label>
            <UnifiedSelect
              v-model="selectedLargeProduct"
              :options="productOptions"
              placeholder="Select a product..."
              variant="cards"
              searchable
              search-placeholder="Search products..."
              size="lg"
              option-label-key="name"
              option-value-key="id"
              @change="handleLargeProductChange"
            />
          </div>
        </div>

        <!-- User List Select -->
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">User List Select</h2>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select a user:</label>
            <UnifiedSelect
              v-model="selectedUser"
              :options="userOptions"
              placeholder="Choose a user..."
              variant="users"
              searchable
              search-placeholder="Search users..."
              size="md"
              option-label-key="name"
              option-value-key="id"
              @change="handleUserChange"
              @user-action="handleUserAction"
            />
          </div>
        </div>

        <!-- Themed Select - Dark Theme -->
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Dark Themed Select</h2>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Choose an option:</label>
            <UnifiedSelect
              v-model="selectedThemed"
              :options="themedOptions"
              placeholder="Select option..."
              variant="themed"
              searchable
              search-placeholder="Search options..."
              size="md"
              option-label-key="label"
              option-value-key="value"
              :custom-theme="darkTheme"
              @change="handleThemedChange"
            />
          </div>
        </div>

        <!-- Themed Select - Colorful Theme -->
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Simple Colorful Themed Select</h2>
          <p class="text-sm text-gray-600 mb-4">
            👥 A clean gradient select with user names and status badges.
            Simple design with purple-to-pink gradient styling and no animations.
          </p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Choose a person:</label>
            <UnifiedSelect
              v-model="selectedColorful"
              :options="colorfulOptions"
              placeholder="Select feature..."
              variant="themed"
              searchable
              search-placeholder="Search features..."
              size="md"
              option-label-key="label"
              option-value-key="value"
              :custom-theme="colorfulTheme"
              @change="handleColorfulChange"
            />
          </div>
        </div>

        <!-- Multi-Select Examples -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <!-- Multi-Select List -->
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <label class="block text-sm font-medium text-gray-700 mb-2">Multi-Select List:</label>
            <UnifiedSelect
              v-model="selectedMultiple"
              :options="simpleOptions"
              placeholder="Select multiple items..."
              variant="list"
              searchable
              :multiple="true"
              size="md"
              @change="handleMultipleChange"
            />
          </div>

          <!-- Multi-Select Cards -->
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <label class="block text-sm font-medium text-gray-700 mb-2">Multi-Select Cards:</label>
            <UnifiedSelect
              v-model="selectedMultipleCards"
              :options="productOptions"
              placeholder="Select multiple cards..."
              variant="cards"
              searchable
              :multiple="true"
              size="md"
              @change="handleMultipleCardsChange"
            />
          </div>
        </div>

        <!-- Color Picker Example -->
        <div class="bg-white p-6 rounded-lg shadow-lg mt-8">
          <label class="block text-sm font-medium text-gray-700 mb-2">Color Picker:</label>
          <div class="w-64">
            <UnifiedSelect
              v-model="selectedColor"
              :options="colorOptions"
              placeholder="Select a color..."
              variant="color-picker"
              input-text="Background Color"
              size="md"
              @change="handleColorChange"
            />
          </div>
        </div>

        <!-- Advanced Demos -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Advanced Flexibility Demos</h2>

          <!-- Grid of Advanced Demos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- 1. Alternating Background Colors Demo -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">1. Alternating Background Colors:</label>
              <div class="alternating-colors">
                <UnifiedSelect
                  v-model="selectedAlternating"
                  :options="alternatingOptions"
                  placeholder="Select with alternating colors..."
                  variant="list"
                  searchable
                  size="md"
                  @change="handleAlternatingChange"
                />
              </div>
            </div>

            <!-- 2. Custom Dropdown Styling Demo -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">2. Custom Border, Radius & Padding:</label>
              <div class="custom-dropdown-style">
                <UnifiedSelect
                  v-model="selectedCustomStyle"
                  :options="simpleOptions"
                  placeholder="Custom styled dropdown..."
                  variant="list"
                  size="md"
                  @change="handleCustomStyleChange"
                />
              </div>
            </div>

            <!-- 3. No Arrow Demo -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">3. No Arrow (Hidden):</label>
              <div class="no-arrow-dropdown">
                <UnifiedSelect
                  v-model="selectedNoArrow"
                  :options="simpleOptions"
                  placeholder="Select without arrow..."
                  variant="list"
                  size="md"
                  @change="handleNoArrowChange"
                />
              </div>
            </div>

            <!-- 4. No Results Message Demo -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">4. No Results Message:</label>
              <UnifiedSelect
                v-model="selectedNoResults"
                :options="limitedOptions"
                placeholder="Search 'xyz' to see no results..."
                variant="list"
                searchable
                search-placeholder="Try searching 'xyz'..."
                size="md"
                @change="handleNoResultsChange"
              />
            </div>

            <!-- 5. Image Grid Demo -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">5. Image Grid Layout:</label>
              <div class="image-grid-dropdown">
                <UnifiedSelect
                  v-model="selectedImageGrid"
                  :options="imageOptions"
                  placeholder="Select an image..."
                  variant="cards"
                  size="md"
                  @change="handleImageGridChange"
                />
              </div>
            </div>

            <!-- 6. Custom Upload Button Demo -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">6. Custom Upload Button:</label>
              <div class="upload-button-dropdown">
                <UnifiedSelect
                  v-model="selectedUpload"
                  :options="uploadOptions"
                  placeholder="Select or upload..."
                  variant="list"
                  size="md"
                  @change="handleUploadChange"
                />
              </div>
            </div>

          </div>
        </div>

        <!-- Results -->
        <div v-if="selectedItem" class="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">Selected:</h3>
          <div class="bg-gray-50 p-4 rounded border">
            <pre class="text-sm text-gray-700">{{ JSON.stringify(selectedItem, null, 2) }}</pre>
          </div>
        </div>

        <!-- Multi-Select Results with Cross Icons -->
        <div v-if="selectedMultiple.length > 0 || selectedMultipleCards.length > 0" class="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">Multi-Select Results with Remove:</h3>
          <div class="space-y-4">
            <!-- Selected List Items with Cross Icons -->
            <div v-if="selectedMultiple.length > 0" class="bg-gray-50 p-4 rounded border">
              <h4 class="font-medium text-gray-700 mb-3">Selected List Items:</h4>
              <div class="flex flex-wrap gap-2 mb-3">
                <div
                  v-for="item in selectedMultiple"
                  :key="item.value"
                  class="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span class="mr-2">{{ item.label }}</span>
                  <button
                    @click="removeFromMultiple(item)"
                    class="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-1 transition-colors duration-200"
                    title="Remove item"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <details class="text-xs">
                <summary class="cursor-pointer text-gray-600 hover:text-gray-800">Show JSON</summary>
                <pre class="mt-2 text-gray-700">{{ JSON.stringify(selectedMultiple, null, 2) }}</pre>
              </details>
            </div>

            <!-- Selected Card Items with Cross Icons -->
            <div v-if="selectedMultipleCards.length > 0" class="bg-gray-50 p-4 rounded border">
              <h4 class="font-medium text-gray-700 mb-3">Selected Card Items:</h4>
              <div class="flex flex-wrap gap-2 mb-3">
                <div
                  v-for="item in selectedMultipleCards"
                  :key="item.id"
                  class="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  <span class="mr-2">{{ item.name }}</span>
                  <button
                    @click="removeFromMultipleCards(item)"
                    class="text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full p-1 transition-colors duration-200"
                    title="Remove item"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <details class="text-xs">
                <summary class="cursor-pointer text-gray-600 hover:text-gray-800">Show JSON</summary>
                <pre class="mt-2 text-gray-700">{{ JSON.stringify(selectedMultipleCards, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UnifiedSelect from './UnifiedSelect.vue'

const selectedItem = ref(null)
const selectedValue = ref('')
const selectedSearchValue = ref('')
const selectedProduct = ref(null)
const selectedLargeProduct = ref(null)
const selectedUser = ref(null)
const selectedThemed = ref('')
const selectedColorful = ref('')
const selectedMultiple = ref([])
const selectedMultipleCards = ref([])
const selectedColor = ref(null)
const selectedAlternating = ref(null)
const selectedCustomStyle = ref(null)
const selectedNoArrow = ref(null)
const selectedNoResults = ref(null)
const selectedImageGrid = ref(null)
const selectedUpload = ref(null)

// Select options
const selectOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date', disabled: true },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' }
]

// Simple options for multi-select
const simpleOptions = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
  { label: 'Option 4', value: 'opt4' },
  { label: 'Option 5', value: 'opt5' }
]

// Color options for color picker
const colorOptions = [
  { label: 'Red', value: '#ef4444', color: '#ef4444' },
  { label: 'Blue', value: '#3b82f6', color: '#3b82f6' },
  { label: 'Green', value: '#10b981', color: '#10b981' },
  { label: 'Yellow', value: '#f59e0b', color: '#f59e0b' },
  { label: 'Purple', value: '#8b5cf6', color: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899', color: '#ec4899' },
  { label: 'Orange', value: '#f97316', color: '#f97316' },
  { label: 'Teal', value: '#14b8a6', color: '#14b8a6' }
]

// Advanced demo options
const alternatingOptions = [
  { label: 'Option 1', value: 'alt1', bgColor: '#f3f4f6' },
  { label: 'Option 2', value: 'alt2', bgColor: '#ffffff' },
  { label: 'Option 3', value: 'alt3', bgColor: '#f3f4f6' },
  { label: 'Option 4', value: 'alt4', bgColor: '#ffffff' },
  { label: 'Option 5', value: 'alt5', bgColor: '#f3f4f6' }
]

const limitedOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' }
]

const imageOptions = [
  {
    id: 1,
    name: 'Mountain',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
    description: 'Beautiful mountain landscape'
  },
  {
    id: 2,
    name: 'Ocean',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=150&h=150&fit=crop',
    description: 'Serene ocean view'
  },
  {
    id: 3,
    name: 'Forest',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=150&h=150&fit=crop',
    description: 'Dense green forest'
  },
  {
    id: 4,
    name: 'Desert',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=150&h=150&fit=crop',
    description: 'Vast desert landscape'
  }
]

const uploadOptions = [
  { label: 'Template 1', value: 'template1' },
  { label: 'Template 2', value: 'template2' },
  { label: 'Template 3', value: 'template3' },
  {
    label: '+ Upload Your Own',
    value: 'upload',
    isCustomButton: true,
    buttonClass: 'bg-blue-500 text-white hover:bg-blue-600 font-medium py-2 px-4 rounded-md transition-colors duration-200'
  }
]

// Product options for card select
const productOptions = [
  {
    id: 1,
    name: 'Organic Bananas',
    description: 'Fresh organic bananas from local farms. Perfect for smoothies and snacks.',
    price: '$3.99/bunch',
    category: 'Fruits',
    icon: '🍌',
    color: '#fbbf24'
  },
  {
    id: 2,
    name: 'Whole Grain Bread',
    description: 'Artisanal whole grain bread baked fresh daily. High in fiber and nutrients.',
    price: '$4.50',
    category: 'Bakery',
    icon: '🍞',
    color: '#d97706'
  },
  {
    id: 3,
    name: 'Greek Yogurt',
    description: 'Creamy Greek yogurt with live probiotics. Available in multiple flavors.',
    price: '$5.99',
    category: 'Dairy',
    icon: '🥛',
    color: '#3b82f6'
  },
  {
    id: 4,
    name: 'Fresh Salmon',
    description: 'Wild-caught Atlantic salmon. Rich in omega-3 fatty acids and protein.',
    price: '$12.99/lb',
    category: 'Seafood',
    icon: '🐟',
    color: '#ef4444'
  },
  {
    id: 5,
    name: 'Mixed Greens',
    description: 'Fresh mixed salad greens including spinach, arugula, and lettuce.',
    price: '$2.99',
    category: 'Vegetables',
    icon: '🥬',
    color: '#10b981'
  },
  {
    id: 6,
    name: 'Premium Coffee',
    description: 'Single-origin coffee beans roasted to perfection. Fair trade certified.',
    price: '$8.99',
    category: 'Beverages',
    icon: '☕',
    color: '#8b5cf6'
  },
  {
    id: 7,
    name: 'Chicken Breast',
    description: 'Free-range chicken breast. Lean protein source, perfect for healthy meals.',
    price: '$7.99/lb',
    category: 'Meat',
    icon: '🍗',
    color: '#f59e0b'
  },
  {
    id: 8,
    name: 'Avocados',
    description: 'Ripe avocados loaded with healthy fats. Great for toast and salads.',
    price: '$1.50 each',
    category: 'Fruits',
    icon: '🥑',
    color: '#059669'
  }
]

// User options for user select
const userOptions = [
  {
    id: 1,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    role: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    verified: true,
    actions: [
      { id: 'view', label: 'View Profile', icon: '👤', primary: true },
      { id: 'message', label: 'Send Message', icon: '💬' },
      { id: 'assign', label: 'Assign Task', icon: '📋' },
      { id: 'remove', label: 'Remove Access', icon: '🚫', destructive: true }
    ]
  },
  {
    id: 2,
    name: 'John Martinez',
    email: 'john.martinez@company.com',
    role: 'Senior Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    verified: true,
    actions: [
      { id: 'view', label: 'View Profile', icon: '👤', primary: true },
      { id: 'message', label: 'Send Message', icon: '💬' },
      { id: 'assign', label: 'Assign Task', icon: '📋' },
      { id: 'promote', label: 'Promote to Lead', icon: '⭐' },
      { id: 'remove', label: 'Remove Access', icon: '🚫', destructive: true }
    ]
  },
  {
    id: 3,
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    role: 'UX Designer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    verified: false,
    actions: [
      { id: 'view', label: 'View Profile', icon: '👤', primary: true },
      { id: 'message', label: 'Send Message', icon: '💬' },
      { id: 'verify', label: 'Verify Account', icon: '✅' },
      { id: 'remove', label: 'Remove Access', icon: '🚫', destructive: true }
    ]
  },
  {
    id: 4,
    name: 'Michael Brown',
    email: 'michael.brown@company.com',
    role: 'DevOps Engineer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    verified: true,
    actions: [
      { id: 'view', label: 'View Profile', icon: '👤', primary: true },
      { id: 'message', label: 'Send Message', icon: '💬' },
      { id: 'assign', label: 'Assign Task', icon: '📋' },
      { id: 'settings', label: 'Manage Permissions', icon: '⚙️' },
      { id: 'remove', label: 'Remove Access', icon: '🚫', destructive: true }
    ]
  },
  {
    id: 5,
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@company.com',
    role: 'Marketing Specialist',
    avatar: null, // Will use placeholder
    verified: false,
    actions: [
      { id: 'view', label: 'View Profile', icon: '👤', primary: true },
      { id: 'message', label: 'Send Message', icon: '💬' },
      { id: 'verify', label: 'Verify Account', icon: '✅' },
      { id: 'remove', label: 'Remove Access', icon: '🚫', destructive: true }
    ]
  }
]

// Themed options
const themedOptions = [
  {
    label: 'Dashboard',
    value: 'dashboard',
    iconBefore: '📊',
    iconAfter: '→',
    badge: 'New'
  },
  {
    label: 'Analytics',
    value: 'analytics',
    iconBefore: '📈',
    iconInline: '⚡',
    iconAfter: '→',
    badge: 'Pro'
  },
  {
    label: 'Settings',
    value: 'settings',
    iconBefore: '⚙️',
    iconAfter: '→'
  },
  {
    label: 'Profile',
    value: 'profile',
    iconBefore: '👤',
    iconInline: '✨',
    iconAfter: '→',
    badge: 'VIP'
  }
]

const colorfulOptions = [
  {
    label: 'Alexandra Thompson',
    value: 'alexandra',
    iconBefore: '👤',
    iconAfter: '→',
    badge: 'Online',
    badgeColor: '#22c55e',
    badgeTextColor: '#ffffff'
  },
  {
    label: 'Benjamin Rodriguez',
    value: 'benjamin',
    iconBefore: '👨',
    iconAfter: '→',
    badge: 'Away',
    badgeColor: '#f59e0b',
    badgeTextColor: '#ffffff'
  },
  {
    label: 'Catherine Williams',
    value: 'catherine',
    iconBefore: '👩',
    iconAfter: '→',
    badge: 'Busy',
    badgeColor: '#ef4444',
    badgeTextColor: '#ffffff'
  },
  {
    label: 'Daniel Martinez',
    value: 'daniel',
    iconBefore: '👨‍💼',
    iconAfter: '→',
    badge: 'Online',
    badgeColor: '#22c55e',
    badgeTextColor: '#ffffff'
  },
  {
    label: 'Emma Johnson',
    value: 'emma',
    iconBefore: '👩‍💻',
    iconAfter: '→',
    badge: 'Away',
    badgeColor: '#f59e0b',
    badgeTextColor: '#ffffff'
  },
  {
    label: 'Frederick Brown',
    value: 'frederick',
    iconBefore: '👨‍🎨',
    iconAfter: '→',
    badge: 'Online',
    badgeColor: '#22c55e',
    badgeTextColor: '#ffffff'
  }
]

// Theme configurations
const darkTheme = {
  item: {
    baseClasses: 'px-4 py-4 border-b border-gray-700 last:border-b-0',
    background: '#1f2937',
    selectedBackground: '#374151',
    selectedBorder: '#60a5fa',
    hoverClasses: 'hover:bg-gray-700',
    selectedClasses: 'border-l-4 border-l-blue-500'
  },
  text: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    color: '#f9fafb',
    selectedColor: '#93c5fd',
    selectedFontWeight: '600'
  },
  icon: {
    color: '#9ca3af',
    fontSize: '18px',
    before: {
      styles: { color: '#60a5fa' }
    },
    inline: {
      styles: { color: '#fbbf24' }
    },
    after: {
      styles: { color: '#6b7280' }
    }
  },
  badge: {
    baseClasses: 'px-2 py-1 rounded-full text-xs font-bold ml-auto',
    background: '#dc2626',
    color: '#ffffff'
  }
}

const colorfulTheme = {
  button: {
    classes: 'border-2 border-purple-400 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold focus:ring-2 focus:ring-purple-300 focus:border-purple-300',
    styles: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
    }
  },
  item: {
    baseClasses: 'px-5 py-4 border-b border-gray-100 last:border-b-0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    selectedBackground: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    hoverClasses: 'hover:bg-opacity-90',
    selectedClasses: 'border-l-4 border-l-pink-500'
  },
  text: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    selectedColor: '#1f2937',
    selectedFontWeight: '700'
  },
  icon: {
    fontSize: '20px',
    before: {
      styles: {
        color: '#fef3c7'
      }
    },
    after: {
      styles: {
        color: '#e5e7eb'
      }
    }
  },
  badge: {
    baseClasses: 'px-3 py-1 rounded-full text-xs font-bold ml-auto',
    background: '#ffffff',
    color: '#1f2937'
  }
}

// Event handlers
const handleSelectChange = (option) => {
  selectedItem.value = { type: 'simple-select', option }
}

const handleSearchSelectChange = (option) => {
  selectedItem.value = { type: 'search-select', option }
}

const handleProductChange = (product) => {
  selectedItem.value = { type: 'card-select', product }
}

const handleLargeProductChange = (product) => {
  selectedItem.value = { type: 'large-card-select', product }
}

const handleUserChange = (user) => {
  selectedItem.value = { type: 'user-select', user }
}

const handleUserAction = (data) => {
  selectedItem.value = {
    type: 'user-action',
    user: data.user,
    action: data.action,
    timestamp: data.timestamp
  }

  // You can handle specific actions here
  console.log(`Action "${data.action.label}" performed on user "${data.user.name}"`)

  // Example of handling different actions
  switch (data.action.id) {
    case 'view':
      alert(`Opening profile for ${data.user.name}`)
      break
    case 'message':
      alert(`Opening message dialog for ${data.user.name}`)
      break
    case 'assign':
      alert(`Opening task assignment for ${data.user.name}`)
      break
    case 'remove':
      if (confirm(`Are you sure you want to remove access for ${data.user.name}?`)) {
        alert(`Access removed for ${data.user.name}`)
      }
      break
    case 'verify':
      alert(`Verifying account for ${data.user.name}`)
      break
    case 'promote':
      alert(`Promoting ${data.user.name} to Lead`)
      break
    case 'settings':
      alert(`Opening permission settings for ${data.user.name}`)
      break
    default:
      alert(`Unknown action: ${data.action.label}`)
  }
}

const handleThemedChange = (option) => {
  selectedItem.value = { type: 'dark-themed', option }
}

const handleColorfulChange = (option) => {
  selectedItem.value = { type: 'colorful-themed', option }
}

const handleMultipleChange = (options) => {
  console.log('Multi-select list changed:', options)
}

const handleMultipleCardsChange = (options) => {
  console.log('Multi-select cards changed:', options)
}

const handleColorChange = (color) => {
  selectedItem.value = { type: 'color-picker', color }
}

// Advanced demo handlers
const handleAlternatingChange = (option) => {
  selectedItem.value = { type: 'alternating', option }
}

const handleCustomStyleChange = (option) => {
  selectedItem.value = { type: 'custom-style', option }
}

const handleNoArrowChange = (option) => {
  selectedItem.value = { type: 'no-arrow', option }
}

const handleNoResultsChange = (option) => {
  selectedItem.value = { type: 'no-results', option }
}

const handleImageGridChange = (option) => {
  selectedItem.value = { type: 'image-grid', option }
}

const handleUploadChange = (option) => {
  if (option.isCustomButton) {
    // Handle custom upload button click
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        selectedItem.value = { type: 'upload', file: file.name }
      }
    }
    fileInput.click()
  } else {
    selectedItem.value = { type: 'template', option }
  }
}

// Functions to remove items from multi-select
const removeFromMultiple = (itemToRemove) => {
  selectedMultiple.value = selectedMultiple.value.filter(item => item.value !== itemToRemove.value)
}

const removeFromMultipleCards = (itemToRemove) => {
  selectedMultipleCards.value = selectedMultipleCards.value.filter(item => item.id !== itemToRemove.id)
}
</script>

<style scoped>
/* Demo-specific styles */

/* 1. Alternating Background Colors */
.alternating-option {
  transition: background-color 0.2s ease;
}

/* Ensure selected items in alternating demo have black background */
.alternating-colors :deep([data-selected="true"]) {
  background-color: #000000 !important;
  color: #ffffff !important;
}

.alternating-colors :deep([data-selected="true"]:hover) {
  background-color: #1f1f1f !important;
}

/* 2. Custom Dropdown Styling */
.custom-dropdown-style :deep(.absolute) {
  border: 3px solid #3b82f6 !important;
  border-radius: 16px !important;
  padding: 8px !important;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3) !important;
}

/* 3. No Arrow */
.no-arrow-dropdown :deep(svg) {
  display: none !important;
}

/* 4. Custom "No Results" styling */
.no-results-message {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

/* 5. Image Grid Layout */
.image-grid-dropdown :deep(.grid) {
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 0.75rem !important;
}

.image-grid-dropdown :deep(.relative) {
  min-height: auto !important;
  border-radius: 8px !important;
}

.image-grid-dropdown :deep(.p-3) {
  padding: 0.5rem !important;
}

.image-grid-dropdown :deep([data-selected="true"] .p-3) {
  padding: 0 !important;
}

/* 6. Upload Button Styling */
.upload-button-dropdown :deep(.bg-blue-500) {
  width: 100%;
  text-align: center;
  border-radius: 8px;
  margin: 4px 0;
}

.upload-button-dropdown :deep(.bg-blue-500:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>