<script setup>
defineProps({
  categories: Array,
  selectedCategory: String,
})

const emit = defineEmits(['select'])
</script>

<template>
  <div
    class="mb-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl transition-colors duration-500"
  >
    <div class="flex items-center gap-3 mb-6">
      <span
        class="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full shadow-sm shadow-indigo-500/50"
      ></span>
      <h4
        class="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest drop-shadow-sm"
      >
        Tất cả thể loại
      </h4>
    </div>

    <div class="flex flex-wrap gap-2.5 md:gap-3.5">
      <button
        v-for="cat in categories"
        :key="cat.slug"
        @click="emit('select', cat.slug)"
        :class="[
          'px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold transition-all duration-300 active:scale-95 border',
          selectedCategory === cat.slug
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20'
            : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md',
        ]"
      >
        {{ cat.name }}
      </button>
    </div>
  </div>
</template>
