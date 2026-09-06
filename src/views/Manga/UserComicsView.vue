<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import MangaCard from '@/components/Common/MangaCard.vue'

const localMangas = ref([])
const loading = ref(true)
const searchQuery = ref('')

const normalizeSearchText = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

const filteredLocalMangas = computed(() => {
  const keyword = normalizeSearchText(searchQuery.value)
  if (!keyword) return localMangas.value

  return localMangas.value.filter((manga) => normalizeSearchText(manga.name).includes(keyword))
})

const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0)

const fetchLocalMangas = async () => {
  loading.value = true
  try {
    // 1. CẬP NHẬT CÂU QUERY: Nối thêm bảng chapters để lấy chapter_number
    const { data, error } = await supabase
      .from('mangas')
      .select(
        `
        *,
        chapters (
          chapter_name,
          chapter_number
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    // 2. CẬP NHẬT MAP DỮ LIỆU: Thêm author và tìm latest_chapter
    localMangas.value = (data || []).map((item) => {
      // Sắp xếp các chương từ lớn đến bé để lấy chương to nhất (mới nhất)
      const sortedChapters =
        item.chapters && item.chapters.length > 0
          ? [...item.chapters].sort((a, b) => b.chapter_number - a.chapter_number)
          : []

      return {
        _id: item.id,
        name: item.title,
        slug: item.slug,
        thumb_url: item.thumbnail_url, // (Hoặc item.thubnail_url tùy theo tên cột chuẩn trong DB của bạn)
        content: item.description,
        isLocal: true,
        author: item.author, // Đã bổ sung Tác giả
        latest_chapter: sortedChapters[0], // Đã bổ sung Chương mới nhất
      }
    })
  } catch (err) {
    console.error('Lỗi lấy truyện nội bộ:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLocalMangas)
</script>

<template>
  <div
    class="py-8 md:py-12 container mx-auto px-4 min-h-[70vh] relative animate-in fade-in duration-500"
  >
    <div
      class="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"
    ></div>

    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-10 relative z-10">
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105"
        >
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            ></path>
          </svg>
        </div>
        <div>
          <h2
            class="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight mb-1"
          >
            Góc Sáng Tác
          </h2>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Những tác phẩm độc quyền do cộng đồng tự do đăng tải (Bạn muốn chia sẻ tác phẩm của
            mình? Hãy liên hệ với chúng tôi qua trang
            <router-link
              to="/contact"
              class="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
              >LIÊN HỆ</router-link
            >
            để được hỗ trợ đăng tải nhé!)
          </p>
        </div>
      </div>

      <div class="w-full lg:w-[360px] shrink-0">
        <label for="local-manga-search" class="sr-only">Tìm kiếm truyện sáng tác</label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            id="local-manga-search"
            v-model="searchQuery"
            type="search"
            autocomplete="off"
            placeholder="Tìm tên truyện sáng tác..."
            class="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-sm font-semibold text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none shadow-sm transition-all"
          />
          <button
            v-if="hasSearchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <p
          v-if="hasSearchQuery"
          class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400"
        >
          Tìm thấy {{ filteredLocalMangas.length }} truyện trong Góc Sáng Tác
        </p>
      </div>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 relative z-10"
    >
      <div v-for="i in 12" :key="i" class="flex flex-col gap-3 animate-pulse">
        <div class="aspect-[2/3] w-full bg-gray-200 dark:bg-slate-800 rounded-2xl shadow-sm"></div>
        <div class="space-y-2 px-1">
          <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-full"></div>
          <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-2/3"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="filteredLocalMangas.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 relative z-10"
    >
      <MangaCard v-for="manga in filteredLocalMangas" :key="manga._id" :manga="manga" />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center py-24 px-4 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-gray-100 dark:border-slate-800 backdrop-blur-md relative z-10 shadow-xl shadow-gray-200/20 dark:shadow-none"
    >
      <div class="w-24 h-24 mb-6 relative">
        <div
          class="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"
        ></div>
        <div
          class="relative w-full h-full bg-white dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700 shadow-lg flex items-center justify-center text-5xl"
        >
          🌱
        </div>
      </div>
      <h3 class="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100 mb-3 text-center">
        {{ hasSearchQuery ? 'Không tìm thấy truyện phù hợp' : 'Khu vực này hiện đang trống' }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 text-center max-w-md font-medium leading-relaxed">
        {{
          hasSearchQuery
            ? 'Từ khóa này không khớp với tên truyện local nào trong Góc Sáng Tác.'
            : 'Hiện tại chưa có tác phẩm nào được đăng tải. Hãy là người đầu tiên chia sẻ câu chuyện của bạn với cộng đồng!'
        }}
      </p>
      <button
        v-if="hasSearchQuery"
        type="button"
        @click="searchQuery = ''"
        class="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
      >
        Xóa tìm kiếm
      </button>
    </div>
  </div>
</template>
