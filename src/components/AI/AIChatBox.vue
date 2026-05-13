<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <transition name="chat-bounce">
      <div
        v-if="isOpen"
        class="mb-4 w-[calc(100vw-3rem)] sm:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden origin-bottom-right"
        style="height: 550px; max-height: calc(100vh - 120px)"
      >
        <div
          class="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex justify-between items-center shrink-0 shadow-md relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-white/10 w-full h-full transform -skew-x-12 translate-x-full group-hover:animate-shine pointer-events-none"
          ></div>

          <div class="flex items-center gap-3 relative z-10">
            <div
              class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner"
            >
              <span class="text-xl">🤖</span>
            </div>
            <div>
              <h3 class="font-black text-sm tracking-wide">Trợ lý Manga AI</h3>
              <p class="text-[10px] text-indigo-100 font-medium">Trực tuyến - Sẵn sàng tư vấn</p>
            </div>
          </div>
          <button
            @click="isOpen = false"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors relative z-10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div
          class="flex-1 p-4 overflow-y-auto bg-gray-50/50 dark:bg-slate-800/50 flex flex-col gap-4 custom-scrollbar"
          ref="chatContainer"
        >
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']"
          >
            <div v-if="msg.role === 'ai'" class="shrink-0 mt-auto mb-1 mr-2">
              <div
                class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] shadow-sm"
              >
                🤖
              </div>
            </div>

            <div
              :class="[
                'max-w-[80%] p-3.5 text-sm leading-relaxed relative',
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/20 font-medium'
                  : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-bl-sm shadow-sm',
              ]"
            >
              <div v-if="msg.role === 'ai'" v-html="msg.content" class="ai-content-html"></div>
              <div v-else>{{ msg.content }}</div>
            </div>
          </div>

          <div v-if="isLoading" class="flex w-full justify-start items-end gap-2">
            <div class="shrink-0 mb-1">
              <div
                class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] shadow-sm"
              >
                🤖
              </div>
            </div>
            <div
              class="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 h-10"
            >
              <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div
                class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style="animation-delay: 0.15s"
              ></div>
              <div
                class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style="animation-delay: 0.3s"
              ></div>
            </div>
          </div>
        </div>

        <div
          class="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 shrink-0"
        >
          <div class="relative flex items-center">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Hỏi AI tìm truyện..."
              class="w-full bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-indigo-300 dark:focus:border-indigo-500/50 rounded-full pl-5 pr-12 py-3.5 text-sm outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              :disabled="isLoading"
            />
            <button
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim()"
              class="absolute right-1.5 bg-indigo-600 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 transition-all shadow-md active:scale-95"
            >
              <svg
                class="w-4 h-4 translate-x-[1px]"
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
        </div>
      </div>
    </transition>

    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="relative group bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-4 shadow-xl shadow-indigo-500/40 transition-all duration-300 hover:scale-110 flex items-center justify-center border-4 border-white dark:border-slate-900 overflow-hidden"
    >
      <span class="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></span>
      <span class="text-3xl relative z-10 drop-shadow-md">🤖</span>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const isOpen = ref(false)
const isLoading = ref(false)
const userInput = ref('')
const chatContainer = ref(null)

// Tin nhắn chào mừng mặc định
const messages = ref([
  {
    role: 'ai',
    content:
      'Chào bạn! Mình là AI tư vấn truyện siêu cấp vũ trụ đây. 🚀<br>Bạn đang muốn tìm bộ truyện có thể loại, cốt truyện hay main như thế nào?',
  },
])

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  const query = userInput.value.trim()
  messages.value.push({ role: 'user', content: query })
  userInput.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!rawKey) throw new Error('Thiếu API Key')
    const apiKey = rawKey.trim()

    // Sử dụng model mới nhất mà bạn đã dò được
    const embedModel = 'gemini-embedding-2'
    const chatModel = 'gemini-2.5-flash'

    // --- TRẠM 1: Bắt đầu lấy Vector ---
    console.log('1. Bắt đầu gọi AI lấy Vector...')
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${embedModel}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: query }] },
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: 768, // Ép 768 chiều khớp với DB
        }),
      },
    )

    // --- TRẠM 2: Lấy Vector xong ---
    console.log('2. Đã gọi xong Vector! Trạng thái HTTP:', embedRes.status)
    const embedData = await embedRes.json()

    if (!embedRes.ok || !embedData.embedding) {
      console.error('Lỗi từ Google Embedding:', embedData)
      throw new Error('EMBED_ERROR')
    }
    const queryVector = embedData.embedding.values

    // --- TRẠM 3: Gọi Database ---
    console.log('3. Bắt đầu gọi Supabase tìm truyện...')
    const { data: matchedMangas, error: dbError } = await supabase.rpc('match_mangas_ai', {
      query_embedding: queryVector,
      match_threshold: 0.01,
      match_count: 3,
    })

    // --- TRẠM 4: Trả về từ Database ---
    if (dbError) {
      console.error('LỖI TỪ SUPABASE:', dbError)
      throw new Error('DB_ERROR')
    }
    console.log('4. Supabase chạy xong! Số truyện tìm thấy:', matchedMangas?.length)

    // --- TRẠM 5: Gọi AI tạo câu trả lời ---
    console.log('5. Bắt đầu gọi AI (gemini-2.5-flash) viết câu chào...')
    let aiReply = ''
    if (!matchedMangas || matchedMangas.length === 0) {
      aiReply =
        'Mình lật tung thư viện rồi mà chưa thấy bộ nào khớp lắm. Bạn thử đổi từ khóa khác xem sao nhé! 🕵️‍♂️'
    } else {
      const context = matchedMangas.map((m) => `- ${m.title}`).join('\n')
      const prompt = `Bạn là trợ lý tư vấn truyện tranh. Người dùng hỏi: "${query}".
      Dựa vào danh sách: \n${context}\n
      Hãy trả lời bằng 1 câu ngắn gọn, thân thiện để giới thiệu các bộ truyện này phù hợp thế nào.
      Không phân tích dài dòng. Trả lời bằng tiếng Việt.`

      const chatRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${chatModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      )

      console.log('5.5. AI phản hồi xong! Trạng thái HTTP:', chatRes.status)
      const chatData = await chatRes.json()

      if (!chatRes.ok) {
        console.error('Lỗi từ AI Chat:', chatData)
        throw new Error('CHAT_ERROR')
      }

      aiReply =
        chatData.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Tadaa! Mình đã chọn lọc ra những siêu phẩm này cho bạn đây:'

      // Gắn giao diện truyện vào bên dưới câu trả lời
      aiReply += `<div class="mt-3 flex flex-col gap-2">`
      matchedMangas.forEach((m) => {
        aiReply += `
        <a href="/truyen/${m.slug}?isLocal=false"
           class="group flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 border border-gray-100 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500/50 rounded-xl transition-all duration-300">
          <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span class="text-lg">📖</span>
          </div>
          <span class="font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm line-clamp-1 transition-colors">
            ${m.title}
          </span>
        </a>`
      })
      aiReply += `</div>`
    }

    messages.value.push({ role: 'ai', content: aiReply })

    // --- TRẠM 6: Thành công ---
    console.log('6. HOÀN THÀNH TẤT CẢ!')
  } catch (err) {
    console.error('BỊ LỖI RỒI:', err)
    messages.value.push({
      role: 'ai',
      content: 'Hệ thống đang bảo trì một chút, bạn chờ chút xíu rồi thử lại nha! 🔧',
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
/* CSS cho thanh cuộn bên trong Chat */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
}

/* Hiệu ứng nảy khi mở khung chat (Vue Transition) */
.chat-bounce-enter-active {
  animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.chat-bounce-leave-active {
  animation: bounce-in 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045) reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0.5) translateY(100px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Xử lý khoảng cách thẻ a bên trong nội dung AI */
:deep(.ai-content-html a) {
  text-decoration: none;
}
</style>
