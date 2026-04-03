<script setup>
defineProps({
  chapters: Array,
  slug: String,
})
defineEmits(['readChapter'])
</script>

<template>
  <div class="mt-10">
    <h2 class="text-2xl font-bold mb-6 flex items-center">
      <span class="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
      Danh sách chương
    </h2>

    <div v-for="(server, sIndex) in chapters" :key="sIndex" class="mb-8">
      <h3 class="text-gray-400 text-sm mb-4 uppercase tracking-widest">
        Server: {{ server.server_name }}
      </h3>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div
          v-for="chapter in server.server_data"
          :key="chapter.chapter_name"
          class="bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all shadow-sm"
        >
          <router-link
            :to="{
              path: `/doc-truyen/${slug}/${chapter.chapter_name}`,
              query: { api: chapter.chapter_api_data },
            }"
            @click="$emit('readChapter', chapter)"
            class="block p-3 text-center"
          >
            <span class="text-gray-700 font-medium text-sm">
              Chương {{ chapter.chapter_name }}
            </span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="!chapters || chapters.length === 0" class="text-gray-500 italic">
      Dữ liệu chương đang được đồng bộ, vui lòng đợi trong giây lát...
    </div>
  </div>
</template>
