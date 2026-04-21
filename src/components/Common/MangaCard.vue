<script setup>
import { computed, watch } from 'vue'
import { useHomeStore } from '../../stores/home'
import { useRouter } from 'vue-router'

const props = defineProps({
  manga: {
    type: Object,
    required: true,
  },
})

console.log('Card nhận được manga:', props.manga)

const homeStore = useHomeStore()
const router = useRouter()

// 1. Logic xử lý ảnh: Tách biệt nguồn ảnh API và Local (Supabase/Internal)
const imageUrl = computed(() => {
  if (props.manga.isLocal) {
    // Truyện nội bộ: dùng trực tiếp link hoặc fallback
    return props.manga.thumb_url || 'https://placehold.co/200x300?text=No+Image'
  }
  // Truyện API Otruyen: ghép domain base
  return props.manga.thumb_url
    ? `${homeStore.IMAGE_RESOURCES}${props.manga.thumb_url}`
    : 'https://placehold.co/200x300?text=No+Image'
})

// 2. Điều hướng an toàn: Đảm bảo truyền query isLocal đúng định dạng
const goToDetail = () => {
  if (!props.manga.slug) {
    console.error('CẢNH BÁO: Truyện này không có slug!', props.manga)
    return
  }

  router.push({
    path: `/truyen/${props.manga.slug}`,
    // Chuyển boolean thành string 'true'/'false' để tránh lỗi URL
    query: { isLocal: props.manga.isLocal ? 'true' : 'false' },
  })
}

// 3. Xử lý danh sách chương (Chỉ hiển thị cho truyện API)
const latestChapters = computed(() => {
  if (props.manga.isLocal) return []
  const list = props.manga.chaptersLatest || []

  if (list.length === 0) return []

  // Dùng toán tử 3 ngôi gán trực tiếp vào const, vừa sạch vừa hết warning
  const rawChapters =
    list[0].server_data && Array.isArray(list[0].server_data) ? list[0].server_data : list

  // Đảo ngược và cắt mảng
  return [...rawChapters].reverse().slice(0, 3)
})

const goToChapter = (chap) => {
  if (!chap) return
  const id = chap.chapter_api_data?.split('/').pop()
  const chapterApiUrl = `https://sv1.otruyencdn.com/v1/api/chapter/${id}`

  router.push({
    path: `/doc-truyen/${props.manga.slug}/${chap.chapter_name}`,
    query: { api: chapterApiUrl },
  })
}

// 4. Xử lý ảnh lỗi
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

watch(
  () => props.manga,
  (newVal) => {
    console.log('🔍 Data nhận được tại MangaCard:', newVal)
  },
  { immediate: true },
)
</script>

<template>
  <div
    @click="goToDetail"
    class="group bg-neutral-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer border border-neutral-800 flex flex-col h-full"
  >
    <div class="relative aspect-[3/4] overflow-hidden shrink-0">
      <img
        :src="imageUrl"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        @error="onImageError"
      />
    </div>

    <div class="p-3 flex flex-col flex-1">
      <h3 class="font-bold text-gray-100 text-[13px] line-clamp-2 mb-2 leading-tight h-8">
        {{ manga.name }}
      </h3>

      <hr class="border-neutral-800 mb-2" />

      <div v-if="!manga.isLocal" class="flex-1 flex flex-col space-y-1">
        <template v-if="latestChapters.length > 0">
          <div
            v-for="(chap, index) in latestChapters"
            :key="index"
            @click.stop="goToChapter(chap)"
            class="flex justify-between items-center p-1.5 rounded-lg hover:bg-neutral-800 group/item transition-colors cursor-pointer"
          >
            <span
              class="text-[11px] text-gray-400 group-hover/item:text-indigo-400 font-medium truncate"
            >
              Chương {{ chap.chapter_name }}
            </span>

            <span v-if="index === 0" class="text-[9px] text-gray-500 font-medium shrink-0 ml-2">
              {{ timeAgo(manga.updatedAt) }}
            </span>
          </div>
        </template>
        <p v-else class="text-[11px] text-gray-500 italic py-1 px-1.5">Đang cập nhật...</p>
      </div>

      <div v-else class="flex-1 flex items-center justify-center">
        <span
          class="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded-full border border-indigo-700"
        >
          Truyện User sáng tác
        </span>
      </div>
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

@keyframes blink-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  } /* Mờ dần */
  100% {
    opacity: 1;
  }
}

.blink-badge {
  animation: blink-animation 1.5s infinite;
}
</style>
