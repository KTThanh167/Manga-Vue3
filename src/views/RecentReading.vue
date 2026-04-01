<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
      <span class="i-lucide-history"></span> Lịch sử đọc truyện
    </h1>

    <div
      v-if="mangaStore.readingHistory.length === 0"
      class="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-700"
    >
      <p class="text-slate-400">Bạn chưa đọc bộ truyện nào hoặc đang tải dữ liệu...</p>
      <router-link to="/" class="text-emerald-400 hover:underline mt-2 inline-block"
        >Khám phá ngay</router-link
      >
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in mangaStore.readingHistory"
        :key="item.id"
        class="bg-slate-800 border border-slate-700 rounded-lg p-4 flex gap-4 hover:border-emerald-500/50 transition relative group"
      >
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-bold truncate group-hover:text-emerald-400 transition">
            {{ item.manga_name }}
          </h3>

          <div class="flex flex-wrap gap-1 my-2">
            <span
              v-for="cat in item.category_list"
              :key="cat"
              class="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
            >
              {{ cat }}
            </span>
          </div>

          <p class="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span class="i-lucide-clock w-3 h-3"></span>
            {{ formatTime(item.last_read_at) }}
          </p>
        </div>

        <button @click="deleteItem(item.id)" class="text-slate-600 hover:text-red-400 p-1">
          <span class="i-lucide-trash-2"></span>
        </button>

        <router-link :to="`/manga/${item.manga_slug}`" class="absolute inset-0 z-0"></router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMangaStore } from '@/stores/manga'

const mangaStore = useMangaStore()

// 1. QUAN TRỌNG NHẤT: Gọi dữ liệu khi vào trang
onMounted(async () => {
  await mangaStore.fetchReadingHistory()
})

// Hàm format thời gian đơn giản
const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}
</script>
