<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useMangaStore } from '@/stores/manga'
import { supabase } from '@/lib/supabaseClient'

// Import components
import MangaInfo from '@/components/MangaDetail/MangaInfo.vue'
import ChapterList from '@/components/MangaDetail/ChapterList.vue'

const route = useRoute()
const router = useRouter()
const mangaStore = useMangaStore()

const manga = ref(null)
const loading = ref(true)
const lastRead = ref(null)
const isLocal = route.query.isLocal === 'true' // Nhận biết từ query param
const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

// 1. Lấy chi tiết truyện
const fetchMangaDetail = async () => {
  const slug = route.params.slug
  const isLocal = route.query.isLocal === 'true' // Xác định nguồn dữ liệu

  // 1. Debug kiểm tra slug
  console.log('Slug đang lấy từ route là:', slug)
  console.log('Nguồn dữ liệu là (Local?):', isLocal)

  // 2. Chốt chặn slug bị lỗi
  if (!slug || slug === 'undefined' || slug === 'null') {
    console.error('Truyện không hợp lệ hoặc không tồn tại!')
    loading.value = false
    return
  }

  loading.value = true

  try {
    if (isLocal) {
      // --- XỬ LÝ TRUYỆN NỘI BỘ (SUPABASE) ---
      const { data, error } = await supabase
        .from('mangas')
        .select('*')
        .eq('slug', slug)
        .maybeSingle() // Dùng maybeSingle để tránh lỗi 406/PGRST116 khi không tìm thấy

      if (error) throw error
      if (!data) {
        console.warning('Không tìm thấy dữ liệu truyện trong hệ thống!')
        return
      }

      // Map dữ liệu từ DB về định dạng mà Component mong đợi
      manga.value = {
        ...data,
        name: data.title,
        content: data.description,
        description: data.description,
        thumb_url: data.thumbnail_url,
        // Nếu bạn chưa làm bảng chapters cho local thì tạm để mảng rỗng
        chapters: [],
      }
    } else {
      // --- XỬ LÝ TRUYỆN API (OTRUYEN) ---
      const [response] = await Promise.all([
        axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`),
        mangaStore.checkFollowStatus(slug),
        fetchLastRead(),
      ])

      if (response.data?.status === 'success') {
        manga.value = response.data.data.item
      } else {
        throw new Error('Không lấy được dữ liệu từ API')
      }
    }
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết truyện:', err)
    console.error('Có lỗi xảy ra khi tải truyện')
  } finally {
    loading.value = false
  }
}

// 2. Lịch sử đọc (Chỉ nên dùng cho API, local nếu muốn bạn có thể tự thêm bảng history riêng)
const fetchLastRead = async () => {
  if (isLocal) return // Tạm thời bỏ qua nếu là local
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
    if (data) lastRead.value = data
  } catch (err) {
    console.error(err)
  }
}

// 3. Logic đọc
const startReading = () => {
  if (isLocal) {
    // Bạn sẽ điều hướng sang trang Đọc truyện nội bộ sau này
    alert('Đang phát triển tính năng đọc truyện nội bộ')
  } else {
    const serverData = manga.value.chapters[0].server_data
    const firstChapter = serverData[serverData.length - 1]
    router.push({
      name: 'ReadManga',
      params: { slug: manga.value.slug, chapter: firstChapter.chapter_name },
      query: { api: firstChapter.chapter_api_data },
    })
  }
}

onMounted(() => {
  fetchMangaDetail()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div
        class="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
      ></div>
      <p class="mt-4 text-gray-400">Đang tải...</p>
    </div>

    <div v-else-if="manga">
      <MangaInfo :manga="manga" :imageResources="isLocal ? '' : IMAGE_RESOURCES" />

      <div class="flex gap-4 mt-8">
        <button
          @click="startReading"
          class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold"
        >
          {{ isLocal ? 'Đọc truyện' : 'Đọc từ đầu' }}
        </button>
      </div>

      <ChapterList :chapters="manga.chapters" :slug="manga.slug" />
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
