<script setup>
import { useMangaStore } from '@/stores/manga'
import MangaCard from '@/components/Common/MangaCard.vue'
import { onMounted } from 'vue'

const mangaStore = useMangaStore()

onMounted(async () => {
  console.log('Trước khi load:', mangaStore.followedMangas)
  await mangaStore.loadBookmarks()
  console.log('Sau khi load:', mangaStore.followedMangas)
})
</script>

<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
    <div
      class="mb-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"
    >
      <div>
        <h1
          class="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3"
        >
          <span class="text-red-500">❤️</span> Truyện đang theo dõi
        </h1>
        <p class="text-gray-400 font-medium mt-1">
          Bạn có
          <span class="text-indigo-600 font-bold">{{ mangaStore.followedMangas.length }}</span> bộ
          truyện trong bộ sưu tập
        </p>
      </div>

      <router-link
        to="/search"
        class="text-sm font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-2xl hover:bg-indigo-100 transition"
      >
        Tìm thêm truyện mới
      </router-link>
    </div>

    <div
      v-if="mangaStore.followedMangas.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    >
      <MangaCard v-for="manga in mangaStore.followedMangas" :key="manga.slug" :manga="manga" />
    </div>

    <div
      v-else
      class="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mx-4"
    >
      <div class="text-7xl mb-6">🏜️</div>
      <h3 class="text-xl font-bold text-gray-800 mb-2">Chưa có truyện nào được theo dõi</h3>
      <p class="text-gray-400 text-sm max-w-xs mx-auto mb-8">
        Đừng để danh sách này trống trải, hãy đi tìm những bộ Manga yêu thích thôi nào!
      </p>
      <router-link
        to="/search"
        class="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition shadow-xl"
      >
        KHÁM PHÁ NGAY
      </router-link>
    </div>
  </div>
</template>
