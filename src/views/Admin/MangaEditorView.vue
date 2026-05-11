<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message, Modal } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const isEdit = !!route.params.id

// const loading = ref(false)
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

const fileInput = ref(null)

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
    submitLoading.value = false
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
        const { error } = await supabase.from('chapters').delete().eq('id', chapterId)

        if (error) throw error

        message.success('Đã xóa chương và các trang liên quan!')
        fetchChapters()
      } catch (err) {
        message.error('Lỗi khi xóa: ' + err.message)
      }
    },
  })
}

// Load dữ liệu
onMounted(async () => {
  if (isEdit) {
    const mangaId = route.params.id
    pageLoading.value = true

    try {
      const [mangaRes, chaptersRes] = await Promise.all([
        supabase.from('mangas').select('*').eq('id', mangaId).single(),
        supabase
          .from('chapters')
          .select('*')
          .eq('manga_id', mangaId)
          .order('chapter_number', { ascending: false }),
      ])

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
  <div
    class="p-4 md:p-8 max-w-5xl mx-auto min-h-[calc(100vh-150px)] animate-in fade-in duration-500 relative"
  >
    <div
      class="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"
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
        Quay lại danh sách
      </button>
    </div>

    <div
      class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-10 mb-8 transition-colors duration-300 relative z-10 overflow-hidden"
    >
      <div
        v-if="pageLoading"
        class="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center"
      >
        <div class="relative w-12 h-12 mb-4">
          <div
            class="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-slate-800"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
          ></div>
        </div>
        <p class="text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
          Đang tải dữ liệu truyện...
        </p>
      </div>

      <div class="flex items-center gap-3 mb-8">
        <div
          class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white"
        >
          <svg v-if="isEdit" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {{ isEdit ? 'Chỉnh sửa truyện' : 'Thêm truyện mới' }}
          </h2>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Cập nhật thông tin chi tiết của tác phẩm
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Tên truyện</label
            >
            <input
              v-model="form.name"
              type="text"
              placeholder="Nhập tên truyện..."
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
            />
          </div>
          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Slug (URL)</label
            >
            <input
              v-model="form.slug"
              type="text"
              placeholder="ten-truyen-tu-dong"
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Tác giả</label
            >
            <input
              v-model="form.author"
              type="text"
              placeholder="Tên tác giả..."
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Trạng thái</label
            >
            <div class="relative">
              <select
                v-model="form.status"
                class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="ongoing">🟢 Đang ra</option>
                <option value="completed">🏆 Hoàn thành</option>
              </select>
              <div
                class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7-7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Ảnh bìa</label
          >
          <div
            class="flex items-center gap-6 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700"
          >
            <div
              class="w-24 h-32 shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm cursor-pointer relative group"
              @click="$refs.fileInput.click()"
            >
              <img v-if="form.thumb_url" :src="form.thumb_url" class="w-full h-full object-cover" />
              <svg
                v-else
                class="w-8 h-8 text-gray-400"
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

              <div
                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  ></path>
                </svg>
                <span class="text-[10px] font-bold">Đổi ảnh</span>
              </div>
            </div>

            <div class="flex-1">
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                class="hidden"
              />
              <h4 class="font-bold text-gray-900 dark:text-white mb-1">Tải ảnh bìa lên</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Định dạng hỗ trợ: JPG, PNG. Dung lượng tối đa 2MB.<br />Click vào khung ảnh hoặc nút
                bên dưới để chọn file.
              </p>

              <div class="flex items-center gap-3">
                <button
                  @click="$refs.fileInput.click()"
                  type="button"
                  class="px-5 py-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
                >
                  Chọn File Mới
                </button>
                <div
                  v-if="uploading"
                  class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl"
                >
                  <svg
                    class="animate-spin w-4 h-4"
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
                  Đang tải lên...
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >Mô tả nội dung</label
          >
          <textarea
            v-model="form.content"
            rows="5"
            placeholder="Viết tóm tắt nội dung truyện tại đây..."
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium resize-none"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-800">
          <button
            @click="router.back()"
            type="button"
            class="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            @click="saveManga"
            :disabled="submitLoading"
            class="px-8 py-3 rounded-xl font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
          >
            <svg
              v-if="submitLoading"
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              ></path>
            </svg>
            {{ submitLoading ? 'Đang lưu...' : isEdit ? 'Cập Nhật Thông Tin' : 'Tạo Truyện Mới' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isEdit"
      class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-10 transition-colors duration-300 relative z-10 overflow-hidden"
    >
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              Danh sách chương
              <span class="bg-indigo-600 text-white text-[11px] px-2 py-0.5 rounded-full">{{
                chapters.length
              }}</span>
            </h3>
          </div>
        </div>

        <button
          @click="router.push(`/admin/manga/${route.params.id}/add-chapter`)"
          class="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Thêm chương mới
        </button>
      </div>

      <div
        v-if="chapters.length > 0"
        class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm"
      >
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700/80">
          <thead class="bg-gray-50/80 dark:bg-slate-800/80">
            <tr>
              <th
                class="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest w-24"
              >
                Chương
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Tiêu Đề
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest w-40 hidden sm:table-cell"
              >
                Ngày Đăng
              </th>
              <th
                class="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest w-32"
              >
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800/80">
            <tr
              v-for="chapter in chapters"
              :key="chapter.id"
              class="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"
                >
                  {{ chapter.chapter_number }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                {{ chapter.chapter_name || '(Không có tiêu đề)' }}
              </td>
              <td
                class="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell"
              >
                {{ new Date(chapter.created_at).toLocaleDateString('vi-VN') }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="router.push(`/admin/manga/edit-chapter/${chapter.id}`)"
                    class="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-bold transition-colors"
                    title="Sửa chương"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    @click="deleteChapter(chapter.id)"
                    class="p-2 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold transition-colors"
                    title="Xóa chương"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="chapters.length === 0 && !pageLoading"
        class="flex flex-col items-center justify-center py-16 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700"
      >
        <svg
          class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
        <p class="text-gray-500 dark:text-gray-400 font-medium mb-4">
          Chưa có chương nào được tải lên cho bộ truyện này.
        </p>
        <button
          @click="router.push(`/admin/manga/${route.params.id}/add-chapter`)"
          class="px-6 py-2.5 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          Bắt đầu thêm chương đầu tiên
        </button>
      </div>
    </div>
  </div>
</template>
