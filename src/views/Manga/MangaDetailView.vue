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
    // 1. Fetch chi tiết truyện (Local hoặc API)
    if (isLocal) {
      const { data, error } = await supabase
        .from('mangas')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw error
      if (data) {
        manga.value = {
          ...data,
          name: data.title,
          thumb_url: data.thumbnail_url,
          isLocal: true,
          chapters: [],
        }
      }
    } else {
      const res = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)
      manga.value = res.data.data.item
    }

    // --- ĐỒNG BỘ TRẠNG THÁI ---
    if (manga.value) {
      await mangaStore.checkFollowStatus(slug)
      await mangaStore.fetchLastRead(slug)
    }
    // ------------------------------------------
  } catch (err) {
    console.error('Lỗi load chi tiết:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMangaDetail)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl text-white">
    <div v-if="loading" class="text-center py-20">Đang tải...</div>
    <div v-else-if="manga">
      <MangaInfo
        :manga="manga"
        :imageResources="manga.isLocal ? '' : 'https://otruyenapi.com/uploads/comics/'"
      />
      <ChapterList :chapters="manga.chapters" :slug="manga.slug" />
    </div>
    <div v-else class="text-center py-20">Truyện không tồn tại.</div>
  </div>
</template>
