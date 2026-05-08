<template>
  <footer
    class="bg-gray-50/50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300 pt-16 mt-auto relative overflow-hidden"
  >
    <div
      class="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none"
    ></div>
    <div
      class="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none"
    ></div>

    <div class="container mx-auto px-4 lg:px-8 pb-8 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 lg:gap-16">
        <div class="col-span-1 md:col-span-1">
          <router-link to="/" class="flex items-center gap-3 mb-6 group inline-flex">
            <div
              class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-500/30"
            >
              <span class="text-white font-black text-xl leading-none">M</span>
            </div>
            <span
              class="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight"
            >
              MangaReal
            </span>
          </router-link>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Trải nghiệm đọc truyện tranh trực tuyến tốt nhất với giao diện hiện đại, mượt mà và hoàn
            toàn miễn phí.
          </p>
        </div>

        <div>
          <h3 class="footer-heading">Khám phá</h3>
          <ul class="space-y-4">
            <li><router-link to="/" class="footer-link">Tất cả truyện</router-link></li>
            <li><router-link to="/completed" class="footer-link">Đã hoàn thành</router-link></li>
            <li>
              <router-link to="/user-comics" class="footer-link">Khu vực sáng tác</router-link>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="footer-heading">Hỗ trợ</h3>
          <ul class="space-y-4">
            <li><router-link to="/about" class="footer-link">Giới thiệu</router-link></li>
            <li><router-link to="/contact" class="footer-link">Liên hệ</router-link></li>
            <li><router-link to="/terms" class="footer-link">Điều khoản dịch vụ</router-link></li>
            <li><router-link to="/privacy" class="footer-link">Chính sách bảo mật</router-link></li>
          </ul>
        </div>

        <div>
          <h3 class="footer-heading">Nguồn dữ liệu</h3>
          <p class="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed font-medium">
            Nội dung và hình ảnh được cung cấp thông qua API của
            <strong class="text-indigo-600 dark:text-indigo-400">otruyen.cc</strong>. Chúng tôi
            không lưu trữ dữ liệu gốc trên máy chủ.
          </p>

          <div
            class="p-4 bg-white/60 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 backdrop-blur-md shadow-sm"
          >
            <span
              class="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest block mb-2"
            >
              Trạng thái API
            </span>
            <div class="flex items-center gap-3">
              <span class="relative flex h-3 w-3 shrink-0">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200"
                >Hệ thống ổn định</span
              >
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-16 pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
          © {{ currentYear }}
          <span class="font-bold text-indigo-600 dark:text-indigo-400">MangaReal</span>. All rights
          reserved.
        </p>
        <p
          class="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2"
        >
          Built with
          <span class="text-emerald-500">Vue 3</span> &
          <span class="text-cyan-500">Tailwind</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer-heading {
  @apply text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6;
}

.footer-link {
  @apply text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block;
}
</style>
