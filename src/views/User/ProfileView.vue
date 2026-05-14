<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// State chính
const loading = ref(true)
const stats = ref({
  followedCount: 0,
  historyCount: 0,
  messageCount: 0,
})

// Kiểm tra xem user đăng nhập bằng Google hay Email/Password
const isGoogleUser = computed(() => {
  return authStore.user?.app_metadata?.provider === 'google'
})

// State Profile
const isEditing = ref(false)
const editData = ref({
  username: '',
})
const updating = ref(false)

// State Đổi mật khẩu
const isChangingPassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const oldPassword = ref('')

const fetchUserStats = async () => {
  if (!authStore.user) return

  const { count: followCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authStore.user.id)

  const { count: readCount } = await supabase
    .from('reading_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authStore.user.id)

  const { count: msgCount } = await supabase
    .from('global_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authStore.user.id)

  stats.value = {
    followedCount: followCount || 0,
    historyCount: readCount || 0,
    messageCount: msgCount || 0,
  }
}

const startEdit = () => {
  editData.value = {
    username: authStore.profile?.username || '',
  }
  isEditing.value = true
}

const handleUpdateProfile = async () => {
  if (!editData.value.username.trim()) {
    alert('Tên hiển thị không được để trống!')
    return
  }

  updating.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: editData.value.username,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authStore.user.id)

    if (error) throw error

    await authStore.fetchProfile()
    isEditing.value = false
    alert('Cập nhật thông tin thành công!')
  } catch (error) {
    alert('Lỗi cập nhật: ' + error.message)
  } finally {
    updating.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    alert('Vui lòng nhập đầy đủ thông tin!')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    alert('Mật khẩu xác nhận không khớp!')
    return
  }

  passwordLoading.value = true
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authStore.user.email,
      password: oldPassword.value,
    })

    if (signInError) throw new Error('Mật khẩu hiện tại không chính xác!')

    await new Promise((resolve) => setTimeout(resolve, 500))

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (updateError) throw updateError

    alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.')
    await supabase.auth.signOut()

    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    isChangingPassword.value = false

    router.push('/login')
  } catch (error) {
    alert(error.message)
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await authStore.fetchProfile()
  if (authStore.user) {
    await fetchUserStats()
  }
  loading.value = false
})

// THEO DÕI SỰ THAY ĐỔI CỦA USER THAY VÌ CHẠY 1 LẦN TRÊN MOUNTED
watch(
  () => authStore.profile,
  async (newProfile) => {
    if (newProfile) {
      await fetchUserStats()
      loading.value = false
    }
  },
)
</script>

<template>
  <div
    class="p-4 md:p-8 max-w-4xl mx-auto min-h-[calc(100vh-200px)] animate-in fade-in duration-500"
  >
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="relative w-16 h-16 mb-4">
        <div
          class="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-800"
        ></div>
        <div
          class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"
        ></div>
      </div>
      <p class="text-gray-500 dark:text-gray-400 font-medium">Đang tải hồ sơ...</p>
    </div>

    <div v-else-if="authStore.profile" class="space-y-6">
      <div
        class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-colors duration-300"
      >
        <div
          class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div class="relative z-10 shrink-0">
          <div
            class="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
          >
            <img
              :src="
                authStore.profile.avatar_url ||
                'https://ui-avatars.com/api/?name=' +
                  authStore.profile.username +
                  '&background=random&color=fff'
              "
              class="w-full h-full rounded-full border-4 border-white dark:border-slate-900 object-cover bg-white dark:bg-slate-800"
              alt="Avatar"
            />
          </div>
        </div>

        <div class="text-center md:text-left relative z-10 flex-1">
          <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
            {{ authStore.profile.username }}
          </h1>
          <div class="flex items-center justify-center md:justify-start gap-3 mt-2">
            <span
              class="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-500/30"
            >
              {{ authStore.profile.role || 'Độc giả' }}
            </span>
            <span
              class="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
              {{ authStore.profile.email }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          @click="router.push('/bookmark')"
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div class="flex items-center gap-4 mb-3">
            <div
              class="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-500/20 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                ></path>
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
              Theo dõi
            </p>
          </div>
          <p class="text-3xl font-black text-gray-900 dark:text-white">
            {{ stats.followedCount }} <span class="text-base font-semibold text-gray-400">bộ</span>
          </p>
        </div>

        <div
          @click="router.push('/history')"
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div class="flex items-center gap-4 mb-3">
            <div
              class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
              Đã đọc
            </p>
          </div>
          <p class="text-3xl font-black text-gray-900 dark:text-white">
            {{ stats.historyCount }} <span class="text-base font-semibold text-gray-400">bộ</span>
          </p>
        </div>

        <div
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-lg transition-colors duration-300"
        >
          <div class="flex items-center gap-4 mb-3">
            <div
              class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                ></path>
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
              Tin nhắn
            </p>
          </div>
          <p class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.messageCount }}</p>
        </div>
      </div>

      <div
        class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300"
      >
        <div
          @click="startEdit"
          class="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 transition-colors group"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                ></path>
              </svg>
            </div>
            <span class="font-bold text-gray-800 dark:text-gray-200"
              >Chỉnh sửa thông tin cá nhân</span
            >
          </div>
          <svg
            class="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </div>

        <div
          v-if="!isGoogleUser"
          @click="isChangingPassword = true"
          class="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 flex items-center justify-center group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-500/20 dark:group-hover:text-purple-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <span class="font-bold text-gray-800 dark:text-gray-200">Đổi mật khẩu</span>
          </div>
          <svg
            class="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </div>
      </div>

      <div
        v-if="isEditing"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Cập nhật hồ sơ</h2>
            <button
              @click="isEditing = false"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="space-y-5">
            <div>
              <label
                class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
                >Tên hiển thị</label
              >
              <input
                v-model="editData.username"
                type="text"
                placeholder="Nhập tên của bạn"
                class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button
              @click="isEditing = false"
              class="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="handleUpdateProfile"
              :disabled="updating"
              class="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {{ updating ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="isChangingPassword"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Đổi mật khẩu</h2>
            <button
              @click="isChangingPassword = false"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label
                class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
                >Mật khẩu hiện tại</label
              >
              <input
                v-model="oldPassword"
                type="password"
                placeholder="Nhập mật khẩu đang dùng"
                class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label
                class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
                >Mật khẩu mới</label
              >
              <input
                v-model="newPassword"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label
                class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
                >Xác nhận mật khẩu</label
              >
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button
              @click="isChangingPassword = false"
              class="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="handleUpdatePassword"
              :disabled="passwordLoading"
              class="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {{ passwordLoading ? 'Đang xử lý...' : 'Cập nhật' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center py-32 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-slate-800"
    >
      <div
        class="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-gray-400"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          ></path>
        </svg>
      </div>
      <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">Chưa đăng nhập</h2>
      <p class="mb-8 text-gray-500 dark:text-gray-400 font-medium">
        Vui lòng đăng nhập để xem và quản lý hồ sơ của bạn
      </p>
      <router-link
        to="/login"
        class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
      >
        Đến trang Đăng nhập
      </router-link>
    </div>
  </div>
</template>
