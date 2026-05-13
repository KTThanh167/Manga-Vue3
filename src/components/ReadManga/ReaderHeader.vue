<script setup>
import { useRouter, useRoute } from 'vue-router'

defineProps({
  comicName: String,
  currentChapter: [String, Number],
  slug: String,
})

defineEmits(['changeChapter'])
const router = useRouter()
const route = useRoute()
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800/60 transition-colors duration-300 shadow-sm"
  >
    <div class="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
      <button
        @click="router.push({ path: `/truyen/${slug}`, query: { isLocal: route.query.isLocal } })"
        class="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 font-medium group"
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
        <span class="hidden md:inline">Quay lại</span>
      </button>

      <div class="flex-1 text-center overflow-hidden px-4">
        <h1 class="font-bold text-base md:text-lg text-gray-900 dark:text-white truncate">
          {{ comicName || 'Đang tải...' }}
        </h1>
        <p
          class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5"
        >
          Chương {{ currentChapter }}
        </p>
      </div>

      <div class="flex gap-2">
        <button
          @click="$emit('changeChapter', -1)"
          :disabled="parseInt(currentChapter) <= 1"
          class="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          title="Chương trước"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <button
          @click="$emit('changeChapter', 1)"
          class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/30 transform hover:scale-105 active:scale-95 transition-all duration-300"
          title="Chương sau"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </header>
</template>
