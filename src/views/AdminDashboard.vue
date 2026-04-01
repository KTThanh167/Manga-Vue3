<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">Xin chào, {{ userProfile?.username }}</span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            @click="showSection = 'users'"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span class="text-white text-sm font-bold">👥</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Tổng User</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.totalUsers }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            @click="showSection = 'mangas'"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span class="text-white text-sm font-bold">📚</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Tổng Truyện</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.totalMangas }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            @click="showSection = 'reads'"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span class="text-white text-sm font-bold">📖</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Lượt Đọc</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.totalReads }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            @click="showSection = 'ratings'"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span class="text-white text-sm font-bold">⭐</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Đánh Giá</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.totalRatings }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white shadow rounded-lg mb-8">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Quản Lý Nhanh</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                @click="showSection = 'users'"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium transition"
              >
                👥 Quản Lý User
              </button>
              <button
                @click="showSection = 'reports'"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md text-sm font-medium transition"
              >
                🚨 Báo Cáo
              </button>
              <button
                @click="showSection = 'settings'"
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-md text-sm font-medium transition"
              >
                ⚙️ Cài Đặt
              </button>
            </div>
          </div>
        </div>

        <!-- Dynamic Content -->
        <UserManagement v-if="showSection === 'users'" ref="userManagementRef" />
        <MangaManagement v-if="showSection === 'mangas'" ref="mangaManagementRef" />

        <div v-else-if="showSection === 'reports'" class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Báo Cáo & Thống Kê</h3>
            <p class="text-gray-500">Tính năng báo cáo đang được phát triển...</p>
          </div>
        </div>

        <div v-else-if="showSection === 'settings'" class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Cài Đặt Hệ Thống</h3>
            <p class="text-gray-500">Tính năng cài đặt đang được phát triển...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'
import UserManagement from '../components/Admin/UserManagement.vue'
import MangaManagement from '../components/Admin/MangaManagement.vue'

const router = useRouter()
const userProfile = ref(null)
const stats = ref({
  totalUsers: 0,
  totalMangas: 0,
  totalReads: 0,
  totalRatings: 0,
})
const showSection = ref('')
const userManagementRef = ref(null)
const mangaManagementRef = ref(null)

// Kiểm tra quyền admin

const checkAdminAccess = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    router.push('/login')
    return false
  }

  // FIX: Dùng app_metadata để check quyền
  const userRole = user.app_metadata?.role

  if (userRole !== 'admin') {
    alert('Bạn không có quyền truy cập trang này!')
    router.push('/')
    return false
  }

  // Vẫn lấy profile để hiển thị username lên giao diện
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  userProfile.value = profile
  return true
}

// Lấy thống kê
const fetchStats = async () => {
  try {
    // Đếm tổng user
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Đếm lượt đọc
    const { count: readCount } = await supabase
      .from('reading_history')
      .select('*', { count: 'exact', head: true })

    stats.value = {
      totalUsers: userCount || 0,
      totalMangas: 1000, // Mock data - có thể fetch từ API external
      totalReads: readCount || 0,
      totalRatings: 0, // Mock data
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Đăng xuất
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(async () => {
  if (await checkAdminAccess()) {
    await fetchStats()
  }
})
</script>
