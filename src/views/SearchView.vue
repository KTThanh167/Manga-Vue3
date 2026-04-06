<script setup>
import { ref, watch } from 'vue'
import { useHomeStore } from '../stores/home'
import MangaCard from '@/components/Common/MangaCard.vue'

const homeStore = useHomeStore()
const keyword = ref('')
const selectedCategory = ref('')
const showSuggestions = ref(false)
let debounceTimer = null

// Danh sách thể loại phổ biến từ Otruyen
const categories = [
  { name: 'Hành động', slug: 'hanh-dong' },
  { name: 'Tình cảm', slug: 'ngon-tinh' },
  { name: 'Hài hước', slug: 'hai-huoc' },
  { name: 'Phiêu lưu', slug: 'phew-luu' },
  { name: 'Chuyển sinh', slug: 'chuyen-sinh' },
]

const startSearch = () => {
  if (keyword.value.trim()) {
    selectedCategory.value = ''
    homeStore.searchMangas(keyword.value)
  }
}

const selectCategory = (slug) => {
  selectedCategory.value = slug
  keyword.value = ''
  homeStore.filterByCategory(slug)
}

// Hàm xử lý gõ phím (Debounce)
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
  }, 300) // Đợi 300ms sau khi ngừng gõ mới gọi API
})

const selectSuggestion = (manga) => {
  keyword.value = manga.name
  showSuggestions.value = false
  homeStore.searchMangas(manga.name) // Thực hiện tìm kiếm chính thức
}
</script>

<template>
  <div class="p-6">
    <div class="bg-indigo-600 rounded-3xl p-8 mb-8 text-center shadow-xl shadow-indigo-100">
      <h2 class="text-white text-2xl font-black mb-4 uppercase tracking-tight">
        Tìm kiếm truyện hay
      </h2>

      <div class="max-w-2xl mx-auto relative group">
        <div class="flex gap-2">
          <input
            v-model="keyword"
            @keyup.enter="startSearch"
            @focus="showSuggestions = true"
            placeholder="Nhập tên truyện..."
            class="flex-1 px-6 py-3 rounded-2xl outline-none shadow-inner text-black font-semibold focus:ring-2 focus:ring-indigo-400 transition"
          />
          <button
            @click="startSearch"
            class="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition active:scale-95"
          >
            TÌM
          </button>
        </div>

        <div
          v-if="showSuggestions && homeStore.searchSuggestions?.length > 0"
          class="absolute z-50 w-full bg-white dark:bg-neutral-800 mt-2 rounded-2xl shadow-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden text-left"
        >
          <div
            v-for="manga in homeStore.searchSuggestions"
            :key="manga._id"
            @click="selectSuggestion(manga)"
            class="flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-neutral-700 cursor-pointer border-b border-gray-50 dark:border-neutral-700 last:border-none transition"
          >
            <img
              :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
              class="w-10 h-14 object-cover rounded-lg shadow-sm"
            />
            <div class="flex-1 overflow-hidden">
              <p class="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                {{ manga.name }}
              </p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="cat in manga.category.slice(0, 2)"
                  :key="cat.id"
                  class="text-[10px] bg-gray-100 dark:bg-neutral-600 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-300"
                >
                  {{ cat.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
        <span class="w-8 h-[1px] bg-gray-200 mr-2"></span>
        Lọc theo thể loại
      </h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.slug"
          @click="selectCategory(cat.slug)"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-90',
            selectedCategory === cat.slug
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : 'bg-white text-gray-600 border border-gray-100 hover:border-indigo-300 hover:text-indigo-600',
          ]"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div>
      <div
        v-if="homeStore.isSearching"
        class="flex flex-col justify-center items-center py-20 gap-4"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"
        ></div>
        <p class="text-gray-400 text-sm font-medium">Đang lục tìm kho truyện...</p>
      </div>

      <div v-else>
        <div
          v-if="homeStore.searchResults.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <MangaCard v-for="manga in homeStore.searchResults" :key="manga._id" :manga="manga" />
        </div>

        <div
          v-else
          class="text-center py-20 bg-gray-50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-neutral-800"
        >
          <p class="text-gray-400 font-medium">Không tìm thấy truyện nào phù hợp rồi...</p>
          <button
            @click="((keyword = ''), (homeStore.searchResults = []))"
            class="mt-4 text-indigo-600 font-bold text-sm hover:underline"
          >
            Xóa tìm kiếm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
