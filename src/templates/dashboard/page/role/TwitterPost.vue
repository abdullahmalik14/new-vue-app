<template>
  <div class="twitter-post-page min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Twitter Post</h1>
      </div>

      <!-- Loading State -->
      <div v-if="currentView === 'loading'" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
        <p class="mt-6 text-gray-600">Checking Twitter connection...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="currentView === 'error'" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Unable to Load</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="initializePage" 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Connect View -->
      <div v-else-if="currentView === 'connect'" class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Connect Your Twitter Account</h2>
          <p class="text-gray-600 mb-6">
            Connect your Twitter account to start posting tweets directly from this dashboard.
          </p>

          <button
            @click="handleConnectTwitter"
            :disabled="isLoading"
            class="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {{ isLoading ? 'Connecting...' : 'Connect Twitter' }}
          </button>
        </div>
      </div>

      <!-- Create Post View -->
      <div v-else-if="currentView === 'create'" class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <!-- Connected Status -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Create Your Tweet</h2>
            <span class="inline-flex items-center gap-1 text-sm text-green-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Connected
            </span>
          </div>

          <form @submit.prevent="handlePostTweet" class="space-y-4">
            <!-- Tweet Text -->
            <div>
              <label for="tweet-text" class="block text-sm font-medium text-gray-700 mb-2">
                Tweet Content
              </label>
              <textarea
                id="tweet-text"
                v-model="postForm.text"
                rows="4"
                maxlength="280"
                placeholder="What's happening?"
                class="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                :disabled="isLoading"
              ></textarea>
              <div class="flex justify-between mt-1">
                <p class="text-xs text-gray-500">
                  {{ selectedFiles.length > 0 ? 'Text is optional when images are attached' : 'Required' }}
                </p>
                <p class="text-xs" :class="characterCount > 280 ? 'text-red-500' : 'text-gray-500'">
                  {{ characterCount }}/280
                </p>
              </div>
            </div>

            <!-- Multi-File Input -->
            <div>
              <label for="media-files" class="block text-sm font-medium text-gray-700 mb-2">
                Images (Optional, max 4)
              </label>
              <input
                id="media-files"
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                class="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :disabled="isLoading"
                @change="handleFilesChange"
              />
              <div v-if="selectedFiles.length > 0" class="mt-2 space-y-1">
                <p class="text-xs text-gray-600">
                  {{ selectedFiles.length }} file(s) selected:
                </p>
                <ul class="text-xs text-gray-500 list-disc list-inside">
                  <li v-for="(file, index) in selectedFiles" :key="index">
                    {{ file.name }} ({{ formatFileSize(file.size) }})
                  </li>
                </ul>
              </div>
              <p v-if="fileError" class="mt-1 text-xs text-red-500">{{ fileError }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                :disabled="isLoading || !canSubmit"
                class="flex-1 py-2 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Posting...' : 'Post Tweet' }}
              </button>
              <button
                type="button"
                @click="handleReconnect"
                :disabled="isLoading"
                class="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded disabled:opacity-50"
              >
                Reconnect
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { getTwitterTokens, saveTwitterTokens, postTwitterMessage } from '@/utils/backend/scyllaDbClient';
import { initiateTwitterLogin, exchangeTwitterCodeForTokens } from '@/utils/auth/socialAuthHandler';
import { log } from '@/utils/common/logHandler';

// Auth store
const authStore = useAuthStore();

// State
const currentView = ref('loading'); // 'loading' | 'error' | 'connect' | 'create'
const isLoading = ref(false);
const error = ref('');
const selectedFiles = ref([]);
const fileError = ref('');
const fileInput = ref(null);

// OAuth popup tracking
let twitterPopup = null;
let currentOAuthState = null;

// Form state
const postForm = reactive({
  text: ''
});

// Computed
const userId = computed(() => {
  return authStore.currentUser?.raw?.sub || null;
});

const characterCount = computed(() => {
  return postForm.text.length;
});

const canSubmit = computed(() => {
  // Can submit if there's text or files
  const hasText = postForm.text.trim().length > 0;
  const hasFiles = selectedFiles.value.length > 0;
  const withinLimit = characterCount.value <= 280;
  return (hasText || hasFiles) && withinLimit;
});

// Methods
async function initializePage() {
  log('TwitterPost.vue', 'initializePage', 'start', 'Initializing Twitter Post page');
  
  currentView.value = 'loading';
  error.value = '';
  
  if (!userId.value) {
    log('TwitterPost.vue', 'initializePage', 'error', 'No userId found in auth store');
    error.value = 'You must be logged in to use this feature.';
    currentView.value = 'error';
    return;
  }

  try {
    const tokens = await getTwitterTokens(userId.value);
    
    log('TwitterPost.vue', 'initializePage', 'success', 'Token check complete', { 
      hasTokens: !!tokens 
    });

    // If tokens exist, show create view (backend handles lazy refresh)
    if (tokens && tokens.access_token) {
      currentView.value = 'create';
    } else {
      currentView.value = 'connect';
    }
  } catch (err) {
    log('TwitterPost.vue', 'initializePage', 'error', 'Failed to check Twitter tokens', { error: err.message });
    
    // 404 means no tokens - show connect view
    if (err.message?.includes('404') || err.message?.includes('not found')) {
      currentView.value = 'connect';
    } else {
      error.value = err.message || 'Failed to check Twitter connection. Please try again.';
      currentView.value = 'error';
    }
  }
}

async function handleConnectTwitter() {
  log('TwitterPost.vue', 'handleConnectTwitter', 'start', 'Starting Twitter OAuth flow');
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const { popup, state } = await initiateTwitterLogin();
    twitterPopup = popup;
    currentOAuthState = state;
    
    log('TwitterPost.vue', 'handleConnectTwitter', 'popup-opened', 'Twitter OAuth popup opened', { state });
  } catch (err) {
    log('TwitterPost.vue', 'handleConnectTwitter', 'error', 'Failed to open Twitter OAuth', { error: err.message });
    error.value = err.message || 'Failed to connect Twitter. Please try again.';
    isLoading.value = false;
  }
}

async function handleOAuthCallback(event) {
  // Validate message origin and structure
  // AuthTwitter.vue sends 'TWITTER_OAUTH_CODE' for success, 'TWITTER_AUTH_ERROR' for errors
  if (!event.data) {
    return;
  }

  // Handle error messages from popup
  if (event.data.type === 'TWITTER_AUTH_ERROR') {
    log('TwitterPost.vue', 'handleOAuthCallback', 'error-received', 'Received OAuth error from popup', {
      error: event.data.error
    });
    
    if (twitterPopup && !twitterPopup.closed) {
      twitterPopup.close();
    }
    twitterPopup = null;
    
    error.value = event.data.error || 'Twitter authentication failed.';
    isLoading.value = false;
    return;
  }

  // Handle success messages
  if (event.data.type !== 'TWITTER_OAUTH_CODE') {
    return;
  }

  const { code, state } = event.data;
  
  log('TwitterPost.vue', 'handleOAuthCallback', 'received', 'Received OAuth callback', { 
    hasCode: !!code, 
    state,
    expectedState: currentOAuthState 
  });

  // Validate state matches
  if (state !== currentOAuthState) {
    log('TwitterPost.vue', 'handleOAuthCallback', 'state-mismatch', 'OAuth state mismatch');
    return;
  }

  // Close popup
  if (twitterPopup && !twitterPopup.closed) {
    twitterPopup.close();
  }
  twitterPopup = null;

  if (!code) {
    error.value = 'No authorization code received from Twitter.';
    isLoading.value = false;
    return;
  }

  try {
    // Exchange code for tokens
    const tokenData = await exchangeTwitterCodeForTokens(code, state);
    
    log('TwitterPost.vue', 'handleOAuthCallback', 'tokens-received', 'Received Twitter tokens');

    // Save tokens to backend
    await saveTwitterTokens(
      userId.value,
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in
    );

    log('TwitterPost.vue', 'handleOAuthCallback', 'success', 'Twitter tokens saved');

    // Acknowledge the popup
    if (event.source) {
      event.source.postMessage({ type: 'TWITTER_OAUTH_ACK', success: true, state }, event.origin || "*");
    }

    // Show success and transition to create view
    alert('Twitter connected successfully!');
    currentView.value = 'create';
    currentOAuthState = null;
    
  } catch (err) {
    log('TwitterPost.vue', 'handleOAuthCallback', 'error', 'OAuth callback failed', { error: err.message });
    
    if (event.source) {
      event.source.postMessage({ type: 'TWITTER_OAUTH_ACK', success: false, state, error: err.message }, event.origin || "*");
    }
    
    error.value = err.message || 'Failed to connect Twitter. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

function handleFilesChange(event) {
  const files = Array.from(event.target.files || []);
  fileError.value = '';
  
  if (files.length > 4) {
    fileError.value = 'Maximum 4 images allowed. Only the first 4 will be used.';
    selectedFiles.value = files.slice(0, 4);
  } else {
    selectedFiles.value = files;
  }
  
  log('TwitterPost.vue', 'handleFilesChange', 'files-selected', 'Files selected', { 
    count: selectedFiles.value.length 
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function handlePostTweet() {
  if (!canSubmit.value) return;
  
  log('TwitterPost.vue', 'handlePostTweet', 'start', 'Posting tweet', {
    textLength: postForm.text.length,
    fileCount: selectedFiles.value.length
  });
  
  isLoading.value = true;
  
  try {
    const response = await postTwitterMessage(
      userId.value,
      postForm.text.trim(),
      selectedFiles.value
    );
    
    log('TwitterPost.vue', 'handlePostTweet', 'success', 'Tweet posted successfully', { 
      tweetId: response?.tweet_id || response?.id 
    });
    
    // Show success message
    const tweetId = response?.tweet_id || response?.id;
    const successText = tweetId 
      ? `Tweet posted! (ID: ${tweetId})`
      : 'Tweet posted successfully!';
    alert(successText);
    
    // Clear the form
    postForm.text = '';
    selectedFiles.value = [];
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    
  } catch (err) {
    log('TwitterPost.vue', 'handlePostTweet', 'error', 'Failed to post tweet', { error: err.message });
    
    // Handle 401 Unauthorized - tokens are invalid
    if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      alert('Twitter connection expired. Please reconnect your account.');
      currentView.value = 'connect';
    } else {
      alert(err.message || 'Failed to post tweet. Please try again.');
    }
  } finally {
    isLoading.value = false;
  }
}

function handleReconnect() {
  // Reset to connect view to allow reconnecting
  currentView.value = 'connect';
}

// Lifecycle
onMounted(() => {
  initializePage();
  window.addEventListener('message', handleOAuthCallback);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleOAuthCallback);
  // Close any open popup
  if (twitterPopup && !twitterPopup.closed) {
    twitterPopup.close();
  }
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

