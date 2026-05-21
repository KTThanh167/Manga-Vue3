<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabaseClient'
import { message, Modal } from 'ant-design-vue'

const router = useRouter()
const mangas = ref([])
const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const sortBy = ref('time_desc')

const filteredAndSortedMangas = computed(() => {
  let result = [...mangas.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((manga) => {
      const nameMatch = (manga.name || manga.title || '').toLowerCase().includes(query)
      const authorMatch = (manga.author || '').toLowerCase().includes(query)
      const statusMatch = (
        manga.status === 'completed' ? 'hoàn thành completed' : 'đang ra ongoing'
      )
        .toLowerCase()
        .includes(query)
      const idMatch = (manga.id || '').toLowerCase().includes(query)

      return nameMatch || authorMatch || statusMatch || idMatch
    })
  }

  result.sort((a, b) => {
    const nameA = (a.name || a.title || '').toLowerCase()
    const nameB = (b.name || b.title || '').toLowerCase()
    const timeA = new Date(a.created_at || a.updated_at || 0).getTime()
    const timeB = new Date(b.created_at || b.updated_at || 0).getTime()

    if (sortBy.value === 'name_asc') {
      return nameA.localeCompare(nameB)
    } else if (sortBy.value === 'name_desc') {
      return nameB.localeCompare(nameA)
    } else if (sortBy.value === 'time_asc') {
      return timeA - timeB
    }

    return timeB - timeA
  })

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedMangas.value.length / itemsPerPage.value) || 1
})

const paginatedMangas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAndSortedMangas.value.slice(start, end)
})

watch([searchQuery, sortBy], () => {
  currentPage.value = 1
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const fetchMangas = async () => {
  loading.value = true

  try {
    const { data, error } = await supabase
      .from('mangas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi khi fetch:', error)
      message.error('Không thể tải danh sách truyện.')
      return
    }
    mangas.value = (data || []).map((m) => ({
      ...m,
      name: m.title,
      thumb_url: m.thumbnail_url,
    }))

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (error) {
    console.error('Lỗi khi fetch:', error)
    message.error('Kết nối bị gián đoạn. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
}

// Chuyển hướng sang View riêng để thêm mới
const handleAdd = () => {
  router.push('/admin/manga/upload')
}

const refreshMangas = () => {
  searchQuery.value = ''
  sortBy.value = 'time_desc'
  currentPage.value = 1
  fetchMangas()
}

// Chuyển hướng sang View riêng để sửa (kèm ID)
const handleEdit = (manga) => {
  router.push(`/admin/manga/edit/${manga.id}`)
}

const deleteManga = (id) => {
  Modal.confirm({
    title: 'Bạn có chắc chắn muốn xóa?',
    content: 'Truyện này và các dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.',
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    async onOk() {
      // Logic xóa dữ liệu
      const { error } = await supabase.from('mangas').delete().eq('id', id)

      if (error) {
        console.error('Lỗi khi xóa:', error)
        message.error('Lỗi khi xóa: ' + error.message)
      } else {
        message.success('Đã xóa truyện thành công!')
        fetchMangas() // Tải lại danh sách
      }
    },
    onCancel() {
      console.log('Đã hủy xóa')
    },
  })
}

const onImageError = (event) => {
  const fallbackUrl = 'https://placehold.co/40x56'

  // NẾU src hiện tại ĐÃ là ảnh lỗi rồi thì DỪNG LẠI, không set nữa
  if (event.target.src === fallbackUrl) return

  event.target.src = fallbackUrl
}

onMounted(fetchMangas)

defineExpose({
  refreshMangas,
})
</script>

<template>
  <div
    class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
  >
    <div
      class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"
    ></div>

    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10"
    >
      <div>
        <h3
          class="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3"
        >
          <span class="text-indigo-500 text-2xl">📚</span> Quản Lý Truyện Nội Bộ
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Quản lý danh sách, chỉnh sửa và thêm mới truyện vào hệ thống
        </p>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button
          @click="refreshMangas"
          :disabled="loading"
          class="shrink-0 p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <svg
            :class="{ 'animate-spin': loading }"
            class="w-5 h-5"
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
        </button>

        <button
          @click="handleAdd"
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transform hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Thêm truyện mới
        </button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm theo tên truyện, tác giả, trạng thái hoặc ID..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 font-medium"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <div class="shrink-0 relative">
        <select
          v-model="sortBy"
          class="w-full md:w-48 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none cursor-pointer"
        >
          <option value="time_desc">⏱️ Gần đây nhất</option>
          <option value="time_asc">🕰️ Cũ nhất</option>
          <option value="name_asc">🔤 Tên A ➡️ Z</option>
          <option value="name_desc">🔤 Tên Z ➡️ A</option>
        </select>
        <div
          class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 relative z-10">
      <div class="relative w-12 h-12 mb-4">
        <div
          class="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-800"
        ></div>
        <div
          class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"
        ></div>
      </div>
      <p class="text-gray-500 dark:text-gray-400 font-medium">Đang tải danh sách truyện...</p>
    </div>

    <div
      v-else-if="filteredAndSortedMangas.length === 0"
      class="flex flex-col items-center justify-center py-20 relative z-10 text-gray-500 dark:text-gray-400"
    >
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
      <p v-if="searchQuery" class="font-medium text-lg">
        Không tìm thấy truyện nào khớp với "{{ searchQuery }}"
      </p>
      <p v-else class="font-medium text-lg">Chưa có bộ truyện nào trong hệ thống.</p>
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="mt-4 text-indigo-500 hover:text-indigo-600 font-bold underline"
      >
        Xóa bộ lọc
      </button>
    </div>

    <div v-else>
      <div
        class="relative z-10 overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm"
      >
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700/80">
          <thead class="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Truyện
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Tác giả
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Trạng thái
              </th>
              <th
                class="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 dark:divide-slate-800/80">
            <tr
              v-for="manga in paginatedMangas"
              :key="manga.id"
              class="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-4">
                  <img
                    :src="manga.thumb_url || 'https://placehold.co/40x56'"
                    class="w-12 h-16 object-cover rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-105 transition-transform"
                    @error="onImageError"
                  />
                  <div class="flex flex-col max-w-[200px] sm:max-w-xs md:max-w-sm">
                    <span class="text-sm font-bold text-gray-900 dark:text-white truncate">{{
                      manga.name
                    }}</span>
                    <span
                      class="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider"
                      >ID: {{ manga.id?.substring(0, 8) }}...</span
                    >
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                  <span
                    class="text-sm font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[150px]"
                    >{{ manga.author || 'Đang cập nhật' }}</span
                  >
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    manga.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                  "
                  class="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border flex w-fit items-center gap-1.5"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      manga.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'
                    "
                  ></span>
                  {{ manga.status === 'completed' ? 'Hoàn thành' : 'Đang ra' }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="handleEdit(manga)"
                    class="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-bold transition-colors"
                    title="Chỉnh sửa"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    @click="deleteManga(manga.id)"
                    class="p-2 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold transition-colors"
                    title="Xóa truyện"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors duration-300"
      >
        <div class="text-[13px] font-medium text-gray-500 dark:text-gray-400">
          Hiển thị
          <span class="font-bold text-gray-900 dark:text-white">{{
            (currentPage - 1) * itemsPerPage + 1
          }}</span>
          -
          <span class="font-bold text-gray-900 dark:text-white">{{
            Math.min(currentPage * itemsPerPage, filteredAndSortedMangas.length)
          }}</span>
          trong tổng số
          <span class="font-bold text-gray-900 dark:text-white">{{
            filteredAndSortedMangas.length
          }}</span>
          truyện
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
  </div>
</template>
