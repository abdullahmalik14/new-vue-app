import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js";
import { useChatStore } from "@/stores/useChatStore.js";

/**
 * Chat Data Pipeline
 * Responsible for fetching data from the backend (mock API),
 * transforming it if necessary, and ingesting it into the Pinia store.
 */
export const chatPipeline = {
  /**
   * Fetch historical messages for a specific chat and populate the store.
   * @param {string} chatId - ID of the chat instance
   * @param {number} limit - Pagination limit
   * @param {number} offset - Pagination offset
   */
  async fetchChatMessagesPipeline(chatId, limit = 20, offset = 0) {
    try {
      console.log(`[Pipeline] Fetching messages for ${chatId}...`);

      // 1. Simulate network latency to see the loader spinner
      // If offset is 0, we are loading the initial page state. Give it a longer 2-second delay so the user can see the center spinner.
      const delayMs = offset === 0 ? 3000 : 800;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Call Mock API using ApiWrapper
      const response = await apiWrapper.get("/chat/messages", {
        chatId,
        limit,
        offset,
      });

      if (response && response.success) {
        const chatStore = useChatStore();

        // Formatter/Transformer logic (if we needed it)
        const formattedMessages = response.messages.map((msg) => ({
          ...msg,
          // We can format timestamps or inject helper properties here
          _loadedAt: new Date().getTime(),
        }));

        // Ingest into Pinia (prepend history so scroll maintains)
        chatStore.prependMessages(chatId, formattedMessages.reverse());

        return {
          success: true,
          count: formattedMessages.length,
          total: response.total,
        };
      } else {
        console.error(`[Pipeline] Failed to fetch messages for ${chatId}`);
        return { success: false };
      }
    } catch (error) {
      console.error(`[Pipeline] Error in fetchChatMessagesPipeline:`, error);
      return { success: false, error };
    }
  },
};
