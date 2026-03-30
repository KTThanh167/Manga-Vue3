<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'
import GlobalChat from '../components/GlobalChat.vue'

// --- TRẠNG THÁI DỮ LIỆU ---
const mangas = ref([])
const recommendedList = ref([])
const topCategory = ref(null)
const loading = ref(true)
const error = ref(null)

const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

// --- LOGIC AI GỢI Ý (NẰM TRONG COMPONENT LUÔN ĐỂ BẠN DỄ QUẢN LÝ) ---
const runAIRecommendation = (history, allMangas) => {
  if (!history || history.length === 0) return

  // 1. Đếm tần suất các thể loại trong lịch sử
  const categoryCounts = {}
  history.forEach((item) => {
    item.category_list?.forEach((catName) => {
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
    })
  })

  // 2. Tìm thể loại yêu thích nhất (Trọng số cao nhất)
  const favorite = Object.keys(categoryCounts).reduce(
    (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
    null,
  )

  if (favorite) {
    topCategory.value = favorite
    // 3. Lọc ra 4 truyện cùng thể loại đó từ danh sách mới
    recommendedList.value = allMangas
      .filter((m) => m.category?.some((c) => c.name === favorite))
      .slice(0, 4)
  }
}

// --- FETCH DỮ LIỆU TỔNG HỢP ---
const fetchHomeData = async () => {
  loading.value = true
  try {
    // Bước 1: Lấy truyện mới từ API
    const res = await axios.get('https://otruyenapi.com/v1/api/danh-sach/truyen-moi')
    if (res.data.status === 'success') {
      mangas.value = res.data.data.items
    }

    // Bước 2: Kiểm tra User và lấy lịch sử từ Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: history } = await supabase
        .from('reading_history')
        .select('category_list')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })
        .limit(20)

      // Bước 3: Chạy AI nếu có lịch sử
      runAIRecommendation(history, mangas.value)
    }
  } catch (err) {
    error.value = 'Hệ thống đang bận, vui lòng thử lại sau!'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchHomeData)
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div class="flex-1">
        <div
          v-if="recommendedList.length > 0"
          class="mb-12 p-6 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-3xl shadow-2xl shadow-indigo-200 text-white overflow-hidden relative"
        >
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div class="flex items-center mb-6 relative z-10">
            <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md mr-4">
              <span class="text-2xl">✨</span>
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight">DÀNH RIÊNG CHO BẠN</h2>
              <p class="text-xs text-indigo-100 opacity-90 italic">
                Dựa trên sở thích đọc thể loại
                <span class="font-bold underline text-white">{{ topCategory }}</span> của bạn
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div
              v-for="manga in recommendedList"
              :key="manga._id"
              @click="$router.push(`/truyen/${manga.slug}`)"
              class="group bg-white/10 backdrop-blur-md p-2 rounded-2xl hover:bg-white/25 cursor-pointer transition duration-300 border border-white/10 shadow-lg"
            >
              <div class="overflow-hidden rounded-xl aspect-[3/4] mb-2">
                <img
                  :src="`${IMAGE_RESOURCES}${manga.thumb_url}`"
                  class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <p class="text-[11px] font-bold line-clamp-1 text-center">{{ manga.name }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-black text-gray-900 flex items-center">
            <span
              class="w-1.5 h-8 bg-indigo-600 rounded-full mr-3 shadow-lg shadow-indigo-200"
            ></span>
            TRUYỆN MỚI CẬP NHẬT
          </h1>
          <button
            @click="fetchHomeData"
            class="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition"
          >
            Làm mới ↻
          </button>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-20">
          <div
            class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"
          ></div>
        </div>

        <div
          v-else-if="error"
          class="bg-red-50 text-red-500 p-4 rounded-xl text-center border border-red-100"
        >
          {{ error }}
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="manga in mangas"
            :key="manga._id"
            @click="$router.push(`/truyen/${manga.slug}`)"
            class="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
          >
            <div class="relative overflow-hidden aspect-[3/4]">
              <img
                :src="`${IMAGE_RESOURCES}${manga.thumb_url}`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div
                class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white font-bold uppercase"
              >
                HOT
              </div>
            </div>

            <div class="p-4">
              <h3
                class="font-bold text-gray-800 text-sm line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors"
              >
                {{ manga.name }}
              </h3>
              <p class="text-[10px] text-gray-400 mt-2 truncate italic">
                {{ manga.origin_name[0] || 'Đang cập nhật' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-80 shrink-0">
        <div class="sticky top-8">
          <GlobalChat />

          <div class="mt-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Hoạt động
            </h4>
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm text-gray-600">Tổng truyện:</span>
              <span class="text-sm font-bold text-indigo-600">{{ mangas.length }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Đang trực tuyến:</span>
              <span class="flex items-center text-sm font-bold text-green-500">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span> 36
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hiệu ứng chuyển cảnh mượt mà */
.group:hover img {
  filter: brightness(1.1);
}
</style>
