<script setup>
import { useRouter } from 'vue-router'

defineProps({
  comicName: String,
  currentChapter: [String, Number],
  slug: String,
})

defineEmits(['changeChapter'])
const router = useRouter()
</script>

<template>
  <header class="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <button
        @click="router.push(`/truyen/${slug}`)"
        class="text-sm hover:text-indigo-400 flex items-center transition"
      >
        <span class="mr-2">❮</span> <span class="hidden md:inline">Quay lại</span>
      </button>

      <div class="text-center overflow-hidden px-2">
        <h1 class="font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-md text-white">
          {{ comicName || 'Đang tải...' }}
        </h1>
        <p class="text-[10px] text-gray-500 uppercase tracking-widest">
          Chapter {{ currentChapter }}
        </p>
      </div>

      <div class="flex gap-2">
        <button
          @click="$emit('changeChapter', -1)"
          :disabled="parseInt(currentChapter) <= 1"
          class="p-2 bg-neutral-800 rounded hover:bg-neutral-700 disabled:opacity-30 transition"
        >
          ❮
        </button>
        <button
          @click="$emit('changeChapter', 1)"
          class="p-2 bg-indigo-600 rounded hover:bg-indigo-500 transition"
        >
          ❯
        </button>
      </div>
    </div>
  </header>
</template>
