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
    loading.value = true
    const { data, error } = await supabase
      .from('mangas')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (data) {
      // Map dữ liệu từ DB về Form
      form.value = {
        name: data.title,
        slug: data.slug,
        author: data.author,
        status: data.status,
        content: data.description,
        thumb_url: data.thumbnail_url,
      }
    }
    if (error) message.error('Lỗi tải dữ liệu')
    loading.value = false
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
  loading.value = true

  const payload = {
    title: form.value.name,
    slug: form.value.slug,
    author: form.value.author,
    status: form.value.status,
    description: form.value.content,
    thumbnail_url: form.value.thumb_url,
  }

  try {
    if (isEdit) {
      await supabase.from('mangas').update(payload).eq('id', route.params.id)
    } else {
      await supabase.from('mangas').insert([payload])
    }
    message.success('Lưu thành công!')
    router.push('/admin/dashboard') // Đổi đường dẫn nếu cần
  } catch (err) {
    message.error('Lỗi lưu dữ liệu: ' + err.message)
  } finally {
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
          <a-button type="primary" :loading="loading" @click="saveManga">Lưu truyện</a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>
