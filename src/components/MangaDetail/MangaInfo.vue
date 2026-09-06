<template>
  <div
    class="flex flex-col md:flex-row gap-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700/60 mt-[20px] transition-colors"
  >
    <div class="w-full md:w-1/3 lg:w-1/4 shrink-0">
      <div
        class="overflow-hidden rounded-2xl shadow-2xl shadow-indigo-500/20 dark:shadow-black/50 relative group"
      >
        <img
          :src="`${imageResources}${manga.thumb_url}`"
          class="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>
      </div>

      <div class="flex flex-col gap-3 mt-6">
        <button
          @click="mangaStore.toggleFollow(manga)"
          :class="[
            'w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border-2',
            mangaStore.isFollowed
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
              : 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 shadow-lg shadow-indigo-100 dark:shadow-none',
          ]"
        >
          <svg
            class="w-5 h-5"
            :fill="mangaStore.isFollowed ? 'currentColor' : 'none'"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
          {{ mangaStore.isFollowed ? 'Đã Theo Dõi' : 'Theo Dõi Truyện' }}
        </button>

        <button
          v-if="mangaStore.lastReadChapter"
          @click="continueReading"
          class="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Đọc tiếp Chương {{ mangaStore.lastReadChapter.last_chapter_name }}
        </button>

        <button
          @click="startReading"
          class="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            ></path>
          </svg>
          Đọc từ đầu
        </button>
      </div>
    </div>

    <div class="flex-1">
      <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
        {{ manga.name }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mb-6 text-sm font-medium">
        {{ manga.origin_name?.[0] }}
      </p>

      <div class="flex flex-wrap gap-4 mb-8 text-sm">
        <div
          class="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20"
        >
          <svg
            class="w-5 h-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-gray-700 dark:text-gray-300 font-bold">{{
            manga.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'
          }}</span>
        </div>
        <div
          class="flex items-center gap-2 bg-purple-50 dark:bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-100 dark:border-purple-500/20"
        >
          <svg
            class="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            ></path>
          </svg>
          <span class="text-gray-700 dark:text-gray-300 font-bold">{{
            manga.view?.toLocaleString() || 0
          }}</span>
        </div>
      </div>

      <div class="mb-8">
        <h3
          class="font-bold text-gray-400 dark:text-slate-500 text-xs mb-3 uppercase tracking-widest"
        >
          Thể loại nổi bật
        </h3>
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="cat in manga.category"
            :key="cat.id"
            @click="goToCategory(cat)"
            class="px-3.5 py-1.5 bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-xs rounded-lg font-bold border border-gray-200 dark:border-slate-600 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:border-indigo-500/50 transition-all"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div>
        <h3
          class="font-bold text-gray-400 dark:text-slate-500 text-xs mb-3 uppercase tracking-widest"
        >
          Nội dung tóm tắt
        </h3>
        <div
          class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm overflow-y-auto max-h-56 p-5 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-inner custom-scrollbar text-justify"
          v-html="manga.content"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMangaStore } from '../../stores/manga'
import { useRouter } from 'vue-router'

const props = defineProps({
  manga: Object,
  imageResources: String,
})
const mangaStore = useMangaStore()
const router = useRouter()

const goToCategory = (cat) => {
  router.push({ path: '/search', query: { category: cat.slug } })
}

const getChapterNumber = (chapter) => Number.parseFloat(chapter.chapter_name)

const getFirstChapter = (serverData) => {
  return [...serverData].sort((a, b) => {
    const chapterA = getChapterNumber(a)
    const chapterB = getChapterNumber(b)

    if (Number.isNaN(chapterA) && Number.isNaN(chapterB)) return 0
    if (Number.isNaN(chapterA)) return 1
    if (Number.isNaN(chapterB)) return -1

    return chapterA - chapterB
  })[0]
}

/**
 * HÀM ĐỌC TỪ ĐẦU
 */
const startReading = () => {
  if (!props.manga.chapters || props.manga.chapters.length === 0) {
    alert('Truyện chưa có chương để đọc!')
    return
  }

  const serverData = props.manga.chapters[0].server_data
  const firstChapter = getFirstChapter(serverData)

  if (!firstChapter) {
    alert('Truyện chưa có chương để đọc!')
    return
  }

  const apiLink = firstChapter.chapter_api_data
  const isLocalManga = !apiLink

  if (isLocalManga) {
    router.push({
      name: 'ReadManga',
      params: { slug: props.manga.slug, chapter: String(firstChapter.chapter_name) },
      query: { isLocal: 'true' },
    })
  } else {
    router.push({
      name: 'ReadManga',
      params: { slug: props.manga.slug, chapter: String(firstChapter.chapter_name) },
      query: { api: apiLink },
    })
  }
}

/**
 * HÀM ĐỌC TIẾP
 */
const continueReading = () => {
  const history = mangaStore.lastReadChapter
  if (!history) return

  // 🔥 ĐÃ FIX: Dùng thông tin truyện HIỆN TẠI (props.manga) để xác định loại truyện
  // Thay vì dùng lịch sử đọc (có thể bị thiếu dữ liệu do bản code cũ)
  const serverData = props.manga.chapters[0].server_data
  const sampleChapter = serverData[0]
  const isLocalManga = !sampleChapter.chapter_api_data

  if (isLocalManga) {
    // ĐỌC TIẾP TRUYỆN LOCAL
    router.push({
      name: 'ReadManga',
      params: { slug: props.manga.slug, chapter: String(history.last_chapter_name) },
      query: { isLocal: 'true' },
    })
  } else {
    // ĐỌC TIẾP TRUYỆN OTRUYEN
    const targetChapter = serverData.find(
      (c) => String(c.chapter_name) === String(history.last_chapter_name),
    )

    // Dò lại link API mới nhất, nếu không thấy thì xài link cũ trong lịch sử
    const correctApiLink = targetChapter ? targetChapter.chapter_api_data : history.chapter_api_data

    router.push({
      name: 'ReadManga',
      params: { slug: props.manga.slug, chapter: String(history.last_chapter_name) },
      query: { api: correctApiLink },
    })
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
