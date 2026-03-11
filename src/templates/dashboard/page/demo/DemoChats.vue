<template>
  <DashboardWrapperTwoColContainer>
  <div class=" flex justify-center flex-wrap gap-12 font-sans">

    <!-- MODEL CHAT PREVIEW -->
    <div>
      <div class="text-[11px] text-zinc-500 font-bold mb-3 uppercase tracking-wider">MODEL chat</div>
      <div class="w-100 h-[623px] shadow-2xl rounded-tl rounded-tr overflow-hidden shadow-zinc-400/50">
        <FlexChat :messages="modelMessages" currentUserId="jenny" :isGroupChat="false"
          :variantForMessage="msg => msg.type === 'system' ? 'system' : null" :theme="chatTheme" :hasMore="modelHasMore"
          :loading="modelLoading" @load-more="fetchMoreModelMessages" :infinite="true">
          <template #header>
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
                    class="w-10 h-10 rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
                  <div class="flex flex-col">
                    <h3 class="font-semibold text-sm text-gray-900 leading-tight">Grapes <span
                        class="text-zinc-400">•••</span></h3>
                    <span class="text-xs text-slate-700 font-normal flex items-center gap-1 mt-0.5"
                      v-if="pendingCallRequestCount > 0"><span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> {{
                        pendingCallRequestCount }} pending request{{ pendingCallRequestCount > 1 ? 's' : '' }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-zinc-600">
                  <img class='w-4 h-4' src="/images/share-icon.png" alt="">
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <template #message.system="{ message }">
            <div class="w-full flex mb-2 mt-4 px-1">
              <LiveCallRequest v-if="message.systemType === 'call_request'" :message="message" :isFanView="false" />
              <div v-else
                class="text-[12px] text-zinc-400 font-medium py-1 px-3 bg-zinc-100 rounded-full w-full text-center">
                {{ message.text }}
              </div>
            </div>
          </template>

          <template #message.content="{ message }">
            <div class="">{{ message.text }}</div>
          </template>

          <template #message.avatar.me="{ message }">
            <img v-if="message.time"
              src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #message.avatar="{ message }">
            <img v-if="message.time" src="https://i.pravatar.cc/150?img=5"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
            <div v-else class="w-5 h-5"></div>
          </template>

          <template #compose>
            <div class="flex items-center gap-3 my-1 w-full">
              <div class='flex gap-2'>
                <img src="https://i.pravatar.cc/150?img=5"
                class="w-8 h-8 rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
              <input type="text" placeholder="Write a reply..." v-model="modelComposeText"
                @keyup.enter="sendMessage('shared-chat', 'jenny', modelComposeText)"
                class="text-[16px] bg-transparent outline-none text-[#667085] placeholder:[#667085] font-[400]" />
              </div>
              <div class="flex items-center gap-1.5 text-zinc-500 justify-end w-full">
                <img src="/images/package-plus.png" alt="" class="size-6 cursor-pointer">
                <!-- <svg @click="sendMessage('shared-chat', 'jenny', modelComposeText)" ... -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                  stroke="#000000" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

                <svg class="size-6" fill="none" stroke="#000000"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </template>
        </FlexChat>
      </div>
    </div>

    <!-- FAN CHAT PREVIEW -->
    <div>
      <div class="text-[11px] text-zinc-500 font-bold mb-3 uppercase tracking-wider">FAN chat</div>
      <div class="w-100 h-[623px] shadow-2xl rounded-tl rounded-tr overflow-hidden shadow-zinc-400/50">
        <FlexChat :messages="fanMessages" currentUserId="fan" :isGroupChat="false"
          :variantForMessage="msg => msg.type === 'system' ? 'system' : null" :theme="chatTheme" :hasMore="fanHasMore"
          :loading="fanLoading" @load-more="fetchMoreFanMessages" :infinite="true">
          <template #header>
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?img=5" class="w-10 h-10 rounded-full object-cover shadow-sm" />
                  <div class="flex flex-col">
                    <h3 class="font-semibold text-sm text-gray-900 leading-tight">Jenny Honey~ <span
                        class="text-zinc-400">•••</span></h3>
                    <span class="text-xs text-slate-700 font-normal flex items-center gap-1 mt-0.5"
                      v-if="pendingCallRequestCount > 0"><span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> {{
                        pendingCallRequestCount }} pending request{{ pendingCallRequestCount > 1 ? 's' : '' }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-zinc-600">
                  <img class='w-4 h-4' src="/images/share-icon.png" alt="">
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <template #message.system="{ message }">
            <div class="w-full flex mb-2 mt-4 px-1">
              <LiveCallRequest v-if="message.systemType === 'call_request'" :message="message" :isFanView="true" />
              <div v-else
                class="text-[12px] text-zinc-400 font-medium py-1 px-3 bg-zinc-100 rounded-full w-full text-center">
                {{ message.text }}
              </div>
            </div>
          </template>

          <template #message.content="{ message }">
            <div class="">{{ message.text }}</div>
          </template>

          <template #message.avatar.me="{ message }">
            <img v-if="message.time" src="https://i.pravatar.cc/150?img=5"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #message.avatar="{ message }">
            <img v-if="message.time"
              src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
            <div v-else class="w-5 h-5"></div>
          </template>

          <template #compose>
            <div class="flex items-center gap-3 my-1 w-full">
              <img src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
                class="w-8 h-8 rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
              <input type="text" placeholder="Write a reply..." v-model="fanComposeText"
                @keyup.enter="sendMessage('shared-chat', 'fan', fanComposeText)"
                class=" text-[16px] bg-transparent outline-none text-[#667085] placeholder:[#667085] font-[400]" />
              <div class="flex gap-3 text-zinc-600 justify-end w-full">
                <!-- <svg @click="sendMessage('shared-chat', 'fan', fanComposeText)"
                  class="w-6 h-6 cursor-pointer hover:text-indigo-600" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg> -->
                <!-- Send Live Call Request Button -->
                <svg @click="sendCallRequest" class="size-6" fill="none"
                  stroke="#000000" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                  stroke="#000000" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <svg class="size-6" fill="none" stroke="#000000"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </template>
        </FlexChat>
      </div>
    </div>

    <!-- GROUP CHAT PREVIEW -->
    <div>
      <div class="text-[11px] text-zinc-500 font-bold mb-3 uppercase tracking-wider">GROUP chat</div>
      <div class="w-100 h-[623px] shadow-2xl rounded-tl rounded-tr overflow-hidden shadow-zinc-400/50">
        <FlexChat :messages="groupMessages" currentUserId="jenny" :isGroupChat="true"
          :variantForMessage="msg => msg.type === 'system' ? 'system' : null" :theme="chatTheme" :hasMore="groupHasMore"
          :loading="groupLoading" @load-more="fetchMoreGroupMessages">
          <template #header>
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="flex -space-x-6">
                    <img src="https://i.pravatar.cc/150?img=11"
                      class="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                    <img src="https://i.pravatar.cc/150?img=33"
                      class="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                    <img src="https://i.pravatar.cc/150?img=47"
                      class="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                  </div>
                  <div class="flex flex-col ml-1">
                    <div class="flex items-center gap-2">
                      <div class=" text-[#0C111D] font-semibold text-[14px]">
                        VVIP TIER
                      </div>
                      <div class="flex items-center text-slate-700">
                        <img src="/images/users.png" alt="" class="size-3  brightness-0">
                        <span class="text-xs font-[400] text-[#0C111D] ml-0.5">88</span>
                      </div>
                      <span class="text-zinc-500 font-bold ml-0.5 mt-0.5 text-xs">•••</span>
                    </div>
                    <span class="text-xs text-slate-700 font-normal flex items-center gap-1"><span
                        class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> 1 pending request</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-zinc-600">
                  <img class='w-4 h-4' src="/images/share-icon.png" alt="">
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <template #message.system="{ message }">
            <div class="w-full flex justify-center mb-2 mt-4 px-1">
              <div class="text-[12px] text-zinc-400 font-medium py-1 px-3 bg-zinc-100 rounded-full">{{ message.text }}
              </div>
            </div>
          </template>

          <template #message.content="{ message }">
            <div class="">{{ message.text }}</div>
          </template>

          <template #message.avatar.me="{ message }">
            <img v-if="message.time"
              src="https://ui-avatars.com/api/?name=Jenny&background=22c55e&color=fff&rounded=true"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #message.avatar="{ message }">
            <img v-if="message.time" :src="message.avatar"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #compose>
            <div class="flex items-center gap-3 my-1 w-full">
              <img src="https://ui-avatars.com/api/?name=Jenny&background=22c55e&color=fff&rounded=true"
                class="w-8 h-8 rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
              <input type="text" placeholder="Write a reply..." v-model="groupComposeText"
                @keyup.enter="sendMessage('group-chat', 'jenny', groupComposeText)"
                class=" text-[16px] bg-transparent outline-none text-[#667085] placeholder:[#667085] font-[400]" />
              <div class="flex gap-3 text-zinc-600 justify-end w-full">
                <svg @click="sendMessage('group-chat', 'jenny', groupComposeText)"
                  class="w-6 h-6 cursor-pointer hover:text-indigo-600" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <svg class="w-6 h-6 cursor-pointer hover:text-zinc-900" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </template>
        </FlexChat>
      </div>
    </div>

  </div>
  </DashboardWrapperTwoColContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FlexChat from '@/components/ui/chat/FlexChat.vue'
import LiveCallRequest from '@/components/ui/chat/LiveCallRequest.vue'
import { useChatStore } from '@/stores/useChatStore.js'
import { chatPipeline } from '@/pipelines/chatPipeline.js'
import { chatFlowHandler } from '@/flows/chatFlowHandler.js'
import DashboardWrapperTwoColContainer from '@/components/dashboard/DashboardWrapperTwoColContainer.vue'

const chatTheme = {
  container: 'relative bg-[#f4f4f5] rounded-tl rounded-tr flex flex-col h-full overflow-hidden border border-zinc-200/50 container-shadow',
  header: 'bg-gray-200 font-sans px-2 py-2 shrink-0 z-10 shadow-sm relative',
  body: 'flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scroll-smooth flex flex-col',
  compose: 'bg-white px-4 py-3 shrink-0',
  myMessageRow: 'flex w-full justify-end mt-1',
  otherMessageRow: 'flex w-full justify-start mt-1',
  systemMessageRow: 'flex w-full justify-center my-3',
  myBubble: 'text-white text-base font-normal max-w-96 min-w-20 min-h-10 px-3 py-1.5 bg-slate-600 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl shadow-[0px_0px_18px_0px_rgba(88,85,249,0.10)] inline-flex justify-center items-center gap-2.5',
  otherBubble: 'text-[#344054] text-base font-normal max-w-96 min-w-20 min-h-10 px-3 py-1.5 bg-gray-50 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-[0px_0px_18px_0px_rgba(88,85,249,0.10)] backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5',
  systemBubble: 'w-full',
  metaWrapper: 'opacity-90',
  myNameMeta: 'hidden',
  myTimeMeta: 'text-[11px] text-zinc-400 font-semibold',
  otherNameMeta: 'hidden',
  otherTimeMeta: 'text-[11px] text-zinc-400 font-semibold',
  avatarWrapper: 'flex shrink-0 items-end',
  avatarImg: 'w-5 h-5 rounded-full object-cover',
}

const modelComposeText = ref('')
const fanComposeText = ref('')
const groupComposeText = ref('')

// Initialize Pinia store
const chatStore = useChatStore()

// Computed reactives mapping to Pinia state
const modelMessages = computed(() => chatStore.getMessagesByChatId('shared-chat'))
const fanMessages = computed(() => chatStore.getMessagesByChatId('shared-chat'))
const groupMessages = computed(() => chatStore.getMessagesByChatId('group-chat'))

// Calculate the exact number of active call requests in the chat history
const pendingCallRequestCount = computed(() => {
  return modelMessages.value.filter(msg => msg.type === 'system' && msg.systemType === 'call_request').length
})

// Pagination states
const modelHasMore = ref(true)
const modelLoading = ref(false)
const fanHasMore = ref(true)
const fanLoading = ref(false)
const groupHasMore = ref(true)
const groupLoading = ref(false)

// Data Pipeline Fetches (Load Initial + Pagination)
const fetchMoreModelMessages = async () => {
  if (modelLoading.value || !modelHasMore.value) return
  modelLoading.value = true
  const res = await chatPipeline.fetchChatMessagesPipeline('shared-chat', 20, modelMessages.value.length)
  if (res.success && res.count === 0) modelHasMore.value = false
  modelLoading.value = false
}

const fetchMoreFanMessages = async () => {
  // We remove the duplicate check so both windows independently trigger their spinner delay on load.
  if (fanLoading.value || !fanHasMore.value) return
  fanLoading.value = true
  const res = await chatPipeline.fetchChatMessagesPipeline('shared-chat', 20, fanMessages.value.length)
  if (res.success && res.count === 0) fanHasMore.value = false
  fanLoading.value = false
}

const fetchMoreGroupMessages = async () => {
  if (groupLoading.value || !groupHasMore.value) return
  groupLoading.value = true
  const res = await chatPipeline.fetchChatMessagesPipeline('group-chat', 20, groupMessages.value.length)
  if (res.success && res.count === 0) groupHasMore.value = false
  groupLoading.value = false
}

// Flow Handler for Sending messages
const sendMessage = async (chatId, senderId, text, type = 'text') => {
  if (!text || typeof text !== 'string' || !text.trim()) return

  // Clear immediately for optimistic feeling
  if (chatId === 'shared-chat') {
    if (senderId === 'jenny') modelComposeText.value = ''
    else if (senderId === 'fan') fanComposeText.value = ''
  }
  else if (chatId === 'group-chat') groupComposeText.value = ''

  await chatFlowHandler.sendMessageFlow({
    chatId,
    senderId,
    text,
    type
  })
}

// Helper to manually trigger a call request for testing
const sendCallRequest = async () => {
  await chatFlowHandler.sendMessageFlow({
    chatId: 'shared-chat',
    senderId: 'fan',
    text: 'Call me and i will sing with you', // Mock text
    type: 'system',
    systemType: 'call_request',
    senderName: 'Jenny Honey~'
  })
}

// Initialize on Dashboard Load
onMounted(async () => {
  // 1. Init mock socket listeners
  chatFlowHandler.initListeners()

  // 2. Trigger UI loaders immediately
  modelLoading.value = true
  fanLoading.value = true
  groupLoading.value = true

  // 3. Artificially delay loading persisted local storage to show the center spinner
  await chatStore.hydrate()

  modelLoading.value = false
  fanLoading.value = false
  groupLoading.value = false

  // 4. Initial fetch queries via Pipeline (for any new messages since last session)
  // If the store is still empty after hydration, the pipeline will fetch the initial batch.
  if (modelMessages.value.length === 0) fetchMoreModelMessages()
  if (fanMessages.value.length === 0) fetchMoreFanMessages()
  if (groupMessages.value.length === 0) fetchMoreGroupMessages()
})
</script>

<style scoped>
.container-shadow {
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.1);
}
</style>