<script setup>
defineProps({
  categories: Array,
  selectedCategory: String,
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="mb-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex items-center gap-3 mb-6">
      <span class="w-1.5 h-5 bg-indigo-600 rounded-full"></span>
      <h4 class="text-sm font-black text-gray-700 uppercase tracking-widest">Tất cả thể loại</h4>
    </div>

    <div class="flex flex-wrap gap-2 md:gap-3">
      <button
        v-for="cat in categories"
        :key="cat.slug"
        @click="emit('select', cat.slug)"
        :class="[
          'px-3 py-1.5 md:px-5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all active:scale-90 border-2',
          selectedCategory === cat.slug
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
            : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50',
        ]"
      >
        {{ cat.name }}
      </button>
    </div>
  </div>
</template>
