<script setup>
defineProps({
  manga: Object,
  imageResources: String,
})
</script>

<template>
  <div
    class="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-[20px]"
  >
    <div class="w-full md:w-1/3 lg:w-1/4 overflow-hidden">
      <img
        :src="`${imageResources}${manga.thumb_url}`"
        class="w-full aspect-[2/3] object-cover rounded-xl shadow-lg shadow-indigo-100 brightness-95 contrast-105"
        loading="lazy"
      />
    </div>

    <div class="flex-1">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ manga.name }}</h1>
      <p class="text-gray-500 mb-4 italic">{{ manga.origin_name?.[0] }}</p>

      <div class="flex flex-wrap gap-2 mb-6">
        <span
          v-for="cat in manga.category"
          :key="cat.id"
          class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium border border-indigo-100"
        >
          {{ cat.name }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <span class="font-bold text-blue-600">Tình trạng:</span>
          <span class="text-blue-600 font-semibold ml-[10px]">{{ manga.status }}</span>
        </div>
        <div>
          <span class="font-bold text-blue-600">Lượt xem:</span>
          <span class="text-blue-600 font-semibold ml-[10px]">
            {{ manga.view?.toLocaleString() || 0 }}
          </span>
        </div>
      </div>

      <h2 class="text-blue-600 font-bold text-lg mb-2">Nội dung tóm tắt</h2>
      <div
        class="text-gray-600 leading-relaxed text-sm overflow-y-auto max-h-40 p-3 bg-gray-50 rounded-lg"
        v-html="manga.content"
      ></div>
    </div>
  </div>
</template>
