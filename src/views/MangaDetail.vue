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
    const response = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)
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
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="manga">
      <MangaInfo :manga="manga" :imageResources="IMAGE_RESOURCES" />

      <ChapterList :chapters="manga.chapters" :slug="manga.slug" @readChapter="handleReadChapter" />
    </div>
  </div>
</template>
