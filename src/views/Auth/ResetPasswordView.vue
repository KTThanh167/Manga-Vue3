<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-500"
  >
    <div
      class="hidden dark:block absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"
    ></div>
    <div
      class="hidden dark:block absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"
    ></div>

    <div
      class="w-full max-w-md p-8 bg-white dark:bg-white/10 dark:backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-3xl shadow-2xl relative z-10 mx-4"
    >
      <div class="text-center mb-8">
        <h2
          class="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
        >
          MANGA REAL
        </h2>
        <p class="text-gray-500 dark:text-slate-300 text-sm mt-2 font-medium">
          Khôi phục quyền truy cập
        </p>
      </div>

      <form @submit.prevent="handleResetPassword" class="space-y-5">
        <div>
          <label
            class="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-2"
            >Mật khẩu mới</label
          >
          <div class="relative group">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              minlength="6"
              placeholder="Tối thiểu 6 ký tự"
              :disabled="!isValidLink"
              class="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </span>
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              :disabled="!isValidLink"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
            >
              <EyeOutlined v-if="showNewPassword" class="text-lg" />
              <EyeInvisibleOutlined v-else class="text-lg" />
            </button>
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-2"
            >Xác nhận mật khẩu</label
          >
          <div class="relative group">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              minlength="6"
              placeholder="Nhập lại mật khẩu mới"
              :disabled="!isValidLink"
              class="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </span>
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              :disabled="!isValidLink"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
            >
              <EyeOutlined v-if="showConfirmPassword" class="text-lg" />
              <EyeInvisibleOutlined v-else class="text-lg" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isValidLink"
          class="w-full mt-4 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-700 text-white font-black tracking-widest shadow-xl shadow-indigo-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg
            v-if="isLoading"
            class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isLoading ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU' }}
        </button>
      </form>

      <div
        class="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center text-sm text-gray-500 dark:text-slate-400"
      >
        Bạn đã nhớ ra mật khẩu?
        <router-link
          to="/login"
          class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
          >Đăng nhập ngay</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const isValidLink = ref(true)
const router = useRouter()

const handleResetPassword = async () => {
  if (newPassword.value.length < 6) {
    message.warning('Mật khẩu phải tối thiểu 6 ký tự!')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.error('Mật khẩu xác nhận không khớp!')
    return
  }

  isLoading.value = true
  const hideLoading = message.loading('Đang cập nhật mật khẩu...', 0)

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    hideLoading()

    if (error) {
      message.error('Lỗi cập nhật: ' + error.message)
    } else {
      message.success('Đổi mật khẩu thành công! Đang chuyển hướng...', 2)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (err) {
    hideLoading()
    message.error('Lỗi hệ thống: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Supabase gửi token qua URL hash (ví dụ: #access_token=...)
  // Nếu người dùng truy cập trực tiếp trang này mà không qua link email, sẽ khóa form lại
  const hash = window.location.hash
  if (!hash || (!hash.includes('access_token') && !hash.includes('type=recovery'))) {
    isValidLink.value = false
    message.error({
      content: 'Đường dẫn không hợp lệ hoặc đã hết hạn! Vui lòng yêu cầu lại link khôi phục.',
      duration: 5,
    })
  }
})
</script>

<style scoped>
/* Hiệu ứng đốm sáng chuyển động chậm giống 2 trang Login/Register */
@keyframes blob {
  0%,
  100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
