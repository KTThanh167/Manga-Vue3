<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Danh Sách Truyện</h3>
        <button
          @click="refreshMangas"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          🔄 Làm mới
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">Đang tải danh sách truyện...</p>
      </div>
      <div v-else-if="mangas.length === 0" class="text-center py-8 text-gray-500">
        Không có truyện nào
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                STT
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tên Truyện
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Slug
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Trạng Thái
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cập Nhật
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(manga, index) in mangas" :key="manga._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div class="flex items-center">
                  <img
                    :src="`${IMAGE_RESOURCES}${manga.thumb_url}`"
                    class="w-10 h-14 object-cover rounded mr-3"
                    :alt="manga.name"
                  />
                  <div>
                    <div class="font-medium">{{ manga.name }}</div>
                    <div class="text-xs text-gray-500 truncate max-w-xs">
                      {{ manga.origin_name?.[0] || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {{ manga.slug }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  :class="
                    manga.status === 'ongoing'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ manga.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(manga.updatedAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="mangas.length > 0" class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-500">
          Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, totalItems) }} của {{ totalItems }} truyện
        </div>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <span class="px-3 py-1 text-sm text-gray-700">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

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

      // Lấy số truyện trên mỗi trang từ API (trường hợp này là 24)
      const perPage = pagination?.totalItemsPerPage || itemsPerPage.value

      // TÍNH TOÁN SỐ TRANG THỦ CÔNG
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

onMounted(() => {
  fetchMangas()
})

defineExpose({ refreshMangas })
</script>
