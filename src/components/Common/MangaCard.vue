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

// Hàm "đào" số chương từ dữ liệu API
const latestChapterNumber = computed(() => {
  // Cách 1: Thử lấy từ last_chapter (ví dụ: "Chương 50")
  let source = props.manga.last_chapter

  // Cách 2: Nếu không có, thử lấy từ chaptersLatest (API Otruyen hay có cái này)
  if (!source && props.manga.chaptersLatest?.length > 0) {
    source = props.manga.chaptersLatest[0].filename
  }

  if (!source) return 0

  // Tách số từ chuỗi (ví dụ "Chương 123" -> 123)
  const match = String(source).match(/\d+/)
  return match ? parseInt(match[0]) : 0
})

const goToChapter = (chapterNumber) => {
  if (chapterNumber < 1) return
  // Hãy đảm bảo route này khớp với file router của bạn (ví dụ: /truyen/abc/chuong-20)
  router.push(`/truyen/${props.manga.slug}/chuong-${chapterNumber}`)
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
        <template v-if="latestChapterNumber > 0">
          <div
            v-for="n in [0, 1, 2]"
            :key="n"
            v-show="latestChapterNumber - n > 0"
            @click.stop="goToChapter(latestChapterNumber - n)"
            class="flex justify-between items-center p-1.5 rounded-lg hover:bg-neutral-800 group/item transition-colors"
          >
            <span class="text-[11px] text-gray-400 group-hover/item:text-indigo-400 font-medium">
              Chương {{ latestChapterNumber - n }}
            </span>
            <span
              v-if="n === 0"
              class="text-[8px] bg-white text-black px-1 rounded font-bold uppercase"
              >Mới</span
            >
          </div>
        </template>

        <p v-else class="text-[11px] text-gray-500 italic py-1 px-1.5">Đang cập nhật...</p>

        <div class="flex-1"></div>
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
