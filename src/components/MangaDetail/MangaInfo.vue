<script setup>
import { useMangaStore } from '../../stores/manga'
import { useRouter } from 'vue-router'

defineProps({
  manga: Object,
  imageResources: String,
})

const mangaStore = useMangaStore()
const router = useRouter()

// Hàm để chuyển trang tìm kiếm theo thể loại
const goToCategory = (cat) => {
  // Giả định route tìm kiếm của bạn là /search hoặc có query category
  router.push({
    path: '/search',
    query: { category: cat.slug },
  })
}
</script>

<template>
  <div
    class="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-[20px]"
  >
    <div class="w-full md:w-1/3 lg:w-1/4">
      <div class="overflow-hidden rounded-xl shadow-lg shadow-indigo-100">
        <img
          :src="`${imageResources}${manga.thumb_url}`"
          class="w-full aspect-[2/3] object-cover brightness-95 contrast-105"
          loading="lazy"
        />
      </div>

      <button
        @click="mangaStore.toggleFollow(manga)"
        :class="[
          'w-full mt-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2',
          mangaStore.isFollowed
            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
            : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100',
        ]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          :fill="mangaStore.isFollowed ? 'currentColor' : 'none'"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {{ mangaStore.isFollowed ? 'Đã Theo Dõi' : 'Theo Dõi' }}
      </button>
    </div>

    <div class="flex-1">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ manga.name }}</h1>
      <p class="text-gray-500 mb-6 italic">{{ manga.origin_name?.[0] }}</p>

      <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div class="flex items-center gap-2">
          <span class="font-bold text-indigo-600">Tình trạng:</span>
          <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">{{
            manga.status
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-indigo-600">Lượt xem:</span>
          <span class="text-gray-700 font-bold">{{ manga.view?.toLocaleString() || 0 }}</span>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="font-bold text-indigo-600 text-sm mb-3 uppercase tracking-wider">Thể loại</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in manga.category"
            :key="cat.id"
            @click="goToCategory(cat)"
            class="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <h2 class="text-indigo-600 font-bold text-lg mb-2">Nội dung tóm tắt</h2>
      <div
        class="text-gray-600 leading-relaxed text-sm overflow-y-auto max-h-48 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner"
        v-html="manga.content"
      ></div>
    </div>
  </div>
</template>
