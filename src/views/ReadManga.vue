<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// State quản lý dữ liệu
const chapterData = ref(null)
const images = ref([])
const loading = ref(true)
const error = ref(null)

// Hàm lấy dữ liệu chương từ API
const fetchChapterData = async () => {
  loading.value = true
  error.value = null
  window.scrollTo(0, 0)

  try {
    // 1. Lấy link từ query parameter mà trang Detail gửi sang
    let apiUrl = route.query.api

    // 2. Nếu link là đường dẫn tương đối (v1/api/chuong/...), hãy thêm domain vào
    if (apiUrl && !apiUrl.startsWith('http')) {
      apiUrl = `https://otruyenapi.com${apiUrl}`
    }

    // 3. Nếu lỡ tay vào thẳng link mà không có query, dùng dự phòng (bỏ sv1)
    if (!apiUrl) {
      apiUrl = `https://otruyenapi.com/v1/api/chuong/${route.params.slug}-chuong-${route.params.chapter}`
    }

    console.log('Đang gọi API tại:', apiUrl) // Kiểm tra xem link có đúng không

    const response = await axios.get(apiUrl)

    if (response.data && response.data.status === 'success') {
      const data = response.data.data
      chapterData.value = data.item

      const domain = data.domain_cdn
      const path = data.item.chapter_path
      images.value = data.item.chapter_image.map((img) => `${domain}/${path}/${img.image_file}`)
    }
  } catch (err) {
    error.value = 'Chương này đang được cập nhật hoặc link đã thay đổi.'
    console.error('Read Error:', err)
  } finally {
    loading.value = false
  }
}

// Chuyển chương
const changeChapter = async (offset) => {
  const nextChapterNum = parseInt(route.params.chapter) + offset

  if (nextChapterNum <= 0) return

  try {
    loading.value = true

    // Lấy danh sách chapter để tìm chapter kế tiếp
    const listResponse = await axios.get(
      `https://otruyenapi.com/v1/api/truyen-tranh/${route.params.slug}`,
      { params: { limit: 1000 } },
    )

    if (listResponse.data.status === 'success') {
      const chapters = listResponse.data.data.item.chapters[0].server_data

      // Tìm chapter kế tiếp (sử dụng chapter_name thay vì chapter_index)
      const nextChapter = chapters.find((ch) => parseInt(ch.chapter_name) === nextChapterNum)

      if (nextChapter?.chapter_api_data) {
        // Navigate kèm API link chính xác
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
    console.error('Error fetching next chapter:', err)
    alert('Không thể lấy dữ liệu chương tiếp theo')
  } finally {
    loading.value = false
  }
}

// Hàm cuộn lên đầu trang
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(fetchChapterData)

// Quan trọng: Theo dõi sự thay đổi của URL để tải lại dữ liệu khi đổi chương
watch(() => route.params.chapter, fetchChapterData)
</script>

<template>
  <div class="min-h-screen bg-neutral-900 text-gray-200">
    <header class="sticky top-0 z-49 bg-black/90 backdrop-blur-md border-b border-gray-800 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <button
          @click="router.push(`/truyen/${route.params.slug}`)"
          class="text-sm hover:text-indigo-400 flex items-center"
        >
          <span class="mr-2">❮</span> <span class="hidden md:inline">Quay lại</span>
        </button>

        <div class="text-center overflow-hidden px-2">
          <h1 class="font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-md">
            {{ chapterData?.comic_name || 'Đang tải...' }}
          </h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-widest">
            Chapter {{ route.params.chapter }}
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="changeChapter(-1)"
            class="p-2 bg-neutral-800 rounded hover:bg-neutral-700 disabled:opacity-30"
            :disabled="parseInt(route.params.chapter) <= 1"
          >
            ❮
          </button>
          <button @click="changeChapter(1)" class="p-2 bg-indigo-600 rounded hover:bg-indigo-500">
            ❯
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto py-4">
      <div v-if="loading" class="flex flex-col items-center justify-center py-40">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p class="mt-4 text-gray-500">Đang chuẩn bị trang truyện...</p>
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

      <div v-else class="flex flex-col">
        <div v-for="(src, index) in images" :key="index" class="relative group">
          <img
            :src="src"
            class="w-full h-auto block"
            loading="lazy"
            :alt="'Trang ' + (index + 1)"
          />
          <span
            class="absolute top-2 right-2 text-[10px] bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            {{ index + 1 }} / {{ images.length }}
          </span>
        </div>

        <div class="py-20 flex flex-col items-center gap-6">
          <p class="text-gray-500 italic">
            --- Bạn đã đọc hết chương {{ route.params.chapter }} ---
          </p>
          <button
            @click="changeChapter(1)"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-full shadow-xl shadow-indigo-900/20 transition-all transform hover:scale-105"
          >
            ĐỌC CHƯƠNG TIẾP THEO ❯
          </button>
        </div>
      </div>
    </main>

    <div class="fixed bottom-6 right-6 flex flex-col gap-3">
      <button
        @click="scrollToTop"
        class="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20"
      >
        ↑
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Loại bỏ khoảng trắng giữa các ảnh */
img {
  display: block;
  border: none;
  margin: 0;
}
</style>
