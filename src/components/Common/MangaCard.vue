<template>
  <div
    @click="goToDetail"
    class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 dark:border-slate-700/60 flex flex-col h-full"
  >
    <div class="relative aspect-[3/4] overflow-hidden shrink-0 bg-gray-200 dark:bg-slate-700">
      <img
        :src="imageUrl"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        loading="lazy"
        @error="onImageError"
        alt="Cover"
      />

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"
      ></div>

      <div
        class="absolute inset-0 bg-slate-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col overflow-hidden"
      >
        <div v-if="manga.content" class="flex flex-col h-full">
          <h4
            class="text-indigo-400 font-bold mb-2 text-xs uppercase tracking-wider border-b border-indigo-500/30 pb-1"
          >
            Tóm tắt
          </h4>
          <p class="text-xs text-gray-300 leading-relaxed line-clamp-6 text-justify">
            {{ stripHtml(manga.content) }}
          </p>
          <span class="mt-auto text-[11px] text-center text-indigo-300 font-bold animate-pulse"
            >👉 Nhấn để xem chi tiết</span
          >
        </div>

        <div v-else class="flex flex-col h-full justify-center space-y-4">
          <div v-if="manga.origin_name && manga.origin_name.length > 0">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold"
              >Tên khác / Tên gốc</span
            >
            <p class="text-[11px] text-indigo-300 font-medium line-clamp-2 mt-0.5">
              {{
                Array.isArray(manga.origin_name) ? manga.origin_name.join(', ') : manga.origin_name
              }}
            </p>
          </div>

          <div v-if="manga.category && manga.category.length > 0">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold"
              >Thể loại nổi bật</span
            >
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              <span
                v-for="(cat, idx) in manga.category.slice(0, 5)"
                :key="idx"
                class="text-[9px] font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-md"
              >
                {{ cat.name || cat }}
              </span>
            </div>
          </div>

          <span class="mt-auto text-[11px] text-center text-white font-bold animate-pulse"
            >👉 Xem thông tin truyện</span
          >
        </div>
      </div>

      <div
        v-if="!manga.isLocal && latestChapters.length > 0"
        class="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 shadow-sm z-10"
      >
        {{ timeAgo(manga.updatedAt) }}
      </div>
    </div>

    <div class="p-4 flex flex-col flex-1 relative z-10 bg-white dark:bg-slate-800">
      <h3
        class="font-bold text-gray-800 dark:text-gray-100 text-[14px] line-clamp-2 mb-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
      >
        {{ manga.name }}
      </h3>

      <div class="mt-auto">
        <div v-if="!manga.isLocal" class="flex flex-col space-y-1">
          <template v-if="latestChapters.length > 0">
            <div
              v-for="(chap, index) in latestChapters"
              :key="index"
              @click.stop="goToChapter(chap)"
              class="relative inline-flex items-center justify-between w-full bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 px-3 py-2.5 rounded-xl transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 group/item"
            >
              <span
                class="text-[12px] font-bold text-gray-600 dark:text-slate-300 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 truncate"
              >
                Chương {{ chap.chapter_name }}
              </span>

              <span class="relative flex h-2.5 w-2.5 shrink-0 ml-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
            </div>
          </template>

          <div v-else class="bg-gray-50 dark:bg-slate-700/30 rounded-xl px-3 py-2.5 text-center">
            <p class="text-[12px] text-gray-500 dark:text-gray-400 italic">Sắp ra mắt...</p>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col space-y-2 border-t border-gray-100 dark:border-slate-700/50 pt-2 mt-1"
        >
          <div class="flex items-center gap-1.5 px-1">
            <svg
              class="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              ></path>
            </svg>
            <span class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              Tác giả:
              <strong class="text-indigo-500 dark:text-indigo-400">{{
                manga.author || 'Đang cập nhật'
              }}</strong>
            </span>
          </div>

          <div
            v-if="latestChapters.length > 0"
            @click.stop="goToChapter(latestChapters[0])"
            class="relative inline-flex items-center justify-between w-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 hover:from-purple-500/20 hover:to-indigo-500/20 px-3 py-2 rounded-xl transition-all border border-indigo-100 dark:border-indigo-700/50 cursor-pointer group/item"
          >
            <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 truncate">
              Chương {{ latestChapters[0].chapter_number || latestChapters[0].chapter_name }}
            </span>

            <svg
              class="w-3.5 h-3.5 text-indigo-500 group-hover/item:translate-x-1 transition-transform shrink-0"
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

            <span
              class="absolute -top-2.5 -right-1.5 px-1.5 py-[2px] text-[7px] font-black tracking-widest uppercase text-white bg-gradient-to-r from-rose-500 to-red-500 rounded-full shadow-sm shadow-red-500/40 animate-pulse border border-white dark:border-slate-800"
            >
              NEW
            </span>
          </div>

          <div v-else class="text-center bg-gray-50 dark:bg-slate-700/30 rounded-xl px-3 py-2">
            <span class="text-[11px] text-gray-400 italic">Chưa có chương nào</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHomeStore } from '../../stores/home'
import { useRouter } from 'vue-router'

const props = defineProps({
  manga: {
    type: Object,
    required: true,
  },
})

const homeStore = useHomeStore()
const router = useRouter()

// Hàm loại bỏ các thẻ HTML rác từ API Otruyen (nếu có)
const stripHtml = (html) => {
  if (!html) return 'Đang cập nhật nội dung...'
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const imageUrl = computed(() => {
  if (props.manga.isLocal) {
    return props.manga.thumb_url || 'https://placehold.co/200x300?text=No+Image'
  }
  return props.manga.thumb_url
    ? `${homeStore.IMAGE_RESOURCES}${props.manga.thumb_url}`
    : 'https://placehold.co/200x300?text=No+Image'
})

const goToDetail = () => {
  if (!props.manga.slug) return
  router.push({
    path: `/truyen/${props.manga.slug}`,
    query: { isLocal: props.manga.isLocal ? 'true' : 'false' },
  })
}

const latestChapters = computed(() => {
  // Nếu là truyện sáng tác, lấy data từ props cha truyền xuống
  if (props.manga.isLocal) {
    if (props.manga.latest_chapter) return [props.manga.latest_chapter]
    if (props.manga.chapters && props.manga.chapters.length > 0) return [props.manga.chapters[0]]
    return []
  }

  // Logic cũ của API
  const list = props.manga.chaptersLatest || []
  if (list.length === 0) return []
  const rawChapters =
    list[0].server_data && Array.isArray(list[0].server_data) ? list[0].server_data : list
  return [...rawChapters].reverse().slice(0, 1)
})

const goToChapter = (chap) => {
  if (!chap) return

  // Logic chuyển trang cho truyện Sáng tác
  if (props.manga.isLocal) {
    router.push({
      path: `/doc-truyen/${props.manga.slug}/${chap.chapter_number || chap.chapter_name}`,
      query: { isLocal: 'true' },
    })
    return
  }

  // Logic chuyển trang cho truyện API
  const id = chap.chapter_api_data?.split('/').pop()
  const chapterApiUrl = `https://sv1.otruyencdn.com/v1/api/chapter/${id}`
  router.push({
    path: `/doc-truyen/${props.manga.slug}/${chap.chapter_name}`,
    query: { api: chapterApiUrl },
  })
}

const onImageError = (event) => {
  const fallback = 'https://placehold.co/200x300?text=No+Image'
  if (event.target.src === fallback) return
  event.target.src = fallback
}

const timeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const diff = Math.floor((new Date() - date) / 1000)

  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước'
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước'
  return Math.floor(diff / 86400) + ' ngày trước'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
