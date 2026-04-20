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

  const { data, error } = await supabase
    .from('mangas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Lỗi khi fetch:', error)
    loading.value = false
    return
  }
  mangas.value = (data || []).map((m) => ({
    ...m,
    name: m.title,
    thumb_url: m.thumbnail_url,
  }))

  loading.value = false
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
  const fallbackUrl = 'https://placehold.co/40x56' // Dùng placehold.co thay vì via.placeholder

  // NẾU src hiện tại ĐÃ là ảnh lỗi rồi thì DỪNG LẠI, không set nữa
  if (event.target.src === fallbackUrl) return

  event.target.src = fallbackUrl
}

onMounted(fetchMangas)
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-black text-gray-900">Quản Lý Truyện Nội Bộ</h3>
      <button
        @click="handleAdd"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition"
      >
        ➕ Thêm truyện
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Truyện</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tác giả</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Trạng thái
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="manga in mangas" :key="manga.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img
                  :src="manga.thumb_url || 'https://placehold.co/40x56'"
                  class="w-10 h-14 object-cover rounded mr-3"
                  @error="onImageError"
                />
                <div class="text-sm font-bold text-gray-900">{{ manga.name }}</div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ manga.author }}</td>
            <td class="px-6 py-4">
              <span
                :class="
                  manga.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                "
                class="px-2 py-1 rounded-full text-xs font-bold"
              >
                {{ manga.status === 'completed' ? 'Hoàn thành' : 'Đang ra' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm font-medium">
              <button @click="handleEdit(manga)" class="text-indigo-600 hover:text-indigo-900">
                Sửa
              </button>
              <button @click="deleteManga(manga.id)" class="text-red-600 ml-4 hover:text-red-900">
                Xóa
              </button>
            </td>
          </tr>
          <tr v-if="mangas.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">Chưa có truyện nào.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
