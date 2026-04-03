<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../../lib/supabaseClient'

const messages = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const chatContainer = ref(null)

// Cuộn xuống cuối mỗi khi có tin nhắn mới
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const fetchAndListen = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  currentUser.value = user

  // 1. Lấy tin nhắn cũ giới hạn 50 tin gần nhất
  const { data } = await supabase
    .from('global_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50)

  messages.value = data || []
  scrollToBottom()

  // 2. Thiết lập lắng nghe Realtime
  const channel = supabase
    .channel('global-chat-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'global_messages',
      },
      (payload) => {
        console.log('NHẬN TIN NHẮN MỚI:', payload.new)
        // Kiểm tra xem tin nhắn đã có trong mảng chưa để tránh trùng
        if (!messages.value.find((m) => m.id === payload.new.id)) {
          messages.value.push(payload.new)
          scrollToBottom()
        }
      },
    )
    .subscribe((status) => {
      console.log('TRẠNG THÁI KẾT NỐI:', status)
    })

  return channel
}

let chatChannel
onMounted(async () => {
  chatChannel = await fetchAndListen()
})
onUnmounted(() => {
  if (chatChannel) supabase.removeChannel(chatChannel)
})

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentUser.value) return
  const { error } = await supabase.from('global_messages').insert({
    user_id: currentUser.value.id,
    user_name: currentUser.value.user_metadata.username || 'Thành viên',
    content: newMessage.value,
  })
  if (!error) newMessage.value = ''
}
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

    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      <div v-for="msg in messages" :key="msg.id" class="flex flex-col">
        <div class="flex items-baseline gap-2">
          <span class="font-bold text-xs text-indigo-500">{{ msg.user_name }}</span>
          <span class="text-[10px] text-gray-400">
            {{
              new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </span>
        </div>
        <p
          class="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 p-2 rounded-lg mt-1 inline-block self-start"
        >
          {{ msg.content }}
        </p>
      </div>
    </div>

    <div class="p-3 border-t border-gray-200 dark:border-gray-700">
      <div v-if="currentUser" class="flex gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Cùng thảo luận về manga nào!"
          class="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
        />
        <button
          @click="sendMessage"
          class="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
            />
          </svg>
        </button>
      </div>
      <p v-else class="text-center text-xs text-gray-500 py-2">
        <router-link to="/login" class="text-indigo-500 font-bold underline">Đăng nhập</router-link>
        để chat
      </p>
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
</style>
