<script setup>
import { ref, watch, onMounted } from 'vue'
import { useHomeStore } from '@/stores/home'
import { useMangaStore } from '@/stores/manga'
import { useRoute, useRouter } from 'vue-router'

import MangaCard from '@/components/Common/MangaCard.vue'
import Pagination from '@/components/Home/PaginationSession.vue'
import SearchBanner from '@/components/Search/SearchBanner.vue'
import CategoryFilter from '@/components/Search/CategoryFilter.vue'

const homeStore = useHomeStore()
const mangaStore = useMangaStore()
const route = useRoute()
const router = useRouter()

const keyword = ref('')
const selectedCategory = ref('')
const showSuggestions = ref(false)
let debounceTimer = null

// --- LOGIC ĐỒNG BỘ URL ---
const updateURL = (params) => {
  router.push({
    path: route.path,
    query: { ...route.query, ...params },
  })
}

// Khởi tạo dữ liệu khi load trang
onMounted(async () => {
  const { q, category, page } = route.query
  const qPage = parseInt(page) || 1
  homeStore.currentPage = qPage

  if (category) {
    selectedCategory.value = category
    await homeStore.filterByCategory(category, qPage)
  } else if (q) {
    keyword.value = q
    await homeStore.searchMangas(q, qPage)
  }
})

// Theo dõi thay đổi URL
watch(
  () => route.query,
  async (newQuery) => {
    const qPage = parseInt(newQuery.page) || 1
    homeStore.currentPage = qPage

    if (newQuery.category) {
      selectedCategory.value = newQuery.category
      await homeStore.filterByCategory(newQuery.category, qPage)
    } else if (newQuery.q) {
      keyword.value = newQuery.q
      await homeStore.searchMangas(newQuery.q, qPage)
    }
  },
)

// Debounce tìm kiếm gợi ý
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

// Hành động Tìm kiếm
const startSearch = (page = 1) => {
  if (!keyword.value.trim()) return
  selectedCategory.value = ''
  showSuggestions.value = false
  updateURL({ q: keyword.value, category: undefined, page: page > 1 ? page : undefined })
  homeStore.searchMangas(keyword.value, page)
}

// Hành động chọn Thể loại
const handleSelectCategory = (slug) => {
  selectedCategory.value = slug
  keyword.value = ''
  showSuggestions.value = false
  // Reset về page 1 khi đổi thể loại
  updateURL({ category: slug, q: undefined, page: undefined })
  homeStore.filterByCategory(slug, 1)
}

// Xử lý chuyển trang từ Pagination
const handlePageChange = (page) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  updateURL({ page })
  if (selectedCategory.value) {
    homeStore.filterByCategory(selectedCategory.value, page)
  } else {
    homeStore.searchMangas(keyword.value, page)
  }
}

const selectSuggestion = (manga) => {
  keyword.value = manga.name
  startSearch(1)
}

const resetFilters = () => {
  keyword.value = ''
  selectedCategory.value = ''
  startSearch(1)
}
</script>

<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto">
    <div class="mb-4 flex">
      <router-link
        to="/"
        class="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
      >
        <div
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-indigo-100 transition-all"
        >
          <font-awesome-icon icon="fa-solid fa-house" />
        </div>
        <span class="text-sm font-bold">Quay về trang chủ</span>
      </router-link>
    </div>

    <SearchBanner
      v-model="keyword"
      :suggestions="homeStore.searchSuggestions"
      :showSuggestions="showSuggestions"
      :imageResources="homeStore.IMAGE_RESOURCES"
      @search="startSearch(1)"
      @selectSuggestion="selectSuggestion"
      @focus="showSuggestions = true"
    />

    <CategoryFilter
      :categories="mangaStore.categories"
      :selectedCategory="selectedCategory"
      @select="handleSelectCategory"
    />

    <div class="min-h-[400px]">
      <div
        v-if="homeStore.isSearching"
        class="flex flex-col justify-center items-center py-32 gap-4"
      >
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-indigo-50"></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"
          ></div>
        </div>
        <p class="text-gray-400 animate-pulse font-bold tracking-widest text-xs uppercase">
          Đang quét dữ liệu...
        </p>
      </div>

      <div v-else>
        <div v-if="homeStore.searchResults?.length > 0">
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          >
            <MangaCard v-for="manga in homeStore.searchResults" :key="manga._id" :manga="manga" />
          </div>

          <div class="mt-16 flex justify-center">
            <Pagination @change-page="handlePageChange" />
          </div>
        </div>

        <div
          v-else-if="keyword || selectedCategory"
          class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200"
        >
          <div class="text-6xl mb-6">🏜️</div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Không tìm thấy truyện phù hợp</h3>
          <p class="text-gray-500 text-sm italic mb-6">
            Thử đổi từ khóa hoặc chọn thể loại khác xem sao!
          </p>
          <button
            @click="resetFilters"
            class="text-indigo-600 font-bold hover:bg-indigo-50 px-6 py-2 rounded-full transition border border-indigo-100"
          >
            Làm mới bộ lọc
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
