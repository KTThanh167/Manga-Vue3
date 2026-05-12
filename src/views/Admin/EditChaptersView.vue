<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message } from 'ant-design-vue'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const chapterId = route.params.chapterId

const loading = ref(false)
const pageLoading = ref(false)
const fileList = ref([])

const form = ref({
  chapter_number: '',
  chapter_name: '',
  manga_id: '',
})

// 1. Tải dữ liệu chương và ảnh cũ
const fetchChapterData = async () => {
  pageLoading.value = true
  try {
    const { data: chapter, error: chErr } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()
    if (chErr) throw chErr

    form.value = {
      chapter_number: chapter.chapter_number,
      chapter_name: chapter.chapter_name,
      manga_id: chapter.manga_id,
    }

    const { data: pages, error: pgErr } = await supabase
      .from('chapter_pages')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('page_order', { ascending: true })
    if (pgErr) throw pgErr

    fileList.value = pages.map((p) => ({
      uid: p.id,
      name: `Page ${p.page_order}`,
      status: 'done',
      url: p.image_url,
      isOld: true,
    }))
  } catch (err) {
    message.error('Không thể tải dữ liệu chương: ' + err.message)
  } finally {
    pageLoading.value = false
  }
}

onMounted(fetchChapterData)

// 2. Hàm lưu cập nhật
const handleUpdate = async () => {
  loading.value = true
  try {
    const { error: updateErr } = await supabase
      .from('chapters')
      .update({
        chapter_number: form.value.chapter_number,
        chapter_name: form.value.chapter_name,
      })
      .eq('id', chapterId)

    if (updateErr) throw updateErr

    const { error: delErr } = await supabase
      .from('chapter_pages')
      .delete()
      .eq('chapter_id', chapterId)

    if (delErr) throw new Error('Không thể làm mới danh sách trang: ' + delErr.message)

    const uploadTasks = fileList.value.map(async (item, i) => {
      if (item.isOld || (item.url && !item.originFileObj)) {
        return {
          chapter_id: chapterId,
          image_url: item.url,
          page_order: i + 1,
        }
      }

      const file = item.originFileObj
      const cleanOriginalName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${Date.now()}_${i}_${cleanOriginalName}`
      const filePath = `manga_${form.value.manga_id}/chapter_${chapterId}/${fileName}`

      const { error: stErr } = await supabase.storage.from('chapters-data').upload(filePath, file)
      if (stErr) throw stErr

      const { data: urlRes } = supabase.storage.from('chapters-data').getPublicUrl(filePath)

      return {
        chapter_id: chapterId,
        image_url: urlRes.publicUrl,
        page_order: i + 1,
      }
    })

    const newPagesData = await Promise.all(uploadTasks)

    if (newPagesData.length > 0) {
      const { error: insErr } = await supabase.from('chapter_pages').insert(newPagesData)
      if (insErr) throw insErr
    }

    message.success('Cập nhật chương thành công!')
    router.push(`/admin/manga/edit/${form.value.manga_id}`)
  } catch (err) {
    console.error('Update Error Context:', err)
    message.error('Lỗi khi cập nhật: ' + (err.description || err.message))
  } finally {
    loading.value = false
  }
}

const beforeUpload = (file) => {
  const previewUrl = URL.createObjectURL(file)

  const newFileItem = {
    uid: `temp-${Date.now()}-${Math.random()}`,
    name: file.name,
    status: 'done',
    url: previewUrl,
    isOld: false,
    originFileObj: file,
  }

  fileList.value = [...fileList.value, newFileItem]
  return false
}

const handleRemove = (file) => {
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid)
  message.info(`Đã tạm gỡ trang ảnh. Nhấn Lưu để áp dụng thay đổi.`)
}
</script>

<template>
  <div
    class="p-4 md:p-8 max-w-5xl mx-auto min-h-[calc(100vh-150px)] animate-in fade-in duration-500 relative"
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
        v-if="pageLoading"
        class="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center"
      >
        <div class="relative w-12 h-12 mb-4">
          <div
            class="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-800"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"
          ></div>
        </div>
        <p class="text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">
          Đang tải dữ liệu chương...
        </p>
      </div>

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-slate-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl"
          >
            #{{ form.chapter_number || '?' }}
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Chỉnh sửa chương
            </h2>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              Cập nhật thông tin và sắp xếp lại trang truyện
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-8">
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
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
            />
          </div>
          <div class="md:col-span-2">
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Tên chương (Tùy chọn)</label
            >
            <input
              v-model="form.chapter_name"
              type="text"
              placeholder="VD: Khởi đầu mới..."
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <label
                class="block text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest"
              >
                Khu vực trang truyện
              </label>
              <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1">
                Kéo thả để sắp xếp lại thứ tự các trang
              </p>
            </div>

            <a-upload
              multiple
              :before-upload="beforeUpload"
              :show-upload-list="false"
              accept="image/*"
            >
              <button
                type="button"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Thêm trang mới
              </button>
            </a-upload>
          </div>

          <div
            class="bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 min-h-[300px]"
          >
            <draggable
              v-model="fileList"
              item-key="uid"
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              ghost-class="opacity-30"
              drag-class="rotate-2"
              animation="300"
            >
              <template #item="{ element, index }">
                <div
                  class="relative group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-move"
                >
                  <div
                    class="absolute top-0 left-0 z-10 bg-indigo-600/90 text-white px-2 py-0.5 text-[10px] font-bold rounded-br-lg backdrop-blur-sm"
                  >
                    Trang {{ index + 1 }}
                  </div>

                  <button
                    type="button"
                    @click.stop="handleRemove(element)"
                    class="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>

                  <div class="aspect-[3/4] w-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                    <img
                      :src="element.url"
                      draggable="false"
                      class="w-full h-full object-cover transition-transform group-hover:scale-105 pointer-events-none"
                    />
                  </div>

                  <div
                    class="p-1.5 text-center bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pointer-events-none"
                  >
                    <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full px-1">
                      {{ element.name || 'new_image.jpg' }}
                    </p>
                  </div>
                </div>
              </template>
            </draggable>

            <div
              v-if="fileList.length === 0 && !pageLoading"
              class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500"
            >
              <svg
                class="w-12 h-12 mb-2 opacity-50"
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
              <p>Chưa có trang truyện nào được tải lên</p>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-100 dark:border-slate-800 mt-8"
        >
          <span
            class="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-lg"
          >
            Tổng cộng:
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              ></path>
            </svg>
            {{ loading ? 'Đang xử lý & Lưu lại...' : 'Lưu Thay Đổi' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
