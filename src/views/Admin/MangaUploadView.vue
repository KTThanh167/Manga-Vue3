<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message, notification } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
// import { useAuthStore } from '@/stores/auth'

// const authStore = useAuthStore()
const router = useRouter()
const currentStep = ref(0)
const loading = ref(false)

const mangaId = ref(null)
const chapterId = ref(null)

// CẬP NHẬT: Thêm author và status vào mangaForm
const mangaForm = ref({
  title: '',
  description: '',
  author: '', // Tên tác giả
  status: 'ongoing', // Mặc định là đang tiến hành
})

const chapterForm = ref({ name: '', number: 1 })
const fileList = ref([])
const coverFile = ref(null)
const coverPreview = ref(null)

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

// 1. Tạo Manga
const handleCreateManga = async () => {
  console.log('🚀 --- BẮT ĐẦU TẠO TRUYỆN ---')
  console.log('1. Form data hiện tại:', mangaForm.value)
  console.log('2. File ảnh bìa:', coverFile.value)

  if (!coverFile.value || !mangaForm.value.title || !mangaForm.value.author) {
    console.log('❌ Bị chặn vì thiếu thông tin form')
    message.warning('Vui lòng nhập đầy đủ tên truyện, tác giả và chọn ảnh bìa')
    return
  }

  loading.value = true

  try {
    console.log('3. Đang lấy thông tin User từ Supabase Auth...')
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    console.log('👉 User trả về:', user, '| Auth Error:', authErr)
    if (authErr || !user) throw new Error('Cần đăng nhập để đăng truyện')

    console.log('4. Đang upload ảnh lên Storage...')
    const fileName = `covers/${Date.now()}-${generateSlug(mangaForm.value.title)}.jpg`
    const { error: uploadErr } = await supabase.storage
      .from('manga-covers')
      .upload(fileName, coverFile.value)
    console.log('👉 Upload Error:', uploadErr)
    if (uploadErr) throw uploadErr

    console.log('5. Đang lấy link ảnh public...')
    const { data: publicUrlData } = supabase.storage.from('manga-covers').getPublicUrl(fileName)
    console.log('👉 Link ảnh:', publicUrlData.publicUrl)

    const insertData = {
      title: mangaForm.value.title,
      description: mangaForm.value.description,
      slug: generateSlug(mangaForm.value.title),
      thumbnail_url: publicUrlData.publicUrl,
      author_id: user.id,
      author: mangaForm.value.author,
      status: mangaForm.value.status,
    }
    console.log('6. Dữ liệu chuẩn bị Insert vào Database:', insertData)

    const { data, error } = await supabase.from('mangas').insert([insertData]).select('id').single()

    console.log('👉 Kết quả Insert DB - Data:', data, '| Error:', error)
    if (error) throw error

    console.log('✅ 7. THÀNH CÔNG TRỌN VẸN!')
    mangaId.value = data.id
    currentStep.value = 1
    message.success('Tạo truyện thành công!')
  } catch (err) {
    console.error('🔥 LỖI BẮT ĐƯỢC (CATCH):', err)
    message.error('Lỗi: ' + (err.message || 'Không thể tạo truyện'))
  } finally {
    console.log('🛑 --- KẾT THÚC (TẮT LOADING) ---')
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

  try {
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

    if (error) throw error

    chapterId.value = data.id
    currentStep.value = 2
  } catch (err) {
    message.error('Lỗi tạo chương: ' + (err.message || 'Lỗi không xác định'))
  } finally {
    loading.value = false
  }
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
            <span v-if="currentStep <= index">{{ index + 1 }}</span>
            <svg
              v-else
              class="w-5 h-5 text-white"
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
          </div>
          <span
            :class="[
              'text-xs font-bold uppercase tracking-wider absolute -bottom-6 w-24 text-center',
              currentStep >= index
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 dark:text-gray-500',
            ]"
            >{{ step }}</span
          >
        </div>
      </div>

      <div
        v-if="currentStep === 0"
        class="max-w-2xl mx-auto space-y-5 animate-in slide-in-from-right-4 duration-300"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Tên truyện</label
            >
            <input
              v-model="mangaForm.title"
              type="text"
              placeholder="Nhập tên tác phẩm..."
              class="input-style"
            />
          </div>
          <div>
            <label
              class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Tác giả</label
            >
            <input
              v-model="mangaForm.author"
              type="text"
              placeholder="Tên tác giả..."
              class="input-style"
            />
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Tình trạng truyện</label
          >
          <a-radio-group v-model:value="mangaForm.status" button-style="solid" class="flex gap-3">
            <a-radio-button value="ongoing" class="rounded-lg">Đang ra</a-radio-button>
            <a-radio-button value="completed" class="rounded-lg overflow-hidden"
              >Hoàn thành</a-radio-button
            >
          </a-radio-group>
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
            class="input-style resize-none"
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
              <div v-else class="text-center p-2 text-gray-400">
                <svg
                  class="w-8 h-8 mx-auto mb-1"
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
              <button
                @click="$refs.fileInput.click()"
                class="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-bold border border-gray-200 dark:border-slate-700"
              >
                Tải ảnh lên
              </button>
            </div>
          </div>
        </div>

        <div class="pt-6 flex justify-end">
          <button @click="handleCreateManga" :disabled="loading" class="btn-primary">
            <svg
              v-if="loading"
              class="animate-spin w-5 h-5 mr-2"
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
          </button>
        </div>
      </div>

      <div v-if="currentStep === 1" class="max-w-2xl mx-auto space-y-6">
        <div
          class="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl mb-6"
        >
          <p class="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
            Truyện <strong class="font-black">"{{ mangaForm.title }}"</strong> đã được tạo thành
            công!
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
            class="input-style"
          />
        </div>
        <div>
          <label
            class="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Số thứ tự chương</label
          >
          <input v-model="chapterForm.number" type="number" min="1" class="input-style" />
        </div>
        <div class="pt-6 flex justify-end">
          <button @click="handleCreateChapter" :disabled="loading" class="btn-primary">
            Tiếp theo
          </button>
        </div>
      </div>

      <div v-if="currentStep === 2" class="max-w-3xl mx-auto">
        <div class="upload-custom-wrapper">
          <a-upload-dragger v-model:fileList="fileList" :before-upload="() => false" multiple>
            <p class="ant-upload-drag-icon"><InboxOutlined class="text-indigo-500" /></p>
            <p class="ant-upload-text dark:text-white font-bold">Kéo thả ảnh của chương vào đây</p>
          </a-upload-dragger>
        </div>
        <div class="pt-8 flex justify-center">
          <button @click="handleUpload" :disabled="loading" class="btn-primary w-full md:w-auto">
            Xuất Bản Truyện
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-style {
  @apply w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium;
}
.btn-primary {
  @apply px-8 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2;
}
.upload-custom-wrapper :deep(.ant-upload-drag) {
  @apply bg-transparent border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl transition-all;
}
</style>
