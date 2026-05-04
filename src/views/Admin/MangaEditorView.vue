<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const isEdit = !!route.params.id

const loading = ref(false)
const uploading = ref(false)

const pageLoading = ref(false) // Dùng cho onMounted
const submitLoading = ref(false) // Dùng cho nút Lưu
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

// Load dữ liệu
onMounted(async () => {
  if (isEdit) {
    pageLoading.value = true // Bật loading trang
    try {
      const { data, error } = await supabase
        .from('mangas')
        .select('*')
        .eq('id', route.params.id)
        .single()

      if (data) {
        form.value = {
          name: data.title,
          slug: data.slug,
          author: data.author,
          status: data.status,
          content: data.description,
          thumb_url: data.thumbnail_url,
        }
      }
      if (error) throw error
    } catch (err) {
      console.error('Lỗi fetch:', err)
      message.error('Không tìm thấy dữ liệu truyện')
    } finally {
      pageLoading.value = false // Chắc chắn tắt loading trang
    }
  }
})

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
</script>

<template>
  <div class="p-6">
    <a-card :title="isEdit ? 'Chỉnh sửa truyện' : 'Thêm truyện mới'" class="max-w-4xl mx-auto">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12"
            ><a-form-item label="Tên truyện"><a-input v-model:value="form.name" /></a-form-item
          ></a-col>
          <a-col :span="12"
            ><a-form-item label="Slug (URL)"><a-input v-model:value="form.slug" /></a-form-item
          ></a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12"
            ><a-form-item label="Tác giả"><a-input v-model:value="form.author" /></a-form-item
          ></a-col>
          <a-col :span="12"
            ><a-form-item label="Trạng thái">
              <a-select v-model:value="form.status">
                <a-select-option value="ongoing">Đang ra</a-select-option>
                <a-select-option value="completed">Hoàn thành</a-select-option>
              </a-select>
            </a-form-item></a-col
          >
        </a-row>
        <a-form-item label="Ảnh bìa">
          <div class="flex items-center gap-4">
            <img
              v-if="form.thumb_url"
              :src="form.thumb_url"
              class="w-20 h-28 object-cover rounded border"
            />
            <input type="file" @change="handleFileUpload" />
          </div>
        </a-form-item>
        <a-form-item label="Mô tả"
          ><a-textarea v-model:value="form.content" :rows="4"
        /></a-form-item>
        <div class="flex justify-end gap-2">
          <a-button @click="router.back()">Hủy</a-button>
          <a-button type="primary" :loading="submitLoading" @click="saveManga">
            Lưu truyện
          </a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>
