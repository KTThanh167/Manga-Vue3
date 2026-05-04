<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message, Modal } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const isEdit = !!route.params.id

const loading = ref(false)
const uploading = ref(false)

const pageLoading = ref(false)
const submitLoading = ref(false)

const chapters = ref([])

const form = ref({
  name: '',
  slug: '',
  author: '',
  status: 'ongoing',
  content: '',
  thumb_url: '',
})

// Hàm tạo Slug tự động
const generateSlug = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

watch(
  () => form.value.name,
  (newName) => {
    if (!isEdit) form.value.slug = generateSlug(newName)
  },
)

// Upload ảnh
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  uploading.value = true
  const fileName = `${Date.now()}.${file.name.split('.').pop()}`

  const { error } = await supabase.storage.from('manga-covers').upload(`covers/${fileName}`, file)
  if (error) {
    message.error('Upload ảnh thất bại')
  } else {
    const { data } = supabase.storage.from('manga-covers').getPublicUrl(`covers/${fileName}`)
    form.value.thumb_url = data.publicUrl
    message.success('Upload ảnh thành công')
  }
  uploading.value = false
}

// Lưu dữ liệu
const saveManga = async () => {
  if (isEdit && !route.params.id) {
    message.error('Không tìm thấy ID truyện để cập nhật!')
    return
  }

  submitLoading.value = true

  const payload = {
    title: form.value.name,
    slug: form.value.slug,
    author: form.value.author,
    status: form.value.status,
    description: form.value.content,
    thumbnail_url: form.value.thumb_url,
  }

  try {
    let result
    if (isEdit) {
      result = await supabase.from('mangas').update(payload).eq('id', route.params.id)
    } else {
      result = await supabase.from('mangas').insert([payload])
    }

    if (result.error) {
      console.error('Lỗi Supabase:', result.error)
      if (result.error.code === '23505') {
        message.error('Lỗi: Slug đã tồn tại!')
      } else {
        message.error('Lỗi: ' + result.error.message)
      }
    } else {
      message.success('Lưu thành công!')
      setTimeout(() => {
        router.push('/admin/local-manga')
      }, 500)
    }
  } catch (err) {
    console.error('Lỗi hệ thống:', err)
    message.error('Lỗi hệ thống: ' + err.message)
  } finally {
    // ĐẢM BẢO LUÔN TẮT LOADING Ở ĐÂY
    loading.value = false
  }
}

//Hàm load danh sách chương
const fetchChapters = async () => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('manga_id', route.params.id)
    .order('chapter_number', { ascending: false })

  if (data) chapters.value = data
  if (error) console.error('Lỗi tải chương:', error.message)
}

//Hàm xóa chương
const deleteChapter = async (chapterId) => {
  Modal.confirm({
    title: 'Xác nhận xóa chương?',
    content: 'Dữ liệu chương và toàn bộ ảnh sẽ bị xóa sạch khỏi hệ thống.',
    okText: 'Xóa ngay',
    okType: 'danger',
    async onOk() {
      try {
        // Chỉ cần 1 lệnh duy nhất, Database tự lo phần còn lại nhờ CASCADE
        const { error } = await supabase.from('chapters').delete().eq('id', chapterId)

        if (error) throw error

        message.success('Đã xóa chương và các trang liên quan!')
        fetchChapters() // Load lại danh sách chương
      } catch (err) {
        message.error('Lỗi khi xóa: ' + err.message)
      }
    },
  })
}

// Load dữ liệu
onMounted(async () => {
  // Chỉ thực hiện fetch dữ liệu nếu đang ở chế độ chỉnh sửa (isEdit)
  if (isEdit) {
    const mangaId = route.params.id
    pageLoading.value = true

    try {
      // Sử dụng Promise.all để chạy song song 2 câu lệnh fetch, giúp tối ưu tốc độ tải trang
      const [mangaRes, chaptersRes] = await Promise.all([
        // 1. Fetch thông tin chi tiết truyện
        supabase.from('mangas').select('*').eq('id', mangaId).single(),

        // 2. Fetch danh sách chương thuộc truyện này, sắp xếp chương mới nhất lên đầu
        supabase
          .from('chapters')
          .select('*')
          .eq('manga_id', mangaId)
          .order('chapter_number', { ascending: false }),
      ])

      // Xử lý dữ liệu truyện
      if (mangaRes.error) throw mangaRes.error
      if (mangaRes.data) {
        const d = mangaRes.data
        form.value = {
          name: d.title,
          slug: d.slug,
          author: d.author,
          status: d.status,
          content: d.description,
          thumb_url: d.thumbnail_url,
        }
      }

      // Xử lý dữ liệu danh sách chương
      if (chaptersRes.error) {
        console.error('Lỗi fetch chapters:', chaptersRes.error.message)
      } else {
        chapters.value = chaptersRes.data || []
      }
    } catch (err) {
      console.error('Lỗi hệ thống khi fetch dữ liệu:', err)
      message.error('Không tìm thấy dữ liệu truyện hoặc lỗi kết nối database')
    } finally {
      pageLoading.value = false
    }
  }
})
</script>

<template>
  <div class="p-6">
    <!-- 1. CARD THÔNG TIN TRUYỆN -->
    <a-card
      :title="isEdit ? 'Chỉnh sửa truyện' : 'Thêm truyện mới'"
      class="max-w-4xl mx-auto mb-8 shadow-sm"
      :loading="pageLoading"
    >
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Tên truyện">
              <a-input v-model:value="form.name" placeholder="Nhập tên truyện..." />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Slug (URL)">
              <a-input v-model:value="form.slug" placeholder="ten-truyen-tu-dong" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Tác giả">
              <a-input v-model:value="form.author" placeholder="Tên tác giả..." />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Trạng thái">
              <a-select v-model:value="form.status">
                <a-select-option value="ongoing">Đang ra</a-select-option>
                <a-select-option value="completed">Hoàn thành</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Ảnh bìa">
          <div class="flex items-start gap-4 p-3 border rounded-lg bg-gray-50">
            <div v-if="form.thumb_url" class="relative group">
              <img
                :src="form.thumb_url"
                class="w-24 h-32 object-cover rounded shadow-md border-2 border-white"
              />
            </div>
            <div class="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p class="text-xs text-gray-500">Định dạng: JPG, PNG. Dung lượng tối đa 2MB.</p>
              <div v-if="uploading" class="text-indigo-600 flex items-center gap-2">
                <a-spin size="small" /> <span class="text-xs">Đang tải ảnh lên...</span>
              </div>
            </div>
          </div>
        </a-form-item>

        <a-form-item label="Mô tả nội dung">
          <a-textarea
            v-model:value="form.content"
            :rows="6"
            placeholder="Viết tóm tắt nội dung truyện tại đây..."
          />
        </a-form-item>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <a-button @click="router.back()">Hủy bỏ</a-button>
          <a-button type="primary" :loading="submitLoading" @click="saveManga" size="large">
            <template #icon v-if="!submitLoading"><save-outlined /></template>
            {{ isEdit ? 'Cập nhật thông tin' : 'Tạo truyện mới' }}
          </a-button>
        </div>
      </a-form>
    </a-card>

    <!-- 2. CARD QUẢN LÝ DANH SÁCH CHƯƠNG (Chỉ hiện khi chỉnh sửa) -->
    <a-card v-if="isEdit" class="max-w-4xl mx-auto shadow-sm">
      <template #title>
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold">Danh sách chương</span>
          <a-badge :count="chapters.length" show-zero color="#4f46e5" />
        </div>
      </template>

      <template #extra>
        <a-button
          type="primary"
          @click="router.push(`/admin/manga/${route.params.id}/add-chapter`)"
        >
          Thêm chương mới
        </a-button>
      </template>

      <!-- Bảng danh sách chương -->
      <a-table :dataSource="chapters" :pagination="{ pageSize: 10 }" rowKey="id" size="middle">
        <a-table-column
          title="Số"
          dataIndex="chapter_number"
          key="chapter_number"
          :width="80"
          align="center"
        >
          <template #default="{ text }">
            <span class="font-bold text-indigo-600">{{ text }}</span>
          </template>
        </a-table-column>

        <a-table-column title="Tên chương" dataIndex="title" key="title">
          <template #default="{ text }">
            {{ text || '(Không có tiêu đề)' }}
          </template>
        </a-table-column>

        <a-table-column title="Ngày đăng" dataIndex="created_at" key="created_at" :width="150">
          <template #default="{ text }">
            <span class="text-gray-500 text-xs">
              {{ new Date(text).toLocaleDateString('vi-VN') }}
            </span>
          </template>
        </a-table-column>

        <a-table-column title="Thao tác" key="action" :width="180" align="right">
          <template #default="{ record }">
            <a-space>
              <a-button size="small" @click="router.push(`/admin/manga/edit-chapter/${record.id}`)">
                Sửa
              </a-button>
              <a-popconfirm
                title="Xóa chương này sẽ mất dữ liệu ảnh liên quan. Bạn chắc chắn chứ?"
                ok-text="Xóa luôn"
                cancel-text="Hủy"
                @confirm="deleteChapter(record.id)"
              >
                <a-button size="small" danger ghost>Xóa</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column>
      </a-table>

      <!-- Thông báo nếu chưa có chương -->
      <div
        v-if="chapters.length === 0 && !pageLoading"
        class="py-12 text-center border-2 border-dashed rounded-lg bg-gray-50"
      >
        <p class="text-gray-400 mb-4">Chưa có chương nào được tải lên cho bộ truyện này.</p>
        <a-button type="dashed" @click="router.push(`/admin/manga/${route.params.id}/add-chapter`)">
          Bắt đầu thêm chương đầu tiên
        </a-button>
      </div>
    </a-card>
  </div>
</template>
