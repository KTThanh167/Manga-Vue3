<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center text-indigo-600">Đăng ký Đọc Truyện</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Tên hiển thị</label>
          <input
            v-model="username"
            type="text"
            required
            class="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            v-model="password"
            type="password"
            required
            class="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
        >
          Đăng ký ngay
        </button>
      </form>
      <p class="mt-4 text-center text-sm">
        Đã có tài khoản?
        <router-link to="/login" class="text-indigo-600 hover:underline">Đăng nhập</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const username = ref('')
const router = useRouter()

const handleRegister = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { username: username.value },
    },
  })

  if (error) {
    alert('Lỗi: ' + error.message)
    return
  }

  if (data.user && data.session === null) {
    alert('Đăng ký thành công! Một email xác nhận đã được gửi đến bạn. Vui lòng kiểm tra hộp thư.')
  } else {
    alert('Đăng ký thành công và đã tự động đăng nhập!')
    router.push('/')
  }
}
</script>
