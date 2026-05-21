<script setup>
import { onMounted, watch } from 'vue' // Bổ sung import watch
import { useAuthStore } from '@/stores/auth'
import { useMangaStore } from '@/stores/manga'
import AIChatBox from '@/components/AI/AIChatBox.vue'

const auth = useAuthStore()
const mangaStore = useMangaStore()

onMounted(async () => {
  // Phải đợi hàm này chạy xong để xác định user là ai
  await auth.initAuth()
})

// 2. Tự động phản ứng khi trạng thái user thay đổi
watch(
  () => auth.user?.id,
  async (userId) => {
    if (userId) {
      await mangaStore.fetchReadingHistory()
      await mangaStore.loadBookmarks()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col"
  >
    <router-view class="flex-grow" />
    <AIChatBox />
  </div>
</template>
