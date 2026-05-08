<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
  >
    <div
      class="hidden dark:block absolute top-[5%] right-[20%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"
    ></div>
    <div
      class="hidden dark:block absolute bottom-[5%] left-[20%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"
    ></div>

    <div
      class="max-w-4xl mx-auto bg-white dark:bg-slate-800/60 dark:backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700/50 relative z-10 animate-fade-in-up"
    >
      <div
        class="bg-gradient-to-r from-slate-800 to-gray-900 dark:from-slate-800 dark:to-slate-950 px-8 py-12 text-center relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"
        ></div>
        <div
          class="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-lg border border-white/10"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        </div>
        <h1 class="text-3xl font-black text-white sm:text-5xl mb-4 tracking-tight relative z-10">
          Điều Khoản Dịch Vụ
        </h1>
        <p class="text-gray-400 font-medium relative z-10">Cập nhật lần cuối: {{ currentDate }}</p>
      </div>

      <div class="p-8 sm:p-12 text-gray-700 dark:text-gray-300 leading-relaxed space-y-8">
        <section
          class="bg-gray-50 dark:bg-slate-700/30 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div class="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">1. Chấp nhận Điều khoản</h2>
          </div>
          <p class="pl-14 text-gray-600 dark:text-gray-400">
            Bằng việc truy cập và sử dụng nền tảng đọc truyện
            <span class="font-bold text-indigo-600 dark:text-indigo-400">Manga Real</span>, bạn xác
            nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản được nêu tại trang
            này. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ.
          </p>
        </section>

        <section
          class="bg-gray-50 dark:bg-slate-700/30 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">2. Tài khoản Người dùng</h2>
          </div>
          <ul class="pl-14 space-y-3 text-gray-600 dark:text-gray-400">
            <li class="flex items-start">
              <span class="text-blue-500 mr-2 mt-0.5">•</span>
              <span>Bạn tự chịu trách nhiệm bảo mật thông tin đăng nhập (Email, Mật khẩu).</span>
            </li>
            <li class="flex items-start">
              <span class="text-blue-500 mr-2 mt-0.5">•</span>
              <span
                >Nghiêm cấm hành vi tạo tài khoản hàng loạt để spam, phá hoại hệ thống hoặc quấy rối
                người dùng khác.</span
              >
            </li>
            <li class="flex items-start">
              <span class="text-blue-500 mr-2 mt-0.5">•</span>
              <span
                >Admin có quyền đình chỉ hoặc xóa tài khoản vĩnh viễn (Vô hiệu hóa user) nếu phát
                hiện vi phạm mà không cần báo trước.</span
              >
            </li>
          </ul>
        </section>

        <section
          class="bg-gray-50 dark:bg-slate-700/30 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div class="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              3. Bản quyền & Nội dung đăng tải
            </h2>
          </div>
          <div class="pl-14 text-gray-600 dark:text-gray-400 space-y-3">
            <p>Đây là nền tảng chia sẻ và kết nối cộng đồng. Quy định đối với nội dung như sau:</p>
            <ul class="space-y-3">
              <li class="flex items-start">
                <span class="text-purple-500 mr-2 mt-0.5">•</span>
                <span
                  ><strong>Manga Real</strong> tôn trọng quyền sở hữu trí tuệ. Tất cả nội dung trên
                  web đều do cộng đồng đóng góp hoặc thu thập từ các nguồn công cộng.</span
                >
              </li>
              <li class="flex items-start">
                <span class="text-purple-500 mr-2 mt-0.5">•</span>
                <span
                  >Người đóng góp phải tự chịu trách nhiệm về nội dung. Tuyệt đối cấm các nội dung
                  đồi trụy, phản động, hoặc vi phạm pháp luật.</span
                >
              </li>
              <li
                class="flex items-start bg-purple-50 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20 mt-4"
              >
                <svg
                  class="w-5 h-5 text-purple-500 mr-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span
                  >Nếu bạn là tác giả/người giữ bản quyền và phát hiện vi phạm, vui lòng liên hệ
                  Admin qua trang
                  <router-link
                    to="/contact"
                    class="text-purple-600 dark:text-purple-400 hover:underline font-bold"
                    >Liên Hệ</router-link
                  >
                  để được hỗ trợ gỡ bỏ ngay lập tức.</span
                >
              </li>
            </ul>
          </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section
            class="bg-gray-50 dark:bg-slate-700/30 p-6 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">4. Quyền Riêng tư</h2>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm pl-11">
              Hệ thống chỉ thu thập thông tin cơ bản để phục vụ việc tạo tài khoản và lưu lịch sử.
              Chúng tôi cam kết không bán dữ liệu của bạn cho bên thứ ba.
            </p>
          </section>

          <section
            class="bg-gray-50 dark:bg-slate-700/30 p-6 rounded-3xl border border-gray-100 dark:border-slate-600/50 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div class="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                5. Miễn trừ Trách nhiệm
              </h2>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm pl-11">
              Dịch vụ được cung cấp "nguyên trạng". Chúng tôi không đảm bảo nền tảng sẽ hoạt động
              100% không gặp lỗi hoặc bảo toàn dữ liệu trước sự cố bất khả kháng.
            </p>
          </section>
        </div>

        <section
          class="bg-indigo-50 dark:bg-indigo-500/10 p-6 md:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 text-center mt-8"
        >
          <h2 class="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">
            6. Thay đổi Điều khoản
          </h2>
          <p class="text-indigo-700 dark:text-indigo-300">
            Chúng tôi có quyền sửa đổi, bổ sung các điều khoản này vào bất kỳ lúc nào. Các thay đổi
            sẽ có hiệu lực ngay khi được cập nhật trên trang này. Việc bạn tiếp tục sử dụng web đồng
            nghĩa với việc chấp nhận các sửa đổi đó.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
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
