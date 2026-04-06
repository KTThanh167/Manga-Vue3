<script setup>
import { ref, watch, onMounted } from 'vue'
import { useHomeStore } from '../stores/home'
import { useRoute, useRouter } from 'vue-router'
import MangaCard from '../components/Common/MangaCard.vue'
import Pagination from '@/components/Home/PaginationSession.vue'

const homeStore = useHomeStore()
const route = useRoute()
const router = useRouter()

const keyword = ref('')
const selectedCategory = ref('')
const showSuggestions = ref(false)
let debounceTimer = null

const categories = [
  { name: 'Hành động', slug: 'action' },
  { name: 'Phiêu lưu', slug: 'adventure' },
  { name: 'Hài hước', slug: 'comedy' },
  { name: 'Chuyển sinh', slug: 'chuyen-sinh' },
  { name: 'Cổ đại', slug: 'co-dai' },
  { name: 'Xuyên không', slug: 'xuyen-khong' },
  { name: 'Ngôn tình', slug: 'ngon-tinh' },
  { name: 'Trọng sinh', slug: 'trong-sinh' },
  { name: 'Manhua', slug: 'manhua' },
  { name: 'Manhwa', slug: 'manhwa' },
]

// --- LOGIC ĐỒNG BỘ URL ---

// Hàm cập nhật URL mà không làm load lại trang
const updateURL = (params) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      ...params,
    },
  })
}

// 1. Khi load trang (F5), lấy dữ liệu từ URL để search
onMounted(async () => {
  const qKeyword = route.query.q
  const qCategory = route.query.category
  const qPage = parseInt(route.query.page) || 1

  // Gán ngay lập tức vào store để Pagination nhận diện được page hiện tại
  homeStore.currentPage = qPage

  if (qCategory) {
    selectedCategory.value = qCategory
    await homeStore.filterByCategory(qCategory, qPage)
  } else if (qKeyword) {
    keyword.value = qKeyword
    await homeStore.searchMangas(qKeyword, qPage)
  }
})

watch(
  () => route.query,
  async (newQuery) => {
    const qKeyword = newQuery.q
    const qCategory = newQuery.category
    const qPage = parseInt(newQuery.page) || 1

    homeStore.currentPage = qPage

    if (qCategory) {
      selectedCategory.value = qCategory
      await homeStore.filterByCategory(qCategory, qPage)
    } else if (qKeyword) {
      keyword.value = qKeyword
      await homeStore.searchMangas(qKeyword, qPage)
    }
  },
)

// 2. Gợi ý nhanh khi nhập từ khóa (debounce 300ms)
watch(keyword, (newVal) => {
  clearTimeout(debounceTimer)
  if (!newVal.trim()) {
    homeStore.searchSuggestions = []
    showSuggestions.value = false
    return
  }
  debounceTimer = setTimeout(() => {
    homeStore.getSuggestions(newVal)
    showSuggestions.value = true
  }, 300)
})

// 3. Thực hiện tìm kiếm theo Tên
const startSearch = (page = 1) => {
  if (!keyword.value.trim()) return
  selectedCategory.value = ''
  showSuggestions.value = false

  // Cập nhật URL: ?q=ten-truyen&page=1 (xóa category)
  updateURL({ q: keyword.value, category: undefined, page: page > 1 ? page : undefined })
  homeStore.searchMangas(keyword.value, page)
}

// 4. Lọc theo Thể loại
const selectCategory = (slug, page = 1) => {
  selectedCategory.value = slug
  keyword.value = ''
  showSuggestions.value = false

  // Cập nhật URL: ?category=slug&page=1 (xóa q)
  updateURL({ category: slug, q: undefined, page: page > 1 ? page : undefined })
  homeStore.filterByCategory(slug, page)
}

// 5. Xử lý chuyển trang
const handlePageChange = (page) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // Cập nhật page trên URL
  updateURL({ page: page })

  if (selectedCategory.value) {
    homeStore.filterByCategory(selectedCategory.value, page)
  } else {
    homeStore.searchMangas(keyword.value, page)
  }
}

// Xử lý khi nhấn vào gợi ý
const selectSuggestion = (manga) => {
  keyword.value = manga.name
  startSearch(1)
}
</script>

<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto">
    <div
      class="bg-indigo-600 rounded-2xl md:rounded-3xl p-5 md:p-8 mb-6 md:mb-8 text-center shadow-xl shadow-indigo-100 relative overflow-hidden"
    >
      <div class="relative z-10">
        <h2 class="text-white text-xl md:text-2xl font-black mb-4 uppercase tracking-tight">
          Khám phá thế giới Manga
        </h2>

        <div class="max-w-2xl mx-auto relative">
          <div class="flex flex-col md:flex-row gap-3">
            <div class="relative flex-1">
              <input
                v-model="keyword"
                @keyup.enter="startSearch(1)"
                @focus="showSuggestions = true"
                placeholder="Nhập tên truyện..."
                class="w-full px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl outline-none shadow-inner text-black font-semibold focus:ring-4 focus:ring-indigo-300 transition text-sm md:text-base"
              />

              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 md:hidden">
                🔍
              </span>
            </div>

            <button
              @click="startSearch(1)"
              class="bg-black text-white px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <span class="text-sm md:text-base">TÌM KIẾM</span>
            </button>
          </div>

          <div
            v-if="showSuggestions && homeStore.searchSuggestions?.length > 0"
            class="absolute z-50 w-full bg-white mt-2 rounded-xl md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left max-h-[60vh] overflow-y-auto"
          >
            <div
              v-for="manga in homeStore.searchSuggestions"
              :key="manga._id"
              @click="selectSuggestion(manga)"
              class="flex items-center gap-3 p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-none transition"
            >
              <img
                :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
                class="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0"
              />
              <div class="flex-1 overflow-hidden">
                <p class="text-sm font-bold text-gray-800 truncate">{{ manga.name }}</p>
                <p class="text-[10px] text-gray-400 mt-1">
                  {{ manga.category[0]?.name }} • {{ manga.last_chapter }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="hidden sm:block absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50"
      ></div>
    </div>

    <div class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <span class="w-1 h-4 bg-indigo-600 rounded-full"></span>
        <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">
          Thể loại phổ biến
        </h4>
      </div>

      <div
        class="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
      >
        <button
          v-for="cat in categories"
          :key="cat.slug"
          @click="selectCategory(cat.slug, 1)"
          :class="[
            'px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all active:scale-90 whitespace-nowrap shadow-sm border',
            selectedCategory === cat.slug
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-400 hover:text-indigo-600',
          ]"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div>
      <div
        v-if="homeStore.isSearching"
        class="flex flex-col justify-center items-center py-24 gap-4"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"
        ></div>
        <p class="text-gray-400 animate-pulse font-medium">Đang tìm kiếm dữ liệu...</p>
      </div>

      <div v-else>
        <div v-if="homeStore.searchResults?.length > 0">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            <MangaCard v-for="manga in homeStore.searchResults" :key="manga._id" :manga="manga" />
          </div>

          <div class="mt-10 mb-10">
            <Pagination @change-page="handlePageChange" />
          </div>
        </div>

        <div
          v-else-if="keyword || selectedCategory"
          class="text-center py-16 md:py-20 bg-gray-50 rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-200 mx-2"
        >
          <div class="text-4xl md:text-5xl mb-4">🔍</div>
          <p class="text-gray-500 font-medium italic px-4 text-sm md:text-base">
            Không tìm thấy kết quả nào. Thử từ khóa khác xem sao!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ẩn thanh cuộn nhưng vẫn cho phép cuộn trên các trình duyệt */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
