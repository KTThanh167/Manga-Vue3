<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-500"
  >
    <div
      class="hidden dark:block absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"
    ></div>
    <div
      class="hidden dark:block absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"
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
          Tạo tài khoản để lưu truyện yêu thích
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label
            class="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-2"
            >Tên hiển thị</label
          >
          <div class="relative group">
            <input
              v-model="username"
              type="text"
              required
              placeholder="VD: Songoku"
              class="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-2"
            >Email</label
          >
          <div class="relative group">
            <input
              v-model="email"
              type="email"
              required
              placeholder="ten@example.com"
              class="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                ></path>
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-2"
            >Mật khẩu</label
          >
          <div class="relative group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
            >
              <EyeOutlined v-if="showPassword" class="text-lg" />
              <EyeInvisibleOutlined v-else class="text-lg" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isRegistering"
          class="w-full mt-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-700 text-white font-black tracking-widest shadow-xl shadow-indigo-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg
            v-if="isRegistering"
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
          {{ isRegistering ? 'ĐANG TẠO TÀI KHOẢN...' : 'ĐĂNG KÝ NGAY' }}
        </button>
      </form>

      <div
        class="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center text-sm text-gray-500 dark:text-slate-400"
      >
        Đã có tài khoản?
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
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const email = ref('')
const password = ref('')
const username = ref('')
const showPassword = ref(false)
const isRegistering = ref(false) // Trạng thái loading cho nút bấm
const router = useRouter()

const handleRegister = async () => {
  if (password.value.length < 6) {
    message.warning('Mật khẩu phải chứa ít nhất 6 ký tự!')
    return
  }

  isRegistering.value = true
  const hideLoading = message.loading('Đang khởi tạo tài khoản...', 0)

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: { username: username.value },
      },
    })

    if (error) {
      hideLoading()
      if (error.message.includes('already registered')) {
        message.error('Email này đã được đăng ký. Vui lòng dùng email khác!')
      } else {
        message.error('Đăng ký thất bại: ' + error.message)
      }
      return
    }

    hideLoading()

    // Supabase behavior: Trả về session = null nếu bật Confirm Email trong cài đặt
    if (data.user && data.session === null) {
      message.success({
        content: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
        duration: 5,
      })
      router.push('/login')
    } else {
      message.success('Tạo tài khoản thành công! Chào mừng đến với Manga Real.')
      router.push('/')
    }
  } catch (err) {
    console.error('Registration error:', err)
    hideLoading()
    message.error('Lỗi hệ thống, vui lòng thử lại sau.')
  } finally {
    isRegistering.value = false
  }
}
</script>

<style scoped>
/* Hiệu ứng đốm sáng chuyển động chậm giống trang Login */
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
