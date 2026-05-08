<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden"
  >
    <div
      class="hidden dark:block absolute top-[10%] left-[15%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"
    ></div>
    <div
      class="hidden dark:block absolute bottom-[10%] right-[15%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"
    ></div>

    <div
      class="max-w-2xl w-full bg-white dark:bg-slate-800/60 dark:backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden p-8 sm:p-12 relative z-10 animate-fade-in-up"
    >
      <div class="text-center mb-10">
        <div
          class="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
        </div>
        <h2
          class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 sm:text-4xl mb-4 tracking-tight"
        >
          Liên Hệ Với Admin
        </h2>
        <p class="text-lg text-gray-500 dark:text-gray-400 font-medium">
          Manga Real luôn hoan nghênh các tác giả và nhóm dịch. Nếu bạn có truyện muốn đăng tải, góp
          ý hệ thống, hoặc báo lỗi, hãy liên hệ trực tiếp với mình nhé!
        </p>
      </div>

      <div class="space-y-4">
        <a
          href="https://zalo.me/0357165087"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center p-5 border-2 border-transparent dark:border-slate-700/50 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 rounded-2xl transition-all duration-300 group cursor-pointer"
        >
          <div
            class="flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-xl shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              ></path>
            </svg>
          </div>
          <div class="ml-6">
            <h3
              class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              Zalo
            </h3>
            <p class="mt-1 text-gray-500 dark:text-gray-400 text-sm font-medium">0357165087</p>
          </div>
          <div
            class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0"
          >
            <svg
              class="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
        </a>

        <a
          href="https://t.me/Thanh1673"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center p-5 border-2 border-transparent dark:border-slate-700/50 bg-sky-50/50 dark:bg-sky-900/10 hover:bg-white dark:hover:bg-slate-800 hover:border-sky-400 dark:hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl transition-all duration-300 group cursor-pointer"
        >
          <div
            class="flex-shrink-0 bg-gradient-to-br from-sky-400 to-blue-500 text-white p-4 rounded-xl shadow-md shadow-sky-500/30 group-hover:scale-110 transition-transform duration-300"
          >
            <svg class="w-7 h-7 pl-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
              ></path>
            </svg>
          </div>
          <div class="ml-6">
            <h3
              class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors"
            >
              Telegram
            </h3>
            <p class="mt-1 text-gray-500 dark:text-gray-400 text-sm font-medium">@Thanh1673</p>
          </div>
          <div
            class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0"
          >
            <svg class="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
        </a>

        <a
          href="mailto:ktthanh1673@gmail.com"
          class="flex items-center p-5 border-2 border-transparent dark:border-slate-700/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-white dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 rounded-2xl transition-all duration-300 group cursor-pointer"
        >
          <div
            class="flex-shrink-0 bg-gradient-to-br from-red-400 to-rose-600 text-white p-4 rounded-xl shadow-md shadow-red-500/30 group-hover:scale-110 transition-transform duration-300"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <div class="ml-6">
            <h3
              class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors"
            >
              Gmail
            </h3>
            <p class="mt-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
              ktthanh1673@gmail.com
            </p>
          </div>
          <div
            class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0"
          >
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
        </a>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-100 dark:border-slate-700/50 text-center">
        <span
          class="inline-block bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-bold border border-indigo-100 dark:border-indigo-500/20"
        >
          Cảm ơn bạn đã đồng hành cùng Manga Real! 💖
        </span>
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
  animation: fadeInUp 0.6s ease-out forwards;
}
</style>
