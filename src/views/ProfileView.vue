<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const stats = ref({
  followedCount: 0,
  historyCount: 0,
  messageCount: 0,
})

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

      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          class="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-50"
        >
          <span class="font-bold text-gray-700">Chỉnh sửa thông tin cá nhân</span>
          <font-awesome-icon icon="fa-solid fa-user-pen" class="text-gray-400" />
        </div>
        <div
          class="p-4 hover:bg-red-50 flex items-center justify-between cursor-pointer text-red-500 font-bold"
          @click="(supabase.auth.signOut(), router.push('/'))"
        >
          <span>Đăng xuất</span>
          <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
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
