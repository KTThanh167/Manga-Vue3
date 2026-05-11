<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <div v-if="loading" class="animate-pulse flex flex-col md:flex-row gap-8 mt-[20px]">
        <div class="w-full md:w-1/3 lg:w-1/4 space-y-4">
          <div class="w-full aspect-[2/3] bg-gray-300 dark:bg-slate-800 rounded-2xl"></div>
          <div class="h-12 bg-gray-300 dark:bg-slate-800 rounded-xl"></div>
          <div class="h-12 bg-gray-300 dark:bg-slate-800 rounded-xl"></div>
        </div>
        <div class="flex-1 space-y-4 mt-4 md:mt-0">
          <div class="h-10 bg-gray-300 dark:bg-slate-800 rounded-lg w-3/4"></div>
          <div class="h-6 bg-gray-300 dark:bg-slate-800 rounded-lg w-1/4 mb-8"></div>
          <div class="flex gap-4">
            <div class="h-8 bg-gray-300 dark:bg-slate-800 rounded-lg w-32"></div>
            <div class="h-8 bg-gray-300 dark:bg-slate-800 rounded-lg w-32"></div>
          </div>
          <div class="flex gap-2 mt-6">
            <div
              class="h-8 bg-gray-300 dark:bg-slate-800 rounded-lg w-20"
              v-for="i in 4"
              :key="i"
            ></div>
          </div>
          <div class="h-40 bg-gray-300 dark:bg-slate-800 rounded-xl mt-6"></div>
        </div>
      </div>

      <div v-else-if="manga">
        <MangaInfo
          :manga="manga"
          :imageResources="manga.isLocal ? '' : 'https://otruyenapi.com/uploads/comics/'"
        />
        <ChapterList :chapters="manga.chapters" :slug="manga.slug" />
      </div>

      <div v-else class="flex flex-col items-center justify-center py-32">
        <div class="text-6xl mb-4">🕵️‍♂️</div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Không tìm thấy truyện</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          Truyện này có thể đã bị xóa hoặc không tồn tại.
        </p>
        <router-link
          to="/"
          class="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          Quay về Trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'
import MangaInfo from '@/components/MangaDetail/MangaInfo.vue'
import ChapterList from '@/components/MangaDetail/ChapterList.vue'
import { useMangaStore } from '@/stores/manga'

const route = useRoute()
const manga = ref(null)
const loading = ref(true)
const mangaStore = useMangaStore()

const fetchMangaDetail = async () => {
  loading.value = true
  const slug = route.params.slug
  const isLocal = route.query.isLocal === 'true'

  try {
    if (isLocal) {
      const { data: mangaData, error: mangaError } = await supabase
        .from('mangas')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (mangaError) throw mangaError
      if (mangaData) {
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('manga_id', mangaData.id)
          .order('chapter_number', { ascending: false })
        if (chaptersError) console.error('Lỗi lấy chương:', chaptersError)
        manga.value = {
          ...mangaData,
          name: mangaData.title,
          content: mangaData.description || 'Chưa có mô tả.',
          thumb_url: mangaData.thumbnail_url,
          isLocal: true,
          chapters: [
            {
              server_name: 'Nội bộ',
              server_data: chaptersData
                ? chaptersData.map((c) => ({
                    chapter_name: c.chapter_number.toString(),
                    chapter_title: c.title || '',
                    chapter_api_data: '',
                    isLocal: true,
                  }))
                : [],
            },
          ],
        }
      }
    } else {
      const res = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)
      manga.value = res.data.data.item
    }
    if (manga.value) {
      await Promise.all([mangaStore.checkFollowStatus(slug), mangaStore.fetchLastRead(slug)])
    }
  } catch (err) {
    console.error('Lỗi load chi tiết:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchMangaDetail()
  await mangaStore.checkFollowStatus(route.params.slug)
})
</script>
