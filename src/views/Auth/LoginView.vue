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
          <div class="relative mt-1">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <span v-if="showPassword"><EyeOutlined /></span>
              <span v-else><EyeInvisibleOutlined /></span>
            </button>
          </div>
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
        >
          Vào đọc truyện
        </button>
      </form>

      <!-- QUÊN MẬT KHẨU -->
      <div class="mt-4 text-center">
        <button
          type="button"
          @click="showForgotModal = true"
          class="text-sm text-indigo-600 hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>

      <p class="mt-4 text-center text-sm text-black/70">
        Chưa có tài khoản?
        <router-link to="/register" class="text-indigo-600 hover:underline">Đăng ký</router-link>
      </p>
    </div>

    <!-- MODAL QUÊN MẬT KHẨU -->
    <div
      v-if="showForgotModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 class="text-xl font-bold mb-4 text-indigo-600">Đặt lại mật khẩu</h3>

        <input
          v-model="forgotEmail"
          type="email"
          placeholder="Nhập email của bạn"
          class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-black"
        />

        <div
          v-if="resetMessage"
          :class="[
            'mb-4 p-3 rounded text-sm text-center',
            resetMessage.includes('Lỗi')
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600',
          ]"
        >
          {{ resetMessage }}
        </div>

        <div class="flex gap-3">
          <button
            @click="handleForgotPassword"
            :disabled="isLoadingResetPassword"
            :class="[
              'flex-1 py-2 px-4 rounded-md transition',
              isLoadingResetPassword
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700',
            ]"
          >
            <span v-if="isLoadingResetPassword" class="inline-block mr-2">⏳</span>
            {{ isLoadingResetPassword ? 'Đang gửi...' : 'Gửi link reset' }}
          </button>
          <button
            @click="showForgotModal = false"
            :disabled="isLoadingResetPassword"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition disabled:opacity-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const showForgotModal = ref(false)
const forgotEmail = ref('')
const resetMessage = ref('')
const isLoadingResetPassword = ref(false)
const router = useRouter()

const handleLogin = async () => {
  const hideLoading = message.loading('Đang xác thực...', 0)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      hideLoading()
      message.error('Đăng nhập thất bại: Tài khoản hoặc mật khẩu không chính xác!')
      return
    }

    // Lấy thông tin profile để chào mừng
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', data.user.id)
      .single()

    hideLoading()

    // Chào mừng người dùng bằng tên (Username)
    message.success(`Chào mừng ${profile?.username || 'bạn'} đã quay trở lại!`)

    // Điều hướng dựa trên role
    if (profile?.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  } catch (err) {
    hideLoading()
    console.error('Lỗi ngoại lệ:', err)
    message.error('Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.')
    router.push('/')
  }
}

// --- QUÊN MẬT KHẨU ---
const handleForgotPassword = async () => {
  if (!forgotEmail.value) {
    message.warning('Vui lòng nhập email của bạn!')
    return
  }

  isLoadingResetPassword.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      message.error('Lỗi: ' + error.message)
    } else {
      message.success('Gửi link reset thành công! Hãy kiểm tra hòm thư của bạn.')
      showForgotModal.value = false
      forgotEmail.value = ''
    }
  } catch (err) {
    message.error('Lỗi hệ thống: ' + err.message)
  } finally {
    isLoadingResetPassword.value = false
  }
}
</script>
s
