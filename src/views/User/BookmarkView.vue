<script setup>
import { useMangaStore } from '@/stores/manga'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const mangaStore = useMangaStore()
const router = useRouter()

// Xử lý link ảnh (Phòng trường hợp API trả về link tương đối hoặc tuyệt đối)
const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `https://otruyenapi.com/uploads/comics/${url}`
}

onMounted(async () => {
  await mangaStore.loadBookmarks()
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
        class="absolute -top-12 -right-12 w-40 h-40 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div class="relative z-10 text-center md:text-left">
        <h1
          class="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center justify-center md:justify-start gap-3"
        >
          <span class="text-red-500 animate-pulse drop-shadow-md">❤️</span> Truyện đang theo dõi
        </h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium mt-2">
          Bạn có
          <span class="text-indigo-600 dark:text-indigo-400 font-black text-lg mx-1">{{
            mangaStore.followedMangas.length
          }}</span>
          bộ truyện trong tủ sách
        </p>
      </div>

      <router-link
        to="/search"
        class="relative z-10 shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 active:scale-95 transition-all duration-300"
      >
        Tìm thêm truyện mới
      </router-link>
    </div>

    <div
      v-if="mangaStore.followedMangas.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    >
      <div
        v-for="manga in mangaStore.sortedFollowedMangas"
        :key="manga.slug"
        @click="router.push(`/truyen/${manga.slug}`)"
        class="group bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-2.5 rounded-2xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all duration-300 border border-gray-100 dark:border-slate-700/80 shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col"
      >
        <div class="relative overflow-hidden rounded-xl aspect-[3/4] shrink-0 bg-indigo-900/50">
          <img
            :src="getImageUrl(manga.thumb_url)"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            :alt="manga.name"
            loading="lazy"
          />

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70"
          ></div>

          <div
            v-if="manga.latest_chapter || (manga.chaptersLatest && manga.chaptersLatest.length > 0)"
            class="absolute bottom-2 right-2 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm shadow-lg z-10 border border-white/10"
          >
            Chương {{ manga.latest_chapter || manga.chaptersLatest[0]?.chapter_name }}
          </div>
        </div>

        <div class="flex-1 flex items-center justify-center mt-3 mb-1 px-1">
          <p
            class="text-[13px] font-bold line-clamp-2 text-center text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          >
            {{ manga.name || manga.title }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-24 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-[40px] border-2 border-dashed border-gray-200 dark:border-slate-700 mx-4 transition-colors duration-300"
    >
      <div class="text-7xl mb-6 grayscale opacity-80 drop-shadow-sm">🏜️</div>
      <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-3">Tủ sách đang trống</h3>
      <p
        class="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-8 font-medium leading-relaxed"
      >
        Đừng để danh sách này trống trải, hãy đi tìm những bộ Manga yêu thích để lấp đầy nó thôi
        nào!
      </p>
      <router-link
        to="/search"
        class="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-xl"
      >
        KHÁM PHÁ NGAY
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
