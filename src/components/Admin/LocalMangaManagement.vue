<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Quản Lý Truyện Nội Bộ</h3>
        <button
          @click="fetchMangas"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          🔄 Làm mới
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Truyện
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tác giả
              </th>
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
                    :src="'https://otruyenapi.com/uploads/comics/' + manga.thumb_url"
                    class="w-10 h-14 object-cover rounded mr-3"
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
                <button
                  @click="openEditModal(manga)"
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Sửa
                </button>
                <button @click="deleteManga(manga.id)" class="text-red-600 hover:text-red-900">
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h3 class="text-xl font-black mb-4">Chỉnh sửa truyện</h3>
        <div class="space-y-4">
          <input
            v-model="editingManga.name"
            placeholder="Tên truyện"
            class="w-full p-3 border rounded-xl"
          />
          <input
            v-model="editingManga.author"
            placeholder="Tác giả"
            class="w-full p-3 border rounded-xl"
          />
          <select v-model="editingManga.status" class="w-full p-3 border rounded-xl">
            <option value="ongoing">Đang ra</option>
            <option value="completed">Hoàn thành</option>
          </select>
          <textarea
            v-model="editingManga.content"
            placeholder="Mô tả"
            class="w-full p-3 border rounded-xl h-32"
          ></textarea>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showEditModal = false"
            class="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
          >
            Hủy
          </button>
          <button
            @click="updateManga"
            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabaseClient'

const mangas = ref([])
const loading = ref(false)
const showEditModal = ref(false)
const editingManga = ref({})

const fetchMangas = async () => {
  loading.value = true
  const { data } = await supabase
    .from('local_mangas')
    .select('*')
    .order('created_at', { ascending: false })
  mangas.value = data || []
  loading.value = false
}

const openEditModal = (manga) => {
  editingManga.value = { ...manga }
  showEditModal.value = true
}

const updateManga = async () => {
  const { error } = await supabase
    .from('local_mangas')
    .update({
      name: editingManga.value.name,
      author: editingManga.value.author,
      status: editingManga.value.status,
      content: editingManga.value.content,
    })
    .eq('id', editingManga.value.id)

  if (!error) {
    alert('Cập nhật thành công!')
    showEditModal.value = false
    fetchMangas()
  }
}

const deleteManga = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa truyện này?')) return
  const { error } = await supabase.from('local_mangas').delete().eq('id', id)
  if (!error) fetchMangas()
}

onMounted(fetchMangas)
</script>
