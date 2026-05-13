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

          <div class="flex items-center gap-2 relative z-10">
            <button
              @click="clearHistory"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/80 hover:shadow-lg hover:shadow-red-500/30 text-white text-xs font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
              title="Xóa lịch sử trò chuyện"
            >
              <span class="text-sm">🗑️</span>
              <span>Làm mới</span>
            </button>

            <button
              @click="isOpen = false"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
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
import { ref, nextTick, watch, onMounted } from 'vue'
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

    const embedModel = 'gemini-embedding-2'
    const chatModel = 'gemini-2.5-flash' // Model xịn nhất bạn đã dò ra

    // =====================================================================
    // TRẠM 1: "ÉP CUNG" AI TRÍCH XUẤT JSON DỰA TRÊN NGỮ CẢNH
    // =====================================================================
    console.log('1. Đang ép AI phân tích câu hỏi thành JSON...')

    // Gom lịch sử chat gần nhất (tối đa 4 câu) để AI biết "bộ trên" là bộ nào
    const recentHistory = messages.value
      .slice(-5, -1)
      .map(
        (m) =>
          `${m.role === 'user' ? 'Khách' : 'Hệ thống'}: ${m.content.replace(/<[^>]*>?/gm, '')}`,
      )
      .join('\n')

    const extractPrompt = `Bạn là hệ thống phân tích dữ liệu tĩnh.
    Lịch sử trò chuyện gần đây:\n${recentHistory}\n
    Câu hỏi mới của người dùng: "${query}"\n
    Hãy trích xuất yêu cầu của người dùng thành ĐÚNG 1 chuỗi JSON với cấu trúc sau. TUYỆT ĐỐI KHÔNG giải thích, KHÔNG bọc trong markdown (\`\`\`json):
    {
      "search_keyword": "Từ khóa cốt lõi miêu tả nội dung truyện (VD: giấu nghề, trọng sinh, hài hước). Dựa vào cả lịch sử nếu người dùng nói 'giống bộ trên'. Nếu không có, để rỗng",
      "min_chapters": Số lượng chương tối thiểu người dùng muốn (chỉ số, VD: 50). Nếu không nhắc đến, ghi 0,
      "filter_genre": "Tên thể loại cụ thể nếu có (VD: Tu Tiên, Hành Động). Nếu không, để rỗng"
    }`

    const extractRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${chatModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: extractPrompt }] }] }),
      },
    )

    const extractData = await extractRes.json()
    if (!extractRes.ok) {
      console.warn(
        `⚠️ Google AI đang bận (Lỗi ${extractRes.status}), tự động dùng chế độ tìm kiếm cơ bản.`,
      )
    }

    let rawJsonText = extractData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    rawJsonText = rawJsonText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    // BỌC THÉP: Luôn đảm bảo có số 0 và chuỗi rỗng để không làm sập Supabase
    let searchParams = { search_keyword: query, min_chapters: 0, filter_genre: '' }
    try {
      if (rawJsonText !== '{}') {
        const parsed = JSON.parse(rawJsonText)
        searchParams.search_keyword = parsed.search_keyword || query
        searchParams.min_chapters = Number(parsed.min_chapters) || 0 // Ép chuẩn thành số
        searchParams.filter_genre = parsed.filter_genre || ''
      }
    } catch (e) {
      console.error('Lỗi khi parse JSON từ AI:', e)
      console.warn('⚠️ AI trả JSON lỗi, dùng tham số mặc định.', rawJsonText)
    }

    console.log('🎯 DỮ LIỆU ĐƯA VÀO SUPABASE:', searchParams)

    // =====================================================================
    // TRẠM 2: TẠO VECTOR CHO TỪ KHÓA ĐÃ LỌC
    // =====================================================================
    console.log('2. Bắt đầu gọi AI lấy Vector...')
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${embedModel}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: searchParams.search_keyword }] },
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: 768,
        }),
      },
    )

    const embedData = await embedRes.json()
    if (!embedRes.ok) throw new Error('EMBED_ERROR')
    const queryVector = embedData.embedding.values

    // =====================================================================
    // TRẠM 3: GỌI SUPABASE VỚI HYBRID SEARCH (VECTOR + LỌC CỨNG)
    // =====================================================================
    console.log('3. Bắt đầu gọi Supabase tìm truyện...')
    const { data: matchedMangas, error: dbError } = await supabase.rpc('match_mangas_ai', {
      query_embedding: queryVector,
      match_threshold: 0.01,
      match_count: 3,
      min_chapters: searchParams.min_chapters,
      filter_genre: searchParams.filter_genre,
    })

    if (dbError) {
      console.error('Lỗi từ Supabase:', dbError)
      throw new Error('DB_ERROR')
    }
    console.log('4. Supabase chạy xong! Số truyện tìm thấy:', matchedMangas?.length)

    // =====================================================================
    // TRẠM 4: AI VIẾT CÂU TRẢ LỜI (CÓ TRÍ NHỚ)
    // =====================================================================
    console.log('5. Bắt đầu gọi AI viết câu chào...')
    let aiReply = ''

    if (!matchedMangas || matchedMangas.length === 0) {
      aiReply =
        'Mình lật tung thư viện rồi mà chưa thấy bộ nào khớp với yêu cầu khắt khe này của bạn. Đổi từ khóa hoặc hạ số chương xuống chút xem sao nha! 🕵️‍♂️'
    } else {
      const context = matchedMangas
        .map((m) => `- ${m.title} (Thể loại: ${m.genres}, ${m.chapter_count} chương)`)
        .join('\n')

      const prompt = `Bạn là trợ lý tư vấn truyện. Lịch sử:\n${recentHistory}\n
      Khách hỏi: "${query}".
      Truyện tìm được:\n${context}\n
      Hãy trả lời bằng 1 câu ngắn gọn, thân thiện (dưới 30 chữ) để giới thiệu các bộ truyện này. Chú ý nhắc đến số chương hoặc thể loại nếu khách có yêu cầu.`

      let greetingText = 'Tadaa! Đây là những siêu phẩm mình tìm được cho bạn:' // Câu chào mặc định

      try {
        const chatRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${chatModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          },
        )

        if (!chatRes.ok) {
          console.warn(
            `⚠️ AI bận viết câu chào (Lỗi ${chatRes.status}). Sử dụng câu chào mặc định.`,
          )
        } else {
          const chatData = await chatRes.json()
          greetingText = chatData.candidates?.[0]?.content?.parts?.[0]?.text || greetingText
        }
      } catch (chatErr) {
        console.warn('⚠️ Không thể kết nối AI để tạo câu chào.', chatErr)
      }

      aiReply = greetingText // Dùng câu chào của AI (hoặc câu mặc định nếu AI lỗi)

      // Gắn giao diện thẻ truyện (có thêm thông tin chương và thể loại)
      aiReply += `<div class="mt-3 flex flex-col gap-2">`
      matchedMangas.forEach((m) => {
        aiReply += `
        <a href="/truyen/${m.slug}?isLocal=false"
           class="group flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 border border-gray-100 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500/50 rounded-xl transition-all duration-300">
          <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span class="text-lg">📖</span>
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm line-clamp-1 transition-colors">
              ${m.title}
            </span>
            <span class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              ${m.chapter_count} chương • ${m.genres.split(',')[0] || 'Truyện tranh'}
            </span>
          </div>
        </a>`
      })
      aiReply += `</div>`
    }

    messages.value.push({ role: 'ai', content: aiReply })
    console.log('6. HOÀN THÀNH TẤT CẢ!')
  } catch (err) {
    console.error('BỊ LỖI RỒI:', err)
    messages.value.push({
      role: 'ai',
      content: 'Hệ thống đang quá tải hoặc gọi API quá nhanh. Bạn chờ vài giây rồi thử lại nha! 🔧',
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// Hàm xóa lịch sử chat
const clearHistory = () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với AI không?')) {
    // Reset lại mảng về đúng 1 tin nhắn chào hỏi mặc định của bạn
    messages.value = [
      {
        role: 'ai',
        content: 'Tadaa! Mình là trợ lý truyện tranh đây. Bạn đang muốn tìm thể loại gì nào? 🕵️‍♂️',
      },
    ]
    // Xóa khỏi bộ nhớ trình duyệt
    localStorage.removeItem('manga_ai_chat_history')
  }
}

// Khi component được mount, tải lịch sử chat từ localStorage nếu có
onMounted(() => {
  const savedChat = localStorage.getItem('manga_ai_chat_history')
  if (savedChat) {
    messages.value = JSON.parse(savedChat)
    // Đẩy thanh cuộn xuống cuối sau khi render xong chữ
    nextTick(() => scrollToBottom())
  }
})

// Mỗi khi messages thay đổi, lưu lại vào localStorage
watch(
  messages,
  (newVal) => {
    localStorage.setItem('manga_ai_chat_history', JSON.stringify(newVal))
  },
  { deep: true },
) // Dùng deep: true để theo dõi sự thay đổi bên trong mảng
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
