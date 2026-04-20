<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabaseClient'
import MangaForm from './MangaForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const mangas = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingManga = ref(null)

const fetchMangas = async () => {
  loading.value = true
  // Lấy dữ liệu từ bảng local_mangas
  const { data } = await supabase
    .from('local_mangas')
    .select('*')
    .order('created_at', { ascending: false })

  mangas.value = data || []
  loading.value = false
}

const handleAdd = () => router.push('/admin/manga/edit')

const handleEdit = (manga) => router.push(`/admin/manga/edit/${manga.id}`)

const handleSaved = () => {
  showForm.value = false
  fetchMangas()
}

const deleteManga = async (id) => {
  if (!confirm('Bạn có chắc chắn xóa truyện này?')) return
  await supabase.from('local_mangas').delete().eq('id', id)
  fetchMangas()
}

onMounted(fetchMangas)
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-black text-gray-900">Quản Lý Truyện Nội Bộ</h3>
      <button @click="handleAdd" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
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
                  :src="
                    'https://otruyenapi.com/uploads/comics/' + (manga.thumb_url || 'default.jpg')
                  "
                  class="w-10 h-14 object-cover rounded mr-3"
                  @error="$event.target.src = 'https://via.placeholder.com/40x56'"
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
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              Chưa có truyện nào trong cơ sở dữ liệu.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <MangaForm
      v-if="showForm"
      :mangaData="editingManga"
      @saved="handleSaved"
      @cancelled="showForm = false"
    />
  </div>
</template>
