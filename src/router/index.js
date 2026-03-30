import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import { supabase } from '../lib/supabaseClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    // Thêm vào mảng routes
    {
      path: '/truyen/:slug',
      component: () => import('../views/MangaDetail.vue'),
      props: true,
    },
    {
      // Chúng ta cũng nên dự phòng luôn route cho trang Đọc chương
      path: '/doc-truyen/:slug/:chapter',
      name: 'ReadManga',
      component: () => import('../views/ReadManga.vue'), // Lazy load cho nhẹ app
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.path.startsWith('/admin')) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return '/login' // Thay vì next('/login')
    }

    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (data?.role !== 'admin') {
      alert('Bạn không có quyền truy cập vùng này!')
      return '/' // Thay vì next('/')
    }
  }
  // Nếu không vướng các điều kiện trên, router sẽ tự cho đi tiếp (không cần gọi next)
})

export default router
