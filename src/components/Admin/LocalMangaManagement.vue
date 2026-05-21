<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabaseClient'
import { message, Modal } from 'ant-design-vue'

const router = useRouter()
const mangas = ref([])
const loading = ref(false)

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
</script>

<template>
  <div
    class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
  >
    <div
      class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"
    ></div>

    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10"
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

      <button
        @click="handleAdd"
        class="shrink-0 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transform hover:-translate-y-0.5 active:scale-95 transition-all"
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
      v-else
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
            v-for="manga in mangas"
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

          <tr v-if="!loading && mangas.length === 0">
            <td colspan="4" class="px-6 py-12 text-center">
              <div
                class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500"
              >
                <svg
                  class="w-12 h-12 mb-3 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                <p class="text-sm font-medium">Chưa có bộ truyện nào trong hệ thống.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
