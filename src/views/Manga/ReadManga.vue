<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500 relative overflow-hidden flex flex-col"
  >
    <div
      class="hidden dark:block absolute top-[10%] left-[10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"
    ></div>
    <div
      class="hidden dark:block absolute bottom-[10%] right-[10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"
    ></div>

    <div
      class="fixed top-[102px] left-0 right-0 z-50 shadow-sm dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800/60"
    >
      <ReaderHeader
        :comicName="chapterData?.comic_name"
        :currentChapter="route.params.chapter"
        :slug="route.params.slug"
        @changeChapter="changeChapter"
      />
    </div>

    <main class="flex-1 max-w-4xl w-full mx-auto py-6 px-4 sm:px-0 relative z-10">
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-40 min-h-[60vh] animate-fade-in-up"
      >
        <div
          class="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex flex-col items-center"
        >
          <div class="relative w-16 h-16 mb-6">
            <div
              class="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-700"
            ></div>
            <div
              class="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent animate-spin"
            ></div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Manga Real đang tải truyện...
          </h3>
          <p class="mt-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
            Chuẩn bị không gian đọc tốt nhất cho bạn
          </p>
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-32 animate-fade-in-up"
      >
        <div
          class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700/50 max-w-md text-center"
        >
          <div
            class="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-rose-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/30 transform rotate-3"
          >
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đã xảy ra lỗi</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-8 font-medium">{{ error }}</p>
          <button
            @click="
              router.push({
                path: `/truyen/${route.params.slug}`,
                query: { isLocal: route.query.isLocal },
              })
            "
            class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1 active:scale-95"
          >
            Quay Lại Trang Truyện
          </button>
        </div>
      </div>

      <div
        v-else
        class="bg-white dark:bg-slate-950 shadow-2xl dark:shadow-none sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800/60 animate-fade-in-up"
      >
        <MangaPages :images="images" />

        <div
          class="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/80 backdrop-blur-md"
        >
          <ReaderFooter
            :currentChapter="route.params.chapter"
            @next="changeChapter(1)"
            @prev="changeChapter(-1)"
          />
        </div>
      </div>
    </main>

    <button
      @click="scrollToTop"
      class="fixed bottom-28 right-8 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-2 group z-50"
      title="Lên đầu trang"
    >
      <svg
        class="w-6 h-6 group-hover:animate-bounce"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'
import { useMangaStore } from '@/stores/manga'
import { message } from 'ant-design-vue'

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

const normalizeData = (data, isLocal, extra = {}) => {
  if (isLocal) {
    return {
      manga: {
        slug: route.params.slug,
        title: data.mangas?.title,
        category: data.mangas?.category_list || [],
      },
      chapter: { chapter_name: data.chapter_number, id: data.id },
    }
  }
  return {
    manga: { slug: route.params.slug, name: data.item.comic_name, category: extra.category || [] },
    chapter: { chapter_name: data.item.chapter_name, chapter_api_data: route.query.api },
  }
}

const fetchChapterData = async () => {
  loading.value = true
  error.value = null
  const isLocal = route.query.isLocal === 'true'
  const slug = route.params.slug
  const chapterNum = route.params.chapter

  scrollToTop()

  try {
    if (isLocal) {
      const { data: mangaData, error: mangaError } = await supabase
        .from('mangas')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (mangaError || !mangaData) throw new Error('Không tìm thấy dữ liệu truyện')

      const { data, error: dbError } = await supabase
        .from('chapters')
        .select(`*, mangas (title), chapter_pages (image_url, page_order)`)
        .eq('manga_id', mangaData.id)
        .eq('chapter_number', chapterNum)
        .maybeSingle()
      if (dbError) throw dbError
      if (!data) throw new Error('Chương này chưa có dữ liệu ảnh.')

      chapterData.value = {
        comic_name: data.mangas?.title || 'Truyện nội bộ',
        chapter_name: data.chapter_number,
      }
      images.value = data.chapter_pages?.length
        ? [...data.chapter_pages]
            .sort((a, b) => a.page_order - b.page_order)
            .map((p) => p.image_url)
        : []
      const { manga, chapter } = normalizeData(data, true)
      await mangaStore.recordReadingHistory(manga, chapter)
    } else {
      let apiUrl = route.query.api
      if (apiUrl && !apiUrl.startsWith('http')) apiUrl = `https://otruyenapi.com${apiUrl}`
      if (!apiUrl) apiUrl = `https://otruyenapi.com/v1/api/chuong/${slug}-chuong-${chapterNum}`

      const [chapterRes, detailRes] = await Promise.all([
        axios.get(apiUrl),
        axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`),
      ])
      if (chapterRes.data?.status === 'success') {
        const chapterDataApi = chapterRes.data.data
        const detailDataApi = detailRes.data.data
        chapterData.value = chapterDataApi.item
        images.value = chapterDataApi.item.chapter_image.map(
          (img) =>
            `${chapterDataApi.domain_cdn}/${chapterDataApi.item.chapter_path}/${img.image_file}`,
        )
        const categories = detailDataApi?.item?.category?.map((c) => c.name) || []
        const { manga, chapter } = normalizeData(chapterDataApi, false, { category: categories })
        await mangaStore.recordReadingHistory(manga, chapter)
      }
    }
  } catch (err) {
    error.value = err.message || 'Chương này đang được cập nhật hoặc link đã thay đổi.'
  } finally {
    loading.value = false
  }
}

const changeChapter = async (offset) => {
  const isLocal = route.query.isLocal === 'true'
  const nextChapterNum = parseInt(route.params.chapter) + offset

  if (nextChapterNum <= 0) {
    message.info('Đây đã là chương đầu tiên của truyện!')
    return
  }

  scrollToTop()

  try {
    loading.value = true

    if (isLocal) {
      // 1. Tìm manga_id dựa trên slug đang có trên URL
      const { data: mangaData, error: mangaErr } = await supabase
        .from('mangas')
        .select('id')
        .eq('slug', route.params.slug)
        .single()

      if (mangaErr || !mangaData) {
        throw new Error('Không tìm thấy thông tin truyện trong cơ sở dữ liệu!')
      }

      // 2. Dùng manga_id để truy vấn chương tiếp theo/trước đó
      const { data: chapterData, error: chapterErr } = await supabase
        .from('chapters')
        .select('id')
        .eq('manga_id', mangaData.id) // Query chuẩn xác theo ID
        .eq('chapter_number', nextChapterNum)
        .maybeSingle()

      // Bắt lỗi rành mạch để dễ debug nếu có
      if (chapterErr) {
        console.error('Lỗi truy vấn Supabase:', chapterErr)
        throw chapterErr
      }

      // 3. Xử lý chuyển trang
      if (chapterData) {
        router.push({
          name: 'ReadManga',
          params: { slug: route.params.slug, chapter: nextChapterNum },
          query: { isLocal: 'true' },
        })
      } else {
        message.warning(offset > 0 ? 'Bạn đã đọc đến chương mới nhất!' : 'Đây là chương đầu tiên!')
      }
    } else {
      // Xử lý cho truyện API (Vẫn giữ nguyên, hoạt động tốt)
      const listRes = await axios.get(
        `https://otruyenapi.com/v1/api/truyen-tranh/${route.params.slug}`,
      )
      const nextChapter = listRes.data.data.item.chapters[0].server_data.find(
        (ch) => parseInt(ch.chapter_name) === nextChapterNum,
      )

      if (nextChapter?.chapter_api_data) {
        router.push({
          name: 'ReadManga',
          params: { slug: route.params.slug, chapter: nextChapterNum },
          query: { api: nextChapter.chapter_api_data },
        })
      } else {
        message.warning('Bạn đã đọc đến chương mới nhất!')
      }
    }
  } catch (err) {
    console.error('Lỗi chuyển chương:', err)
    message.error('Có lỗi xảy ra khi chuyển chương, vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(fetchChapterData)
watch(() => route.params.chapter, fetchChapterData)
</script>

<style scoped>
:deep(img) {
  width: 100%;
  display: block;
}

/* Animations */
@keyframes blob {
  0%,
  100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}
</style>
