<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'
import { useMangaStore } from '@/stores/manga'

// Components
import ReaderHeader from '@/components/ReadManga/ReaderHeader.vue'
import MangaPages from '@/components/ReadManga/MangaPages.vue'
import ReaderFooter from '@/components/ReadManga/ReaderFooter.vue'

const route = useRoute()
const router = useRouter()
const mangaStore = useMangaStore()

const chapterData = ref(null)
const images = ref([])
const loading = ref(true)
const error = ref(null)

// ==============================
// 🔥 HELPER: CHUẨN HÓA DATA
// ==============================
const normalizeData = (data, isLocal, extra = {}) => {
  if (isLocal) {
    return {
      manga: {
        slug: route.params.slug,
        title: data.mangas?.title,
        category: data.mangas?.category_list || [],
      },
      chapter: {
        chapter_name: data.chapter_number,
        id: data.id,
      },
    }
  }

  return {
    manga: {
      slug: route.params.slug,
      name: data.item.comic_name,
      category: extra.category || [],
    },
    chapter: {
      chapter_name: data.item.chapter_name,
      chapter_api_data: route.query.api,
    },
  }
}

// ==============================
// 🚀 FETCH CHAPTER
// ==============================
const fetchChapterData = async () => {
  loading.value = true
  error.value = null

  const isLocal = route.query.isLocal === 'true'
  const slug = route.params.slug
  const chapterNum = route.params.chapter

  scrollToTop()

  try {
    if (isLocal) {
      // 1. Lấy manga id
      const { data: mangaData, error: mangaError } = await supabase
        .from('mangas')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (mangaError || !mangaData) throw new Error('Không tìm thấy dữ liệu truyện')

      // 2. Lấy chapter + pages
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
      if (!data) throw new Error('Chương này chưa có dữ liệu ảnh.')

      // 3. Gán UI data
      chapterData.value = {
        comic_name: data.mangas?.title || 'Truyện nội bộ',
        chapter_name: data.chapter_number,
      }

      // 4. Xử lý ảnh
      if (data.chapter_pages?.length) {
        const sorted = [...data.chapter_pages].sort((a, b) => a.page_order - b.page_order)
        images.value = sorted.map((p) => p.image_url)
      } else {
        images.value = []
      }

      // 🔥 Lưu lịch sử bằng STORE
      const { manga, chapter } = normalizeData(data, true)
      await mangaStore.recordReadingHistory(manga, chapter)
    } else {
      // ===== API OTRUYEN =====
      let apiUrl = route.query.api

      if (apiUrl && !apiUrl.startsWith('http')) {
        apiUrl = `https://otruyenapi.com${apiUrl}`
      }

      if (!apiUrl) {
        apiUrl = `https://otruyenapi.com/v1/api/chuong/${slug}-chuong-${chapterNum}`
      }

      // 🔥 GỌI SONG SONG 2 API
      const [chapterRes, detailRes] = await Promise.all([
        axios.get(apiUrl),
        axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`),
      ])

      if (chapterRes.data?.status === 'success') {
        const chapterDataApi = chapterRes.data.data
        const detailDataApi = detailRes.data.data

        // ===== UI DATA =====
        chapterData.value = chapterDataApi.item

        const domain = chapterDataApi.domain_cdn
        const path = chapterDataApi.item.chapter_path

        images.value = chapterDataApi.item.chapter_image.map(
          (img) => `${domain}/${path}/${img.image_file}`,
        )

        // 🔥 LẤY CATEGORY TỪ DETAIL API
        const categories = detailDataApi?.item?.category?.map((c) => c.name) || []

        // 🔥 SAVE HISTORY
        const { manga, chapter } = normalizeData(chapterDataApi, false, { category: categories })

        await mangaStore.recordReadingHistory(manga, chapter)
      }
    }
  } catch (err) {
    error.value = err.message || 'Chương này đang được cập nhật hoặc link đã thay đổi.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ==============================
// 🔄 CHUYỂN CHƯƠNG
// ==============================
const changeChapter = async (offset) => {
  const isLocal = route.query.isLocal === 'true'
  const currentNum = parseInt(route.params.chapter)
  const nextChapterNum = currentNum + offset

  if (nextChapterNum <= 0) return

  scrollToTop()

  try {
    loading.value = true

    if (isLocal) {
      const { data } = await supabase
        .from('chapters')
        .select('id')
        .eq('manga_slug', route.params.slug)
        .eq('chapter_number', nextChapterNum)
        .maybeSingle()

      if (data) {
        router.push({
          name: 'ReadManga',
          params: {
            slug: route.params.slug,
            chapter: nextChapterNum,
          },
          query: { isLocal: 'true' },
        })
      } else {
        alert(offset > 0 ? 'Chương mới nhất rồi!' : 'Chương đầu tiên rồi!')
      }
    } else {
      const listRes = await axios.get(
        `https://otruyenapi.com/v1/api/truyen-tranh/${route.params.slug}`,
      )

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
        alert('Chương chưa có trên API!')
      }
    }
  } catch (err) {
    console.error(err)
    alert('Lỗi khi chuyển chương')
  } finally {
    loading.value = false
  }
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(fetchChapterData)

watch(() => route.params.chapter, fetchChapterData)
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
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center py-40">
        <div class="animate-spin h-12 w-12 border-b-2 border-indigo-500 rounded-full"></div>
        <p class="mt-4 text-gray-500 text-sm">Đang tải truyện...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-40">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button
          @click="
            router.push({
              path: `/truyen/${route.params.slug}`,
              query: { isLocal: route.query.isLocal },
            })
          "
          class="bg-indigo-600 px-6 py-2 rounded-lg text-white"
        >
          Quay lại
        </button>
      </div>

      <!-- Content -->
      <div v-else>
        <MangaPages :images="images" />

        <ReaderFooter
          :currentChapter="route.params.chapter"
          @next="changeChapter(1)"
          @prev="changeChapter(-1)"
        />
      </div>
    </main>

    <!-- Scroll top -->
    <button @click="scrollToTop" class="fixed bottom-6 right-6 p-3 bg-white/10 rounded-full">
      ↑
    </button>
  </div>
</template>

<style scoped>
:deep(img) {
  width: 100%;
  display: block;
}
</style>
