<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const manga = ref(null)
const loading = ref(true)
const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

// Hàm lưu lịch sử vào Supabase để phục vụ AI
const saveHistory = async (mangaData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return // Nếu chưa login thì không lưu

  const categories = mangaData.category.map((c) => c.name)

  const { error } = await supabase.from('reading_history').insert({
    user_id: user.id,
    manga_slug: mangaData.slug,
    manga_name: mangaData.name,
    category_list: categories, // Đây là dữ liệu quan trọng cho AI
    last_read_at: new Date(),
  })

  if (error) console.error('Lỗi lưu lịch sử:', error.message)
}

const fetchMangaDetail = async () => {
  loading.value = true // Đảm bảo bật loading khi bắt đầu
  try {
    const slug = route.params.slug
    const response = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)

    // Kiểm tra kỹ cấu trúc data của Otruyen
    if (response.data && response.data.status === 'success') {
      manga.value = response.data.data.item

      // Chỉ lưu lịch sử sau khi đã có dữ liệu manga
      if (manga.value) {
        saveHistory(manga.value)
      }
    }
  } catch (err) {
    console.error('Lỗi API chi tiết:', err)
  } finally {
    loading.value = false // Tắt loading dù thành công hay thất bại
  }
}

onMounted(() => {
  fetchMangaDetail()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="manga">
      <nav class="text-sm text-gray-500 mb-4">
        <router-link to="/" class="hover:text-indigo-600">Trang chủ</router-link> /
        <span>{{ manga.name }}</span>
      </nav>

      <div
        class="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div class="w-full md:w-1/3 lg:w-1/4">
          <img
            :src="`${IMAGE_RESOURCES}${manga.thumb_url}`"
            class="w-full rounded-xl shadow-lg shadow-indigo-100"
          />
        </div>

        <div class="flex-1">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ manga.name }}</h1>
          <p class="text-gray-500 mb-4 italic">{{ manga.origin_name[0] }}</p>

          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="cat in manga.category"
              :key="cat.id"
              class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium border border-indigo-100"
            >
              {{ cat.name }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span class="font-semibold">Tình trạng:</span> {{ manga.status }}</div>
            <div>
              <span class="font-semibold">Lượt xem:</span> {{ manga.view?.toLocaleString() || 0 }}
            </div>
          </div>

          <h2 class="font-bold text-lg mb-2">Nội dung tóm tắt</h2>
          <div
            class="text-gray-600 leading-relaxed text-sm overflow-y-auto max-h-40 p-3 bg-gray-50 rounded-lg"
            v-html="manga.content"
          ></div>
        </div>
      </div>

      <div class="mt-10">
        <h2 class="text-2xl font-bold mb-6 flex items-center text-white">
          <span class="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
          Danh sách chương
        </h2>

        <div v-for="(server, sIndex) in manga.chapters" :key="sIndex" class="mb-8">
          <h3 class="text-gray-400 text-sm mb-4 uppercase tracking-widest">
            Server: {{ server.server_name }}
          </h3>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div
              v-for="chapter in server.server_data"
              :key="chapter.chapter_name"
              class="bg-neutral-800 border border-gray-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-900/30 transition-all"
            >
              <router-link
                :to="{
                  path: `/doc-truyen/${manga.slug}/${chapter.chapter_name}`,
                  query: { api: chapter.chapter_api_data },
                }"
                class="block p-3 text-center"
              >
                <span class="text-gray-200 font-medium text-sm">
                  Chương {{ chapter.chapter_name }}
                </span>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="!manga.chapters || manga.chapters.length === 0" class="text-gray-500 italic">
          Dữ liệu chương đang được đồng bộ, vui lòng đợi trong giây lát...
        </div>
      </div>
    </div>
  </div>
</template>
