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
const coverPreview = ref(null) // Thêm state để hiển thị ảnh preview

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
  if (!coverFile.value || !mangaForm.value.title) {
    message.warning('Vui lòng nhập tên truyện và chọn ảnh bìa')
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
  if (!chapterForm.value.name || !chapterForm.value.number) {
    message.warning('Vui lòng nhập tên và số chương')
    return
  }
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
  if (fileList.value.length === 0) return message.warning('Vui lòng chọn ảnh cho chương này')
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
    router.push('/admin/local-manga')
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

// Xử lý xem trước ảnh bìa
const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
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

    <div class="mb-8">
      <router-link
        to="/admin/local-manga"
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
        Quay lại danh sách
      </router-link>
    </div>

    <div
      class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-10 transition-colors duration-300 relative z-10 overflow-hidden"
    >
      <div class="text-center mb-10">
        <h2
          class="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-3"
        >
          <span class="text-3xl drop-shadow-sm">🚀</span> Đăng Truyện Mới
        </h2>
        <p class="text-gray-500 dark:text-gray-400 font-medium mt-2">
          Hoàn thành 3 bước dưới đây để đưa tác phẩm lên hệ thống
        </p>
      </div>

      <div class="relative flex items-center justify-between w-full max-w-2xl mx-auto mb-12 px-4">
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-full z-0"
        ></div>
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full z-0 transition-all duration-500"
          :style="{ width: `${(currentStep / 2) * 100}%` }"
        ></div>

        <div
          v-for="(step, index) in ['Thông tin truyện', 'Tạo chương', 'Tải ảnh lên']"
          :key="index"
          class="relative z-10 flex flex-col items-center gap-2"
        >
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md',
              currentStep >= index
                ? 'bg-indigo-600 text-white shadow-indigo-500/40 ring-4 ring-indigo-100 dark:ring-indigo-900/30'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-slate-700',
            ]"
          >
            <svg
              v-if="currentStep > index"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span
            :class="[
              'text-xs font-bold uppercase tracking-wider absolute -bottom-6 w-24 text-center',
              currentStep >= index
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 dark:text-gray-500',
            ]"
          >
            {{ step }}
          </span>
        </div>
      </div>

      <div
        v-if="currentStep === 0"
        class="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300"
      >
        <div>
          <label
            class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Tên truyện</label
          >
          <input
            v-model="mangaForm.title"
            type="text"
            placeholder="Nhập tên tác phẩm..."
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
          />
        </div>

        <div>
          <label
            class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Mô tả nội dung</label
          >
          <textarea
            v-model="mangaForm.description"
            rows="4"
            placeholder="Giới thiệu ngắn về cốt truyện..."
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium resize-none"
          ></textarea>
        </div>

        <div>
          <label
            class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Ảnh bìa</label
          >
          <div class="flex items-center gap-6">
            <div
              class="w-28 h-40 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center bg-gray-50 dark:bg-slate-800/50 overflow-hidden relative group cursor-pointer"
              @click="$refs.fileInput.click()"
            >
              <img v-if="coverPreview" :src="coverPreview" class="w-full h-full object-cover" />
              <div v-else class="text-center p-2">
                <svg
                  class="w-8 h-8 text-gray-400 mx-auto mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span class="text-[10px] text-gray-500 font-medium">Chọn ảnh</span>
              </div>
              <div
                v-if="coverPreview"
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
              >
                Đổi ảnh
              </div>
            </div>
            <div class="flex-1">
              <input
                type="file"
                ref="fileInput"
                @change="handleCoverChange"
                accept="image/*"
                class="hidden"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Hỗ trợ định dạng JPG, PNG. Kích thước tối ưu 400x600px.
              </p>
              <button
                @click="$refs.fileInput.click()"
                class="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
              >
                Tải ảnh lên
              </button>
            </div>
          </div>
        </div>

        <div class="pt-6 flex justify-end">
          <button
            @click="handleCreateManga"
            :disabled="loading"
            class="px-8 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
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
            {{ loading ? 'Đang khởi tạo...' : 'Tạo Truyện & Tiếp tục' }}
            <svg
              v-if="!loading"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="currentStep === 1"
        class="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300"
      >
        <div
          class="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl mb-6"
        >
          <p class="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
            Truyện <strong class="font-black">"{{ mangaForm.title }}"</strong> đã được tạo thành
            công! Khởi tạo chương đầu tiên để tiếp tục.
          </p>
        </div>

        <div>
          <label
            class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Tên chương hiển thị</label
          >
          <input
            v-model="chapterForm.name"
            type="text"
            placeholder="VD: Chương 1: Khởi đầu..."
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
          />
        </div>

        <div>
          <label
            class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Số thứ tự chương</label
          >
          <input
            v-model="chapterForm.number"
            type="number"
            min="1"
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
          />
        </div>

        <div class="pt-6 flex justify-end">
          <button
            @click="handleCreateChapter"
            :disabled="loading"
            class="px-8 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
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
            {{ loading ? 'Đang xử lý...' : 'Tạo Chương & Tiếp tục' }}
            <svg
              v-if="!loading"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="currentStep === 2"
        class="max-w-3xl mx-auto animate-in slide-in-from-right-4 duration-300"
      >
        <div class="upload-custom-wrapper">
          <a-upload-dragger
            v-model:fileList="fileList"
            :before-upload="() => false"
            multiple
            class="custom-dragger"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined class="text-indigo-500 dark:text-indigo-400" />
            </p>
            <p class="ant-upload-text dark:text-white font-bold text-lg">
              Kéo thả toàn bộ ảnh của chương vào đây
            </p>
            <p class="ant-upload-hint dark:text-gray-400">
              Hỗ trợ upload nhiều file cùng lúc. Các file sẽ được sắp xếp theo tên (Hãy đánh số thứ
              tự 01, 02... cho tên file để đảm bảo đúng trang).
            </p>
          </a-upload-dragger>
        </div>

        <div class="pt-8 flex justify-center">
          <button
            @click="handleUpload"
            :disabled="loading"
            class="px-10 py-4 rounded-xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/30 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3 w-full justify-center md:w-auto"
          >
            <svg
              v-if="loading"
              class="animate-spin w-6 h-6"
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
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              ></path>
            </svg>
            {{ loading ? 'Đang tải ảnh lên server...' : 'Xuất Bản Truyện' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Xử lý hiển thị Dark Mode cho Ant Design Dragger */
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
.upload-custom-wrapper :deep(.ant-upload-list-item) {
  border-radius: 0.5rem;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-list-item) {
  color: #e2e8f0;
}
html.dark .upload-custom-wrapper :deep(.ant-upload-list-item:hover) {
  background-color: #334155;
}
</style>
