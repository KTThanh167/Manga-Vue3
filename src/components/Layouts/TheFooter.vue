<template>
  <footer
    class="bg-white border-t border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300 pt-[50px]"
  >
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-1">
          <router-link to="/" class="flex items-center gap-2 mb-4 group">
            <div
              class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <span
              class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
            >
              MangaReal
            </span>
          </router-link>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Trải nghiệm đọc truyện tranh trực tuyến tốt nhất với giao diện hiện đại, mượt mà và hoàn
            toàn miễn phí.
          </p>
        </div>

        <div>
          <h3 class="footer-heading">Khám phá</h3>
          <ul class="space-y-3">
            <li><router-link to="/browse" class="footer-link">Tất cả truyện</router-link></li>
            <li><router-link to="/latest" class="footer-link">Mới cập nhật</router-link></li>
            <li><router-link to="/trending" class="footer-link">Truyện hot nhất</router-link></li>
            <li><router-link to="/completed" class="footer-link">Đã hoàn thành</router-link></li>
          </ul>
        </div>

        <div>
          <h3 class="footer-heading">Hỗ trợ</h3>
          <ul class="space-y-3">
            <li><router-link to="/about" class="footer-link">Giới thiệu</router-link></li>
            <li><router-link to="/contact" class="footer-link">Liên hệ</router-link></li>
            <li><router-link to="/terms" class="footer-link">Điều khoản dịch vụ</router-link></li>
            <li><router-link to="/privacy" class="footer-link">Chính sách bảo mật</router-link></li>
          </ul>
        </div>

        <div>
          <h3 class="footer-heading">Nguồn dữ liệu</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 italic mb-4 leading-relaxed">
            Nội dung và hình ảnh được cung cấp thông qua API của <strong>otruyen.cc</strong>. Chúng
            tôi không lưu trữ dữ liệu gốc trên máy chủ.
          </p>
          <div
            class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
          >
            <span
              class="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block mb-1"
              >Status</span
            >
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-xs font-medium dark:text-gray-200">Hệ thống ổn định</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p class="text-sm text-gray-400">
          © {{ currentYear }}
          <span class="font-semibold text-gray-600 dark:text-gray-300">MangaReal</span>. All rights
          reserved.
        </p>
        <p class="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
          Built with Vue 3 & Tailwind
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
  @apply text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-5;
}

.footer-link {
  @apply text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors;
}

.social-icon {
  @apply w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300;
}
</style>
