<script setup>
import { ref, onMounted } from 'vue'

const mangas = ref([])
const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(50)
const totalItems = ref(0)
const totalPages = ref(0)

const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

const fetchMangas = async (page = 1) => {
  loading.value = true
  try {
    const response = await fetch(
      `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${page}&limit=${itemsPerPage.value}`,
    )
    const data = await response.json()

    if (data.status === 'success') {
      mangas.value = data.data.items || []

      const pagination = data.data.params?.pagination

      // Lấy tổng số truyện
      totalItems.value = pagination?.totalItems || 0

      // Lấy số truyện trên mỗi trang từ API (24 truyện)
      const perPage = pagination?.totalItemsPerPage || itemsPerPage.value

      // Tính toán số trang
      totalPages.value = Math.ceil(totalItems.value / perPage)

      currentPage.value = page
    }
  } catch (error) {
    console.error('Error fetching mangas:', error)
    mangas.value = []
  } finally {
    loading.value = false
  }
}

const refreshMangas = () => {
  currentPage.value = 1 // Reset về trang 1 khi làm mới
  fetchMangas(1)
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchMangas(page)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN')
}

// Xử lý ảnh lỗi
const onImageError = (event) => {
  const fallbackUrl = 'https://placehold.co/40x56'
  if (event.target.src === fallbackUrl) return
  event.target.src = fallbackUrl
}

onMounted(() => {
  fetchMangas()
})

defineExpose({ refreshMangas })
</script>

<template>
  <div
    class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
  >
    <div
      class="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"
    ></div>

    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10"
    >
      <div>
        <h3
          class="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3"
        >
          <span class="text-blue-500 text-2xl drop-shadow-sm">🌐</span> Nguồn API Truyện
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Dữ liệu tự động đồng bộ từ hệ thống otruyenapi.com
        </p>
      </div>

      <button
        @click="refreshMangas"
        :disabled="loading"
        class="shrink-0 flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-xl font-bold border border-blue-100 dark:border-blue-500/30 transition-all disabled:opacity-50 group"
      >
        <svg
          :class="{ 'animate-spin': loading }"
          class="w-4 h-4 group-active:rotate-180 transition-transform duration-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
        {{ loading ? 'Đang tải...' : 'Làm mới' }}
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 relative z-10">
      <div class="relative w-12 h-12 mb-4">
        <div
          class="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-800"
        ></div>
        <div
          class="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
        ></div>
      </div>
      <p class="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
        Đang nạp dữ liệu từ máy chủ...
      </p>
    </div>

    <div
      v-else-if="mangas.length === 0"
      class="flex flex-col items-center justify-center py-20 relative z-10 text-gray-500 dark:text-gray-400"
    >
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        ></path>
      </svg>
      <p class="font-medium">Không tìm thấy truyện nào. Vui lòng thử làm mới lại.</p>
    </div>

    <div
      v-else
      class="relative z-10 overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700/80">
        <thead class="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest w-16"
            >
              STT
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
            >
              Tên Truyện
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden md:table-cell"
            >
              Slug
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
            >
              Trạng Thái
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
            >
              Cập Nhật
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-slate-800/80">
          <tr
            v-for="(manga, index) in mangas"
            :key="manga._id"
            class="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group"
          >
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-400 dark:text-gray-500"
            >
              #{{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center gap-4">
                <img
                  :src="`${IMAGE_RESOURCES}${manga.thumb_url}`"
                  class="w-10 h-14 object-cover rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-105 transition-transform"
                  :alt="manga.name"
                  @error="onImageError"
                />
                <div class="flex flex-col max-w-[150px] sm:max-w-[200px] lg:max-w-xs">
                  <span class="font-bold text-gray-900 dark:text-white truncate">{{
                    manga.name
                  }}</span>
                  <span class="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                    {{ manga.origin_name?.[0] || 'N/A' }}
                  </span>
                </div>
              </div>
            </td>

            <td
              class="px-6 py-4 whitespace-nowrap text-[11px] font-mono text-gray-400 dark:text-gray-500 hidden md:table-cell"
            >
              <span class="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">{{
                manga.slug
              }}</span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="
                  manga.status === 'ongoing'
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                "
                class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border flex w-fit items-center gap-1.5"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    manga.status === 'ongoing' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'
                  "
                ></span>
                {{ manga.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành' }}
              </span>
            </td>

            <td
              class="px-6 py-4 whitespace-nowrap text-[12px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-3"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {{ formatDate(manga.updatedAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="mangas.length > 0 && !loading"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 dark:border-slate-800"
    >
      <div class="text-[13px] font-medium text-gray-500 dark:text-gray-400">
        Hiển thị
        <span class="font-bold text-gray-900 dark:text-white">{{
          (currentPage - 1) * itemsPerPage + 1
        }}</span>
        -
        <span class="font-bold text-gray-900 dark:text-white">{{
          Math.min(currentPage * itemsPerPage, totalItems)
        }}</span>
        trong tổng số
        <span class="font-bold text-gray-900 dark:text-white">{{ totalItems }}</span> truyện
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="p-2 md:px-4 md:py-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          <span class="hidden md:block">Trước</span>
        </button>

        <span
          class="px-4 py-2 text-[13px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20"
        >
          Trang {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="p-2 md:px-4 md:py-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1"
        >
          <span class="hidden md:block">Sau</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
