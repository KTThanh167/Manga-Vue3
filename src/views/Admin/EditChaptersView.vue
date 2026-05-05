<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { message } from 'ant-design-vue'
import { RollbackOutlined, SaveOutlined } from '@ant-design/icons-vue'
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
    // Lấy thông tin chương
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

    // Lấy danh sách ảnh hiện có
    const { data: pages, error: pgErr } = await supabase
      .from('chapter_pages')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('page_order', { ascending: true })
    if (pgErr) throw pgErr

    // Chuyển dữ liệu ảnh cũ thành định dạng fileList của Ant Design
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
    //Cập nhật thông tin cơ bản
    const { error: updateErr } = await supabase
      .from('chapters')
      .update({
        chapter_number: form.value.chapter_number,
        chapter_name: form.value.chapter_name,
      })
      .eq('id', chapterId)

    if (updateErr) throw updateErr

    //Xóa bản ghi cũ trong DB
    const { error: delErr } = await supabase
      .from('chapter_pages')
      .delete()
      .eq('chapter_id', chapterId)

    if (delErr) throw new Error('Không thể làm mới danh sách trang: ' + delErr.message)

    //Chuẩn bị dữ liệu và Upload ảnh
    const uploadTasks = fileList.value.map(async (item, i) => {
      // Trường hợp 1: Ảnh đã tồn tại
      if (item.isOld || (item.url && !item.originFileObj)) {
        return {
          chapter_id: chapterId,
          image_url: item.url,
          page_order: i + 1,
        }
      }

      // Trường hợp 2: Ảnh mới cần upload
      const file = item.originFileObj
      const fileName = `${Date.now()}_${i}.${file.name.split('.').pop()}`
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

    //Chèn lại dữ liệu vào DB (chỉ thực hiện nếu có ảnh)
    if (newPagesData.length > 0) {
      const { error: insErr } = await supabase.from('chapter_pages').insert(newPagesData)

      if (insErr) throw insErr
    }

    message.success('Cập nhật chương thành công!')

    //Điều hướng về trang chỉnh sửa truyện
    router.push(`/admin/manga/edit/${form.value.manga_id}`)
  } catch (err) {
    console.error('Update Error Context:', err)
    message.error('Lỗi khi cập nhật: ' + (err.description || err.message))
  } finally {
    loading.value = false
  }
}

const beforeUpload = (file) => {
  fileList.value = [...fileList.value, file]
  return false
}

const handleRemove = (file) => {
  // Lọc bỏ file được chọn ra khỏi danh sách hiện tại
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid)

  message.info(`Đã tạm gỡ ${file.name}. Nhấn Lưu để áp dụng thay đổi.`)
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <a-card :loading="pageLoading" class="shadow-md rounded-xl overflow-hidden border-none">
      <!-- Header Custom -->
      <template #title>
        <div class="flex items-center gap-2">
          <div class="w-2 h-6 bg-indigo-600 rounded-full"></div>
          <span class="text-lg font-bold text-gray-800">
            Chỉnh sửa chương {{ form.chapter_number }}
          </span>
        </div>
      </template>

      <template #extra>
        <a-button @click="router.back()" class="flex items-center gap-2 hover:text-indigo-600">
          <rollback-outlined /> Quay lại
        </a-button>
      </template>

      <a-form layout="vertical" class="mt-2">
        <!-- Thông tin cơ bản -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a-form-item label="Số chương" class="font-semibold">
            <a-input-number
              v-model:value="form.chapter_number"
              class="w-full !rounded-lg"
              placeholder="Ví dụ: 10"
            />
          </a-form-item>
          <a-col :span="16" class="md:col-span-2">
            <a-form-item label="Tên chương (Không bắt buộc)" class="font-semibold">
              <a-input
                v-model:value="form.chapter_name"
                placeholder="Nhập tiêu đề chương..."
                class="!rounded-lg"
              />
            </a-form-item>
          </a-col>
        </div>

        <!-- Quản lý trang truyện -->
        <div class="mb-4 flex items-center justify-between">
          <label class="block text-sm font-semibold text-gray-700">
            Danh sách trang truyện (Kéo thả để sắp xếp)
          </label>
          <a-upload
            multiple
            :before-upload="beforeUpload"
            :show-upload-list="false"
            accept="image/*"
          >
            <a-button type="primary" ghost class="!rounded-md border-indigo-600 text-indigo-600">
              + Thêm ảnh trang
            </a-button>
          </a-upload>
        </div>

        <!-- Khu vực Kéo thả ảnh -->
        <div class="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 min-h-[300px]">
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
                class="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-move"
              >
                <!-- Badge số thứ tự -->
                <div
                  class="absolute top-0 left-0 z-10 bg-black/60 text-white px-2 py-0.5 text-[10px] font-bold rounded-br-lg backdrop-blur-sm"
                >
                  Trang {{ index + 1 }}
                </div>

                <!-- Nút xóa nhanh -->
                <button
                  @click.stop="handleRemove(element)"
                  class="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  X
                </button>

                <!-- Thumbnail Ảnh -->
                <div class="aspect-[3/4] w-full bg-gray-200 overflow-hidden">
                  <img
                    :src="
                      element.url ||
                      (element.originFileObj ? URL.createObjectURL(element.originFileObj) : '')
                    "
                    class="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                <!-- Thông tin file (tùy chọn) -->
                <div class="p-1.5 text-center bg-white border-t">
                  <p class="text-[10px] text-gray-500 truncate w-full px-1">
                    {{ element.name || 'new_image.jpg' }}
                  </p>
                </div>
              </div>
            </template>
          </draggable>

          <!-- Empty State -->
          <div
            v-if="fileList.length === 0"
            class="flex flex-col items-center justify-center py-20 text-gray-400"
          >
            <picture-outlined class="text-4xl mb-2" />
            <p>Chưa có trang truyện nào được tải lên</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end items-center gap-4 mt-8 pt-6 border-t">
          <span class="text-sm text-gray-500">Tổng cộng: {{ fileList.length }} trang</span>
          <a-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleUpdate"
            class="!h-12 !px-8 !rounded-lg !bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <save-outlined /> Lưu thay đổi
          </a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>
