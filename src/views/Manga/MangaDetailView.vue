<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'
import MangaInfo from '@/components/MangaDetail/MangaInfo.vue'
import ChapterList from '@/components/MangaDetail/ChapterList.vue'

const route = useRoute()
const manga = ref(null)
const loading = ref(true)

const fetchMangaDetail = async () => {
  loading.value = true
  const slug = route.params.slug
  // const isLocalParam = route.query.isLocal === 'true'

  try {
    // 1. Thử fetch Supabase trước (vì slug local là duy nhất)
    const { data: localData, error: localErr } = await supabase
      .from('mangas')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (!localErr && localData) {
      // Nếu tìm thấy trong Supabase -> Đây là truyện nội bộ
      manga.value = {
        ...localData,
        name: localData.title,
        thumb_url: localData.thumbnail_url,
        isLocal: true,
        chapters: [],
      }
    } else {
      // 2. Nếu không có trong Supabase -> Fetch Otruyen
      try {
        const res = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)
        manga.value = res.data.data.item
      } catch (err) {
        console.error('Không tìm thấy truyện ở cả nguồn Local và API', err)
      }
    }
  } catch (err) {
    console.error('Lỗi load truyện:', err)
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
