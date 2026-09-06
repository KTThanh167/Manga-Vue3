<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
</script>

<template>
  <section
    v-if="isVisible"
    class="fixed inset-x-0 top-0 z-[200] px-4 pt-4 sm:px-6"
    role="alert"
    aria-live="polite"
  >
    <div
      class="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-red-200 bg-white p-5 shadow-2xl shadow-red-950/20 dark:border-red-500/30 dark:bg-slate-900 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="flex gap-4">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
        >
          <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
          </svg>
        </div>

        <div>
          <p class="text-lg font-black text-red-700 dark:text-red-300 sm:text-2xl">
            Thông báo: API Otruyen đang gặp sự cố
          </p>
          <p class="mt-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-200 sm:text-base">
            Hiện tại nguồn dữ liệu bên Otruyen bị lỗi nên các chức năng lấy danh sách truyện,
            tìm kiếm và một số truyện từ nguồn ngoài có thể không hiển thị. Website vẫn hỗ trợ
            đọc các truyện nội bộ đã được lưu trong hệ thống.
          </p>
          <p class="mt-3 text-sm font-bold text-red-600 dark:text-red-300">
            Mong người dùng thông cảm trong thời gian hệ thống chờ nguồn API hoạt động trở lại.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="self-end rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-200 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-red-500/30 sm:self-start"
        aria-label="Đóng thông báo"
        @click="isVisible = false"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </section>
</template>
