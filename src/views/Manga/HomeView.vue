<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHomeStore } from '@/stores/home'
import RecommendationSection from '@/components/Home/RecommendationSection.vue'
import MangaGrid from '@/components/Home/MangaGrid.vue'
import ActivitySidebar from '@/components/Home/ActivitySidebar.vue'

const homeStore = useHomeStore()
const route = useRoute()

// 1. Hàm load dữ liệu tập trung
const loadData = async () => {
  const pageFromUrl = parseInt(route.query.page) || 1
  await homeStore.fetchHomeData(pageFromUrl)
}

// 2. Theo dõi sự thay đổi của page trên URL (dùng khi click nút phân trang)
watch(
  () => route.query.page,
  async () => {
    // Cuộn lên đầu trang mượt mà
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    // GỌI DATA NGAY TẠI ĐÂY
    await loadData()
  },
  { immediate: true }, // Đảm bảo watch chạy ngay khi component mounted để load dữ liệu ban đầu
)

// 3. Khi F5 hoặc lần đầu vào trang
onMounted(async () => {
  // Gọi loadData để nó tự lấy page từ URL hiện tại
  await loadData()

  // Các logic khác giữ nguyên
  await homeStore.fetchAndListen()
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-[50px] pb-[50px]">
    <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div class="flex-1">
        <RecommendationSection />
        <MangaGrid />
      </div>

      <ActivitySidebar />
    </div>
  </div>
</template>
