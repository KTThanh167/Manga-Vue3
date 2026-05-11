<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'

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
    // --- BƯỚC MỚI: KIỂM TRA TRÙNG SỐ CHƯƠNG ---
    const { data: existingChapter, error: checkErr } = await supabase
      .from('chapters')
      .select('id')
      .eq('manga_id', mangaId)
      .eq('chapter_number', parseInt(form.value.chapter_number))
      .maybeSingle() // Dùng maybeSingle để lấy 1 kết quả, nếu không có sẽ trả về null thay vì báo lỗi

    if (checkErr) throw checkErr

    // Nếu tìm thấy chapter có số này rồi -> Chặn lại ngay
    if (existingChapter) {
      loading.value = false
      return message.error(
        `Lỗi: Chương ${form.value.chapter_number} đã tồn tại trong bộ truyện này! Vui lòng chọn số khác.`,
      )
    }
    // ----------------------------------------

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
    message.error('Lỗi: ' + (err.message || 'Có lỗi xảy ra trong quá trình lưu'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="p-4 md:p-8 max-w-4xl mx-auto min-h-[calc(100vh-150px)] animate-in fade-in duration-500 relative"
  >
    <div
      class="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"
    ></div>

    <div class="mb-6">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Quay lại trang truyện
      </button>
    </div>

    <div
      class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-10 transition-colors duration-300 relative z-10 overflow-hidden"
    >
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-slate-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Thêm chương mới
            </h2>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              Đăng tải nội dung chương tiếp theo cho tác phẩm
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Số thứ tự chương</label
            >
            <input
              v-model="form.chapter_number"
              type="number"
              min="1"
              required
              placeholder="VD: 1, 2, 3..."
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
            />
          </div>
          <div class="md:col-span-2">
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Tên chương (Tùy chọn)</label
            >
            <input
              v-model="form.title"
              type="text"
              placeholder="VD: Cuộc gặp gỡ định mệnh..."
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label
            class="block text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1"
            >Nội dung chương</label
          >
          <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-4">
            Tải lên các trang ảnh. Hệ thống sẽ tự động sắp xếp theo thứ tự bạn chọn.
          </p>

          <div class="upload-custom-wrapper">
            <a-upload-dragger
              v-model:fileList="fileList"
              multiple
              :before-upload="beforeUpload"
              @remove="handleRemove"
              list-type="picture"
              class="custom-dragger"
            >
              <p class="ant-upload-drag-icon">
                <InboxOutlined class="text-indigo-500 dark:text-indigo-400" />
              </p>
              <p class="ant-upload-text dark:text-white font-bold text-lg">
                Kéo thả toàn bộ ảnh của chương vào đây
              </p>
              <p class="ant-upload-hint dark:text-gray-400">
                Hỗ trợ upload nhiều file cùng lúc (JPG, PNG). Hãy đặt tên file theo số thứ tự (01,
                02...) để đảm bảo ảnh không bị lộn xộn.
              </p>
            </a-upload-dragger>
          </div>
        </div>

        <div
          class="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-100 dark:border-slate-800 mt-8"
        >
          <span
            class="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-lg"
          >
            Đã chọn:
            <span class="text-indigo-600 dark:text-indigo-400">{{ fileList.length }}</span> trang
          </span>

          <button
            type="submit"
            :disabled="loading"
            class="w-full sm:w-auto px-10 py-4 rounded-xl font-black text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
          >
            <svg
              v-if="loading"
              class="animate-spin w-5 h-5"
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
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              ></path>
            </svg>
            {{ loading ? 'Đang tải ảnh lên server...' : 'Lưu & Upload Chương' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Xử lý hiển thị Dark Mode cho Ant Design Dragger và File List */
.upload-custom-wrapper :deep(.ant-upload-drag) {
  background-color: transparent !important;
  border: 2px dashed #cbd5e1 !important;
  border-radius: 1rem !important;
  transition: all 0.3s;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-drag) {
  border-color: #475569 !important;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-drag):hover {
  border-color: #818cf8 !important;
  background-color: rgba(30, 41, 59, 0.5) !important;
}

/* Xử lý danh sách ảnh (List Type Picture) */
.upload-custom-wrapper :deep(.ant-upload-list-item) {
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  margin-top: 12px;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-list-item) {
  background-color: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-list-item-name) {
  color: #cbd5e1;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-list-item:hover) {
  background-color: #334155;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-list-item-action .anticon-delete) {
  color: #ef4444;
}
</style>
