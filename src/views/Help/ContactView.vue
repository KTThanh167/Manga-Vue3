<template>
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 sm:p-12">
      <!-- Tiêu đề -->
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Liên Hệ Với Admin</h2>
        <p class="text-lg text-gray-500">
          Manga Real luôn hoan nghênh các tác giả và nhóm dịch. Nếu bạn có truyện muốn đăng tải, góp
          ý hệ thống, hoặc báo lỗi, hãy liên hệ trực tiếp với mình qua các kênh dưới đây nhé!
        </p>
      </div>

      <!-- Danh sách các kênh liên hệ -->
      <div class="space-y-5">
        <a
          href="https://zalo.me/0357165087"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center p-5 border-2 border-transparent bg-blue-50 hover:bg-white hover:border-blue-500 hover:shadow-lg rounded-2xl transition-all duration-300 group cursor-pointer"
        >
          <div
            class="flex-shrink-0 bg-blue-500 text-white p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300"
          >
            <span class="text-2xl">💬</span>
          </div>
          <div class="ml-6">
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Zalo
            </h3>
            <p class="mt-1 text-gray-500 font-medium">Nhắn tin trực tiếp qua Zalo (0357165087)</p>
          </div>
        </a>

        <a
          href="https://t.me/@Thanh1673"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center p-5 border-2 border-transparent bg-sky-50 hover:bg-white hover:border-sky-400 hover:shadow-lg rounded-2xl transition-all duration-300 group cursor-pointer"
        >
          <div
            class="flex-shrink-0 bg-sky-400 text-white p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300"
          >
            <span class="text-2xl">✈️</span>
          </div>
          <div class="ml-6">
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-sky-500 transition-colors">
              Telegram
            </h3>
            <p class="mt-1 text-gray-500 font-medium">Liên hệ qua Telegram (@Thanh1673)</p>
          </div>
        </a>

        <!-- Nút Gmail -->
        <a
          href="mailto:ktthanh1673@gmail.com"
          class="flex items-center p-5 border-2 border-transparent bg-red-50 hover:bg-white hover:border-red-500 hover:shadow-lg rounded-2xl transition-all duration-300 group cursor-pointer"
        >
          <div
            class="flex-shrink-0 bg-red-500 text-white p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300"
          >
            <span class="text-2xl">📧</span>
          </div>
          <div class="ml-6">
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              Gmail
            </h3>
            <p class="mt-1 text-gray-500 font-medium">Gửi email (ktthanh1673@gmail.com)</p>
          </div>
        </a>
      </div>

      <!-- Lời cảm ơn -->
      <div class="mt-10 text-center text-sm text-gray-400">
        <p>Cảm ơn bạn đã đồng hành cùng Manga Real!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>
