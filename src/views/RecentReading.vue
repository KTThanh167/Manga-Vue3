<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
      <span class="i-lucide-history text-emerald-400"></span> Lịch sử đọc truyện
    </h1>

    <div
      v-if="mangaStore.readingHistory.length === 0"
      class="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-700"
    >
      <div class="i-lucide-book-open text-5xl text-slate-600 mx-auto mb-4"></div>
      <p class="text-slate-400">Bạn chưa đọc bộ truyện nào hoặc dữ liệu đang được tải...</p>
      <router-link
        to="/"
        class="text-emerald-400 hover:text-emerald-300 font-medium mt-4 inline-block transition"
      >
        Khám phá truyện mới ngay
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in mangaStore.readingHistory"
        :key="item.id"
        class="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4 hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all duration-300 relative group shadow-lg"
      >
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-bold text-lg truncate group-hover:text-emerald-400 transition">
            {{ item.manga_name }}
          </h3>

          <div class="flex items-center gap-2 mt-1">
            <span
              class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20"
            >
              {{ item.last_chapter_name || 'Đang cập nhật' }}
            </span>
          </div>

          <div class="flex flex-wrap gap-1 mt-3">
            <span
              v-for="cat in item.category_list"
              :key="cat"
              class="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded shadow-sm"
            >
              {{ cat }}
            </span>
          </div>

          <p class="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
            <span class="i-lucide-clock w-3.5 h-3.5"></span>
            Đọc lúc: {{ formatTime(item.last_read_at) }}
          </p>
        </div>

        <button
          @click.stop="deleteItem(item.id, item.manga_name)"
          class="text-slate-600 hover:text-red-400 p-2 relative z-10 self-start transition-colors rounded-lg hover:bg-red-400/10"
          title="Xóa khỏi lịch sử"
        >
          <span class="i-lucide-trash-2 w-5 h-5"></span>
        </button>

        <router-link
          :to="`/doc-truyen/${item.manga_slug}/${item.last_chapter_id || ''}`"
          class="absolute inset-0 z-0 rounded-xl"
        ></router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useMangaStore } from '@/stores/manga'
import { supabase } from '@/lib/supabaseClient'

const mangaStore = useMangaStore()
let historyChannel = null

onMounted(() => {
  // Duy trì lắng nghe Realtime để các tab đồng bộ với nhau
  historyChannel = supabase
    .channel('history-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reading_history' }, () => {
      mangaStore.fetchReadingHistory()
    })
    .subscribe()
})

onUnmounted(() => {
  if (historyChannel) {
    supabase.removeChannel(historyChannel)
  }
})

const formatTime = (dateStr) => {
  if (!dateStr) return '...'
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

const deleteItem = async (id) => {
  if (confirm('Bạn có muốn xóa truyện này khỏi lịch sử không?')) {
    const { error } = await supabase.from('reading_history').delete().eq('id', id)

    if (!error) {
      // Xóa thành công trên DB thì xóa luôn trong Store để UI mất ngay lập tức
      mangaStore.readingHistory = mangaStore.readingHistory.filter((item) => item.id !== id)
    } else {
      alert('Không thể xóa lịch sử, vui lòng thử lại!')
    }
  }
}
</script>

<style scoped>
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
