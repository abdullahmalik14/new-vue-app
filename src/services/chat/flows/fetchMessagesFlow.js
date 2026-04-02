import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function fetchMessagesFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const { chatId, limit = 20, pagingState } = payload;
  
  if (!chatId) {
    return fail({ code: "FETCH_MESSAGES_MISSING_CHAT_ID", message: "chatId is required." });
  }
  
  let url = `${baseUrl}/chats/${chatId}/messages`;
  let query = { limit };
  if (pagingState) {
    query.pagingState = JSON.stringify(pagingState);
  }

  try {
    const response = await api.get(url, query);
    
    const status = getHttpStatus(response, 200);
    if (response?.ok === false) {
      return fail({ code: "FETCH_MESSAGES_FAILED", message: response?.error || "Failed to fetch messages" }, { flow: "chat.fetchMessages", status });
    }
    
    const mappedItems = (response?.messages || []).map(msg => {
      // ScyllaDB/DynamoDB marshalled content extraction
      let text = msg.content;
      if (typeof text === 'object' && text !== null) {
        if (text.text && typeof text.text === 'object' && text.text.S) {
          text = text.text.S;
        } else if (typeof text.text === 'string') {
          text = text.text;
        }
      }

      return {
        id: msg.message_id,
        message_id: msg.message_id,
        chatId: msg.chat_id || chatId,
        senderId: msg.sender_id || 'unknown',
        senderName: msg.sender_id || 'unknown',
        text: text || '',
        type: msg.content_type || 'text',
        // Fallback time formatting
        time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase().replace(" ", "") : ''
      };
    });

    return ok({ 
      items: mappedItems, 
      pagingState: response?.pagingState, 
      chatId 
    }, { flow: "chat.fetchMessages", status });
  } catch (error) {
    return asFlowError(error, "FETCH_MESSAGES_UNEXPECTED");
  }
}
