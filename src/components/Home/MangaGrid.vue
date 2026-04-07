<script setup>
import { useHomeStore } from '../../stores/home'
import Pagination from './PaginationSession.vue'
import MangaCard from '@/components/Common/MangaCard.vue'

const homeStore = useHomeStore()

// Thêm hàm xử lý chuyển trang
const handlePageChange = async (newPage) => {
  await homeStore.fetchHomeData(newPage)
}
</script>

<template>
  <div>
    <div v-if="homeStore.loading" class="flex justify-center py-10">
      <p class="text-gray-500 italic">Đang tải dữ liệu...</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <MangaCard v-for="manga in homeStore.mangas" :key="manga._id" :manga="manga" />
    </div>

    <Pagination @change-page="handlePageChange" />
  </div>
</template>
