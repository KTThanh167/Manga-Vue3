<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message, notification } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const currentStep = ref(0)
const loading = ref(false)

const mangaId = ref(null)
const chapterId = ref(null)
const mangaForm = ref({ title: '', description: '' })
const chapterForm = ref({ name: '', number: 1 })
const fileList = ref([])
const coverFile = ref(null)

// Hàm tạo Slug
const generateSlug = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// 1. Tạo Manga (Bao gồm upload ảnh bìa và tạo slug)
const handleCreateManga = async () => {
  if (!coverFile.value) {
    message.warning('Vui lòng chọn ảnh bìa')
    return
  }
  loading.value = true

  try {
    // A. Upload ảnh bìa
    const fileName = `covers/${Date.now()}-${generateSlug(mangaForm.value.title)}.jpg`
    const { error: uploadErr } = await supabase.storage
      .from('manga-covers')
      .upload(fileName, coverFile.value)
    if (uploadErr) throw uploadErr

    const { data: publicUrlData } = supabase.storage.from('manga-covers').getPublicUrl(fileName)

    // B. Insert vào DB
    const { data, error } = await supabase
      .from('mangas')
      .insert([
        {
          title: mangaForm.value.title,
          description: mangaForm.value.description,
          slug: generateSlug(mangaForm.value.title),
          thumbnail_url: publicUrlData.publicUrl,
        },
      ])
      .select('id')
      .single()

    if (error) throw error

    mangaId.value = data.id
    currentStep.value = 1
  } catch (err) {
    message.error('Lỗi tạo truyện: ' + err.message)
  } finally {
    loading.value = false
  }
}

// 2. Tạo Chương
const handleCreateChapter = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('chapters')
    .insert([
      {
        manga_id: mangaId.value,
        chapter_name: chapterForm.value.name,
        chapter_number: chapterForm.value.number,
      },
    ])
    .select('id')
    .single()

  if (error) {
    message.error('Lỗi tạo chương')
    loading.value = false
    return
  }
  chapterId.value = data.id
  currentStep.value = 2
  loading.value = false
}

// 3. Upload ảnh chương (Batch)
const handleUpload = async () => {
  if (fileList.value.length === 0) return message.warning('Vui lòng chọn ảnh')
  loading.value = true

  try {
    const uploadPromises = fileList.value.map(async (file, index) => {
      const cleanName = sanitizeFileName(file.name)
      const filePath = `chapters/${chapterId.value}/${index}-${cleanName}`
      const { error } = await supabase.storage
        .from('manga-content')
        .upload(filePath, file.originFileObj)
      if (error) throw error

      const { data } = supabase.storage.from('manga-content').getPublicUrl(filePath)
      return { chapter_id: chapterId.value, image_url: data.publicUrl, page_order: index }
    })

    const pages = await Promise.all(uploadPromises)
    await supabase.from('chapter_pages').insert(pages)

    notification.success({ message: 'Thành công', description: 'Đã đăng chương hoàn tất!' })
    router.push('/admin/dashboard')
  } catch (err) {
    message.error('Lỗi upload: ' + err.message)
  } finally {
    loading.value = false
  }
}

const sanitizeFileName = (name) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]/gi, '_')
    .toLowerCase()
}

const handleCoverChange = (e) => {
  coverFile.value = e.target.files[0]
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <a-steps :current="currentStep" class="mb-8">
      <a-step title="Thông tin truyện" />
      <a-step title="Tạo chương" />
      <a-step title="Tải ảnh lên" />
    </a-steps>

    <a-card>
      <div v-if="currentStep === 0">
        <a-form layout="vertical">
          <a-form-item label="Tên truyện"><a-input v-model:value="mangaForm.title" /></a-form-item>
          <a-form-item label="Mô tả"
            ><a-textarea v-model:value="mangaForm.description"
          /></a-form-item>
          <a-form-item label="Ảnh bìa">
            <input type="file" @change="handleCoverChange" accept="image/*" />
          </a-form-item>
          <a-button type="primary" @click="handleCreateManga" :loading="loading"
            >Tiếp theo</a-button
          >
        </a-form>
      </div>

      <div v-if="currentStep === 1">
        <a-form layout="vertical">
          <a-form-item label="Tên chương"><a-input v-model:value="chapterForm.name" /></a-form-item>
          <a-form-item label="Số chương"
            ><a-input-number v-model:value="chapterForm.number"
          /></a-form-item>
          <a-button type="primary" @click="handleCreateChapter" :loading="loading"
            >Tiếp theo</a-button
          >
        </a-form>
      </div>

      <div v-if="currentStep === 2">
        <a-upload-dragger v-model:fileList="fileList" :before-upload="() => false" multiple>
          <p class="ant-upload-drag-icon"><InboxOutlined /></p>
          <p class="ant-upload-text">Kéo thả ảnh chương vào đây</p>
        </a-upload-dragger>
        <a-button type="primary" class="mt-4" @click="handleUpload" :loading="loading"
          >Đăng chương</a-button
        >
      </div>
    </a-card>
  </div>
</template>
