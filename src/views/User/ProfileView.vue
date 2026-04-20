<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// State chính để lưu thông tin và thống kê người dùng
const loading = ref(true)
const stats = ref({
  followedCount: 0,
  historyCount: 0,
  messageCount: 0,
})

// State cho phần chỉnh sửa Profile
const isEditing = ref(false)
const editData = ref({
  username: '',
  avatar_url: '',
})
const updating = ref(false)

// State cho phần đổi mật khẩu
const isChangingPassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const oldPassword = ref('')

const fetchUserStats = async () => {
  if (!authStore.user) return

  // 1. Đếm số bookmark
  const { count: followCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authStore.user.id)

  // 2. Đếm lịch sử đọc
  const { count: readCount } = await supabase
    .from('reading_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authStore.user.id)

  // 3. Đếm tin nhắn (nếu muốn)
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

// Khởi tạo dữ liệu sửa khi mở Form
const startEdit = () => {
  editData.value = {
    username: authStore.profile.username,
    avatar_url: authStore.profile.avatar_url,
  }
  isEditing.value = true
}

// Hàm cập nhật Profile lên Supabase
const handleUpdateProfile = async () => {
  updating.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: editData.value.username,
        avatar_url: editData.value.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authStore.user.id)

    if (error) throw error

    // Cập nhật lại store để UI thay đổi theo
    await authStore.fetchProfile()
    isEditing.value = false
    alert('Cập nhật thông tin thành công!')
  } catch (error) {
    alert('Lỗi cập nhật: ' + error.message)
  } finally {
    updating.value = false
  }
}

// Hàm xử lý đổi mật khẩu
const handleUpdatePassword = async () => {
  if (!oldPassword.value || !newPassword.value) {
    alert('Vui lòng nhập đầy đủ thông tin!')
    return
  }

  passwordLoading.value = true

  try {
    // BƯỚC 1: Xác thực mật khẩu cũ
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authStore.user.email,
      password: oldPassword.value,
    })

    if (signInError) {
      throw new Error('Mật khẩu hiện tại không chính xác!')
    }

    // BƯỚC 2: Thêm một chút chờ đợi nhỏ (khoảng 500ms) để Session ổn định
    await new Promise((resolve) => setTimeout(resolve, 500))

    // BƯỚC 3: Cập nhật mật khẩu mới
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (updateError) throw updateError

    // BƯỚC 4: Xóa sạch Session và yêu cầu đăng nhập lại
    alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.')

    // Quan trọng: Clear hoàn toàn dữ liệu local
    await supabase.auth.signOut()

    // Reset form
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
  await fetchUserStats()
  loading.value = false
})
</script>

<template>
  <div class="p-4 md:p-6 max-w-4xl mx-auto min-h-screen">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
    </div>

    <div v-else-if="authStore.profile">
      <div
        class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-6"
      >
        <img
          :src="
            authStore.profile.avatar_url ||
            'https://ui-avatars.com/api/?name=' + authStore.profile.username
          "
          class="w-24 h-24 rounded-full border-4 border-indigo-50 object-cover"
        />
        <div class="text-center md:text-left">
          <h1 class="text-2xl font-black text-gray-800">{{ authStore.profile.username }}</h1>
          <p class="text-indigo-600 font-bold text-sm uppercase tracking-widest">
            {{ authStore.profile.role || 'Độc giả' }}
          </p>
          <p class="text-gray-400 text-xs mt-2">{{ authStore.profile.email }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          @click="router.push('/bookmark')"
          class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-indigo-50 transition"
        >
          <p class="text-gray-400 text-xs font-bold uppercase mb-1">Theo dõi</p>
          <p class="text-2xl font-black text-indigo-600">{{ stats.followedCount }} bộ</p>
        </div>

        <div
          @click="router.push('/history')"
          class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-blue-50 transition"
        >
          <p class="text-gray-400 text-xs font-bold uppercase mb-1">Đã đọc</p>
          <p class="text-2xl font-black text-blue-600">{{ stats.historyCount }} bộ</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-gray-400 text-xs font-bold uppercase mb-1">Tin nhắn</p>
          <p class="text-2xl font-black text-green-600">{{ stats.messageCount }}</p>
        </div>
      </div>

      <div
        @click="startEdit"
        class="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-50"
      >
        <span class="font-bold text-gray-700">Chỉnh sửa thông tin cá nhân</span>
        <font-awesome-icon icon="fa-solid fa-user-pen" class="text-gray-400" />
      </div>

      <!-- Đổi mật khẩu -->
      <div
        @click="isChangingPassword = true"
        class="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-50"
      >
        <span class="font-bold text-gray-700">Đổi mật khẩu</span>
        <font-awesome-icon icon="fa-solid fa-lock" class="text-gray-400" />
      </div>

      <!-- Modal chỉnh sửa Profile -->
      <div
        v-if="isEditing"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300"
        >
          <h2 class="text-xl font-black mb-6 text-gray-800">Cập nhật hồ sơ</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
                >Tên hiển thị</label
              >
              <input
                v-model="editData.username"
                type="text"
                class="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
                >Link ảnh đại diện (URL)</label
              >
              <input
                v-model="editData.avatar_url"
                type="text"
                placeholder="https://..."
                class="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button
              @click="isEditing = false"
              class="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              @click="handleUpdateProfile"
              :disabled="updating"
              class="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition disabled:opacity-50"
            >
              {{ updating ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal đổi mật khẩu -->
      <div
        v-if="isChangingPassword"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300"
        >
          <h2 class="text-xl font-black mb-6 text-gray-800">Đổi mật khẩu mới</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
                >Mật khẩu hiện tại</label
              >
              <input
                v-model="oldPassword"
                type="password"
                placeholder="Nhập mật khẩu đang dùng"
                class="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none transition"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
                >Mật khẩu mới</label
              >
              <input
                v-model="newPassword"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                class="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
                >Xác nhận mật khẩu</label
              >
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                class="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button
              @click="isChangingPassword = false"
              class="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              @click="handleUpdatePassword"
              :disabled="passwordLoading"
              class="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition disabled:opacity-50"
            >
              {{ passwordLoading ? 'Đang cập nhật...' : 'Cập nhật' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="mb-4 font-bold text-gray-500">Vui lòng đăng nhập để xem hồ sơ</p>
      <router-link to="/login" class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold"
        >Đăng nhập</router-link
      >
    </div>
  </div>
</template>
