<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../../lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

// --- STATE QUẢN LÝ ---
const messages = ref([])
const reactions = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const chatContainer = ref(null)
let chatChannel = null

// --- LOGIC GIAO DIỆN ---
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// --- LOGIC XỬ LÝ EMOJI ---
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

  // 1. Tìm reaction hiện có
  const existing = reactions.value.find(
    (r) =>
      String(r.message_id) === String(messageId) &&
      String(r.user_id) === String(currentUser.value.id) &&
      r.emoji === emoji,
  )

  if (existing) {
    // 2. Nếu đã tồn tại -> XÓA
    const { error } = await supabase.from('message_reactions').delete().eq('id', existing.id)

    if (error) console.error('Lỗi khi xóa cảm xúc:', error.message)
  } else {
    // 3. Nếu chưa tồn tại -> THÊM MỚI
    const { error } = await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: currentUser.value.id,
      emoji: emoji,
    })

    if (error) {
      console.warn('Cảm xúc đã tồn tại trên server, đang đồng bộ lại...')
    }
  }
}

// --- LOGIC REALTIME & API ---
const fetchAndListen = async () => {
  // 1. Lấy thông tin user hiện tại
  const {
    data: { user },
  } = await supabase.auth.getUser()
  currentUser.value = user

  // 2. Lấy 50 tin nhắn cũ từ Database để hiển thị khi load trang
  const { data: msgData } = await supabase
    .from('global_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50)

  messages.value = msgData || []

  // 3. Lấy toàn bộ Reactions cho các tin nhắn trên
  if (messages.value.length > 0) {
    const messageIds = messages.value.map((m) => m.id)
    const { data: reactData } = await supabase
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds)
    reactions.value = reactData || []
  }
  // -----------------------------

  await scrollToBottom()

  // 4. Bắt đầu thiết lập lắng nghe Realtime
  const channel = supabase
    .channel('global-chat-room')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'global_messages' },
      (payload) => {
        const exists = messages.value.some((m) => m.id === payload.new.id)
        if (!exists) {
          messages.value.push(payload.new)
          scrollToBottom()
        }
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reactions' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          if (!reactions.value.some((r) => r.id === payload.new.id)) {
            reactions.value.push(payload.new)
          }
        } else if (payload.eventType === 'DELETE') {
          reactions.value = reactions.value.filter((r) => r.id !== payload.old.id)
        }
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Đã kết nối Realtime thành công!')
      }
    })

  return channel
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentUser.value) return
  const content = newMessage.value
  newMessage.value = ''

  // Lấy tên mới nhất từ bảng profiles thông qua authStore để đảm bảo đồng bộ với tên hiển thị trên toàn app
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

// Hàm định dạng thời gian hiển thị
const formatTimeAgo = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  // Tính khoảng cách từ thời gian đó đến hiện tại
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: vi,
  }).replace('khoảng ', '')
}

// --- LIFECYCLE ---
onMounted(async () => {
  chatChannel = await fetchAndListen()
})

onUnmounted(() => {
  if (chatChannel) supabase.removeChannel(chatChannel)
})
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[500px]"
  >
    <div
      class="p-3 border-b border-gray-200 dark:border-gray-700 font-bold text-indigo-600 flex items-center"
    >
      <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
      Kênh thảo luận chung
    </div>

    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-50/50 dark:bg-transparent"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'flex flex-col group relative',
          msg.user_id === currentUser?.id ? 'items-end' : 'items-start',
        ]"
      >
        <div
          :class="[
            'flex items-baseline gap-2 mb-1 px-1',
            msg.user_id === currentUser?.id ? 'flex-row-reverse' : '',
          ]"
        >
          <span class="font-bold text-[11px] text-indigo-500">
            {{
              msg.user_id === currentUser?.id ? authStore.profile?.username || 'Bạn' : msg.user_name
            }}
          </span>
          <span class="text-[9px] text-gray-400">
            {{ formatTimeAgo(msg.created_at) }}
          </span>
        </div>

        <div
          :class="[
            'flex items-center gap-2 max-w-[85%]',
            msg.user_id === currentUser?.id ? 'flex-row-reverse' : '',
          ]"
        >
          <p
            :class="[
              'text-sm p-3 rounded-2xl shadow-sm border transition-colors',
              msg.user_id === currentUser?.id
                ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                : 'bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-neutral-600 rounded-tl-none',
            ]"
          >
            {{ msg.content }}
          </p>

          <div
            v-if="currentUser"
            :class="[
              'opacity-0 group-hover:opacity-100 transition-all flex bg-white dark:bg-neutral-800 border dark:border-neutral-600 shadow-md rounded-full px-2 py-1 gap-1',
              msg.user_id === currentUser?.id ? 'flex-row' : 'flex-row',
            ]"
          >
            <button
              v-for="e in ['❤️', '😂', '🔥', '👍']"
              :key="e"
              @click="toggleReaction(msg.id, e)"
              class="hover:scale-125 transition text-xs"
            >
              {{ e }}
            </button>
          </div>
        </div>

        <div
          :class="[
            'flex flex-wrap gap-1 mt-1.5',
            msg.user_id === currentUser?.id ? 'justify-end' : 'justify-start',
          ]"
        >
          <button
            v-for="(count, emoji) in getGroupedReactions(msg.id)"
            :key="emoji"
            @click="toggleReaction(msg.id, emoji)"
            :class="[
              'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all active:scale-90',
              hasMyReaction(msg.id, emoji)
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700'
                : 'bg-white border-gray-200 text-gray-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-400',
            ]"
          >
            <span>{{ emoji }}</span>
            <span class="font-bold">{{ count }}</span>
          </button>
        </div>
      </div>
    </div>

    <div
      class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 rounded-b-xl"
    >
      <div v-if="currentUser" class="flex gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Viết tin nhắn..."
          class="flex-1 bg-gray-100 dark:bg-neutral-900 border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
        />
        <button
          @click="sendMessage"
          class="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full transition shadow-md shadow-indigo-500/20 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 rotate-90"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
            />
          </svg>
        </button>
      </div>
      <div v-else class="text-center py-2">
        <p class="text-xs text-gray-500">
          Vui lòng
          <router-link to="/login" class="text-indigo-500 font-bold hover:underline"
            >đăng nhập</router-link
          >
          để tham gia thảo luận.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>
