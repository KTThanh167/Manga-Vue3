<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header giữ cố định -->
    <AdminHeader :username="userProfile?.username" @logout="handleLogout" />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Khu vực Stats Card: Bây giờ đóng vai trò như các phím tắt điều hướng -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng User"
            :value="stats.totalUsers"
            icon="👥"
            colorClass="bg-blue-500"
            @click="router.push('/admin/users')"
          />
          <StatCard
            title="Tổng Truyện"
            :value="stats.totalMangas"
            icon="📚"
            colorClass="bg-green-500"
            @click="router.push('/admin/manga')"
          />
          <StatCard
            title="Lượt Đọc"
            :value="stats.totalReads"
            icon="📖"
            colorClass="bg-purple-500"
            @click="router.push('/admin/dashboard')"
          />
          <StatCard
            title="Đánh Giá"
            :value="stats.totalRatings"
            icon="⭐"
            colorClass="bg-yellow-500"
            @click="router.push('/admin/dashboard')"
          />
        </div>

        <!-- Thanh hành động nhanh -->
        <QuickActions @changeSection="navigateToSection" />

        <!-- KHU VỰC QUAN TRỌNG NHẤT: Nội dung thay đổi theo URL -->
        <div class="mt-8">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Import Layout Components
import AdminHeader from '@/components/Admin/AdminHeader.vue'
import StatCard from '@/components/Admin/StatCard.vue'
import QuickActions from '@/components/Admin/QuickActions.vue'

const router = useRouter()
const userProfile = ref(null)
const stats = ref({ totalUsers: 0, totalMangas: 0, totalReads: 0, totalRatings: 0 })

/**
 * Điều hướng trang dựa trên event từ QuickActions
 * Giúp đồng bộ URL và tránh mất trang khi Reload
 */
const navigateToSection = (section) => {
  const routes = {
    users: '/admin/users',
    mangas: '/admin/manga',
    local_mangas: '/admin/local-manga',
    reports: '/admin/dashboard',
    settings: '/admin/dashboard',
  }

  if (routes[section]) {
    router.push(routes[section])
  }
}

const fetchStats = async () => {
  try {
    const [usersCount, readsCount, otruyenRes, localMangas] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('reading_history').select('*', { count: 'exact', head: true }),
      axios.get('https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=1'),
      supabase.from('local_mangas').select('*', { count: 'exact', head: true }),
    ])

    const totalApiMangas = otruyenRes.data?.data?.params?.pagination?.totalItems || 0
    const totalLocalMangas = localMangas.count || 0

    stats.value = {
      totalUsers: usersCount.count || 0,
      totalMangas: totalApiMangas + totalLocalMangas,
      totalReads: readsCount.count || 0,
      totalRatings: 0,
    }
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu thống kê:', err)
  }
}

const checkAdminAccess = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    userProfile.value = {
      username: user.user_metadata?.full_name || user.email,
    }
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

<style scoped>
/* Hiệu ứng chuyển tab mượt mà */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
