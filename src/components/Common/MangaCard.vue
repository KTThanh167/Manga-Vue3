<script setup>
import { useHomeStore } from '../../stores/home'

defineProps({
  manga: {
    type: Object,
    required: true,
  },
})

const homeStore = useHomeStore()
</script>

<template>
  <div
    @click="$router.push(`/truyen/${manga.slug}`)"
    class="group bg-white dark:bg-neutral-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 dark:border-neutral-700"
  >
    <div class="relative overflow-hidden aspect-[3/4]">
      <img
        :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        loading="lazy"
      />
      <div
        class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white font-bold uppercase"
      >
        HOT
      </div>
    </div>

    <div class="p-4">
      <h3
        class="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors"
      >
        {{ manga.name }}
      </h3>
      <p class="text-[10px] text-gray-400 mt-2 truncate italic">
        {{ (manga.origin_name && manga.origin_name[0]) || 'Đang cập nhật' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.group:hover img {
  filter: brightness(1.1);
}
</style>
