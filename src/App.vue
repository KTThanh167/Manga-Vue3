<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMangaStore } from '@/stores/manga'
import AIChatBox from '@/components/AI/AIChatBox.vue'

const auth = useAuthStore()
const mangaStore = useMangaStore()

onMounted(async () => {
  // 1. Lấy thông tin người dùng trước
  await auth.fetchProfile()

  // 2. Nếu đã đăng nhập thành công, mới đi lấy lịch sử
  if (auth.user) {
    await mangaStore.fetchReadingHistory()
  }
})
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col"
  >
    <router-view class="flex-grow" />
    <AIChatBox />
  </div>
</template>
