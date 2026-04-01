<script setup>
import { useHomeStore } from '../../stores/home'

const homeStore = useHomeStore()
</script>

<template>
  <div
    v-if="homeStore.recommendedList.length > 0"
    class="mb-12 p-6 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-3xl shadow-2xl shadow-indigo-200 text-white overflow-hidden relative"
  >
    <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

    <div class="flex items-center mb-6 relative z-10">
      <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md mr-4">
        <span class="text-2xl">✨</span>
      </div>
      <div>
        <h2 class="text-2xl font-black tracking-tight">DÀNH RIÊNG CHO BẠN</h2>
        <p class="text-xs text-indigo-100 opacity-90 italic">
          Dựa trên sở thích đọc thể loại
          <span class="font-bold underline text-white">{{ homeStore.topCategory }}</span> của bạn
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
      <div
        v-for="manga in homeStore.recommendedList"
        :key="manga._id"
        @click="$router.push(`/truyen/${manga.slug}`)"
        class="group bg-white/10 backdrop-blur-md p-2 rounded-2xl hover:bg-white/25 cursor-pointer transition duration-300 border border-white/10 shadow-lg"
      >
        <div class="overflow-hidden rounded-xl aspect-[3/4] mb-2">
          <img
            :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
            class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        </div>
        <p class="text-[11px] font-bold line-clamp-1 text-center">{{ manga.name }}</p>
      </div>
    </div>
  </div>
</template>
