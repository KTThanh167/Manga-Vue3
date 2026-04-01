<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMangaStore } from '@/stores/manga'

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
  <router-view />
</template>
