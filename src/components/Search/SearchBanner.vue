<script setup>
// Nhận dữ liệu từ cha (SearchView)
defineProps({
  modelValue: String, // Từ khóa tìm kiếm (keyword)
  suggestions: Array, // Danh sách gợi ý từ store
  showSuggestions: Boolean, // Trạng thái ẩn/hiện gợi ý
  imageResources: String, // Base URL của ảnh từ store
})

// Báo cáo sự kiện ngược lại cho cha
const emit = defineEmits(['update:modelValue', 'search', 'selectSuggestion', 'focus'])
</script>

<template>
  <div
    class="bg-indigo-600 rounded-2xl md:rounded-3xl p-5 md:p-10 mb-8 text-center shadow-xl shadow-indigo-100 relative overflow-hidden"
  >
    <div class="relative z-10">
      <h2 class="text-white text-xl md:text-3xl font-black mb-6 uppercase tracking-tight">
        Khám phá kho truyện Manga
      </h2>

      <div class="max-w-2xl mx-auto relative">
        <div class="flex flex-col md:flex-row gap-3">
          <div class="relative flex-1">
            <input
              :value="modelValue"
              @input="emit('update:modelValue', $event.target.value)"
              @keyup.enter="emit('search')"
              @focus="emit('focus')"
              placeholder="Nhập tên truyện bạn muốn tìm..."
              class="w-full px-6 py-4 rounded-xl md:rounded-2xl outline-none shadow-inner text-black font-semibold focus:ring-4 focus:ring-indigo-300 transition text-sm md:text-base"
            />
          </div>
          <button
            @click="emit('search')"
            class="bg-black text-white px-8 py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <span>TÌM KIẾM</span>
          </button>
        </div>

        <div
          v-if="showSuggestions && suggestions?.length > 0"
          class="absolute z-50 w-full bg-white mt-2 rounded-xl md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left max-h-[60vh] overflow-y-auto"
        >
          <div
            v-for="manga in suggestions"
            :key="manga._id"
            @click="emit('selectSuggestion', manga)"
            class="flex items-center gap-3 p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-none transition"
          >
            <img
              :src="`${imageResources}${manga.thumb_url}`"
              class="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0"
            />
            <div class="flex-1 overflow-hidden">
              <p class="text-sm font-bold text-gray-800 truncate">{{ manga.name }}</p>
              <p class="text-[10px] text-gray-400 mt-1 uppercase">
                {{ manga.category[0]?.name }} • {{ manga.last_chapter }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="hidden sm:block absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50"
    ></div>
    <div
      class="hidden sm:block absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400 rounded-full opacity-30"
    ></div>
  </div>
</template>
