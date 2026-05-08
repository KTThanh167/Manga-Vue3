<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useMangaStore } from '@/stores/manga'
import { supabase } from '@/lib/supabaseClient'

const mangaStore = useMangaStore()
let historyChannel = null

onMounted(async () => {
  await mangaStore.fetchReadingHistory()

  historyChannel = supabase
    .channel('history-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reading_history' }, () => {
      mangaStore.fetchReadingHistory()
    })
    .subscribe()
})

onUnmounted(() => {
  if (historyChannel) supabase.removeChannel(historyChannel)
})

const formatTime = (dateStr) => {
  if (!dateStr) return '...'
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const deleteItem = async (id, name) => {
  if (confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi lịch sử đọc không?`)) {
    const { error } = await supabase.from('reading_history').delete().eq('id', id)
    if (!error) {
      mangaStore.readingHistory = mangaStore.readingHistory.filter((item) => item.id !== id)
    } else {
      alert('Không thể xóa lịch sử, vui lòng thử lại!')
    }
  }
}
</script>

<template>
  <div
    class="max-w-6xl mx-auto p-4 md:p-8 min-h-[calc(100vh-150px)] animate-in fade-in duration-500 relative"
  >
    <div
      class="absolute top-1/4 left-0 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"
    ></div>

    <div class="mb-8">
      <router-link
        to="/"
        class="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm w-fit"
      >
        <div
          class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </div>
        <span class="text-sm font-bold uppercase tracking-widest">Trở về</span>
      </router-link>
    </div>

    <div
      class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl"
    >
      <div class="text-center md:text-left">
        <h1
          class="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center justify-center md:justify-start gap-3"
        >
          <span class="text-emerald-500 text-4xl">⏱️</span> Lịch sử đọc
        </h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium mt-2">
          Bạn đã lướt qua
          <span class="text-indigo-600 dark:text-indigo-400 font-black text-lg mx-1">{{
            mangaStore.readingHistory.length
          }}</span>
          bộ truyện
        </p>
      </div>
    </div>

    <div
      v-if="mangaStore.readingHistory.length === 0"
      class="text-center py-24 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-[40px] border-2 border-dashed border-gray-200 dark:border-slate-700 transition-colors duration-300"
    >
      <div class="text-7xl mb-6 grayscale opacity-80 drop-shadow-sm">🕸️</div>
      <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-3">Lịch sử trống trải</h3>
      <p
        class="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-8 font-medium leading-relaxed"
      >
        Có vẻ như bạn chưa đọc bộ truyện nào, hoặc bạn đang dùng một tài khoản mới tinh tươm.
      </p>
      <router-link
        to="/search"
        class="inline-block bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
      >
        TÌM TRUYỆN ĐỂ ĐỌC
      </router-link>
    </div>

    <TransitionGroup
      v-else
      name="grid"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      <div
        v-for="item in mangaStore.readingHistory"
        :key="item.id"
        class="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-700/80 rounded-3xl p-5 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
      >
        <router-link
          :to="`/truyen/${item.manga_slug}`"
          class="absolute inset-0 z-0 rounded-3xl"
        ></router-link>

        <div class="flex justify-between items-start mb-4 relative z-10">
          <h3
            class="text-gray-900 dark:text-white font-black text-lg leading-tight line-clamp-2 pr-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
          >
            {{ item.manga_name }}
          </h3>
          <button
            @click.stop="deleteItem(item.id, item.manga_name)"
            class="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-xl transition-colors shrink-0"
            title="Xóa lịch sử"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-2 mb-4 relative z-10">
          <span class="relative flex h-2.5 w-2.5">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span
            class="text-sm font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/30"
          >
            Đang đọc: Chương {{ item.last_chapter_name || '?' }}
          </span>
        </div>

        <div
          v-if="item.category_list && item.category_list.length > 0"
          class="flex flex-wrap gap-1.5 mb-5 relative z-10"
        >
          <span
            v-for="cat in item.category_list"
            :key="cat"
            class="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-md border border-gray-200 dark:border-slate-700"
          >
            {{ cat }}
          </span>
        </div>

        <div
          class="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10"
        >
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            {{ formatTime(item.last_read_at) }}
          </div>
          <span
            class="text-[10px] uppercase font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >Tiếp tục đọc 👉</span
          >
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.grid-enter-active,
.grid-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.grid-leave-active {
  position: absolute;
}
</style>
