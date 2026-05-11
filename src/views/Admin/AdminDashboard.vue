<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col"
  >
    <AdminHeader :username="userProfile?.username" @logout="handleLogout" />

    <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 flex-1 w-full">
      <div class="px-4 sm:px-0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-8">
          <StatCard
            title="Tổng User"
            :value="stats.totalUsers"
            icon="👥"
            colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
            @click="router.push('/admin/users')"
          />
          <StatCard
            title="Tổng Truyện"
            :value="stats.totalMangas"
            icon="📚"
            colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
            @click="router.push('/admin/manga')"
          />
          <StatCard
            title="Lượt Đọc"
            :value="stats.totalReads"
            icon="📖"
            colorClass="bg-gradient-to-br from-purple-500 to-pink-500"
            @click="router.push('/admin/dashboard')"
          />
          <StatCard
            title="Đánh Giá"
            :value="stats.totalRatings"
            icon="⭐"
            colorClass="bg-gradient-to-br from-amber-400 to-orange-500"
            @click="router.push('/admin/dashboard')"
          />
        </div>

        <div
          class="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden transition-colors duration-300"
        >
          <div
            class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600"
          ></div>
          <div
            class="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"
          ></div>

          <div class="relative z-10 pl-4">
            <h2
              class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight"
            >
              <span class="text-3xl drop-shadow-sm">🧠</span> Trung tâm Dữ liệu AI (Vector Search)
            </h2>
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed"
            >
              Đồng bộ nội dung truyện thành Vector Embedding để siêu AI có thể "đọc", "hiểu" và tư
              vấn chính xác nhất cho người dùng.
            </p>
          </div>

          <div class="relative z-10 shrink-0 w-full md:w-auto pl-4 md:pl-0">
            <a-button
              type="primary"
              size="large"
              class="w-full md:w-auto !h-12 !px-8 !bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 !border-none !rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 active:scale-95 transition-all"
              :loading="isSyncing"
              @click="handleSyncAI"
            >
              🚀 Nạp 50 truyện mới nhất
            </a-button>
          </div>
        </div>
        <QuickActions @changeSection="navigateToSection" />

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
import { message } from 'ant-design-vue'

// Import Layout Components
import AdminHeader from '@/components/Admin/AdminHeader.vue'
import StatCard from '@/components/Admin/StatCard.vue'
import QuickActions from '@/components/Admin/QuickActions.vue'

// Import hàm nạp dữ liệu AI
import { sync50Mangas } from '@/services/AI/syncManga.js'

const router = useRouter()
const userProfile = ref(null)
const stats = ref({ totalUsers: 0, totalMangas: 0, totalReads: 0, totalRatings: 0 })

// Trạng thái loading của nút nạp AI
const isSyncing = ref(false)

/**
 * Xử lý sự kiện khi bấm nút nạp dữ liệu AI
 */
const handleSyncAI = async () => {
  isSyncing.value = true
  message.loading({
    content: 'Đang nạp dữ liệu truyện vào não AI, vui lòng không tắt trang...',
    key: 'sync_ai',
    duration: 0,
  })

  try {
    await sync50Mangas()
    message.success({
      content: 'Tuyệt vời! AI đã học xong 50 bộ truyện mới.',
      key: 'sync_ai',
      duration: 3,
    })
  } catch (err) {
    console.error('Lỗi nạp AI:', err)
    message.error({
      content: 'Có lỗi xảy ra khi nạp. Hãy kiểm tra tab Console (F12).',
      key: 'sync_ai',
      duration: 3,
    })
  } finally {
    isSyncing.value = false
  }
}

/**
 * Điều hướng trang dựa trên event từ QuickActions
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
    const [usersCount, readsCount, otruyenRes, mangas] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('reading_history').select('*', { count: 'exact', head: true }),
      axios.get('https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=1'),
      supabase.from('mangas').select('*', { count: 'exact', head: true }),
    ])

    const totalApiMangas = otruyenRes.data?.data?.params?.pagination?.totalItems || 0
    const totalLocalMangas = mangas.count || 0

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
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
