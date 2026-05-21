<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: String,
  suggestions: Array,
  showSuggestions: Boolean,
  imageResources: String,
})

const emit = defineEmits(['update:modelValue', 'search', 'selectSuggestion', 'focus'])
const searchInput = ref(null)

const focusInput = () => {
  searchInput.value?.focus()
}

defineExpose({
  focusInput,
})
</script>

<template>
  <div class="relative mb-12 p-6 md:p-12 text-center rounded-[2rem]">
    <div
      class="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-900/20 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-500"
    >
      <div
        class="absolute top-0 left-1/4 w-72 h-72 bg-white/20 dark:bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay"
      ></div>
      <div
        class="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-500/30 dark:bg-purple-500/30 rounded-full blur-[80px] pointer-events-none mix-blend-overlay"
      ></div>
    </div>

    <div class="relative z-20">
      <h2
        class="text-white text-2xl md:text-4xl font-black mb-8 uppercase tracking-tight drop-shadow-md"
      >
        Khám phá kho truyện Manga
      </h2>

      <div class="max-w-3xl mx-auto relative">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1 group">
            <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                class="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              ref="searchInput"
              :value="modelValue"
              @input="emit('update:modelValue', $event.target.value)"
              @keyup.enter="emit('search')"
              @focus="emit('focus')"
              placeholder="Nhập tên truyện bạn muốn tìm..."
              class="w-full pl-12 pr-6 py-4 md:py-4.5 rounded-2xl outline-none bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-gray-900 dark:text-white font-medium border-2 border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <button
            @click="emit('search')"
            class="shrink-0 bg-gray-900 dark:bg-indigo-500 text-white px-8 py-4 md:py-4.5 rounded-2xl font-black tracking-wide hover:bg-gray-800 dark:hover:bg-indigo-400 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 dark:shadow-indigo-500/20"
          >
            <span>TÌM KIẾM</span>
          </button>
        </div>

        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="showSuggestions && suggestions?.length > 0"
            class="absolute z-50 w-full mt-3 rounded-2xl shadow-2xl shadow-indigo-900/20 border border-gray-100 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl overflow-hidden text-left max-h-[60vh] overflow-y-auto"
          >
            <div
              v-for="manga in suggestions"
              :key="manga._id"
              @click="emit('selectSuggestion', manga)"
              class="flex items-center gap-4 p-3 hover:bg-indigo-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-gray-50 dark:border-slate-700/50 last:border-none transition-colors"
            >
              <img
                :src="`${imageResources}${manga.thumb_url}`"
                class="w-12 h-16 object-cover rounded-xl shadow-sm shrink-0 bg-gray-200 dark:bg-slate-700"
              />
              <div class="flex-1 overflow-hidden">
                <p class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mb-1">
                  {{ manga.name }}
                </p>
                <div
                  class="flex items-center gap-2 text-[10px] md:text-xs font-semibold uppercase tracking-wider"
                >
                  <span
                    class="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md"
                  >
                    {{ manga.category?.[0]?.name || 'Manga' }}
                  </span>
                  <span class="text-gray-400 dark:text-gray-500">•</span>
                  <span class="text-gray-500 dark:text-gray-400">{{
                    manga.last_chapter || 'Đang cập nhật'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Chỉnh lại thanh cuộn (scrollbar) cho khung gợi ý nhìn mượt hơn */
div::-webkit-scrollbar {
  width: 6px;
}
div::-webkit-scrollbar-track {
  background: transparent;
}
div::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-slate-600 rounded-full;
}
div::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-slate-500;
}
</style>
