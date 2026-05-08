<script setup>
defineProps({
  currentChapter: [String, Number],
})
defineEmits(['next', 'prev'])
</script>

<template>
  <div class="py-12 flex flex-col items-center gap-8">
    <div class="flex items-center w-full max-w-lg px-4">
      <div
        class="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"
      ></div>
      <span
        class="px-4 text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest"
      >
        Hết chương {{ currentChapter }}
      </span>
      <div
        class="h-px flex-1 bg-gradient-to-l from-transparent via-gray-300 dark:via-gray-600 to-transparent"
      ></div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 w-full max-w-lg px-4">
      <button
        @click="$emit('prev')"
        class="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
      >
        <svg
          class="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
        Chương Trước
      </button>

      <button
        @click="$emit('next')"
        class="flex-[2] py-3.5 px-6 rounded-xl font-bold !text-white bg-indigo-600 dark:bg-indigo-500 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group border border-indigo-500/50"
      >
        Chương Tiếp Theo
        <svg
          class="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
      </button>
    </div>
  </div>
</template>
