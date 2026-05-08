<script setup>
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHomeStore } from '@/stores/home'
import MangaCard from '@/components/Common/MangaCard.vue'
import Pagination from '@/components/Home/PaginationSession.vue'

const homeStore = useHomeStore()
const route = useRoute()
const router = useRouter() // Thêm useRouter để xử lý chuyển trang

/**
 * Hàm load dữ liệu tập trung:
 * Lấy page từ URL và gọi API với slug 'hoan-thanh'
 */
const loadCompleted = async () => {
  const page = parseInt(route.query.page) || 1
  await homeStore.fetchListData('hoan-thanh', page)
}

/**
 * Hàm xử lý khi người dùng bấm qua trang mới ở Pagination
 */
const handlePageChange = (newPage) => {
  // Đẩy page mới lên URL, Watcher ở dưới sẽ tự động bắt được và load data
  router.push({ query: { ...route.query, page: newPage } })
}

/**
 * Theo dõi sự thay đổi của page trên thanh URL
 */
watch(
  () => route.query.page,
  async () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    await loadCompleted()
  },
)

onMounted(() => {
  loadCompleted()
})
</script>

<template>
  <div
    class="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-150px)] animate-in fade-in duration-500"
  >
    <div
      class="mb-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden transition-colors duration-300"
    >
      <div
        class="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div class="relative z-10 text-center md:text-left">
        <h1
          class="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center justify-center md:justify-start gap-3"
        >
          <span class="text-emerald-500 text-3xl md:text-4xl drop-shadow-sm animate-bounce-slow"
            >🏆</span
          >
          Truyện đã hoàn thành
        </h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium mt-2">
          Những bộ truyện xuất sắc đã đi đến hồi kết viên mãn
        </p>
      </div>

      <div
        class="relative z-10 shrink-0 hidden md:flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 rounded-2xl shadow-sm"
      >
        <span class="relative flex h-2.5 w-2.5 shrink-0">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span
          class="text-xs font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase"
        >
          Full Completed
        </span>
      </div>
    </div>

    <div
      v-if="homeStore.loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="animate-pulse bg-gray-200 dark:bg-slate-800/80 aspect-[2/3] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm"
      ></div>
    </div>

    <div v-else>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
      >
        <MangaCard
          v-for="manga in homeStore.mangas"
          :key="manga.id"
          :manga="manga"
          :image-resources="homeStore.IMAGE_RESOURCES"
        />
      </div>

      <div v-if="homeStore.mangas.length > 0" class="mt-14 mb-6 flex justify-center">
        <Pagination @change-page="handlePageChange" />
      </div>

      <div
        v-if="homeStore.mangas.length === 0"
        class="text-center py-20 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl border border-dashed border-gray-200 dark:border-slate-700"
      >
        <p class="text-gray-500 dark:text-gray-400 font-medium">
          Không tìm thấy bộ truyện hoàn thành nào.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}
@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
