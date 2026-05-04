<script setup>
defineProps({
  chapters: Array,
  slug: String,
})
defineEmits(['readChapter'])
</script>

<!-- ChapterList.vue -->
<template>
  <div class="mt-10">
    <h2 class="text-2xl font-bold mb-6 flex items-center text-white">
      <span class="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
      Danh sách chương
    </h2>

    <!-- Thêm kiểm tra chapters?.length -->
    <div v-if="chapters && chapters.length > 0">
      <div v-for="(server, sIndex) in chapters" :key="sIndex" class="mb-8">
        <h3 class="text-gray-400 text-sm mb-4 uppercase tracking-widest">
          Server: {{ server.server_name }}
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <!-- Sửa lại logic render để bảo vệ dữ liệu -->
          <div
            v-for="chapter in server.server_data ? [...server.server_data].reverse() : []"
            :key="chapter.chapter_name"
            class="bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <router-link
              :to="{
                path: `/doc-truyen/${slug}/${chapter.chapter_name}`,
                query: {
                  api: chapter.chapter_api_data,
                  isLocal: chapter.isLocal ? 'true' : undefined,
                },
              }"
              class="block p-3 text-center"
            >
              <span class="text-gray-700 font-medium text-sm">
                Chương {{ chapter.chapter_name }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Hiển thị khi không có chương -->
    <div v-else class="text-gray-400 italic py-10 bg-gray-800/50 rounded-xl text-center">
      🏜️ Dữ liệu chương đang được cập nhật...
    </div>
  </div>
</template>
