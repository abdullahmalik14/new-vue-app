<template>
  <!-- <AuthLayout> -->
    <div class="relative z-20 flex flex-col items-center justify-center min-h-screen gap-4">
      <div v-if="isProcessing" class="flex flex-col items-center justify-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p class="text-white text-lg">{{ statusMessage }}</p>
      </div>
      <div v-else-if="error" class="flex flex-col items-center gap-4 max-w-2xl">
        <div class="text-red-500 text-lg font-bold">{{ error }}</div>
        <div class="bg-gray-800 p-4 rounded text-xs text-gray-300 font-mono overflow-auto max-h-64">
          <div class="mb-2">{{ t('auth.oauth.debug.title') }}</div>
          <div>{{ t('auth.oauth.debug.urlState') }} {{ route.query.state || t('auth.oauth.debug.missing') }}</div>
          <div>{{ t('auth.oauth.debug.storedState') }} {{ debugInfo.storedState || t('auth.oauth.debug.missing') }}</div>
          <div>{{ t('auth.oauth.debug.code') }} {{ route.query.code ? t('auth.oauth.debug.present') : t('auth.oauth.debug.missing') }}</div>
          <div>{{ t('auth.oauth.debug.localStorageKeys') }} {{ debugInfo.localStorageKeys || t('auth.oauth.debug.none') }}</div>
        </div>
        <p class="text-white text-sm">{{ t('auth.oauth.twitter.closeHint') }}</p>
      </div>
    </div>
  <!-- </AuthLayout> -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { log } from '@/infrastructure/logging/logHandler.js';

const { t } = useI18n();
const route = useRoute();
const isProcessing = ref(true);
const statusMessage = ref(t('auth.oauth.twitter.processing'));
const error = ref(null);
const debugInfo = ref({
  storedState: null,
  localStorageKeys: null
});

// Handle Twitter OAuth callback
async function completeTwitterOAuthCallback() {
  log('TwitterAuthPage.vue', 'completeTwitterOAuthCallback', 'start', 'Processing Twitter OAuth callback', {});
  window.performanceTracker?.step({
    step: 'completeTwitterOAuthCallback_start',
    file: 'TwitterAuthPage.vue',
    method: 'completeTwitterOAuthCallback',
    flag: 'start',
    purpose: 'Process Twitter OAuth callback'
  });

  try {
    // Extract code and state from URL
    const code = route.query.code;
    const state = route.query.state;
    const errorParam = route.query.error;

    // Debug logging
    console.log('[AuthTwitter] Callback received:', {
      code: code ? 'present' : 'missing',
      state: state || 'missing',
      errorParam: errorParam || 'none',
      fullQuery: route.query,
      hasOpener: !!window.opener
    });

    debugInfo.value = {
      storedState: 'Using postMessage to parent',
      localStorageKeys: 'Code_verifier stored in parent window memory'
    };

    if (errorParam) {
      throw new Error(`Twitter OAuth error: ${errorParam}. ${route.query.error_description || ''}`);
    }

    if (!code || !state) {
      throw new Error(`Missing authorization code or state parameter. Code: ${code ? 'present' : 'missing'}, State: ${state ? 'present' : 'missing'}`);
    }

    // Send code and state to parent window via postMessage.
    // Parent window has code_verifier in memory and will handle the token exchange.
    console.log('[AuthTwitter] Checking window.opener:', {
      hasOpener: !!window.opener,
      openerClosed: window.opener?.closed,
      origin: window.location.origin
    });
    
    if (window.opener && !window.opener.closed) {
      const message = {
        type: 'twitter-oauth-code',
        code: code,
        state: state,
        source: 'twitter-oauth-popup',
        v: 1
      };
      
      console.log('[AuthTwitter] Sending message to parent:', {
        type: message.type,
        hasCode: !!message.code,
        hasState: !!message.state,
        codeLength: message.code?.length,
        stateLength: message.state?.length
      });
      
      log('TwitterAuthPage.vue', 'completeTwitterOAuthCallback', 'send-code', 'Sending code to parent window', {});
      
      statusMessage.value = t('auth.oauth.twitter.sending');
      
      try {
        // We intentionally use "*" for delivery because the callback page might be on
        // a different origin (e.g., ngrok) than the parent. The parent must validate
        // using `event.source` and the `state` value.
        window.opener.postMessage(message, '*');
        console.log('[AuthTwitter] Message sent to parent window:', {
          messageType: message.type,
          targetOrigin: '*'
        });
      } catch (err) {
        console.error('[AuthTwitter] Error sending message:', err);
        throw err;
      }

      log('TwitterAuthPage.vue', 'completeTwitterOAuthCallback', 'message-sent', 'Code sent to parent', {});

      statusMessage.value = t('auth.oauth.twitter.complete');

      // Don't close immediately - wait for parent to acknowledge or timeout after 30s
      let acknowledged = false;
      const timeout = setTimeout(() => {
        if (!acknowledged) {
          statusMessage.value = t('auth.oauth.twitter.timeoutNotice');
          console.warn('[AuthTwitter] Timeout waiting for parent acknowledgment');
        }
      }, 30000);

      // Listen for acknowledgment from parent (optional)
      const ackListener = (event) => {
        if (event.data && event.data.type === 'twitter-oauth-ack' && event.data.state === state) {
          acknowledged = true;
          clearTimeout(timeout);
          window.removeEventListener('message', ackListener);
          statusMessage.value = t('auth.oauth.twitter.successClosing');
          setTimeout(() => {
            window.close();
          }, 1000);
        }
      };
      window.addEventListener('message', ackListener);

      // Fallback: close after 5 seconds if parent doesn't respond
      setTimeout(() => {
        if (!acknowledged) {
          window.removeEventListener('message', ackListener);
          clearTimeout(timeout);
          // Don't auto-close - let user close manually to see if there were errors
          statusMessage.value = t('auth.oauth.twitter.manualClose');
        }
      }, 5000);
    } else {
      // Not in popup - this shouldn't happen in popup flow
      throw new Error('Not in popup window - cannot complete OAuth flow');
    }

    window.performanceTracker?.step({
      step: 'completeTwitterOAuthCallback_complete',
      file: 'TwitterAuthPage.vue',
      method: 'completeTwitterOAuthCallback',
      flag: 'success',
      purpose: 'Twitter callback processed successfully'
    });
  } catch (err) {
    log('TwitterAuthPage.vue', 'completeTwitterOAuthCallback', 'error', 'Twitter callback failed', {
      error: err.message,
      stack: err.stack
    });

    error.value = err.message || t('auth.oauth.twitter.genericError');
    isProcessing.value = false;

    // Send error message to parent window (if popup)
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: 'twitter-auth-error',
          error: error.value
        },
        window.location.origin
      );

      // Don't close popup on error - let user see the error and close manually
      statusMessage.value = t('auth.oauth.twitter.errorOccurred');
    }

    window.performanceTracker?.step({
      step: 'completeTwitterOAuthCallback_error',
      file: 'TwitterAuthPage.vue',
      method: 'completeTwitterOAuthCallback',
      flag: 'error',
      purpose: 'Twitter callback failed'
    });
  }
}

onMounted(() => {
  completeTwitterOAuthCallback();
});
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: []
};
</script>