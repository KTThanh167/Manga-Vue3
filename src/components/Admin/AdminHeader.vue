<script setup>
defineProps(['username'])
defineEmits(['logout'])
</script>

<template>
  <header
    class="sticky top-0 z-[100] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-[72px]">
        <div class="flex items-center gap-3 md:gap-4">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <div>
            <h1
              class="text-lg md:text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight"
            >
              Quản Trị Viên
            </h1>
            <p
              class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest hidden sm:block"
            >
              MangaReal Dashboard
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 sm:gap-6">
          <div class="hidden sm:flex items-center gap-3">
            <div class="flex flex-col text-right">
              <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400"
                >Xin chào,</span
              >
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{
                username || 'Admin'
              }}</span>
            </div>
            <div
              class="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-500/30 shadow-sm"
            >
              {{ username ? username.charAt(0).toUpperCase() : 'A' }}
            </div>
          </div>

          <div class="w-px h-8 bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
        </div>
      </div>
    </div>
  </header>
</template>
