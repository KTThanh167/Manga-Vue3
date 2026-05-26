<script setup>
defineEmits(['changeSection'])
</script>

<template>
  <div
    class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 mb-8 transition-colors duration-300 relative overflow-hidden"
  >
    <div
      class="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="relative z-10">
      <h3
        class="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6 flex items-center gap-3"
      >
        <span class="text-amber-500 text-2xl drop-shadow-sm">⚡</span> Thao Tác Nhanh
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <button
          @click="$emit('changeSection', 'users')"
          class="relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group text-left"
        >
          <div
            class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-all"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </div>
          <div>
            <h4
              class="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              Quản Lý User
            </h4>
            <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Kiểm soát tài khoản, quyền
            </p>
          </div>
        </button>

        <button
          @click="$emit('changeSection', 'local_mangas')"
          class="relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group text-left"
        >
          <div
            class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              ></path>
            </svg>
          </div>
          <div>
            <h4
              class="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            >
              Truyện Nội Bộ
            </h4>
            <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Thêm, sửa, xóa truyện nội bộ
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
