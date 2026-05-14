<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../../lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const messages = ref([])
const reactions = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const chatContainer = ref(null)
let chatChannel = null

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const getGroupedReactions = (messageId) => {
  const msgReactions = reactions.value.filter((r) => r.message_id === messageId)
  const groups = {}
  msgReactions.forEach((r) => {
    groups[r.emoji] = (groups[r.emoji] || 0) + 1
  })
  return groups
}

const hasMyReaction = (messageId, emoji) => {
  if (!currentUser.value) return false
  return reactions.value.some(
    (r) => r.message_id === messageId && r.user_id === currentUser.value.id && r.emoji === emoji,
  )
}

const toggleReaction = async (messageId, emoji) => {
  if (!currentUser.value) return
  const existing = reactions.value.find(
    (r) =>
      String(r.message_id) === String(messageId) &&
      String(r.user_id) === String(currentUser.value.id) &&
      r.emoji === emoji,
  )

  if (existing) {
    const { error } = await supabase.from('message_reactions').delete().eq('id', existing.id)
    if (error) console.error('Lỗi khi xóa cảm xúc:', error.message)
  } else {
    const { error } = await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: currentUser.value.id,
      emoji: emoji,
    })
    if (error) console.warn('Cảm xúc đã tồn tại trên server, đang đồng bộ lại...')
  }
}

const fetchAndListen = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  currentUser.value = user

  // 1. CẬP NHẬT QUERY: Lấy thêm role từ bảng profiles (Cú pháp rút gọn)
  const { data: msgData } = await supabase
    .from('global_messages')
    .select('*, profiles(role)')
    .order('created_at', { ascending: true })
    .limit(50)

  messages.value = msgData || []

  if (messages.value.length > 0) {
    const messageIds = messages.value.map((m) => m.id)
    const { data: reactData } = await supabase
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds)
    reactions.value = reactData || []
  }

  await scrollToBottom()

  const channel = supabase
    .channel('global-chat-room')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'global_messages' },
      async (payload) => {
        const exists = messages.value.some((m) => m.id === payload.new.id)
        if (!exists) {
          // 2. CẬP NHẬT REALTIME: Kéo thêm thông tin profile cho tin nhắn mới vừa bay vào
          const { data: newMsgWithProfile } = await supabase
            .from('global_messages')
            .select('*, profiles(role)')
            .eq('id', payload.new.id)
            .single()

          if (newMsgWithProfile) {
            messages.value.push(newMsgWithProfile)
          } else {
            messages.value.push(payload.new) // Fallback nếu có lỗi
          }
          scrollToBottom()
        }
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reactions' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          if (!reactions.value.some((r) => r.id === payload.new.id))
            reactions.value.push(payload.new)
        } else if (payload.eventType === 'DELETE') {
          reactions.value = reactions.value.filter((r) => r.id !== payload.old.id)
        }
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') console.log('Đã kết nối Realtime thành công!')
    })

  return channel
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentUser.value) return
  const content = newMessage.value
  newMessage.value = ''

  const displayName =
    authStore.profile?.username || currentUser.value.user_metadata.username || 'Thành viên'

  const { error } = await supabase.from('global_messages').insert({
    user_id: currentUser.value.id,
    user_name: displayName,
    content: content,
  })

  if (error) {
    console.error('Lỗi gửi tin:', error)
    newMessage.value = content
  }
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return formatDistanceToNow(date, { addSuffix: true, locale: vi }).replace('khoảng ', '')
}

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

onMounted(async () => {
  chatChannel = await fetchAndListen()
})
onUnmounted(() => {
  if (chatChannel) supabase.removeChannel(chatChannel)
})
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-gray-100 dark:border-neutral-800 flex flex-col h-full overflow-hidden transition-colors duration-300"
  >
    <div
      class="p-4 border-b border-gray-100 dark:border-neutral-800 bg-transparent flex items-center shrink-0"
    >
      <span class="relative flex h-3 w-3 mr-3">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
        ></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
      <h3
        class="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 uppercase tracking-widest text-sm"
      >
        Global Chat
      </h3>
    </div>

    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-5 custom-scrollbar bg-transparent"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['flex w-full', msg.user_id === currentUser?.id ? 'justify-end' : 'justify-start']"
      >
        <div
          :class="[
            'flex max-w-[75%] gap-2',
            msg.user_id === currentUser?.id ? 'flex-row-reverse' : 'flex-row',
          ]"
        >
          <div v-if="msg.user_id !== currentUser?.id" class="shrink-0 mt-1">
            <div
              class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-neutral-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-inner"
            >
              {{ getInitial(msg.user_name) }}
            </div>
          </div>

          <div class="flex flex-col group relative">
            <div
              :class="[
                'flex items-baseline gap-2 mb-1 px-1',
                msg.user_id === currentUser?.id ? 'flex-row-reverse' : '',
              ]"
            >
              <div class="flex items-center gap-1">
                <span
                  class="text-[11px]"
                  :class="
                    msg.profiles?.role === 'admin'
                      ? 'font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'
                      : 'font-bold text-gray-700 dark:text-gray-300'
                  "
                >
                  {{ msg.user_id === currentUser?.id ? 'Bạn' : msg.user_name }}
                </span>

                <svg
                  v-if="msg.profiles?.role === 'admin'"
                  class="w-3.5 h-3.5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  title="Quản trị viên"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  ></path>
                </svg>
              </div>

              <span class="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                {{ formatTimeAgo(msg.created_at) }}
              </span>
            </div>

            <div class="relative group/msg">
              <p
                :class="[
                  'text-sm p-3 shadow-sm border transition-colors relative z-10 leading-relaxed break-words',
                  msg.profiles?.role === 'admin'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-100 rounded-2xl rounded-tr-sm shadow-md'
                    : msg.user_id === currentUser?.id
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent rounded-2xl rounded-tr-sm shadow-indigo-500/20'
                      : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 border-gray-100 dark:border-neutral-700 rounded-2xl rounded-tl-sm',
                ]"
              >
                {{ msg.content }}
              </p>

              <div
                v-if="currentUser"
                :class="[
                  'absolute -top-10 opacity-0 group-hover/msg:opacity-100 transition-all duration-200 flex bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 shadow-xl rounded-full px-2 py-1.5 gap-1.5 z-30 scale-95 group-hover/msg:scale-100 origin-bottom',
                  msg.user_id === currentUser?.id ? 'right-0' : 'left-0',
                ]"
              >
                <button
                  v-for="e in ['❤️', '😂', '🔥', '👍', '😭', '😠']"
                  :key="e"
                  @click="toggleReaction(msg.id, e)"
                  class="hover:scale-125 transition-transform text-sm transform active:scale-90"
                >
                  {{ e }}
                </button>
              </div>
            </div>

            <div
              :class="[
                'flex flex-wrap gap-1 mt-1.5 relative z-10',
                msg.user_id === currentUser?.id ? 'justify-end' : 'justify-start',
              ]"
            >
              <button
                v-for="(count, emoji) in getGroupedReactions(msg.id)"
                :key="emoji"
                @click="toggleReaction(msg.id, emoji)"
                :class="[
                  'flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border transition-all active:scale-90 shadow-sm',
                  hasMyReaction(msg.id, emoji)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400 font-bold'
                    : 'bg-white border-gray-100 text-gray-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-400',
                ]"
              >
                <span class="text-xs">{{ emoji }}</span>
                <span>{{ count }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="p-3 sm:p-4 border-t border-gray-100 dark:border-neutral-800 bg-transparent shrink-0"
    >
      <div v-if="currentUser" class="flex gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Nhập tin nhắn..."
          class="flex-1 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-neutral-900 text-gray-800 dark:text-white placeholder-gray-400 outline-none transition-all"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-neutral-700 text-white p-2.5 rounded-2xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center shrink-0 border border-transparent"
        >
          <svg
            class="w-5 h-5 translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            ></path>
          </svg>
        </button>
      </div>
      <div
        v-else
        class="text-center py-2 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-dashed border-gray-200 dark:border-neutral-700"
      >
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Vui lòng
          <router-link
            to="/login"
            class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline px-1"
            >đăng nhập</router-link
          >
          để thảo luận.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #404040;
}
</style>
