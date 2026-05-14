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
          Thế giới truyện tranh trong tầm tay
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
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
              class="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <span
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
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
              class="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
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

        <div class="flex justify-end">
          <button
            type="button"
            @click="showForgotModal = true"
            class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-700 text-white font-black tracking-widest shadow-xl shadow-indigo-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          ĐĂNG NHẬP NGAY
        </button>
      </form>

      <div class="mt-6">
        <div class="relative flex items-center">
          <div class="flex-grow border-t border-gray-200 dark:border-white/10"></div>
          <span
            class="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest font-semibold"
            >hoặc</span
          >
          <div class="flex-grow border-t border-gray-200 dark:border-white/10"></div>
        </div>

        <button
          @click="loginWithGoogle"
          :disabled="isGoogleLoading"
          type="button"
          class="mt-6 w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold tracking-widest shadow-sm transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {{ isGoogleLoading ? 'ĐANG CHUYỂN HƯỚNG...' : 'TIẾP TỤC VỚI GOOGLE' }}
        </button>
      </div>
      <div
        class="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center text-sm text-gray-500 dark:text-slate-400"
      >
        Bạn là thành viên mới?
        <router-link
          to="/register"
          class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
          >Tạo tài khoản</router-link
        >
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showForgotModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-white/10"
        >
          <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">
            Khôi phục
          </h3>
          <p class="text-gray-500 dark:text-slate-400 text-sm text-center mb-6">
            Nhập email liên kết với tài khoản của bạn
          </p>

          <input
            v-model="forgotEmail"
            type="email"
            class="w-full px-4 py-3 bg-gray-100 dark:bg-slate-900 border border-transparent dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 mb-4 outline-none"
            placeholder="email@gmail.com"
          />

          <div class="flex gap-3">
            <button
              @click="showForgotModal = false"
              class="flex-1 py-3 px-4 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              @click="handleForgotPassword"
              :disabled="isLoadingResetPassword"
              class="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 disabled:opacity-50"
            >
              {{ isLoadingResetPassword ? '...' : 'Gửi' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
const isLoadingResetPassword = ref(false)
const isGoogleLoading = ref(false) // Thêm biến loading cho Google
const router = useRouter()

const handleLogin = async () => {
  // 1. Dùng 'key' để quản lý thông báo, tránh lỗi crash khi gọi hàm ẩn loading
  message.loading({ content: 'Manga Real đang xác thực...', key: 'loginProcess', duration: 0 })

  try {
    // 2. Cực kỳ quan trọng: Trim dữ liệu đầu vào
    // Loại bỏ mọi khoảng trắng thừa để quá trình so sánh thông tin chính xác tuyệt đối
    const cleanEmail = email.value.trim()
    const cleanPassword = password.value.trim()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    })

    if (error) {
      // Hủy thông báo loading thông qua key
      message.destroy('loginProcess')
      message.error('Sai tài khoản hoặc mật khẩu!')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', data.user.id)
      .single()

    message.destroy('loginProcess')
    message.success(`Chào mừng ${profile?.username || 'độc giả'} trở lại!`)

    profile?.role === 'admin' ? router.push('/admin/dashboard') : router.push('/')
  } catch (err) {
    console.error('Login error:', err)
    message.destroy('loginProcess')
    message.error('Lỗi hệ thống rồi Thành ơi!')
  }
}

// BỔ SUNG HÀM ĐĂNG NHẬP BẰNG GOOGLE
const loginWithGoogle = async () => {
  isGoogleLoading.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
  } catch (err) {
    console.error('Lỗi đăng nhập Google:', err.message)
    message.error('Không thể đăng nhập bằng Google lúc này!')
    isGoogleLoading.value = false // Chỉ tắt loading nếu có lỗi, nếu thành công trình duyệt sẽ tự chuyển trang
  }
}

const handleForgotPassword = async () => {
  if (!forgotEmail.value) {
    message.warning('Nhập email đã chứ!')
    return
  }
  isLoadingResetPassword.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) message.error(error.message)
    else {
      message.success('Check mail nhé!')
      showForgotModal.value = false
    }
  } finally {
    isLoadingResetPassword.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

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
