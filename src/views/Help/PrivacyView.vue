<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
  >
    <div
      class="hidden dark:block absolute top-[5%] left-[20%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"
    ></div>
    <div
      class="hidden dark:block absolute bottom-[5%] right-[20%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"
    ></div>

    <div
      class="max-w-4xl mx-auto bg-white dark:bg-slate-800/60 dark:backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700/50 relative z-10 animate-fade-in-up"
    >
      <div
        class="bg-gradient-to-r from-indigo-600 to-blue-700 dark:from-indigo-900/80 dark:to-blue-900/80 px-8 py-12 text-center relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"
        ></div>
        <div
          class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            ></path>
          </svg>
        </div>
        <h1 class="text-3xl font-black text-white sm:text-5xl mb-4 tracking-tight relative z-10">
          Chính Sách Bảo Mật
        </h1>
        <p class="text-indigo-100 dark:text-indigo-200 font-medium relative z-10">
          Cập nhật lần cuối: {{ currentDate }}
        </p>
      </div>

      <div class="p-8 sm:p-12 text-gray-700 dark:text-gray-300 leading-relaxed space-y-10">
        <div
          class="bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-500 p-6 rounded-r-2xl text-lg text-gray-800 dark:text-gray-200 font-medium"
        >
          Chào mừng bạn đến với
          <span class="font-black text-indigo-600 dark:text-indigo-400">Manga Real</span>. Việc bảo
          vệ thông tin cá nhân của người dùng là ưu tiên hàng đầu của chúng tôi. Chính sách này giải
          thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn khi sử dụng nền tảng.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section
            class="bg-gray-50 dark:bg-slate-700/30 p-8 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                1. Thông tin chúng tôi thu thập
              </h2>
            </div>
            <ul class="space-y-4">
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span><strong>Tài khoản:</strong> Email, Tên hiển thị (Username) và Mật khẩu.</span>
              </li>
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  ><strong>Dữ liệu sử dụng:</strong> Lịch sử đọc, Bookmark, và các bình luận.</span
                >
              </li>
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  ><strong>Kỹ thuật:</strong> Cookie phiên đăng nhập để giữ trạng thái an
                  toàn.</span
                >
              </li>
            </ul>
          </section>

          <section
            class="bg-gray-50 dark:bg-slate-700/30 p-8 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
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
              <h2 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                2. Mục đích sử dụng dữ liệu
              </h2>
            </div>
            <ul class="space-y-4">
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  >Cung cấp, duy trì và cá nhân hóa trải nghiệm (đồng bộ lịch sử, AI gợi ý).</span
                >
              </li>
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>Quản lý hệ thống, xác thực danh tính và ngăn chặn spam.</span>
              </li>
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>Liên hệ hỗ trợ kỹ thuật hoặc cấp lại mật khẩu.</span>
              </li>
            </ul>
          </section>

          <section
            class="bg-gray-50 dark:bg-slate-700/30 p-8 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                3. Cam kết Bảo mật
              </h2>
            </div>
            <ul class="space-y-4">
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  ><strong>Không bán dữ liệu:</strong> Tuyệt đối KHÔNG bán, cho thuê thông tin cá
                  nhân cho bên thứ ba.</span
                >
              </li>
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  ><strong>Mã hóa chuẩn Cloud:</strong> Dữ liệu được mã hóa một chiều bởi hạ tầng
                  máy chủ đám mây Supabase an toàn.</span
                >
              </li>
            </ul>
          </section>

          <section
            class="bg-gray-50 dark:bg-slate-700/30 p-8 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                4. Quyền kiểm soát
              </h2>
            </div>
            <ul class="space-y-4">
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  >Bạn có quyền chỉnh sửa thông tin tại trang <strong>Hồ sơ cá nhân</strong>.</span
                >
              </li>
              <li class="flex items-start">
                <svg
                  class="w-5 h-5 text-indigo-500 mt-1 mr-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  >Yêu cầu xóa toàn bộ dữ liệu tài khoản vĩnh viễn thông qua trang Liên hệ.</span
                >
              </li>
            </ul>
          </section>
        </div>

        <div class="mt-12 text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            Nếu bạn có bất kỳ thắc mắc nào, hãy cho chúng tôi biết.
          </p>
          <router-link
            to="/contact"
            class="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-xl shadow-gray-900/20 dark:shadow-white/10 group"
          >
            Liên Hệ Ban Quản Trị
            <svg
              class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
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
