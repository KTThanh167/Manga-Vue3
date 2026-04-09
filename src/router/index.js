import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import { supabase } from '../lib/supabaseClient'

//Import Layout
import MainLayout from '@/Layouts/MainLayout.vue'
import AuthLayout from '@/Layouts/AuthLayout.vue'
import EmptyLayout from '@/Layouts/EmptyLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- CỤM 1: CÁC TRANG DÙNG MAIN LAYOUT ---
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'truyen/:slug',
          name: 'manga-detail',
          component: () => import('../views/MangaDetail.vue'),
          props: true,
        },
        {
          path: 'doc-truyen/:slug/:chapter',
          name: 'ReadManga',
          component: () => import('../views/ReadManga.vue'),
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('../views/RecentReading.vue'),
        },
        {
          path: 'admin/dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/AdminDashboard.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'bookmark',
          name: 'bookmark',
          component: () => import('../views/BookmarkView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
      ],
    },

    // --- CỤM 2: CÁC TRANG DÙNG AUTH LAYOUT ---
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: 'register',
          name: 'register',
          component: RegisterPage,
        },
        {
          path: 'login',
          name: 'login',
          component: LoginPage,
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: ResetPassword,
        },
      ],
    },
    {
      path: '/',
      component: EmptyLayout,
      children: [
        { path: 'search', name: 'search', component: () => import('../views/SearchView.vue') },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.path.startsWith('/admin')) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return '/login'
    }

    // FIX: Lấy role từ app_metadata (thông tin trong Token) thay vì bảng profiles
    const userRole = user.app_metadata?.role

    if (userRole !== 'admin') {
      alert('Bạn không có quyền truy cập vùng này!')
      return '/'
    }
  }
})

export default router
