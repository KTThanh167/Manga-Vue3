<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useMangaStore } from '../stores/manga'

// Import components con
import MangaInfo from '../components/MangaDetail/MangaInfo.vue'
import ChapterList from '../components/MangaDetail/ChapterList.vue'

const route = useRoute()
const mangaStore = useMangaStore()
const manga = ref(null)
const loading = ref(true)
const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

const fetchMangaDetail = async () => {
  loading.value = true
  try {
    const slug = route.params.slug

    // Sử dụng Promise.all để chạy song song việc lấy dữ liệu truyện và check trạng thái theo dõi
    // Giúp trang load nhanh hơn
    const [response] = await Promise.all([
      axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`),
      mangaStore.checkFollowStatus(slug),
    ])

    if (response.data?.status === 'success') {
      manga.value = response.data.data.item
    }
  } catch (err) {
    console.error('Lỗi API chi tiết:', err)
  } finally {
    loading.value = false
  }
}

const handleReadChapter = (chapter) => {
  if (!manga.value) return
  mangaStore.recordReadingHistory(
    {
      title: manga.value.name,
      slug: manga.value.slug,
      categories: manga.value.category?.map((c) => c.name) || [],
    },
    {
      name: `Chương ${chapter.chapter_name}`,
      id: chapter.chapter_name,
    },
  )
}

onMounted(fetchMangaDetail)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 space-y-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
        <div class="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
      </div>
      <p class="text-gray-400 font-medium animate-pulse">Đang tải thông tin truyện...</p>
    </div>

    <div v-else-if="manga">
      <MangaInfo :manga="manga" :imageResources="IMAGE_RESOURCES" />

      <ChapterList :chapters="manga.chapters" :slug="manga.slug" @readChapter="handleReadChapter" />
    </div>

    <div v-else class="text-center py-20">
      <p class="text-gray-500">Không tìm thấy dữ liệu truyện này. Vui lòng thử lại sau!</p>
      <button @click="$router.push('/')" class="mt-4 text-indigo-600 font-bold hover:underline">
        Quay lại trang chủ
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
