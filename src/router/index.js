import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Manga/HomeView.vue'
import RegisterView from '@/views/Auth/RegisterView.vue'
import LoginView from '@/views/Auth/LoginView.vue'
import ResetPassword from '@/views/Auth/ResetPasswordView.vue'
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
          component: () => import('@/views/Manga/MangaDetailView.vue'),
          props: true,
        },
        {
          path: 'doc-truyen/:slug/:chapter',
          name: 'ReadManga',
          component: () => import('@/views/Manga/ReadManga.vue'),
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/views/User/RecentReading.vue'),
        },
        {
          path: '/admin',

          component: () => import('@/views/Admin/AdminDashboard.vue'),
          meta: { requiresAuth: true, isAdmin: true },
          children: [
            {
              path: 'dashboard',
              name: 'AdminStats',

              component: () => import('@/components/Admin/StatCard.vue'),
            },
            {
              path: 'users',
              name: 'AdminUsers',
              component: () => import('@/components/Admin/UserManagement.vue'),
            },
            {
              path: 'manga',
              name: 'AdminManga',
              component: () => import('@/components/Admin/MangaManagement.vue'),
            },
            {
              path: 'local-manga',
              name: 'AdminLocalManga',
              component: () => import('@/components/Admin/LocalMangaManagement.vue'),
            },

            {
              path: 'manga/edit/:id?',
              name: 'MangaEditor',
              component: () => import('../views/Admin/MangaEditorView.vue'),
            },
            {
              path: 'manga/upload',
              name: 'MangaUpload',
              component: () => import('../views/Admin/MangaUploadView.vue'),
            },
            {
              path: '/admin/manga/:mangaId/add-chapter',
              name: 'AddChapter',
              component: () => import('@/views/Admin/AddChaptersView.vue'),
              props: true,
            },
            {
              path: '/admin/manga/edit-chapter/:chapterId',
              name: 'EditChapter',
              component: () => import('@/views/Admin/EditChaptersView.vue'),
              props: true,
            },
            {
              path: '',
              redirect: { name: 'AdminUsers' },
            },
          ],
        },
        {
          path: 'bookmark',
          name: 'bookmark',
          component: () => import('@/views/User/BookmarkView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/User/ProfileView.vue'),
        },
        {
          path: 'completed',
          name: 'completed',
          component: () => import('@/views/User/CompletedView.vue'),
        },
        {
          path: '/user-comics',
          name: 'UserComics',
          component: () => import('@/views/Manga/UserComicsView.vue'),
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
          component: RegisterView,
        },
        {
          path: 'login',
          name: 'login',
          component: LoginView,
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
        {
          path: 'search',
          name: 'search',
          component: () => import('../views/Search/SearchView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.path.startsWith('/admin')) {
    // 1. Kiểm tra xem người dùng đã đăng nhập chưa
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return '/login'
    }

    // 2. Lấy role trực tiếp từ bảng profiles để luôn có dữ liệu mới nhất
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // 3. Kiểm tra xem role có phải là admin không (dùng trim() cho chắc chắn)
    if (error || !profile || profile.role?.trim() !== 'admin') {
      alert('Bạn không có quyền truy cập vùng này!')
      return '/'
    }
  }
})

export default router
