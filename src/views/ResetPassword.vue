<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center text-indigo-600">Đặt lại mật khẩu</h2>

      <form @submit.prevent="handleResetPassword">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <div class="relative mt-1">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black pr-10"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <span v-if="showNewPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <div class="relative mt-1">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black pr-10"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <span v-if="showConfirmPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <div
          v-if="message"
          :class="[
            'mb-4 p-3 rounded text-sm text-center',
            message.includes('Lỗi') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600',
          ]"
        >
          {{ message }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          :class="[
            'w-full py-2 px-4 rounded-md transition font-medium',
            isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700',
          ]"
        >
          <span v-if="isLoading" class="inline-block mr-2">⏳</span>
          {{ isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-black/70">
        Nhớ mật khẩu rồi?
        <router-link to="/login" class="text-indigo-600 hover:underline"
          >Quay lại đăng nhập</router-link
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const message = ref('')
const isLoading = ref(false)
const router = useRouter()

const handleResetPassword = async () => {
  // Validate mật khẩu
  if (newPassword.value.length < 6) {
    message.value = 'Lỗi: Mật khẩu phải tối thiểu 6 ký tự'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Lỗi: Mật khẩu không khớp'
    return
  }

  isLoading.value = true
  message.value = ''

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (error) {
      message.value = 'Lỗi: ' + error.message
    } else {
      message.value = 'Cập nhật mật khẩu thành công! Đang chuyển đến trang đăng nhập...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (err) {
    message.value = 'Lỗi: ' + err.message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Kiểm tra xem có token trong URL không
  const hash = window.location.hash
  if (!hash.includes('access_token')) {
    message.value = 'Lỗi: Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới'
  }
})
</script>
