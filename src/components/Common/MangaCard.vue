<script setup>
import { computed } from 'vue' // Cần import computed ở đây
import { useHomeStore } from '../../stores/home'
import { useRouter } from 'vue-router'

const props = defineProps({
  manga: {
    type: Object,
    required: true,
  },
})

const homeStore = useHomeStore()
const router = useRouter()

const latestChapters = computed(() => {
  // slice(0, 3) sẽ lấy từ phần tử index 0 đến 2 (tổng cộng 3)
  const list = props.manga.chaptersLatest || []
  return list.slice(0, 3)
})

const goToChapter = (chap) => {
  if (!chap) return

  const chapterApiUrl = `https://sv1.otruyencdn.com/v1/api/chapter/${chap.chapter_api_data.split('/').pop()}`

  router.push({
    path: `/doc-truyen/${props.manga.slug}/${chap.chapter_name}`,
    query: { api: chapterApiUrl },
  })
}
</script>

<template>
  <div
    @click="router.push(`/truyen/${manga.slug}`)"
    class="group bg-neutral-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer border border-neutral-800 flex flex-col h-full"
  >
    <div class="relative aspect-[3/4] overflow-hidden shrink-0">
      <img
        :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>

    <div class="p-3 flex flex-col flex-1">
      <h3 class="font-bold text-gray-100 text-[13px] line-clamp-2 mb-2 leading-tight h-8">
        {{ manga.name }}
      </h3>

      <hr class="border-neutral-800 mb-2" />

      <div class="flex-1 flex flex-col space-y-1">
        <template v-if="latestChapters.length > 0">
          <div
            v-for="(chap, index) in latestChapters"
            :key="index"
            @click.stop="goToChapter(chap)"
            class="flex justify-between items-center p-1.5 rounded-lg hover:bg-neutral-800 group/item transition-colors"
          >
            <div class="flex items-center gap-2 overflow-hidden">
              <span
                class="text-[11px] text-gray-400 group-hover/item:text-indigo-400 font-medium truncate"
              >
                Chương {{ chap.chapter_name }}
              </span>
            </div>

            <span
              v-if="index === 0"
              class="text-[8px] bg-white text-black px-1 rounded font-bold uppercase shrink-0"
            >
              Mới
            </span>
          </div>
        </template>

        <p v-else class="text-[11px] text-gray-500 italic py-1 px-1.5">Đang cập nhật...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
