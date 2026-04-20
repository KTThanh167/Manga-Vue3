<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const isEdit = !!route.params.id // Nếu có ID là Sửa, không là Thêm

const form = ref({
  name: '',
  slug: '',
  author: '',
  status: 'ongoing',
  content: '',
  thumb_url: '',
})

const loading = ref(false)

onMounted(async () => {
  if (isEdit) {
    const { data } = await supabase
      .from('local_mangas')
      .select('*')
      .eq('id', route.params.id)
      .single()
    if (data) form.value = data
  }
})

const save = async () => {
  loading.value = true
  try {
    if (isEdit) {
      await supabase.from('local_mangas').update(form.value).eq('id', route.params.id)
    } else {
      await supabase.from('local_mangas').insert([form.value])
    }
    alert('Thành công!')
    router.push('/admin/manga') // Trở về trang quản lý
  } catch (err) {
    alert('Lỗi: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
    <h1 class="text-2xl font-black mb-6">{{ isEdit ? 'Sửa Truyện' : 'Đăng Truyện Mới' }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <input v-model="form.name" placeholder="Tên truyện" class="p-3 border rounded-xl" />
      <input
        v-model="form.slug"
        placeholder="Slug (vd: ten-truyen)"
        class="p-3 border rounded-xl"
      />
      <input v-model="form.author" placeholder="Tác giả" class="p-3 border rounded-xl" />
      <input v-model="form.thumb_url" placeholder="Tên file ảnh" class="p-3 border rounded-xl" />
    </div>

    <textarea
      v-model="form.content"
      placeholder="Mô tả nội dung..."
      class="w-full mt-4 p-3 border rounded-xl h-40"
    ></textarea>

    <div class="mt-6 flex justify-end gap-4">
      <button @click="router.back()" class="px-6 py-3 bg-gray-200 rounded-xl">Hủy</button>
      <button @click="save" class="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
        {{ loading ? 'Đang lưu...' : 'Lưu Truyện' }}
      </button>
    </div>
  </div>
</template>
