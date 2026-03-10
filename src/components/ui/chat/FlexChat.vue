<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

/* PROPS */
const props = defineProps({
    messages: { type: Array, required: true },
    currentUserId: { type: [String, Number], required: true },
    isGroupChat: { type: Boolean, default: false },
    rowKey: { type: String, default: 'id' },

    theme: {
        type: Object, default: () => ({
            container: 'relative bg-white border border-zinc-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden',
            header: 'bg-white border-b border-zinc-200 p-4 shrink-0',
            body: 'flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth flex flex-col',
            compose: 'bg-white border-t border-zinc-200 p-4 shrink-0',

            // Message Row Wrappers
            myMessageRow: 'flex w-full justify-end',
            otherMessageRow: 'flex w-full justify-start',
            systemMessageRow: 'flex w-full justify-center my-2',

            // Bubbles
            myBubble: 'bg-[#B6C2D8] text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]', // Using color from figma ref roughly
            otherBubble: 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm',
            systemBubble: 'bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-lg px-4 py-3 text-sm flex flex-col gap-2 max-w-md w-full shadow-sm',

            // Meta (Time, Name)
            metaWrapper: 'flex items-center gap-2 mt-1 px-1',
            myNameMeta: 'text-xs text-zinc-500 font-medium',
            myTimeMeta: 'text-xs text-zinc-400',
            otherNameMeta: 'text-xs text-zinc-500 font-medium',
            otherTimeMeta: 'text-xs text-zinc-400',

            // Avatars
            avatarWrapper: 'flex shrink-0 mr-2 items-end',
            avatarImg: 'w-6 h-6 rounded-full object-cover',

            // Loader / Footer
            loaderWrapper: 'p-3 flex justify-center shrink-0 w-full'
        })
    },

    // Pagination & Scrolling
    infinite: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: false },
    alwaysShowLoadMore: { type: Boolean, default: false },
    threshold: { type: [String, Number], default: '100px' }, // Threshold from TOP to load historical messages

    // Customization callbacks
    variantForMessage: { type: Function, default: null }, // (msg, index) => 'system' | null
    messageAttrs: { type: Function, default: null }, // (msg, index) => { ...data-attrs }
})

const emit = defineEmits(['load-more', 'message-click', 'message-context'])

/* REFS */
const bodyEl = ref(null)
const nearTop = ref(false)

/* HELPERS */
const isMe = (msg) => msg.senderId === props.currentUserId
const isSystem = (msg, index) => props.variantForMessage && props.variantForMessage(msg, index) === 'system'

const isLastInGroup = (msg, index) => {
    if (index === props.messages.length - 1) return true
    const nextMsg = props.messages[index + 1]
    if (isSystem(nextMsg, index + 1)) return true
    if (isSystem(msg, index)) return true
    if (msg.senderId !== nextMsg.senderId) return true
    return false
}

/* SCROLL LOGIC FOR CHAT (Reverse of FlexTable - we load more when scrolling UP) */
function toPx(raw, el) {
    try { const v = window.ScrollEvents?.toPixelThreshold?.(raw, el); if (typeof v === 'number') return v } catch (e) { }
    const n = Number(raw); return Number.isFinite(n) ? n : 100
}

function maybeEmitLoad() {
    if (!props.loading && props.hasMore) {
        emit('load-more')
    }
}

function attachScroll() {
    const el = bodyEl.value
    if (!el) return

    let lastScrollTop = el.scrollTop

    const onScroll = () => {
        // For chat, user scrolls UP to see older messages (load more)
        const d = el.scrollTop
        const isScrollingUp = d < lastScrollTop
        lastScrollTop = d

        // Only trigger "nearTop" if the chat has actually overflowed and is scrollable.
        // If scrollHeight == clientHeight, it means there are only a few messages and no scrollbar exists yet.
        const isScrollable = el.scrollHeight > el.clientHeight

        nearTop.value = isScrollable && d <= toPx(props.threshold, el)

        if (props.infinite && nearTop.value && isScrollingUp) {
            maybeEmitLoad()
        }
    }

    el.__fcScroll = onScroll
    el.addEventListener('scroll', onScroll, { passive: true })
}

function detachScroll() {
    const el = bodyEl.value
    if (el?.__fcScroll) {
        el.removeEventListener('scroll', el.__fcScroll)
        delete el.__fcScroll
    }
}

let previousScrollHeight = 0

/* AUTO-SCROLL TO BOTTOM ON NEW MESSAGES */
const scrollToBottom = async (force = false) => {
    await nextTick()
    const el = bodyEl.value
    if (!el) return

    // Only auto-scroll if user is already near bottom, OR if forced (initial load)
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150

    if (force || isNearBottom) {
        el.scrollTop = el.scrollHeight
    }
}

/* MAINTAIN SCROLL POSITION WHEN PREPENDING HISTORY */
const maintainScrollPosition = async () => {
    const el = bodyEl.value
    if (!el) return

    const currentScrollHeight = el.scrollHeight
    const scrollDiff = currentScrollHeight - previousScrollHeight

    // If new messages were added at the TOP, restore the scroll position
    if (scrollDiff > 0 && el.scrollTop < 50) {
        el.scrollTop += scrollDiff
    }

    previousScrollHeight = currentScrollHeight
}

onMounted(async () => {
    await nextTick()
    attachScroll()
    scrollToBottom(true)
    if (bodyEl.value) previousScrollHeight = bodyEl.value.scrollHeight
})

onBeforeUnmount(() => {
    detachScroll()
})

watch(() => props.infinite, async () => {
    detachScroll()
    await nextTick()
    attachScroll()
})

watch(() => props.messages, async (newVal, oldVal) => {
    const el = bodyEl.value
    if (!el) return

    const oldFirstId = oldVal?.[0]?.[props.rowKey]
    const newFirstId = newVal?.[0]?.[props.rowKey]

    // Detect if messages were prepended (loaded history) vs appended (new message)
    if (oldFirstId !== newFirstId) {
        await nextTick()
        maintainScrollPosition()
    } else {
        await scrollToBottom()
        previousScrollHeight = el.scrollHeight
    }
}, { deep: true })

</script>

<style scoped>
/* Custom scrollbar matching FlexTable style */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

<template>
    <div :class="theme.container">

        <!-- HEADER SLOT -->
        <div v-if="$slots.header" :class="theme.header">
            <slot name="header"></slot>
        </div>

        <!-- MAIN CHAT BODY -->
        <div ref="bodyEl" :class="[theme.body, 'no-scrollbar']">

            <!-- INITIAL CENTERED LOADER (For empty state) -->
            <div v-if="loading && messages.length === 0" class="flex-1 flex justify-center items-center h-full w-full">
                <slot name="initial-loader">
                    <svg class="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </slot>
            </div>

            <template v-else>
                <!-- TOP LOADER (Historical Messages) -->
                <div v-if="alwaysShowLoadMore || loading || hasMore" :class="theme.loaderWrapper">
                    <slot name="loader">
                        <div v-if="loading" class="flex justify-center items-center py-2 w-full">
                            <svg class="animate-spin h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="3">
                                </circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </div>
                    </slot>
                </div>

                <!-- MESSAGES LOOP -->
                <template v-for="(msg, rIdx) in messages" :key="msg[rowKey] ?? rIdx">

                    <!-- ENTIRE MESSAGE ROW OVERRIDE SLOT -->
                    <slot name="message" :message="msg" :index="rIdx" :isMe="isMe(msg)" :isSystem="isSystem(msg, rIdx)">

                        <!-- SYSTEM MESSAGE -->
                        <div v-if="isSystem(msg, rIdx)" :class="theme.systemMessageRow"
                            v-bind="messageAttrs ? messageAttrs(msg, rIdx) : {}" @click="$emit('message-click', msg)"
                            @contextmenu.prevent="$emit('message-context', msg)">
                            <slot name="message.system" :message="msg">
                                <div :class="theme.systemBubble">
                                    <slot name="message.content" :message="msg">{{ msg.text }}</slot>
                                </div>
                            </slot>
                        </div>

                        <!-- USER MESSAGE (ME OR OTHER) -->
                        <div v-else :class="isMe(msg) ? theme.myMessageRow : theme.otherMessageRow"
                            v-bind="messageAttrs ? messageAttrs(msg, rIdx) : {}" @click="$emit('message-click', msg)"
                            @contextmenu.prevent="$emit('message-context', msg)">

                            <!-- WRAPPER -->
                            <div class="flex flex-col" :class="isMe(msg) ? 'items-end' : 'items-start'">

                                <!-- NAME (FOR OTHERS) -->
                                <span v-if="!isMe(msg) && msg.senderName" :class="[theme.otherNameMeta, 'mb-1 ml-1']">{{
                                    msg.senderName }}</span>

                                <!-- BUBBLE -->
                                <div :class="isMe(msg) ? theme.myBubble : theme.otherBubble"
                                    :style="!isLastInGroup(msg, rIdx) ? 'margin-bottom: 2px;' : ''">
                                    <slot name="message.content" :message="msg">
                                        <div class="whitespace-pre-wrap break-words text-sm">{{ msg.text }}</div>
                                    </slot>
                                </div>

                                <!-- FOOTER (AVATAR & TIME) -->
                                <div v-if="isLastInGroup(msg, rIdx)"
                                    class="flex items-center gap-2 mt-1.5 px-0.5 w-full"
                                    :class="isMe(msg) ? 'justify-end' : 'justify-start'">

                                    <!-- OTHER SIDE: Avatar then Time -->
                                    <template v-if="!isMe(msg)">
                                        <div :class="theme.avatarWrapper">
                                            <slot name="message.avatar" :message="msg">
                                                <img v-if="msg.avatar" :src="msg.avatar" :class="theme.avatarImg"
                                                    alt="Avatar" />
                                            </slot>
                                        </div>
                                        <slot name="message.meta" :message="msg" :isMe="isMe(msg)">
                                            <span v-if="msg.time" :class="theme.otherTimeMeta">{{ msg.time }}</span>
                                        </slot>
                                    </template>

                                    <!-- MY SIDE: Time then Avatar -->
                                    <template v-if="isMe(msg)">
                                        <slot name="message.meta" :message="msg" :isMe="isMe(msg)">
                                            <span v-if="msg.time" :class="theme.myTimeMeta">{{ msg.time }}</span>
                                        </slot>
                                        <div :class="[theme.avatarWrapper, 'ml-1.5']">
                                            <slot name="message.avatar.me" :message="msg"></slot>
                                        </div>
                                    </template>

                                </div>

                            </div>

                        </div>
                    </slot>
                </template>
            </template>
        </div>

        <!-- COMPOSE AREA SLOT -->
        <div v-if="$slots.compose" :class="theme.compose">
            <slot name="compose"></slot>
        </div>

    </div>
</template>
