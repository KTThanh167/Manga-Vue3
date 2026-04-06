<template>
  <header
    class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-slate-900/80 dark:border-gray-800 transition-colors duration-300"
  >
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-8">
        <router-link to="/" class="flex items-center gap-2 group">
          <div
            class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform"
          >
            <span class="text-white font-bold">M</span>
          </div>
          <span
            class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
          >
            MangaReal
          </span>
        </router-link>

        <nav class="hidden md:flex items-center gap-6">
          <router-link to="/browse" class="nav-link">Khám phá</router-link>
          <router-link to="/latest" class="nav-link">Mới cập nhật</router-link>
          <router-link to="/trending" class="nav-link">Thịnh hành</router-link>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden sm:block relative">
          <router-link to="/search">
            <input
              type="text"
              placeholder="Tìm truyện..."
              class="w-48 lg:w-64 pl-5 pr-4 py-1.5 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 text-sm transition-all dark:bg-gray-800"
            />
          </router-link>
        </div>

        <div v-if="user" class="relative group">
          <button
            @click.stop="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none"
          >
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm"
            >
              {{ userInitial }}
            </div>
            <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ userName }}
            </span>
            <span
              class="material-icons-outlined text-gray-400 text-sm transition-transform"
              :class="{ 'rotate-180': isDropdownOpen }"
              ><font-awesome-icon icon="sort-down"
            /></span>
          </button>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2"
          >
            <div
              v-if="isDropdownOpen"
              v-click-outside="closeDropdown"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl ring-1 ring-black/5 py-2 z-50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700"
            >
              <div class="px-4 py-2 mb-1">
                <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Tài khoản
                </p>
                <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              </div>

              <div class="py-1">
                <router-link to="/profile" class="dropdown-item">
                  <span class="material-icons-outlined text-lg">person</span>
                  Hồ sơ cá nhân
                </router-link>
                <router-link to="/library" class="dropdown-item">
                  <span class="material-icons-outlined text-lg">bookmarks</span>
                  Tủ sách của tôi
                </router-link>
                <router-link to="/history" class="dropdown-item">
                  <span class="material-icons-outlined text-lg">history</span>
                  Lịch sử đọc
                </router-link>
              </div>

              <div class="py-1">
                <button
                  @click="handleLogout"
                  class="dropdown-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <span class="material-icons-outlined text-lg">logout</span>
                  Đăng xuất
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div v-else class="flex items-center gap-2">
          <router-link
            to="/login"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
            >Đăng nhập</router-link
          >
          <router-link
            to="/register"
            class="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition"
            >Đăng ký</router-link
          >
        </div>
      </div>
    </div>
    <div class="w-full bg-blue-600 dark:bg-blue-700 py-1.5 overflow-hidden whitespace-nowrap group">
      <div
        class="inline-block animate-marquee group-hover:[animation-play-state:paused] cursor-pointer"
      >
        <span class="text-xs font-medium text-white px-4">
          📢 Dữ liệu truyện, bản quyền được mình mượn dùng từ
          <span class="font-bold underline">otruyen.cc</span> — Chúc bạn đọc truyện vui vẻ!
        </span>
        <span class="text-xs font-medium text-white px-4">
          📢 Dữ liệu truyện, bản quyền được mình mượn dùng từ
          <span class="font-bold underline">otruyen.cc</span> — Chúc bạn đọc truyện vui vẻ!
        </span>
        <span class="text-xs font-medium text-white px-4">
          📢 Dữ liệu truyện, bản quyền được mình mượn dùng từ
          <span class="font-bold underline">otruyen.cc</span> — Chúc bạn đọc truyện vui vẻ!
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient' // Đảm bảo đường dẫn này đúng với project của bạn

const router = useRouter()
const user = ref(null)
const isDropdownOpen = ref(false)

// 1. Khởi tạo dữ liệu người dùng từ Supabase
onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  user.value = session?.user ?? null

  // Lắng nghe mọi thay đổi (Login, Logout, Token Refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
})

// 2. Computed xử lý tên hiển thị
const userName = computed(() => {
  if (!user.value) return 'Khách'
  return user.value.user_metadata?.full_name || user.value.email.split('@')[0]
})

// 3. Chữ cái đầu cho Avatar
const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

// 4. Các hàm điều hướng/hành động
const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Lỗi khi đăng xuất:', error.message)
  } else {
    isDropdownOpen.value = false
    router.push('/') // Quay về trang chủ sau khi thoát
  }
}

/**
 * Directive để click ra ngoài thì đóng dropdown
 * (Bạn có thể cài thư viện @vueuse/core hoặc viết đơn giản như bên dưới)
 */
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}
</script>

<style scoped>
.nav-link {
  @apply text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400;
}

.dropdown-item {
  @apply flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors;
}

/* Tùy chỉnh router-link-active cho nav-link */
.router-link-active:not(.group) {
  @apply text-blue-600 font-bold;
}
</style>
