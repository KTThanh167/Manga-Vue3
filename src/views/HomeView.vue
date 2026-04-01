<script setup>
import { onMounted } from 'vue'
import { useHomeStore } from '../stores/home'
import RecommendationSection from '@/components/Home/RecommendationSection.vue'
import MangaGrid from '@/components/Home/MangaGrid.vue'
import ActivitySidebar from '@/components/Home/ActivitySidebar.vue'
const homeStore = useHomeStore()

onMounted(async () => {
  await homeStore.fetchHomeData()
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
