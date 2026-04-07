<template>
  <div class="min-h-screen bg-gray-100">
    <AdminHeader :username="userProfile?.username" @logout="handleLogout" />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng User"
            :value="stats.totalUsers"
            icon="👥"
            colorClass="bg-blue-500"
            @click="showSection = 'users'"
          />
          <StatCard
            title="Tổng Truyện"
            :value="stats.totalMangas"
            icon="📚"
            colorClass="bg-green-500"
            @click="showSection = 'mangas'"
          />
          <StatCard
            title="Lượt Đọc"
            :value="stats.totalReads"
            icon="📖"
            colorClass="bg-purple-500"
            @click="showSection = 'reads'"
          />
          <StatCard
            title="Đánh Giá"
            :value="stats.totalRatings"
            icon="⭐"
            colorClass="bg-yellow-500"
            @click="showSection = 'ratings'"
          />
        </div>

        <QuickActions @changeSection="(section) => (showSection = section)" />

        <div class="mt-8">
          <UserManagement v-if="showSection === 'users'" />
          <MangaManagement v-if="showSection === 'mangas'" />

          <div v-else-if="showSection === 'reports'" class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Báo Cáo & Thống Kê</h3>
            <p class="text-gray-500">Tính năng đang phát triển...</p>
          </div>

          <div v-else-if="showSection === 'settings'" class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Cài Đặt Hệ Thống</h3>
            <p class="text-gray-500">Tính năng đang phát triển...</p>
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
import axios from 'axios'

// Import components mới
import AdminHeader from '../components/Admin/AdminHeader.vue'
import StatCard from '../components/Admin/StatCard.vue'
import QuickActions from '../components/Admin/QuickActions.vue'
import UserManagement from '../components/Admin/UserManagement.vue'
import MangaManagement from '../components/Admin/MangaManagement.vue'

const router = useRouter()
const userProfile = ref(null)
const showSection = ref('users') // Mặc định hiện quản lý user
const stats = ref({ totalUsers: 0, totalMangas: 0, totalReads: 0, totalRatings: 0 })

// --- Các hàm Logic (giữ nguyên từ file cũ của bạn) ---
const checkAdminAccess = async () => {
  /* logic check admin của bạn */
}
const fetchStats = async () => {
  try {
    // Chạy song song: 2 câu lệnh từ Supabase và 1 câu lệnh từ API Otruyen
    const [usersCount, readsCount, otruyenRes] = await Promise.all([
      // 1. Lấy tổng User từ Supabase
      supabase.from('profiles').select('*', { count: 'exact', head: true }),

      // 2. Lấy tổng lượt đọc từ Supabase
      supabase.from('reading_history').select('*', { count: 'exact', head: true }),

      // 3. Lấy dữ liệu danh sách mới nhất từ Otruyen để lấy con số tổng (totalItems)
      axios.get('https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=1'),
    ])

    // Trích xuất con số tổng từ kết quả API
    // Cấu trúc API Otruyen: res.data.data.params.pagination.totalItems
    const totalApiMangas = otruyenRes.data?.data?.params?.pagination?.totalItems || 0

    stats.value = {
      totalUsers: usersCount.count || 0,
      totalMangas: totalApiMangas || 0,
      totalReads: readsCount.count || 0,
      totalRatings: 0,
    }

    console.log('Cập nhật thống kê thành công:', stats.value)
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu thống kê:', err)
  }
}
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(async () => {
  await checkAdminAccess()
  await fetchStats()
})
</script>
