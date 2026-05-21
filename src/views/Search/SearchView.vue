<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
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
const searchBannerRef = ref(null)
let debounceTimer = null

// --- LOGIC ĐỒNG BỘ URL ---
const updateURL = (params) => {
  router.push({
    path: route.path,
    query: { ...route.query, ...params },
  })
}

const shouldFocusSearchInput = (query = route.query) => query.focus === '1' || (!query.q && !query.category)

const focusSearchInput = async () => {
  await nextTick()
  setTimeout(() => {
    searchBannerRef.value?.focusInput()
  }, 50)
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

  if (shouldFocusSearchInput()) {
    focusSearchInput()
  }
})

// Theo dõi thay đổi URL (NƠI ĐẶT LOGIC SCROLL MỚI)
watch(
  () => route.query,
  async (newQuery) => {
    const qPage = parseInt(newQuery.page) || 1
    homeStore.currentPage = qPage

    // 1. CHỜ API TẢI DỮ LIỆU XONG
    if (newQuery.category) {
      selectedCategory.value = newQuery.category
      await homeStore.filterByCategory(newQuery.category, qPage)
    } else if (newQuery.q) {
      keyword.value = newQuery.q
      await homeStore.searchMangas(newQuery.q, qPage)
    }

    // 2. KHI TẢI XONG -> GIAO DIỆN DÀI RA -> BẮT ĐẦU CUỘN LÊN TOP
    nextTick(() => {
      setTimeout(() => {
        const topElement = document.getElementById('top-page')
        if (topElement) {
          topElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        } else {
          // Fallback dự phòng trong trường hợp ID bị xóa mất
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 50)
    })

    if (shouldFocusSearchInput(newQuery)) {
      focusSearchInput()
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
  updateURL({
    q: keyword.value,
    category: undefined,
    page: page > 1 ? page : undefined,
    focus: undefined,
  })
}

// Hành động chọn Thể loại (Có tính năng Bỏ chọn - Hủy lọc)
const handleSelectCategory = (slug) => {
  // Bấm vào thể loại đang chọn -> Hủy lọc
  if (selectedCategory.value === slug) {
    resetFilters()
    return
  }

  selectedCategory.value = slug
  keyword.value = ''
  showSuggestions.value = false
  // Reset về page 1 khi đổi thể loại
  updateURL({ category: slug, q: undefined, page: undefined, focus: undefined })
}

// Xử lý chuyển trang từ Pagination
const handlePageChange = (page) => {
  updateURL({ page })
}

const selectSuggestion = (manga) => {
  keyword.value = manga.name
  startSearch(1)
}

const resetFilters = () => {
  keyword.value = ''
  selectedCategory.value = ''
  updateURL({ q: undefined, category: undefined, page: undefined, focus: undefined })
}
</script>

<template>
  <div
    id="top-page"
    class="p-4 md:p-6 max-w-7xl mx-auto min-h-screen transition-colors duration-500"
  >
    <div class="mb-6 flex">
      <router-link
        to="/"
        class="inline-flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-full text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-slate-800 transition-all hover:shadow-md hover:-translate-x-1 group"
      >
        <div
          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </div>
        <span class="text-sm font-bold">Quay về trang chủ</span>
      </router-link>
    </div>

    <SearchBanner
      ref="searchBannerRef"
      class="relative z-50"
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

    <div class="min-h-[400px] relative">
      <div
        v-if="homeStore.isSearching"
        class="absolute inset-0 z-10 flex flex-col justify-center items-center py-32 gap-4 bg-gray-50/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-3xl"
      >
        <div class="relative w-16 h-16">
          <div
            class="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-800"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"
          ></div>
        </div>
        <p
          class="text-indigo-600 dark:text-indigo-400 animate-pulse font-black tracking-widest text-xs uppercase"
        >
          Đang quét dữ liệu...
        </p>
      </div>

      <div v-else>
        <div v-if="homeStore.searchResults?.length > 0">
          <div v-if="selectedCategory || keyword" class="mb-6 flex items-center gap-3">
            <span class="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
            <h3 class="text-lg font-black text-gray-900 dark:text-white">
              <template v-if="selectedCategory"
                >Truyện thể loại:
                <span class="text-indigo-600 dark:text-indigo-400 capitalize">{{
                  selectedCategory.replace(/-/g, ' ')
                }}</span></template
              >
              <template v-else
                >Kết quả cho:
                <span class="text-indigo-600 dark:text-indigo-400">"{{ keyword }}"</span></template
              >
            </h3>
          </div>

          <TransitionGroup
            name="list-fade"
            tag="div"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          >
            <MangaCard v-for="manga in homeStore.searchResults" :key="manga._id" :manga="manga" />
          </TransitionGroup>

          <div class="mt-16 mb-10 flex justify-center">
            <Pagination @change-page="handlePageChange" />
          </div>
        </div>

        <div
          v-else-if="keyword || selectedCategory"
          class="text-center py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-700 shadow-sm"
        >
          <div class="text-7xl mb-6 grayscale opacity-80">🏜️</div>
          <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-3">
            Không tìm thấy truyện phù hợp
          </h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
            Thử đổi từ khóa tìm kiếm hoặc chọn một thể loại khác xem sao!
          </p>
          <button
            @click="resetFilters"
            class="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-xl"
          >
            Làm mới bộ lọc
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hiệu ứng di chuyển mượt mà khi đổi vị trí xếp hạng */
.list-fade-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hiệu ứng khi truyện mới xuất hiện hoặc biến mất */
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.list-fade-leave-active {
  position: absolute;
  visibility: hidden;
}
</style>
