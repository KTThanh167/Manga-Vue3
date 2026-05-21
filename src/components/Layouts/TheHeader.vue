<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isDropdownOpen = ref(false)
const isDarkMode = ref(false)

// 1. Khởi tạo dữ liệu người dùng từ Supabase
onMounted(async () => {
  // KHÔI PHỤC TRẠNG THÁI DARK MODE TỪ LOCALSTORAGE
  const savedTheme = localStorage.getItem('theme')
  const html = document.documentElement

  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    html.classList.add('dark')
    isDarkMode.value = true
  } else {
    html.classList.remove('dark')
    isDarkMode.value = false
  }
})

// 2. Computed xử lý tên hiển thị ưu tiên Username từ Store
const userName = computed(() => {
  if (!authStore.user) return 'Khách'
  return (
    authStore.profile?.username ||
    authStore.user.user_metadata?.username ||
    authStore.user.email.split('@')[0]
  )
})

// 3. Chữ cái đầu cho Avatar
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

// 4. Hàm điều hướng/hành động
const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  isDropdownOpen.value = false
  router.push('/')
}

// 5. Tính năng Dark Mode Toggle
const toggleDarkMode = () => {
  const html = document.documentElement
  isDarkMode.value = !isDarkMode.value

  if (isDarkMode.value) {
    html.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    html.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// 6. Directive để đóng dropdown khi click ra ngoài
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      // Bỏ qua nếu click vào nút kích hoạt dropdown
      if (
        !(
          el === event.target ||
          el.contains(event.target) ||
          event.target.closest('#user-menu-btn')
        )
      ) {
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

<template>
  <header
    class="sticky top-0 z-[100] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 transition-colors duration-300"
  >
    <div class="container mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between gap-4">
      <router-link to="/" class="flex items-center gap-3 shrink-0 group">
        <div
          class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-500/30"
        >
          <span class="text-white font-black text-xl leading-none">M</span>
        </div>
        <span
          class="hidden sm:block text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight"
        >
          MangaReal
        </span>
      </router-link>

      <router-link
        to="/user-comics"
        class="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-500/10 dark:to-rose-500/10 border border-orange-200 dark:border-orange-500/20 rounded-full group transition-all hover:shadow-md hover:-translate-y-0.5"
      >
        <span class="relative flex h-2.5 w-2.5 shrink-0">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
        </span>
        <span
          class="text-sm font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-500 transition-colors"
        >
          Khu vực Sáng tác
        </span>
      </router-link>

      <div class="flex items-center gap-3 sm:gap-5">
        <router-link to="/search" class="group relative hidden sm:block">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm truyện..."
            readonly
            class="w-48 lg:w-72 pl-10 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-transparent group-hover:border-indigo-500/50 group-hover:bg-white dark:group-hover:bg-slate-900 focus:ring-4 focus:ring-indigo-500/20 text-sm text-gray-800 dark:text-white transition-all cursor-pointer outline-none shadow-inner"
          />
        </router-link>

        <router-link
          to="/search"
          class="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </router-link>

        <div v-if="authStore.user" class="relative">
          <button
            id="user-menu-btn"
            @click="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all outline-none border border-transparent dark:border-slate-700/50"
          >
            <div
              class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/30"
            >
              {{ userInitial }}
            </div>
            <span
              class="hidden lg:block text-sm font-bold text-gray-700 dark:text-gray-200 max-w-[120px] truncate"
            >
              {{ userName }}
            </span>
            <svg
              class="w-4 h-4 text-gray-400 transition-transform duration-300"
              :class="{ 'rotate-180': isDropdownOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          <transition name="dropdown">
            <div
              v-if="isDropdownOpen"
              v-click-outside="closeDropdown"
              class="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 py-2 z-50 overflow-hidden border border-gray-100 dark:border-slate-700"
            >
              <div
                class="px-5 py-4 border-b border-gray-100 dark:border-slate-700/80 mb-2 bg-gray-50/50 dark:bg-slate-900/30"
              >
                <p class="text-[10px] uppercase font-black text-indigo-500 tracking-widest mb-1">
                  Tài khoản
                </p>
                <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {{ userName }}
                </p>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {{ authStore.user.email }}
                </p>
              </div>

              <div class="px-2 py-1 space-y-1">
                <router-link to="/profile" class="dropdown-item group" @click="closeDropdown">
                  <svg
                    class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  Hồ sơ cá nhân
                </router-link>
                <router-link to="/bookmark" class="dropdown-item group" @click="closeDropdown">
                  <svg
                    class="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    ></path>
                  </svg>
                  Tủ sách của tôi
                </router-link>
                <router-link to="/history" class="dropdown-item group" @click="closeDropdown">
                  <svg
                    class="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Lịch sử đọc
                </router-link>
              </div>

              <div
                class="px-2 py-2 mt-2 border-t border-gray-100 dark:border-slate-700/80 space-y-1"
              >
                <button
                  @click="toggleDarkMode"
                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <svg
                      v-if="!isDarkMode"
                      class="w-5 h-5 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      ></path>
                    </svg>
                    Giao diện
                  </div>
                  <span
                    class="text-[10px] uppercase text-gray-400 bg-gray-200 dark:bg-slate-900 px-2 py-0.5 rounded-md"
                    >{{ isDarkMode ? 'Tối' : 'Sáng' }}</span
                  >
                </button>

                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
                >
                  <svg
                    class="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div v-else class="flex items-center gap-1 sm:gap-2">
          <router-link
            to="/login"
            class="px-3 sm:px-5 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Đăng nhập
          </router-link>
          <router-link
            to="/register"
            class="px-4 sm:px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            Đăng ký
          </router-link>
        </div>
      </div>
    </div>

    <div class="w-full bg-gradient-to-r from-indigo-600 to-purple-700 py-1.5 overflow-hidden">
      <div class="inline-block animate-marquee whitespace-nowrap">
        <span
          v-for="i in 4"
          :key="i"
          class="text-[11px] font-bold text-white/90 px-8 uppercase tracking-widest"
        >
          📢 Nguồn dữ liệu API:
          <span class="text-white border-b border-white/50 pb-0.5">Otruyen.cc</span> — Chúc bạn đọc
          truyện vui vẻ! ✨
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  } /* Sửa lại thành -50% vì nhân đôi số span */
}

.animate-marquee {
  display: inline-block;
  animation: marquee 25s linear infinite;
}

/* Base class cho các mục trong Menu Dropdown */
.dropdown-item {
  @apply w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer;
}

/* Hiệu ứng Mở Dropdown Mượt mà */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  transform-origin: top right;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
