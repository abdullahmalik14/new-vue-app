import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js";
import mockSocket from "@/utils/chat/mockSocket.js";
import { useChatStore } from "@/stores/useChatStore.js";

/**
 * Chat Flow Handler
 * Responsible for handling user actions (Flows) like sending a message,
 * making API calls, and emitting events to sockets or handling incoming ones.
 */
export const chatFlowHandler = {
  /**
   * Called when a user clicks "Send Message"
   * @param {Object} payload
   */
  async sendMessageFlow({
    chatId,
    senderId,
    text,
    type = "text",
    time = null,
    systemType = null,
    senderName = null,
  }) {
    if (!text || text.trim() === "") return false;

    // In real app, generate a unique ID
    const msgId = Date.now().toString();
    const currTime =
      time ||
      new Date()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .toLowerCase()
        .replace(" ", "");

    // 1. Send data to Backend via mock API (simulating validation/db save)
    try {
      console.log(`[FlowHandler] Sending message to backend API...`);
      const response = await apiWrapper.post("/chat/send", {
        id: msgId,
        chatId,
        senderId,
        text,
        time: currTime,
        type,
        systemType,
        senderName,
      });

      if (response && response.success) {
        // 2. Mock Backend Broadcast behavior -> Send to mock socket
        // In real app backend does this. We simulate it here.
        console.log(`[FlowHandler] Backend API success. Emitting to socket...`);
        mockSocket.send("receive_message", response.data);
        return true;
      } else {
        console.error(`[FlowHandler] Send message API failed`);
        return false;
      }
    } catch (error) {
      console.error(`[FlowHandler] Send message flow error:`, error);
      return false;
    }
  },

  /**
   * Called when the mock socket fires a 'receive_message' event
   * @param {Object} messagePayload
   */
  receiveMessageFlow(messagePayload) {
    if (!messagePayload || !messagePayload.chatId) return;

    console.log(
      `[FlowHandler] Received message via socket for chat ${messagePayload.chatId}`,
      messagePayload,
    );

    // 1. Validation/Sanitization logic can live here
    const sanitizedMessage = {
      ...messagePayload,
      text: escapeHtml(messagePayload.text),
    };

    // 2. Save directly to Pinia store so UI updates
    const chatStore = useChatStore();
    chatStore.addMessage(messagePayload.chatId, sanitizedMessage);
  },

  /**
   * Initialize socket listeners
   */
  initListeners() {
    mockSocket.off("receive_message", this.receiveMessageFlow);
    mockSocket.on("receive_message", this.receiveMessageFlow);
    console.log(`[FlowHandler] Socket listeners initialized`);
  },
};

// Simple HTML escaper
function escapeHtml(text) {
  if (!text) return text;
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  // In our mock we might pass normal text, but simulating a pipeline sanitization phase
  return text.substring(0, 1000); // just cap length for demo
}
