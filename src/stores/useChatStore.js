import { defineStore } from "pinia";

// Helper function to load data from localStorage
const loadState = (key, defaultState) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultState;
  } catch (e) {
    console.warn(`Error loading ${key} from localStorage`, e);
    return defaultState;
  }
};

// Helper function to save data to localStorage
const saveState = (key, state) => {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn(`Error saving ${key} to localStorage`, e);
  }
};

export const useChatStore = defineStore("chat", {
  state: () => ({
    // Initialize with empty arrays to trigger the UI spinner
    messages: {},
    pagingStates: {},
  }),

  getters: {
    getMessagesByChatId: (state) => {
      return (chatId) => state.messages[chatId] || [];
    },
  },

  actions: {
    // Manually trigger hydration to simulate latency on persisted data
    async hydrate() {
      // Artificially delay loading from local storage to display the center spinner
      await new Promise((resolve) => setTimeout(resolve, 800));
      const persistedMessages = loadState("chat_messages", {});
      const persistedPaging = loadState("chat_paging", {});

      // Merge persisted messages into the reactive state
      for (const [chatId, messages] of Object.entries(persistedMessages)) {
        this.messages[chatId] = messages;
      }
      for (const [chatId, state] of Object.entries(persistedPaging)) {
        this.pagingStates[chatId] = state;
      }
    },

    setMessages(chatId, messagesList) {
      this.messages[chatId] = messagesList;
      saveState("chat_messages", this.messages);
    },

    addMessage(chatId, message) {
      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }
      // Check if message already exists (e.g. optimistic update vs actual received)
      const existingIdx = this.messages[chatId].findIndex(
        (m) => (m.id || m.message_id) === (message.id || message.message_id),
      );
      if (existingIdx !== -1) {
        this.messages[chatId][existingIdx] = message;
      } else {
        this.messages[chatId].push(message);
      }
      saveState("chat_messages", this.messages);
    },

    addMessageAction({ chatId, item }) {
      this.addMessage(chatId, item);
    },

    prependMessages(chatId, historicalMessages) {
      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }

      // Avoid duplicates based on ID
      const existingIds = new Set(this.messages[chatId].map((m) => (m.id || m.message_id)));
      const newMessages = historicalMessages.filter(
        (m) => !existingIds.has(m.id || m.message_id),
      );

      this.messages[chatId] = [...newMessages, ...this.messages[chatId]];
      saveState("chat_messages", this.messages);
    },

    prependMessagesAction({ chatId, items, pagingState }) {
      if (Array.isArray(items) && items.length > 0) {
        // Reverse array because historical messages arrive descending typically
        this.prependMessages(chatId, items.slice().reverse());
      }
      if (pagingState !== undefined) {
        this.pagingStates[chatId] = pagingState;
        saveState("chat_paging", this.pagingStates);
      }
    },

    clearCache() {
      this.messages = {};
      this.pagingStates = {};
      localStorage.removeItem("chat_messages");
      localStorage.removeItem("chat_paging");
    }
  },
});
