<template>
  <div class="telegram-post-page min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Telegram Post</h1>
      </div>

      <!-- Loading State -->
      <div v-if="currentView === 'loading'" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
        <p class="mt-6 text-gray-600">Loading your profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="currentView === 'error'" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Unable to Load Profile</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="initializePage" 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Setup View -->
      <div v-else-if="currentView === 'setup'" class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Setup Your Telegram Bot</h2>

          <form @submit.prevent="handleSaveToken" class="space-y-4">
            <div>
              <label for="bot-token" class="block text-sm font-medium text-gray-700 mb-2">
                Bot Token
              </label>
              <div class="relative">
                <input
                  id="bot-token"
                  v-model="tokenForm.botToken"
                  :type="showToken ? 'text' : 'password'"
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ..."
                  class="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  :disabled="isLoading"
                  required
                />
                <button
                  type="button"
                  @click="showToken = !showToken"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showToken" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Get your bot token from 
                <a 
                  href="https://t.me/BotFather" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline"
                >@BotFather</a>
              </p>
            </div>

            <button
              type="submit"
              :disabled="isLoading || !tokenForm.botToken.trim()"
              class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Saving...' : 'Save Token & Continue' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Create Post View -->
      <div v-else-if="currentView === 'create'" class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Create Your Post</h2>

          <form @submit.prevent="handlePostMessage" class="space-y-4">
            <!-- Chat ID -->
            <div>
              <label for="chat-id" class="block text-sm font-medium text-gray-700 mb-2">
                Chat ID / Channel
              </label>
              <input
                id="chat-id"
                v-model="postForm.chatId"
                type="text"
                placeholder="@yourchannel or -1001234567890"
                class="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :disabled="isLoading"
                required
              />
            </div>

            <!-- File Input -->
            <div>
              <label for="media-file" class="block text-sm font-medium text-gray-700 mb-2">
                Media File (Optional)
              </label>
              <input
                id="media-file"
                ref="fileInput"
                type="file"
                accept="image/*,video/*"
                class="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :disabled="isLoading"
                @change="handleFileChange"
              />
              <p v-if="selectedFile" class="mt-1 text-xs text-gray-600">
                Selected: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
              </p>
            </div>

            <!-- Message Text / Caption -->
            <div>
              <label for="message-text" class="block text-sm font-medium text-gray-700 mb-2">
                {{ selectedFile ? 'Caption' : 'Message' }}
              </label>
              <textarea
                id="message-text"
                v-model="postForm.text"
                rows="6"
                :placeholder="selectedFile ? 'Write a caption for your media...' : 'Write your message here...'"
                class="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                :disabled="isLoading"
                :required="!selectedFile"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                :disabled="isLoading || !postForm.chatId.trim() || (!postForm.text.trim() && !selectedFile)"
                class="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Sending...' : 'Send Message' }}
              </button>
              <button
                type="button"
                @click="handleReconfigureToken"
                :disabled="isLoading"
                class="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded disabled:opacity-50"
              >
                Change Bot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { getUserData, saveTelegramToken, postTelegramMessage } from '@/utils/backend/scyllaDbClient';
import { log } from '@/utils/common/logHandler';

// Auth store
const authStore = useAuthStore();

// State
const currentView = ref('loading'); // 'loading' | 'error' | 'setup' | 'create'
const isLoading = ref(false);
const error = ref('');
const userData = ref(null);
const showToken = ref(false);
const selectedFile = ref(null);
const fileInput = ref(null);

// Form states
const tokenForm = reactive({
  botToken: ''
});

const postForm = reactive({
  chatId: '',
  text: ''
});

// Computed
const userId = computed(() => {
  return authStore.currentUser?.raw?.sub || null;
});

// Methods
async function initializePage() {
  log('TelegramPost.vue', 'initializePage', 'start', 'Initializing Telegram Post page');
  
  currentView.value = 'loading';
  error.value = '';
  
  if (!userId.value) {
    log('TelegramPost.vue', 'initializePage', 'error', 'No userId found in auth store');
    error.value = 'You must be logged in to use this feature.';
    currentView.value = 'error';
    return;
  }

  try {
    const response = await getUserData(userId.value);
    userData.value = response;
    
    log('TelegramPost.vue', 'initializePage', 'success', 'User data fetched', { 
      hasTelegramToken: !!response?.telegram_bot_token 
    });

    // Determine which view to show based on telegram_bot_token
    if (response?.telegram_bot_token) {
      currentView.value = 'create';
    } else {
      currentView.value = 'setup';
    }
  } catch (err) {
    log('TelegramPost.vue', 'initializePage', 'error', 'Failed to fetch user data', { error: err.message });
    
    if (err.message?.includes('404') || err.message?.includes('not found')) {
      error.value = 'User profile not found. Please contact support.';
    } else {
      error.value = err.message || 'Failed to load your profile. Please try again.';
    }
    currentView.value = 'error';
  }
}

async function handleSaveToken() {
  if (!tokenForm.botToken.trim()) return;
  
  log('TelegramPost.vue', 'handleSaveToken', 'start', 'Saving Telegram bot token');
  
  isLoading.value = true;
  
  try {
    await saveTelegramToken(userId.value, tokenForm.botToken.trim());
    
    log('TelegramPost.vue', 'handleSaveToken', 'success', 'Token saved successfully');
    
    // Update local userData
    userData.value = { ...userData.value, telegram_bot_token: tokenForm.botToken.trim() };
    
    // Show success message using alert
    alert('Bot token saved successfully!');
    
    // Transition to create view
    currentView.value = 'create';
    
    // Clear the token form
    tokenForm.botToken = '';
  } catch (err) {
    log('TelegramPost.vue', 'handleSaveToken', 'error', 'Failed to save token', { error: err.message });
    alert(err.message || 'Failed to save bot token. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    log('TelegramPost.vue', 'handleFileChange', 'file-selected', 'File selected', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });
  } else {
    selectedFile.value = null;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function handlePostMessage() {
  if (!postForm.chatId.trim() || (!postForm.text.trim() && !selectedFile.value)) return;
  
  log('TelegramPost.vue', 'handlePostMessage', 'start', 'Posting message to Telegram', {
    chatId: postForm.chatId,
    hasFile: !!selectedFile.value
  });
  
  isLoading.value = true;
  
  try {
    const response = await postTelegramMessage(
      userId.value,
      postForm.chatId.trim(),
      postForm.text.trim() || '',
      selectedFile.value
    );
    
    log('TelegramPost.vue', 'handlePostMessage', 'success', 'Message posted successfully', { 
      messageId: response?.message_id 
    });
    
    // Show success message with message ID if available
    const successText = response?.message_id 
      ? `Message sent! (ID: ${response.message_id})`
      : 'Message sent successfully!';
    alert(successText);
    
    // Clear the form (keep chatId for convenience)
    postForm.text = '';
    selectedFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    
  } catch (err) {
    log('TelegramPost.vue', 'handlePostMessage', 'error', 'Failed to post message', { error: err.message });
    
    // Handle 401 Unauthorized - token is invalid
    if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      alert('Bot token is invalid. Please reconfigure your bot.');
      // Clear the stored token and redirect to setup
      userData.value = { ...userData.value, telegram_bot_token: null };
      currentView.value = 'setup';
    } else {
      alert(err.message || 'Failed to send message. Please try again.');
    }
  } finally {
    isLoading.value = false;
  }
}

function handleReconfigureToken() {
  // Reset to setup view to allow changing the bot token
  tokenForm.botToken = '';
  currentView.value = 'setup';
}

// Lifecycle
onMounted(() => {
  initializePage();
});
</script>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>

