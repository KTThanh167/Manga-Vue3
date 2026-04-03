<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

// Import components
import ReaderHeader from '../components/ReadManga/ReaderHeader.vue'
import MangaPages from '../components/ReadManga/MangaPages.vue'
import ReaderFooter from '../components/ReadManga/ReaderFooter.vue'

const route = useRoute()
const router = useRouter()

const chapterData = ref(null)
const images = ref([])
const loading = ref(true)
const error = ref(null)

const fetchChapterData = async () => {
  loading.value = true
  error.value = null
  window.scrollTo(0, 0)

  try {
    let apiUrl = route.query.api
    if (apiUrl && !apiUrl.startsWith('http')) {
      apiUrl = `https://otruyenapi.com${apiUrl}`
    }
    if (!apiUrl) {
      apiUrl = `https://otruyenapi.com/v1/api/chuong/${route.params.slug}-chuong-${route.params.chapter}`
    }

    const response = await axios.get(apiUrl)
    if (response.data?.status === 'success') {
      const data = response.data.data
      chapterData.value = data.item
      const domain = data.domain_cdn
      const path = data.item.chapter_path
      images.value = data.item.chapter_image.map((img) => `${domain}/${path}/${img.image_file}`)
    }
  } catch (err) {
    error.value = 'Chương này đang được cập nhật hoặc link đã thay đổi.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const changeChapter = async (offset) => {
  const nextChapterNum = parseInt(route.params.chapter) + offset
  if (nextChapterNum <= 0) return

  try {
    loading.value = true
    const listRes = await axios.get(
      `https://otruyenapi.com/v1/api/truyen-tranh/${route.params.slug}`,
    )
    if (listRes.data.status === 'success') {
      const chapters = listRes.data.data.item.chapters[0].server_data
      const nextChapter = chapters.find((ch) => parseInt(ch.chapter_name) === nextChapterNum)

      if (nextChapter?.chapter_api_data) {
        router.push({
          name: 'ReadManga',
          params: { slug: route.params.slug, chapter: nextChapterNum },
          query: { api: nextChapter.chapter_api_data },
        })
      } else {
        alert('Chương tiếp theo chưa được cập nhật!')
      }
    }
  } catch (err) {
    alert('Không thể lấy dữ liệu chương tiếp theo')
    console.error(err)
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
      <div v-if="loading" class="flex flex-col items-center justify-center py-40">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p class="mt-4 text-gray-500 text-sm">Đang chuẩn bị trang truyện...</p>
      </div>

      <div v-else-if="error" class="text-center py-40 px-6">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button
          @click="router.push(`/truyen/${route.params.slug}`)"
          class="bg-indigo-600 px-6 py-2 rounded-lg text-white"
        >
          Về trang chi tiết
        </button>
      </div>

      <div v-else>
        <MangaPages :images="images" />
        <ReaderFooter :currentChapter="route.params.chapter" @next="changeChapter(1)" />
      </div>
    </main>

    <button
      @click="scrollToTop"
      class="fixed bottom-6 right-6 p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all border border-white/5 z-50 shadow-2xl"
    >
      ↑
    </button>
  </div>
</template>
