<template>
  <DashboardWrapperTwoColContainer>
    <div
      class="h-[750px] w-full max-w-6xl mx-auto my-8 flex shadow-2xl rounded-xl overflow-hidden shadow-zinc-400/50 bg-white">

      <!-- LEFT SIDEBAR: CHAT LIST -->
      <div class="w-80 border-r border-zinc-200 flex flex-col bg-gray-50/50 shrink-0">
        <div class="p-5 border-b border-zinc-200 bg-white flex items-center justify-between shadow-sm z-10">
          <h2 class="font-bold text-lg text-gray-900">Conversations</h2>
          <div
            class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
            {{ displayInitials }}
          </div>
        </div>

        <div class="flex-1 overflow-y-auto w-full">
          <div v-for="contact in contactList" :key="contact.id" @click="selectChat(contact.id)" :class="[
            'w-full cursor-pointer p-4 border-b border-zinc-100 transition-colors flex items-center gap-3',
            selectedChatId === contact.id ? 'bg-indigo-50/80 border-l-4 border-l-indigo-500' : 'hover:bg-zinc-100 border-l-4 border-l-transparent'
          ]">
            <div class="relative shrink-0">
              <img :src="contact.avatar" class="w-12 h-12 rounded-full object-cover shadow-sm bg-white" />
              <div v-if="contact.type === 'group'"
                class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                <img src="/images/users.png" alt="group" class="w-4 h-4 brightness-0 opacity-70" />
              </div>
              <div v-if="getUnreadCount(contact.id) > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex flex-col justify-center items-center rounded-full font-bold shadow">
                {{ getUnreadCount(contact.id) }}
              </div>
            </div>

            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <div class="font-semibold text-gray-900 truncate text-sm">
                {{ contact.name }}
              </div>
              <div class="text-xs text-gray-500 truncate flex items-center gap-1">
                <span v-if="contact.type === 'private'" class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {{ contact.type === 'group' ? '4 Participants' : contact.role }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT MAIN: CHAT VIEW -->
      <div class="flex-1 flex flex-col h-full bg-[#fcfcfc] w-full min-w-0 relative">
        <div v-if="selectedChat" class="flex-1 h-full w-full relative flex flex-col overflow-hidden">
          <FlexChat class="h-full flex flex-col w-full absolute inset-0" :messages="activeMessages"
            :currentUserId="currentUserId" :isGroupChat="selectedChat.type === 'group'"
            :variantForMessage="msg => msg.type === 'system' ? 'system' : null" :theme="chatTheme"
            :hasMore="activeHasMore" :loading="activeLoading" @load-more="fetchMoreActiveMessages"
            :typingUsers="filteredTypingUsers" :infinite="true">
            <!-- DYNAMIC HEADER -->
            <template #header>
              <div class="w-full">
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-3">
                    <img :src="selectedChat.avatar"
                      class="w-10 h-10 rounded-full object-cover shadow-sm border border-zinc-200 bg-white" />
                    <div class="flex flex-col">
                      <div class="text-gray-900 font-bold text-[15px] flex items-center gap-2">
                        {{ selectedChat.name }}
                        <span v-if="selectedChat.type === 'private'"
                          class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold tracking-wider">DM</span>
                      </div>
                      <div class="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <span v-if="selectedChat.type === 'group'">
                          <img src="/images/users.png" class="size-3 inline opacity-50 mr-1 pb-0.5" />
                          3 Members
                        </span>
                        <span v-else class="flex items-center gap-1.5">
                          <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 text-zinc-400">
                    <svg class="w-5 h-5 cursor-pointer hover:text-indigo-600 transition-colors" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <svg class="w-5 h-5 cursor-pointer hover:text-indigo-600 transition-colors" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                      </path>
                    </svg>
                  </div>
                </div>
              </div>
            </template>

            <!-- CUSTOM SYSTEM MESSAGES -->
            <template #message.system="{ message }">
              <div class="w-full flex justify-center mb-2 mt-4 px-1">
                <div
                  class="text-[11px] uppercase tracking-wider text-zinc-400 font-bold py-1 px-4 bg-zinc-100/80 rounded-full border border-zinc-200">
                  {{ message.text }}
                </div>
              </div>
            </template>

            <template #message.content="{ message }">
              <div class="leading-relaxed">{{ message.text }}</div>
            </template>

            <!-- DYNAMIC AVATARS FOR MESSAGES -->
            <template #message.avatar.me="{ message }">
              <img v-if="message.time" :src="getUserAvatarUrl(message.senderId)"
                class="w-6 h-6 rounded-full object-cover shadow-sm bg-indigo-50 border border-indigo-100" />
              <div v-else class="w-6 h-6"></div>
            </template>

            <template #message.avatar="{ message }">
              <img v-if="message.time" :src="getUserAvatarUrl(message.senderId)"
                class="w-6 h-6 rounded-full object-cover shadow-sm bg-gray-50 border border-gray-200" />
              <div v-else class="w-6 h-6"></div>
            </template>

            <!-- COMPOSE BOX -->
            <template #compose>
              <div class="flex items-center gap-3 my-1 w-full relative">
                <input type="text" :placeholder="'Message ' + selectedChat.name + '...'" v-model="composeText"
                  @keyup.enter="handleSend" @input="handleTyping"
                  class=" text-[15px] bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium w-full px-2" />

                <div class="flex gap-4 text-zinc-400 justify-end w-auto whitespace-nowrap items-center shrink-0">
                  <svg class="w-5 h-5 cursor-pointer hover:text-indigo-500 transition-colors" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg class="w-5 h-5 cursor-pointer hover:text-indigo-500 transition-colors" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                    </path>
                  </svg>
                  <button @click="handleSend"
                    class="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-md transition-transform active:scale-95">
                    <svg class="w-4 h-4 translate-x-px -translate-y-px" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </template>
          </FlexChat>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4 bg-gray-50">
          <div class="p-6 bg-white rounded-full shadow-sm border border-zinc-100">
            <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
              </path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-700">No Chat Selected</h2>
          <p class="text-gray-400 max-w-sm text-sm">Select a conversation from the sidebar to start messaging.</p>
        </div>
      </div>

    </div>
  </DashboardWrapperTwoColContainer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import FlexChat from '@/components/ui/chat/FlexChat.vue'
import DashboardWrapperTwoColContainer from '@/components/dashboard/DashboardWrapperTwoColContainer.vue'
import { useChatStore } from '@/stores/useChatStore.js'
import { FlowHandler } from '@/services/flow-system/FlowHandler.js'
import { useAuthStore } from '@/stores/useAuthStore.js'
import SocketHandler from '@/services/socket/SocketHandler.js'

// --- CORE AUTH ---
const authStore = useAuthStore()
const chatStore = useChatStore()

// userId extraction:
// - Real Cognito sub (UUID): use as-is → '97c45ac8-70e1-7093-2a13-c492458b486c' ✅
// - Mock sub 'mock-user-XXXXX': strip prefix → '1775053005043' (numeric, AWS accepts) ✅
// - No sub: email prefix fallback
const extractUserId = (sub) => {
  if (!sub) return null
  if (String(sub).startsWith('mock-user-')) return String(sub).replace('mock-user-', '')
  return String(sub)
}

const currentUserId = computed(() => {
  const extracted = extractUserId(authStore.currentUser?.raw?.sub)
  if (extracted) return extracted
  const email = String(authStore.currentUser?.email || '').trim().toLowerCase()
  if (email) return email.split('@')[0]
  return 'dev'
})
const currentUserRole = computed(() => authStore.userRole || 'creator')

// STABLE socket routing IDs — numeric fallback use karo (AWS accepts these)
const CREATOR_SUB = '97c45ac8-70e1-7093-2a13-c492458b486c'
const FAN1_ID = '1775053005043'
const FAN2_ID = '1775055865377'
const FAN3_ID = '1775068094042'

// GROUP: Creator + all fans using numeric stable IDs
const GROUP_CHAT_MEMBERS = [CREATOR_SUB, FAN1_ID, FAN2_ID, FAN3_ID]

const displayInitials = computed(() => {
  return currentUserId.value.substring(0, 2).toUpperCase()
})



// --- SIDEBAR DATA ---
const contactList = computed(() => [
  {
    id: 'group-chat',
    type: 'group',
    name: 'VVIP Tier Group',
    members: GROUP_CHAT_MEMBERS,
    avatar: 'https://ui-avatars.com/api/?name=VVIP&background=0f172a&color=fff&rounded=true'
  },
  {
    id: 'dm-abfan',
    type: 'private',
    name: 'abfan',
    recipientId: FAN1_ID,   // 'abfan' — matches fan's WebSocket userID ✅
    role: 'Top Fan',
    avatar: 'https://ui-avatars.com/api/?name=abfan&background=3b82f6&color=fff&rounded=true'
  },
  {
    id: 'dm-fan2',
    type: 'private',
    name: 'fan2',
    recipientId: FAN2_ID,   // 'fan2' — matches fan's WebSocket userID ✅
    role: 'New Fan',
    avatar: 'https://ui-avatars.com/api/?name=fan2&background=f43f5e&color=fff&rounded=true'
  },
  {
    id: 'dm-fan3',
    type: 'private',
    name: 'fan3',
    recipientId: FAN3_ID,   // 'fan3' — matches fan's WebSocket userID ✅
    role: 'New Fan',
    avatar: 'https://ui-avatars.com/api/?name=fan3&background=f43f5e&color=fff&rounded=true'
  }
])


const selectedChatId = ref('group-chat')
const selectedChat = computed(() => contactList.value.find(c => c.id === selectedChatId.value))

// Switch chats from Sidebar
const selectChat = async (id) => {
  if (selectedChatId.value === id) return
  selectedChatId.value = id
  composeText.value = ''

  // Sync from DB immediately on switch to grab any missing/new messages
  await fetchMoreActiveMessages()
}

// Global unread counters mock (In production, map to useChatStore.unreadMap)
const unreadCounts = ref({})
const getUnreadCount = (id) => {
  if (selectedChatId.value === id) return 0 // Active chat has NO unread
  return unreadCounts.value[id] || 0
}

// ID → Display name mapping (PEHLE declare karo, baad mein getUserAvatarUrl use karega)
const getUserDisplayName = (userId) => {
  if (!userId) return 'Unknown'
  const map = {
    [CREATOR_SUB]: 'dev (Creator)',
    [FAN1_ID]: 'abfan',
    [FAN2_ID]: 'fan2',
    [FAN3_ID]: 'fan3',
    // Email prefix fallbacks
    'dev': 'dev (Creator)',
    'abfan': 'abfan',
    'fan2': 'fan2',
    'fan3': 'fan3',
  }
  return map[userId] || userId
}

// Dynamic UI helper — getUserDisplayName ke BAAD declare karo
const getUserAvatarUrl = (id) => {
  const name = getUserDisplayName(id)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&rounded=true&bold=true`
}


// --- ACTIVE CHAT DYNAMICS ---
const composeText = ref('')
const activeMessages = computed(() => chatStore.getMessagesByChatId(selectedChatId.value))
const activeHasMore = ref(true)
const activeLoading = ref(false)

// We preserve the core theme styles you provided exactly as instructed
const chatTheme = {
  container: 'relative bg-white flex flex-col h-full w-full overflow-hidden shrink-0',
  header: 'bg-white font-sans px-5 py-4 shrink-0 z-10 border-b border-zinc-200 relative',
  body: 'flex-1 overflow-y-auto px-6 py-4 space-y-2.5 scroll-smooth flex flex-col pt-6 bg-[#fafafa] absolute inset-x-0 bottom-[75px] top-[73px]',
  compose: 'bg-white px-5 py-3 shrink-0 border-t border-zinc-200 absolute bottom-0 inset-x-0',
  myMessageRow: 'flex w-full justify-end mt-1.5',
  otherMessageRow: 'flex w-full justify-start mt-1.5',
  systemMessageRow: 'flex w-full justify-center my-4',
  myBubble: 'text-white text-[15px] font-medium max-w-[85%] min-w-16 min-h-10 px-4 py-2 bg-indigo-600 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-sm inline-flex justify-center items-center gap-2.5',
  otherBubble: 'text-gray-800 text-[15px] font-medium max-w-[85%] min-w-16 min-h-10 px-4 py-2 bg-white border border-gray-100 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm inline-flex justify-center items-center gap-2.5',
  systemBubble: 'w-full',
  metaWrapper: 'opacity-90 mt-1',
  myNameMeta: 'hidden',
  myTimeMeta: 'text-[10px] text-gray-400 font-semibold uppercase tracking-wider',
  otherNameMeta: 'text-[11px] text-gray-500 font-bold block mb-1',
  otherTimeMeta: 'text-[10px] text-gray-400 font-semibold uppercase tracking-wider',
  avatarWrapper: 'flex shrink-0 items-end mb-1 mr-2',
  avatarImg: 'w-6 h-6 rounded-full object-cover shadow-sm bg-white',
}


// ---------------- TYPING INDICATOR SCOPING ----------------
// Instead of a global typing list, we map typing users PER chat ID
const activeTypingSets = ref({})

const filteredTypingUsers = computed(() => {
  const setForChat = activeTypingSets.value[selectedChatId.value]
  if (!setForChat) return []
  // Map stored userIds back to their display names for the UI to show
  return Array.from(setForChat).map(uid => getUserDisplayName(uid))
})

let typingThrottle = null
const clearTypingTimer = {}

const handleTyping = () => {
  if (typingThrottle) return

  const chat = selectedChat.value
  if (!chat) return

  const typingRecipients = chat.type === 'group'
    ? (chat.members || GROUP_CHAT_MEMBERS).filter(uid => uid !== currentUserId.value)
    : [chat.recipientId]

  typingRecipients.forEach(recipientId => {
    SocketHandler.sendSocketMessage({
      flag: 'chat:message:create',
      payload: {
        action: 'typing',
        chatId: selectedChatId.value,
        to: recipientId,
        senderId: currentUserId.value,
        senderName: getUserDisplayName(currentUserId.value) // naam bhi bhejo
      }
    }).catch(err => console.error("Error sending typing indicator:", err))
  })

  typingThrottle = setTimeout(() => {
    typingThrottle = null
  }, 1500)
}

const receiveTyping = (chatId, userId, senderName) => {
  if (!userId || userId === currentUserId.value) return

  if (!activeTypingSets.value[chatId]) {
    activeTypingSets.value[chatId] = new Set()
  }

  // NOTE: Store userId (not displayName) so it can be perfectly matched
  // and deleted when the actual message arrives via payload.senderId
  activeTypingSets.value[chatId].add(userId)
  activeTypingSets.value[chatId] = new Set(activeTypingSets.value[chatId])

  const timerKey = `${chatId}_${userId}`
  if (clearTypingTimer[timerKey]) clearTimeout(clearTypingTimer[timerKey])

  clearTypingTimer[timerKey] = setTimeout(() => {
    if (activeTypingSets.value[chatId]) {
      activeTypingSets.value[chatId].delete(userId)
      activeTypingSets.value[chatId] = new Set(activeTypingSets.value[chatId])
    }
  }, 3000)
}


// ---------------- FETCH HISTORICAL MESSAGES ----------------
const fetchMoreActiveMessages = async () => {
  if (activeLoading.value || !activeHasMore.value) return
  activeLoading.value = true

  const cid = selectedChatId.value
  const pagingState = chatStore.pagingStates[cid] || null;
  const res = await FlowHandler.run('chat.fetchMessages', { chatId: cid, limit: 20, pagingState });

  if (res.ok) {
    if (res.data.items && res.data.items.length > 0) {
      chatStore.prependMessagesAction({
        chatId: cid,
        items: res.data.items,
        pagingState: res.data.pagingState
      })
    }
    if (!res.data.items || res.data.items.length === 0 || !res.data.pagingState) {
      activeHasMore.value = false;
    }
  } else {
    activeHasMore.value = false;
  }
  activeLoading.value = false
}

// Mount par SAARE chats fetch karo — sirf selected nahi
// Isse localStorage clear hone ke baad bhi DB se data aata hai
const fetchAllChatsFromDB = async () => {
  const allChatIds = contactList.value.map(c => c.id)
  for (const chatId of allChatIds) {
    const pagingState = chatStore.pagingStates[chatId] || null
    const res = await FlowHandler.run('chat.fetchMessages', { chatId, limit: 20, pagingState })
    if (res.ok && res.data.items && res.data.items.length > 0) {
      chatStore.prependMessagesAction({
        chatId,
        items: res.data.items,
        pagingState: res.data.pagingState
      })
      console.log(`[Creator] ✅ Fetched ${res.data.items.length} msgs for ${chatId}`)
    }
  }
}

// ---------------- SEND MESSAGES ----------------
const handleSend = async () => {
  const text = composeText.value
  if (!text || !text.trim() || !selectedChat.value) return

  const targetChatId = selectedChatId.value
  composeText.value = ''

  const tempMsgId = 'msg-' + Date.now() + Math.random().toString(36).substr(2, 5)
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase().replace(" ", "")

  // 1. Optimistic Update
  const messageObj = {
    id: tempMsgId,
    message_id: tempMsgId,
    chatId: targetChatId,
    senderId: currentUserId.value,
    senderName: getUserDisplayName(currentUserId.value), // ID nahi, naam
    text,
    type: 'text',
    time: timeStr
  }

  chatStore.addMessage(targetChatId, messageObj)

  // 2. Save to Database permanently via HTTP API Flow
  try {
    const res = await FlowHandler.run('chat.sendMessage', {
      chatId: targetChatId,
      senderId: currentUserId.value,
      text: text,
      type: 'text'
    })
    if (!res.ok) {
      console.warn("Failed to permanently save message to DB", res.error)
    }
  } catch (err) {
    console.error("Database save failed: ", err)
  }

  // 3. Notify other clients instantly via Socket
  // CRITICAL: AWS Lambda routes by single 'to' userId only.
  // For groups: we loop and send one socket message per recipient.
  // For DMs: send one message to the specific fan's userId.
  const chat = selectedChat.value

  const socketRecipients = chat.type === 'group'
    ? (chat.members || GROUP_CHAT_MEMBERS).filter(uid => uid !== currentUserId.value)
    : [chat.recipientId]

  const basePayload = {
    id: tempMsgId,
    chatId: targetChatId,
    senderId: currentUserId.value,
    senderName: getUserDisplayName(currentUserId.value), // naam bhi bhejo
    text,
    type: 'text',
    time: timeStr
  }

  // Send one message per recipient so AWS can route correctly
  socketRecipients.forEach(recipientId => {
    SocketHandler.sendSocketMessage({
      flag: 'chat:message:create',
      payload: { ...basePayload, to: recipientId }
    }).catch(e => console.error(`[Creator] Failed to send socket msg to ${recipientId}:`, e))
  })
}

// ---------------- SOCKET LISTENERS ----------------
const handleSocketIncoming = (payload) => {
  console.log("[DashboardChatsCreator] 📥 Socket Incoming:", payload)
  if (!payload) return

  // 1. Process Typing indicators globally for all chats
  if (payload.action === 'typing') {
    receiveTyping(payload.chatId || 'group-chat', payload.senderId, payload.senderName)
    return
  }

  if (!payload.id) return

  // FILTER: Ignore messages we sent ourselves (prevents echo/duplicate)
  // AWS Gateway echoes back to the sender too — we've already done optimistic update
  if (payload.senderId === currentUserId.value) {
    console.log("[DashboardChatsCreator] ⏭️ Skipping own echo message:", payload.id)
    return
  }

  // Clear typing for this sender immediately upon receiving actual message
  if (payload.senderId && activeTypingSets.value[payload.chatId]) {
    activeTypingSets.value[payload.chatId].delete(payload.senderId)
    activeTypingSets.value[payload.chatId] = new Set(activeTypingSets.value[payload.chatId])
    const timerKey = `${payload.chatId}_${payload.senderId}`
    if (clearTypingTimer[timerKey]) clearTimeout(clearTypingTimer[timerKey])
  }

  // 2. Add message to correct chat in store
  const constructedMsg = {
    id: payload.id,
    message_id: payload.id,
    chatId: payload.chatId,
    senderId: payload.senderId,
    senderName: payload.senderName || getUserDisplayName(payload.senderId), // naam, ID nahi
    text: payload.text,
    type: payload.type || 'text',
    time: payload.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase().replace(" ", "")
  }

  chatStore.addMessage(payload.chatId, constructedMsg)

  // 3. Mark unread if not the active chat
  if (payload.chatId !== selectedChatId.value) {
    unreadCounts.value[payload.chatId] = (unreadCounts.value[payload.chatId] || 0) + 1
  }
}

// ---------------- LIFECYCLE ----------------
onMounted(async () => {
  activeLoading.value = true
  await chatStore.hydrate()

  // Saare chats DB se fetch karo (localStorage clear hone pe bhi data milega)
  await fetchAllChatsFromDB()
  activeLoading.value = false

  try {
    SocketHandler.identifyCurrentUser(currentUserId.value)
    SocketHandler._initializeSocketConnection()

    SocketHandler.registerSocketListener({
      flag: 'chat:message:create',
      callback: handleSocketIncoming
    })

    console.log(`[DashboardChatsCreator - DYNAMIC] WebSocket active for UID: ${currentUserId.value}`)
  } catch (err) {
    console.warn("Socket connection failed", err)
  }
})

onUnmounted(() => {
  // Socket listener teardown managed by component scope ideally
})
</script>