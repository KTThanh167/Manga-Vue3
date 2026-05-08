<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
  >
    <div
      class="hidden dark:block absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"
    ></div>
    <div
      class="hidden dark:block absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"
    ></div>

    <div class="max-w-4xl mx-auto relative z-10">
      <div class="text-center mb-16 animate-fade-in-up">
        <h1 class="text-5xl md:text-6xl font-black tracking-tighter mb-4">
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
          >
            MANGA REAL
          </span>
        </h1>
        <p
          class="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto"
        >
          Nền tảng đọc truyện tranh trực tuyến hiện đại, mượt mà và thông minh.
        </p>
      </div>

      <div
        class="bg-white dark:bg-slate-800/50 dark:backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700/60 overflow-hidden animate-fade-in-up delay-100"
      >
        <div
          class="p-8 md:p-12 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
        >
          <div class="flex items-center mb-6 justify-center gap-3">
            <div
              class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transform -rotate-6"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Sứ Mệnh & Mục Tiêu
            </h2>
          </div>
          <p
            class="text-gray-600 dark:text-gray-300 leading-relaxed text-lg text-center max-w-3xl mx-auto"
          >
            Manga Real được xây dựng với mong muốn tạo ra một không gian kết nối giữa những người
            đam mê truyện tranh và các nhóm dịch giả. Với giao diện trực quan, tốc độ tải trang tối
            ưu và đặc biệt là kho truyện phong phú luôn được cập nhật liên tục, dự án kỳ vọng mang
            lại trải nghiệm giải trí tuyệt vời nhất cho độc giả.
          </p>
        </div>

        <div
          class="p-8 md:p-12 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50/30 dark:bg-slate-900/20"
        >
          <div class="flex items-center justify-center mb-8 gap-3">
            <div
              class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transform rotate-3"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                ></path>
              </svg>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Công Nghệ Cốt Lõi
            </h2>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div
              class="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 text-center cursor-default"
            >
              <div
                class="w-12 h-12 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <span class="text-2xl text-emerald-500">🟩</span>
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-lg">Vue 3</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Frontend Framework</div>
            </div>

            <div
              class="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-sky-500/50 dark:hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-300 text-center cursor-default"
            >
              <div
                class="w-12 h-12 mx-auto bg-sky-50 dark:bg-sky-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <span class="text-2xl text-sky-500">🌊</span>
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-lg">Tailwind</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">UI & Styling</div>
            </div>

            <div
              class="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-green-500/50 dark:hover:border-green-500/50 hover:-translate-y-1 transition-all duration-300 text-center cursor-default"
            >
              <div
                class="w-12 h-12 mx-auto bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <span class="text-2xl text-green-500">⚡</span>
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-lg">Supabase</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Database & Auth</div>
            </div>

            <div
              class="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 text-center cursor-default"
            >
              <div
                class="w-12 h-12 mx-auto bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <span class="text-2xl text-purple-500">✨</span>
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-lg">Gemini AI</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">AI Assistant</div>
            </div>

            <div
              class="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 text-center cursor-default"
            >
              <div
                class="w-12 h-12 mx-auto bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <span class="text-2xl text-blue-500">🐜</span>
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-lg">Ant Design</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">UI Components</div>
            </div>
          </div>
        </div>

        <div class="p-8 md:p-12 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <div class="flex items-center justify-center mb-6 gap-3">
            <div
              class="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 transform -rotate-3"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Về Tác Giả</h2>
          </div>

          <div
            class="relative bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 md:p-8 text-center max-w-3xl mx-auto"
          >
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div
                class="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-indigo-50 dark:border-slate-900 flex items-center justify-center shadow-xl"
              >
                <span class="text-3xl">👨‍💻</span>
              </div>
            </div>

            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mt-6">
              Xin chào, mình là
              <span class="font-black text-indigo-600 dark:text-indigo-400 text-xl">Thành</span> -
              một lập trình viên Web Frontend đam mê công nghệ và yêu thích truyện tranh.
            </p>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              <strong>Manga Real</strong> không chỉ là một nền tảng đọc truyện, mà còn là
              <strong>Đồ án Tốt nghiệp (Graduation Project)</strong> chứa đựng rất nhiều tâm huyết.
              Dự án là nơi mình đúc kết và áp dụng thực tế các kiến thức đã học: từ xây dựng giao
              diện tương tác cao, thiết kế cơ sở dữ liệu thời gian thực, cho đến việc tích hợp trí
              tuệ nhân tạo (AI) vào các tính năng hệ thống.
            </p>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4 font-medium italic">
              Rất mong nhận được sự ủng hộ, đóng góp ý kiến từ độc giả và các thầy cô để dự án ngày
              một hoàn thiện hơn!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* Keyframes cho hiệu ứng Blob (như các trang Auth) */
@keyframes blob {
  0%,
  100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}

/* Hiệu ứng trượt lên mượt mà khi load trang */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
.delay-100 {
  animation-delay: 0.1s;
}
</style>
