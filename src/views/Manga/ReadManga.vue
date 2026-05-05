<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

// Import components
import ReaderHeader from '@/components/ReadManga/ReaderHeader.vue'
import MangaPages from '@/components/ReadManga/MangaPages.vue'
import ReaderFooter from '@/components/ReadManga/ReaderFooter.vue'

const route = useRoute()
const router = useRouter()

const chapterData = ref(null)
const images = ref([])
const loading = ref(true)
const error = ref(null)

// --- LOGIC LƯU LỊCH SỬ ĐỌC ---
const saveReadingHistory = async (data) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error: upsertError } = await supabase.from('reading_history').upsert(
      {
        user_id: user.id,
        manga_slug: String(route.params.slug),
        manga_name: String(data.comic_name),
        chapter_name: String(data.chapter_name),

        chapter_api_data:
          route.query.api ||
          `https://otruyenapi.com/v1/api/chuong/${route.params.slug}-chuong-${route.params.chapter}`,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id, manga_slug',
      },
    )

    if (upsertError) {
      console.error('Lỗi lưu lịch sử chi tiết:', upsertError.message)
    }
  } catch (err) {
    console.error('Lỗi thực thi:', err)
  }
}

// --- LOGIC FETCH DỮ LIỆU CHƯƠNG ---
const fetchChapterData = async () => {
  loading.value = true
  error.value = null
  const isLocal = route.query.isLocal === 'true'
  const slug = route.params.slug
  const chapterNum = route.params.chapter
  scrollToTop()

  try {
    if (isLocal) {
      // BƯỚC 1: Lấy ID của truyện dựa trên slug từ bảng mangas
      const { data: mangaData, error: mangaError } = await supabase
        .from('mangas')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (mangaError || !mangaData) throw new Error('Không tìm thấy dữ liệu truyện')

      // BƯỚC 2: Truy vấn lồng để lấy Chapter và danh sách trang ảnh (chapter_pages)
      const { data, error: dbError } = await supabase
        .from('chapters')
        .select(
          `
          *,
          mangas (title),
          chapter_pages (image_url, page_order)
        `,
        )
        .eq('manga_id', mangaData.id)
        .eq('chapter_number', chapterNum)
        .maybeSingle()

      if (dbError) throw dbError
      if (!data) throw new Error('Chương này hiện chưa có dữ liệu ảnh.')

      // BƯỚC 3: Gán thông tin hiển thị
      chapterData.value = {
        comic_name: data.mangas?.title || 'Truyện nội bộ',
        chapter_name: data.chapter_number,
      }

      // BƯỚC 4: Xử lý danh sách ảnh từ bảng chapter_pages
      if (data.chapter_pages && data.chapter_pages.length > 0) {
        const sortedPages = [...data.chapter_pages].sort((a, b) => a.page_order - b.page_order)
        images.value = sortedPages.map((page) => page.image_url)
      } else {
        images.value = []
      }

      await saveReadingHistory(chapterData.value)
    } else {
      // --- LOGIC LẤY TRUYỆN OTRUYEN ---
      let apiUrl = route.query.api
      if (apiUrl && !apiUrl.startsWith('http')) {
        apiUrl = `https://otruyenapi.com${apiUrl}`
      }
      if (!apiUrl) {
        apiUrl = `https://otruyenapi.com/v1/api/chuong/${slug}-chuong-${chapterNum}`
      }

      const response = await axios.get(apiUrl)
      if (response.data?.status === 'success') {
        const data = response.data.data
        chapterData.value = data.item
        const domain = data.domain_cdn
        const path = data.item.chapter_path
        images.value = data.item.chapter_image.map((img) => `${domain}/${path}/${img.image_file}`)
        await saveReadingHistory(data.item)
      }
    }
  } catch (err) {
    error.value = err.message || 'Chương này đang được cập nhật hoặc link đã thay đổi.'
    console.error('Chi tiết lỗi:', err)
  } finally {
    loading.value = false
  }
}

// --- ĐIỀU HƯỚNG CHƯƠNG ---
const changeChapter = async (offset) => {
  const isLocal = route.query.isLocal === 'true'
  const currentNum = parseInt(route.params.chapter)
  const nextChapterNum = currentNum + offset
  scrollToTop()

  // Không cho phép số chương nhỏ hơn 1
  if (nextChapterNum <= 0) return

  try {
    loading.value = true

    if (isLocal) {
      // --- XỬ LÝ TRUYỆN NỘI BỘ (SUPABASE) ---
      const { data, error: dbError } = await supabase
        .from('chapters')
        .select('id, chapter_number')
        .eq('manga_slug', route.params.slug)
        .eq('chapter_number', nextChapterNum)
        .maybeSingle()

      if (dbError) throw dbError

      if (data) {
        // Chuyển trang và giữ lại query isLocal=true
        router.push({
          name: 'ReadManga',
          params: {
            slug: route.params.slug,
            chapter: nextChapterNum,
          },
          query: { isLocal: 'true' },
        })
      } else {
        alert(offset > 0 ? 'Bạn đã đọc đến chương mới nhất!' : 'Đây là chương đầu tiên!')
      }
    } else {
      // --- XỬ LÝ TRUYỆN OTRUYEN (API) ---
      const listRes = await axios.get(
        `https://otruyenapi.com/v1/api/truyen-tranh/${route.params.slug}`,
      )

      if (listRes.data.status === 'success') {
        // Lấy danh sách chương từ server đầu tiên
        const chapters = listRes.data.data.item.chapters[0].server_data
        const nextChapter = chapters.find((ch) => parseInt(ch.chapter_name) === nextChapterNum)

        if (nextChapter?.chapter_api_data) {
          router.push({
            name: 'ReadManga',
            params: {
              slug: route.params.slug,
              chapter: nextChapterNum,
            },
            query: { api: nextChapter.chapter_api_data },
          })
        } else {
          alert('Chương này chưa được cập nhật trên hệ thống API!')
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi chuyển chương:', err)
    alert('Có lỗi xảy ra khi tìm chương tiếp theo.')
  } finally {
    loading.value = false
  }
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(fetchChapterData)

// Watch sự thay đổi của chapter trên URL để fetch lại (khi nhấn Next/Prev)
watch(
  () => route.params.chapter,
  () => {
    fetchChapterData()
  },
)
</script>

<template>
  <div class="min-h-screen bg-neutral-900 text-gray-200">
    <ReaderHeader
      :comicName="chapterData?.comic_name"
      :currentChapter="route.params.chapter"
      :slug="route.params.slug"
      @changeChapter="changeChapter"
    />

    <main class="max-w-3xl mx-auto py-4">
      <div v-if="loading" class="flex flex-col items-center justify-center py-40">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p class="mt-4 text-gray-500 text-sm">Đang chuẩn bị trang truyện...</p>
      </div>

      <div v-else-if="error" class="text-center py-40 px-6">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button
          @click="
            router.push({
              path: `/truyen/${route.params.slug}`,
              query: { isLocal: route.query.isLocal },
            })
          "
          class="bg-indigo-600 px-6 py-2 rounded-lg text-white font-bold"
        >
          Về trang chi tiết
        </button>
      </div>

      <div v-else>
        <MangaPages :images="images" />
        <ReaderFooter
          :currentChapter="route.params.chapter"
          @next="changeChapter(1)"
          @prev="changeChapter(-1)"
        />
      </div>
    </main>

    <button
      @click="scrollToTop"
      class="fixed bottom-6 right-6 p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all border border-white/5 z-50 shadow-2xl"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
:deep(img) {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}
</style>
