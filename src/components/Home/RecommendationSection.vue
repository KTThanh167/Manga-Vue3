<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useHomeStore } from '../../stores/home'
import { useRouter } from 'vue-router'

const homeStore = useHomeStore()
const router = useRouter()

// --- LOGIC CAROUSEL ---
const currentIndex = ref(0)
let autoPlayInterval = null

const visibleMangas = computed(() => {
  const list = homeStore.recommendedList
  if (!list || list.length === 0) return []
  if (list.length <= 4) return list

  const result = []
  for (let i = 0; i < 4; i++) {
    const index = (currentIndex.value + i) % list.length
    result.push(list[index])
  }
  return result
})

const nextSlide = () => {
  if (homeStore.recommendedList.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % homeStore.recommendedList.length
    resetAutoPlay()
  }
}

const prevSlide = () => {
  if (homeStore.recommendedList.length > 0) {
    currentIndex.value =
      (currentIndex.value - 1 + homeStore.recommendedList.length) % homeStore.recommendedList.length
    resetAutoPlay()
  }
}

const startAutoPlay = () => {
  autoPlayInterval = setInterval(() => {
    nextSlide()
  }, 8000)
}

const resetAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
  startAutoPlay()
}

// Hàm hỗ trợ loại bỏ thẻ HTML cho tóm tắt truyện
const stripHtml = (html) => {
  if (!html) return 'Đang cập nhật nội dung...'
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

onMounted(() => {
  startAutoPlay()
})
onUnmounted(() => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
})

watch(
  () => homeStore.recommendedList,
  (newList) => {
    console.log('======= KIỂM TRA CAROUSEL =======')
    console.log('1. Độ dài mảng gợi ý:', newList.length)
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="homeStore.recommendedList.length > 0 && homeStore.topCategory"
    class="mb-12 p-6 md:p-8 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-3xl shadow-2xl shadow-indigo-500/30 text-white overflow-hidden relative"
  >
    <div
      class="absolute -top-16 -right-16 w-56 h-56 bg-white/20 rounded-full blur-[80px] pointer-events-none"
    ></div>
    <div
      class="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none"
    ></div>

    <div class="flex items-center justify-between mb-8 relative z-10">
      <div class="flex items-center">
        <div
          class="bg-white/20 p-3 rounded-2xl backdrop-blur-md mr-4 shadow-inner border border-white/10"
        >
          <span class="text-2xl">✨</span>
        </div>
        <div>
          <h2 class="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            DÀNH RIÊNG CHO BẠN
          </h2>
          <p class="text-xs md:text-sm text-indigo-100 opacity-90 font-medium mt-1">
            Dựa trên sở thích đọc thể loại
            <span class="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md ml-1">{{
              homeStore.topCategory
            }}</span>
            của bạn
          </p>
        </div>
      </div>

      <div v-if="homeStore.recommendedList.length > 4" class="flex space-x-2 shrink-0">
        <button
          @click="prevSlide"
          class="p-2.5 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-300 border border-white/20 shadow-sm active:scale-95"
          title="Trở về"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="p-2.5 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-300 border border-white/20 shadow-sm active:scale-95"
          title="Tiếp theo"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <TransitionGroup
      name="smooth-fade"
      tag="div"
      class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 relative z-10"
    >
      <div
        v-for="manga in visibleMangas"
        :key="manga._id"
        @click="router.push(`/truyen/${manga.slug}`)"
        class="group bg-white/10 backdrop-blur-xl p-2.5 rounded-2xl hover:bg-white/20 cursor-pointer transition-all duration-300 border border-white/20 shadow-xl flex flex-col"
      >
        <div class="relative overflow-hidden rounded-xl aspect-[3/4] shrink-0 bg-indigo-900/50">
          <img
            :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70"
          ></div>

          <div
            class="absolute inset-0 bg-slate-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col overflow-hidden z-20"
          >
            <div v-if="manga.content" class="flex flex-col h-full">
              <h4
                class="text-indigo-300 font-bold mb-2 text-[10px] uppercase tracking-wider border-b border-indigo-500/30 pb-1"
              >
                Tóm tắt
              </h4>
              <p class="text-[11px] text-gray-300 leading-relaxed line-clamp-6 text-justify">
                {{ stripHtml(manga.content) }}
              </p>
              <span class="mt-auto text-[10px] text-center text-indigo-300 font-bold animate-pulse"
                >👉 Click để xem</span
              >
            </div>

            <div v-else class="flex flex-col h-full justify-center space-y-3">
              <div v-if="manga.origin_name && manga.origin_name.length > 0">
                <span class="text-[9px] text-gray-400 uppercase tracking-wider font-semibold"
                  >Tên khác</span
                >
                <p class="text-[10px] text-indigo-200 font-medium line-clamp-2 mt-0.5">
                  {{
                    Array.isArray(manga.origin_name)
                      ? manga.origin_name.join(', ')
                      : manga.origin_name
                  }}
                </p>
              </div>

              <div v-if="manga.category && manga.category.length > 0">
                <span class="text-[9px] text-gray-400 uppercase tracking-wider font-semibold"
                  >Thể loại</span
                >
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="(cat, idx) in manga.category.slice(0, 3)"
                    :key="idx"
                    class="text-[8px] font-bold bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 px-1.5 py-0.5 rounded"
                  >
                    {{ cat.name || cat }}
                  </span>
                </div>
              </div>
              <span class="mt-auto text-[10px] text-center text-white font-bold animate-pulse"
                >👉 Xem thông tin</span
              >
            </div>
          </div>

          <div
            v-if="manga.chaptersLatest && manga.chaptersLatest.length > 0"
            class="absolute bottom-2 right-2 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm shadow-lg z-10 border border-white/10"
          >
            Chương {{ manga.chaptersLatest[0].chapter_name }}
          </div>
        </div>

        <div class="flex-1 flex items-center justify-center mt-3 mb-1 px-1">
          <p
            class="text-[13px] font-bold line-clamp-2 text-center text-white leading-snug group-hover:text-indigo-200 transition-colors"
          >
            {{ manga.name }}
          </p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.smooth-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}
.smooth-fade-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(15px);
}
.smooth-fade-leave-active {
  transition: all 0.4s ease;
  position: absolute;
  opacity: 0;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
