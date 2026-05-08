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
// Giữ nguyên phần logic cũ của bạn nhé Thành, mình chỉ tút tát giao diện thôi!
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
const router = useRouter()

const handleLogin = async () => {
  const hideLoading = message.loading('Manga Real đang xác thực...', 0)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) {
      hideLoading()
      message.error('Sai tài khoản hoặc mật khẩu!')
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', data.user.id)
      .single()
    hideLoading()
    message.success(`Chào mừng ${profile?.username || 'độc giả'} trở lại!`)
    profile?.role === 'admin' ? router.push('/admin/dashboard') : router.push('/')
  } catch (err) {
    console.error('Login error:', err)
    hideLoading()
    message.error('Lỗi hệ thống rồi Thành ơi!')
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
