<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message } from 'ant-design-vue'
import { InboxOutlined, RollbackOutlined, SaveOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const mangaId = route.params.mangaId

const loading = ref(false)
const fileList = ref([]) // Danh sách file chọn từ máy tính

const form = ref({
  chapter_number: '',
  title: '',
})

// Xử lý khi chọn file
const beforeUpload = (file) => {
  fileList.value = [...fileList.value, file]
  return false // Chặn không cho Ant Design tự động upload
}

const handleRemove = (file) => {
  const index = fileList.value.indexOf(file)
  const newFileList = fileList.value.slice()
  newFileList.splice(index, 1)
  fileList.value = newFileList
}

// Hàm chính: Lưu chương và Upload ảnh
const handleSave = async () => {
  if (!form.value.chapter_number || fileList.value.length === 0) {
    return message.warning('Vui lòng nhập số chương và chọn ít nhất 1 ảnh!')
  }

  loading.value = true
  try {
    // BƯỚC 1: Tạo bản ghi chương trong bảng chapters
    const { data: chapter, error: chapterErr } = await supabase
      .from('chapters')
      .insert([
        {
          manga_id: mangaId,
          chapter_number: parseInt(form.value.chapter_number),
          chapter_name: form.value.title,
        },
      ])
      .select()
      .single()

    if (chapterErr) throw chapterErr

    // BƯỚC 2: Upload từng ảnh lên Storage và lấy URL

    const uploadPromises = fileList.value.map(async (fileItem, index) => {
      // QUAN TRỌNG: Lấy file gốc từ originFileObj
      const file = fileItem.originFileObj || fileItem

      const fileName = `${Date.now()}_${index}.${file.name.split('.').pop()}`
      const filePath = `manga_${mangaId}/chapter_${chapter.id}/${fileName}`

      const { error: storageErr } = await supabase.storage
        .from('chapters-data')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        })

      if (storageErr) throw storageErr

      const { data: urlRes } = supabase.storage.from('chapters-data').getPublicUrl(filePath)

      return {
        chapter_id: chapter.id,
        image_url: urlRes.publicUrl,
        page_order: index + 1,
      }
    })

    const pagesData = await Promise.all(uploadPromises)

    // BƯỚC 3: Lưu danh sách link ảnh vào bảng chapter_pages
    const { error: pagesErr } = await supabase.from('chapter_pages').insert(pagesData)

    if (pagesErr) throw pagesErr

    message.success('Thêm chương thành công!')
    router.push(`/admin/manga/edit/${mangaId}`)
  } catch (err) {
    console.error(err)
    message.error('Lỗi: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <a-card title="Thêm chương mới">
      <template #extra>
        <a-button @click="router.back()"><rollback-outlined /> Quay lại</a-button>
      </template>

      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="Số chương (Ví dụ: 1, 2, 3...)">
              <a-input-number v-model:value="form.chapter_number" class="w-full" :min="1" />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="Tên chương (Không bắt buộc)">
              <a-input v-model:value="form.title" placeholder="Ví dụ: Cuộc hội ngộ bất ngờ" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Nội dung chương (Chọn nhiều ảnh truyện)">
          <a-upload-dragger
            v-model:fileList="fileList"
            multiple
            :before-upload="beforeUpload"
            @remove="handleRemove"
            list-type="picture"
          >
            <p class="ant-upload-drag-icon"><inbox-outlined /></p>
            <p class="ant-upload-text">Nhấp hoặc kéo thả nhiều ảnh vào đây</p>
            <p class="ant-upload-hint">
              Hỗ trợ upload hàng loạt. Ảnh sẽ được sắp xếp theo thứ tự bạn chọn.
            </p>
          </a-upload-dragger>
        </a-form-item>

        <div class="flex justify-end mt-4">
          <a-button type="primary" size="large" :loading="loading" @click="handleSave">
            <save-outlined /> Lưu và Upload chương
          </a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>
