<template>
  <header
    class="sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b border-gray-100 dark:bg-slate-900/95 dark:border-gray-800 transition-all duration-300"
  >
    <div class="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <router-link to="/" class="flex items-center gap-2 shrink-0 group">
        <div
          class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <span class="text-white font-bold text-xl">M</span>
        </div>
        <span
          class="hidden xs:block text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight"
        >
          MangaReal
        </span>
      </router-link>

      <div class="flex items-center gap-2 sm:gap-4">
        <div class="relative flex items-center">
          <router-link
            to="/search"
            class="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-600 transition-all"
          >
            <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
          </router-link>

          <div class="hidden sm:block">
            <router-link to="/search" class="block group">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Tìm truyện..."
                  readonly
                  class="w-40 lg:w-64 pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:ring-2 focus:ring-blue-500/50 text-sm transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 outline-none"
                />
              </div>
            </router-link>
          </div>
        </div>

        <div v-if="user" class="relative">
          <button
            @click.stop="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all outline-none"
          >
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md"
            >
              {{ userInitial }}
            </div>
            <span class="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {{ userName }}
            </span>
            <font-awesome-icon
              icon="sort-down"
              class="text-gray-400 text-xs mt-[-4px]"
              :class="{ 'rotate-180 transition-transform': isDropdownOpen }"
            />
          </button>

          <transition name="dropdown">
            <div
              v-if="isDropdownOpen"
              v-click-outside="closeDropdown"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 py-2 z-50 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div class="px-4 py-3 border-b border-gray-50 dark:border-gray-700 mb-1">
                <p class="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                  Tài khoản
                </p>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                  {{ user.email }}
                </p>
              </div>

              <div class="py-1">
                <router-link to="/profile" class="dropdown-item" @click="closeDropdown">
                  <span class="material-icons-outlined text-lg">person</span> Hồ sơ cá nhân
                </router-link>
                <router-link to="/bookmark" class="dropdown-item" @click="closeDropdown">
                  <span class="material-icons-outlined text-lg">bookmarks</span> Tủ sách của tôi
                </router-link>
                <router-link to="/history" class="dropdown-item" @click="closeDropdown">
                  <span class="material-icons-outlined text-lg">history</span> Lịch sử đọc
                </router-link>
              </div>

              <div class="py-1 mt-1 border-t border-gray-50 dark:border-gray-700">
                <button
                  @click="handleLogout"
                  class="dropdown-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                >
                  <span class="material-icons-outlined text-lg">logout</span> Đăng xuất
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div v-else class="flex items-center gap-2">
          <router-link
            to="/login"
            class="px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition dark:text-gray-300"
          >
            Đăng nhập
          </router-link>
          <router-link
            to="/register"
            class="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition"
          >
            Đăng ký
          </router-link>
        </div>
      </div>
    </div>

    <div class="w-full bg-blue-600 dark:bg-blue-700 py-1.5 overflow-hidden whitespace-nowrap">
      <div class="inline-block animate-marquee whitespace-nowrap">
        <span
          v-for="i in 3"
          :key="i"
          class="text-[11px] font-bold text-white px-8 uppercase tracking-wider"
        >
          📢 Nguồn dữ liệu: <span class="underline">otruyen.cc</span> — Chúc bạn đọc truyện vui vẻ!
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Fix lỗi marquee nếu chưa có keyframes */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.33%);
  }
}

.animate-marquee {
  display: inline-block;
  animation: marquee 20s linear infinite;
}

.dropdown-item {
  @apply flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors;
}

/* Transition cho Dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Ẩn bớt logo chữ trên mobile cực nhỏ */
@media (max-width: 400px) {
  .xs\:block {
    display: none;
  }
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

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
