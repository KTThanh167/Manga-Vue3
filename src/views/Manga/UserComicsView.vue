<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import MangaCard from '@/components/Common/MangaCard.vue'

const localMangas = ref([])
const loading = ref(true)

const fetchLocalMangas = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('mangas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Map dữ liệu từ DB (title, thumbnail_url) sang format mà MangaCard mong đợi
    localMangas.value = (data || []).map((item) => ({
      _id: item.id,
      name: item.title,
      slug: item.slug,
      thumb_url: item.thumbnail_url,
      content: item.description,
      isLocal: true,
    }))
  } catch (err) {
    console.error('Lỗi lấy truyện nội bộ:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLocalMangas)
</script>

<template>
  <div class="py-6">
    <div class="flex items-center gap-2 mb-6">
      <span class="text-2xl">✍️</span>
      <h2 class="text-xl font-black text-gray-800 uppercase italic">
        Truyện do người dùng đóng góp
      </h2>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <a-spin />
    </div>

    <div
      v-else-if="localMangas.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 pl-3"
    >
      <MangaCard v-for="manga in localMangas" :key="manga._id" :manga="manga" />
    </div>

    <div v-else class="text-center py-10 text-gray-500">
      Chưa có truyện nào do thành viên đăng tải.
    </div>
  </div>
</template>
