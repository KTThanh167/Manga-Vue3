<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center text-indigo-600">Đăng nhập</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
        >
          Vào đọc truyện
        </button>
      </form>
      <p class="mt-4 text-center text-sm">
        Chưa có tài khoản?
        <router-link to="/register" class="text-indigo-600 hover:underline">Đăng ký</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    alert('Đăng nhập thất bại: ' + error.message)
    return
  }

  // SỬ DỤNG DATA TẠI ĐÂY:
  if (data.user) {
    // 1. Lấy thông tin role từ bảng profiles (mà mình đã tạo ở GĐ 1)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', data.user.id)
      .single()

    // 2. Điều hướng dựa trên Role
    if (profile?.role === 'admin') {
      alert(`Chào mừng Admin ${profile.username}!`)
      router.push('/admin/dashboard')
    } else {
      alert(`Chào mừng ${profile.username} quay trở lại!`)
      router.push('/')
    }
  }
}
</script>
