<script setup>
import { onMounted } from 'vue'
import { useHomeStore } from '../stores/home'
import TheHeader from '@/components/Layouts/TheHeader.vue'
import RecommendationSection from '@/components/Home/RecommendationSection.vue'
import MangaGrid from '@/components/Home/MangaGrid.vue'
import ActivitySidebar from '@/components/Home/ActivitySidebar.vue'

const homeStore = useHomeStore()

onMounted(async () => {
  // Chạy cả 2 hàm cùng lúc khi component được gắn vào DOM
  await homeStore.fetchHomeData()
  await homeStore.fetchAndListen()
})
</script>

<template>
  <div class="sticky top-0 z-50">
    <TheHeader />
  </div>
  <div class="bg-gray-50 min-h-screen pt-[50px]">
    <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div class="flex-1">
        <RecommendationSection />
        <MangaGrid />
      </div>

      <ActivitySidebar />
    </div>
  </div>
</template>
