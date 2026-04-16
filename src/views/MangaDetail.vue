<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useMangaStore } from '../stores/manga'
import { supabase } from '../lib/supabaseClient'

// Import components con
import MangaInfo from '../components/MangaDetail/MangaInfo.vue'
import ChapterList from '../components/MangaDetail/ChapterList.vue'

const route = useRoute()
const router = useRouter()
const mangaStore = useMangaStore()

const manga = ref(null)
const loading = ref(true)
const lastRead = ref(null) // Lưu trữ thông tin chương đọc dở
const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

// 1. Kiểm tra lịch sử đọc dở từ Supabase
const fetchLastRead = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('reading_history')
      .select('chapter_name, chapter_api_data')
      .eq('user_id', user.id)
      .eq('manga_slug', route.params.slug)
      .maybeSingle()

    if (data) {
      lastRead.value = data
      console.log('Đã tìm thấy lịch sử đọc:', data.chapter_name)
    }
  } catch (err) {
    console.error('Lỗi lấy lịch sử đọc:', err)
  }
}

// 2. Lấy chi tiết truyện từ API
const fetchMangaDetail = async () => {
  loading.value = true
  try {
    const slug = route.params.slug
    const [response] = await Promise.all([
      axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`),
      mangaStore.checkFollowStatus(slug),
      fetchLastRead(), // Chạy song song việc lấy lịch sử
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

// 3. Logic Đọc từ đầu (Lấy chương cuối cùng trong danh sách - thường là chương 1)
const startReadingFromStart = () => {
  if (!manga.value || !manga.value.chapters.length) return

  // O Truyện thường sắp xếp chương mới nhất lên đầu, nên chương 1 nằm ở cuối mảng
  const serverData = manga.value.chapters[0].server_data
  const firstChapter = serverData[serverData.length - 1]

  router.push({
    name: 'ReadManga',
    params: { slug: manga.value.slug, chapter: firstChapter.chapter_name },
    query: { api: firstChapter.chapter_api_data },
  })
}

// 4. Logic Đọc tiếp
const handleContinueReading = () => {
  if (lastRead.value) {
    router.push({
      name: 'ReadManga',
      params: {
        slug: route.params.slug,
        chapter: lastRead.value.chapter_name,
      },
      query: { api: lastRead.value.chapter_api_data },
    })
  }
}

const handleReadChapter = (chapter) => {
  if (!manga.value) return
  // Logic cũ để lưu vào store (nếu bạn vẫn dùng store song song)
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

onMounted(() => {
  fetchMangaDetail()
})
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

      <div class="flex flex-wrap gap-4 mt-8 mb-12">
        <button
          @click="startReadingFromStart"
          class="flex-1 sm:flex-none px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          Đọc từ đầu
        </button>

        <button
          v-if="lastRead"
          @click="handleContinueReading"
          class="flex-1 sm:flex-none px-10 py-4 bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-500/50 rounded-2xl font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd"
            />
          </svg>
          Đọc tiếp Chương {{ lastRead.chapter_name }}
        </button>
      </div>

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
