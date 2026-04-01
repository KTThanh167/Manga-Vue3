<script setup>
import { useHomeStore } from '../../stores/home'

const homeStore = useHomeStore()
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-black text-gray-900 flex items-center">
        <span class="w-1.5 h-8 bg-indigo-600 rounded-full mr-3 shadow-lg shadow-indigo-200"></span>
        TRUYỆN MỚI CẬP NHẬT
      </h1>
      <button
        @click="homeStore.fetchHomeData"
        class="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition"
      >
        Làm mới ↻
      </button>
    </div>

    <div v-if="homeStore.loading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"
      ></div>
    </div>

    <div
      v-else-if="homeStore.error"
      class="bg-red-50 text-red-500 p-4 rounded-xl text-center border border-red-100"
    >
      {{ homeStore.error }}
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="manga in homeStore.mangas"
        :key="manga._id"
        @click="$router.push(`/truyen/${manga.slug}`)"
        class="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
      >
        <div class="relative overflow-hidden aspect-[3/4]">
          <img
            :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div
            class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white font-bold uppercase"
          >
            HOT
          </div>
        </div>

        <div class="p-4">
          <h3
            class="font-bold text-gray-800 text-sm line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors"
          >
            {{ manga.name }}
          </h3>
          <p class="text-[10px] text-gray-400 mt-2 truncate italic">
            {{ manga.origin_name[0] || 'Đang cập nhật' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hiệu ứng chuyển cảnh mượt mà */
.group:hover img {
  filter: brightness(1.1);
}
</style>
