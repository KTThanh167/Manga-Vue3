<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Nút mở Chatbox -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg shadow-indigo-300 transition-transform hover:scale-110 flex items-center justify-center"
    >
      <span class="text-2xl">🤖</span>
    </button>

    <!-- Khung Chat -->
    <div
      v-else
      class="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
      style="height: 500px"
    >
      <!-- Header -->
      <div class="bg-indigo-600 p-4 text-white flex justify-between items-center">
        <h3 class="font-bold flex items-center gap-2"><span>🤖</span> Trợ lý Truyện Tranh</h3>
        <button @click="isOpen = false" class="text-white hover:text-gray-200 text-xl font-bold">
          ×
        </button>
      </div>

      <!-- Khu vực hiển thị tin nhắn -->
      <div class="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3" ref="chatContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'max-w-[85%] p-3 rounded-xl text-sm',
            msg.role === 'user'
              ? 'bg-indigo-600 text-white self-end rounded-br-none'
              : 'bg-white text-gray-800 border border-gray-200 self-start rounded-bl-none shadow-sm',
          ]"
        >
          <!-- Nếu là tin nhắn của AI có chứa HTML (link truyện) -->
          <div v-if="msg.role === 'ai'" v-html="msg.content"></div>
          <div v-else>{{ msg.content }}</div>
        </div>

        <!-- Hiệu ứng đang gõ -->
        <div
          v-if="isLoading"
          class="bg-white border border-gray-200 text-gray-500 self-start p-3 rounded-xl rounded-bl-none text-sm flex gap-1 shadow-sm"
        >
          <span class="animate-bounce">●</span>
          <span class="animate-bounce" style="animation-delay: 0.2s">●</span>
          <span class="animate-bounce" style="animation-delay: 0.4s">●</span>
        </div>
      </div>

      <!-- Ô nhập nội dung -->
      <div class="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Ví dụ: Tìm truyện main bá đạo..."
          class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :disabled="isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="isLoading || !userInput.trim()"
          class="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➤
        </button>
      </div>
    </div>
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
    content: 'Chào bạn! Mình là AI tư vấn truyện. Bạn đang muốn tìm truyện như thế nào?',
  },
])

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim()) return
  const query = userInput.value.trim()
  messages.value.push({ role: 'user', content: query })
  userInput.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY.trim()

    // --- BƯỚC 1: KIỂM TRA MODEL ---
    const checkRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    )
    const checkData = await checkRes.json()

    // Tìm model để tạo Vector
    const embedModel = checkData.models.find((m) =>
      m.supportedGenerationMethods.includes('embedContent'),
    )?.name
    // Tìm model để Chat (Thường là gemini-pro hoặc các bản đời cũ hơn nếu tài khoản bạn hạn chế)
    const chatModel = checkData.models.find((m) =>
      m.supportedGenerationMethods.includes('generateContent'),
    )?.name

    if (!embedModel || !chatModel) throw new Error('Không tìm thấy model phù hợp trong tài khoản')

    console.log(`🤖 Sử dụng: Vector(${embedModel}) | Chat(${chatModel})`)

    // --- BƯỚC 2: TẠO VECTOR ---
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${embedModel}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: query }] },
          taskType: 'RETRIEVAL_QUERY',
        }),
      },
    )
    const embedData = await embedRes.json()
    const queryVector = embedData.embedding.values

    // --- BƯỚC 3: TÌM TRUYỆN ---
    const { data: matchedMangas } = await supabase.rpc('match_mangas_ai', {
      query_embedding: queryVector,
      match_threshold: 0.01,
      match_count: 3,
    })

    // --- BƯỚC 4: CHAT BẰNG MODEL ĐÃ DÒ ĐƯỢC ---
    let aiReply = ''
    if (!matchedMangas || matchedMangas.length === 0) {
      aiReply = 'Hiện tại mình chưa tìm thấy truyện nào khớp. Bạn thử hỏi từ khóa khác nhé!'
    } else {
      // Chỉ lấy thông tin quan trọng nhất để AI không bị "loãng"
      const context = matchedMangas.map((m) => `- ${m.title}`).join('\n')

      // Prompt cực kỳ ngắn gọn, ép AI chỉ trả lời câu dẫn dắt
      const prompt = `Bạn là trợ lý tư vấn truyện tranh. Người dùng hỏi: "${query}".
      Dựa vào danh sách: \n${context}\n
      Hãy trả lời bằng 1-2 câu ngắn gọn, thân thiện để giới thiệu các bộ truyện này phù hợp thế nào.
      Không phân tích dài dòng. Trả lời bằng tiếng Việt.`

      const chatRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${chatModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      )

      const chatData = await chatRes.json()
      aiReply =
        chatData.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Đây là những bộ truyện phù hợp nhất với yêu cầu của bạn:'

      // Hiển thị danh sách link dưới dạng các card nhỏ gọn
      aiReply += `<br><br><div class="flex flex-col gap-2">`
      matchedMangas.forEach((m) => {
        aiReply += `
      <a href="/truyen/${m.slug}?isLocal=false"
         class="p-2 bg-white border border-gray-200 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm text-xs">
        📖 ${m.title}
      </a>`
      })
      aiReply += `</div>`
    }

    messages.value.push({ role: 'ai', content: aiReply })
  } catch (err) {
    console.error('Lỗi:', err)
    messages.value.push({ role: 'ai', content: 'Có chút trục trặc, bạn thử lại nhé!' })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>
