<script setup>
defineProps({
  currentChapter: [String, Number],
})
defineEmits(['next'])
</script>

<template>
  <div class="py-20 flex flex-col items-center gap-6">
    <div
      class="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-gray-700 to-transparent"
    ></div>
    <p class="text-gray-500 italic text-sm">--- Bạn đã đọc hết chương {{ currentChapter }} ---</p>
    <button
      @click="$emit('next')"
      class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-full shadow-xl shadow-indigo-900/20 transition-all transform hover:scale-105 active:scale-95"
    >
      ĐỌC CHƯƠNG TIẾP THEO ❯
    </button>
  </div>
</template>
