<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHomeStore } from '@/stores/home'
import MangaCard from '@/components/Common/MangaCard.vue'
import Pagination from '@/components/Home/PaginationSession.vue'

const homeStore = useHomeStore()
const route = useRoute()

/**
 * Hàm load dữ liệu tập trung:
 * Lấy page từ URL và gọi API với slug 'truyen-hoan-thanh'
 */
const loadCompleted = async () => {
  const page = parseInt(route.query.page) || 1
  await homeStore.fetchListData('hoan-thanh', page)
}

/**
 * Theo dõi sự thay đổi của page trên thanh URL
 */
watch(
  () => route.query.page,
  async () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    await loadCompleted()
  },
)

onMounted(() => {
  loadCompleted()
})
</script>

<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
    <div class="mb-8 border-b border-gray-100 pb-6 flex items-end justify-between">
      <div>
        <h1
          class="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3"
        >
          <span class="bg-green-500 w-2 h-8 rounded-full"></span>
          Truyện đã hoàn thành
        </h1>
        <p class="text-gray-400 text-sm mt-1 font-medium">
          Những bộ truyện đã đi đến hồi kết viên mãn
        </p>
      </div>
      <div
        class="hidden md:block text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg"
      >
        FULL COMPLETED
      </div>
    </div>

    <div v-if="homeStore.loading" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      <div
        v-for="i in 12"
        :key="i"
        class="animate-pulse bg-gray-100 aspect-[2/3] rounded-2xl"
      ></div>
    </div>

    <div v-else>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
      >
        <MangaCard
          v-for="manga in homeStore.mangas"
          :key="manga.id"
          :manga="manga"
          :image-resources="homeStore.IMAGE_RESOURCES"
        />
      </div>

      <div class="mt-12 flex justify-center">
        <Pagination @change-page="handlePageChange" />
      </div>
    </div>
  </div>
</template>
