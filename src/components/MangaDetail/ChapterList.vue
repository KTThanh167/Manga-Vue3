<template>
  <div
    class="mt-12 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700/60 transition-colors"
  >
    <div
      class="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-slate-700 pb-4"
    >
      <h2 class="text-2xl font-black flex items-center text-gray-900 dark:text-white">
        <span class="w-1.5 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full mr-3"></span>
        Danh sách chương
      </h2>
    </div>

    <div v-if="chapters && chapters.length > 0">
      <div v-for="(server, sIndex) in chapters" :key="sIndex" class="mb-8 last:mb-0">
        <div class="flex items-center gap-2 mb-5">
          <svg
            class="w-4 h-4 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            ></path>
          </svg>
          <h3 class="text-gray-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
            Server:
            <span class="text-indigo-600 dark:text-indigo-400">{{ server.server_name }}</span>
          </h3>
        </div>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4"
        >
          <div
            v-for="chapter in server.server_data ? [...server.server_data].reverse() : []"
            :key="chapter.chapter_name"
            class="group relative bg-gray-50 dark:bg-slate-700/40 border border-gray-200 dark:border-slate-600/50 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <router-link
              :to="{
                path: `/doc-truyen/${slug}/${chapter.chapter_name}`,
                query: {
                  api: chapter.chapter_api_data,
                  isLocal: chapter.isLocal ? 'true' : undefined,
                },
              }"
              class="block py-3 px-2 text-center relative z-10"
            >
              <span
                class="text-gray-700 dark:text-gray-300 font-bold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors"
              >
                Chương {{ chapter.chapter_name }}
              </span>
            </router-link>
            <div
              class="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-xl pointer-events-none transition-all"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700"
    >
      <span class="text-4xl mb-3 opacity-50">🏜️</span>
      <p class="text-gray-500 dark:text-slate-400 font-medium">
        Dữ liệu chương đang được cập nhật...
      </p>
    </div>
  </div>
</template>

<script setup>
// Giữ nguyên 100% script
defineProps({
  chapters: Array,
  slug: String,
})
defineEmits(['readChapter'])
</script>
