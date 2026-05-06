<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useHomeStore } from '../../stores/home'
import { useRouter } from 'vue-router'

const homeStore = useHomeStore()
const router = useRouter()

// --- LOGIC CAROUSEL ---
const currentIndex = ref(0)
let autoPlayInterval = null

// Lấy ra 4 truyện để hiển thị dựa trên currentIndex
const visibleMangas = computed(() => {
  const list = homeStore.recommendedList
  if (!list || list.length === 0) return []

  // Nếu list có ít hơn hoặc bằng 4 truyện thì hiển thị tất cả, không cần vòng lặp
  if (list.length <= 4) return list

  const result = []
  for (let i = 0; i < 4; i++) {
    // Thuật toán vòng tròn: tự động quay về 0 khi vượt quá độ dài mảng
    const index = (currentIndex.value + i) % list.length
    result.push(list[index])
  }
  return result
})

// Hàm tiến tới (Next)
const nextSlide = () => {
  if (homeStore.recommendedList.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % homeStore.recommendedList.length
    resetAutoPlay() // Reset thời gian để không bị nhảy giật cục khi người dùng tự bấm
  }
}

// Hàm lùi về (Prev)
const prevSlide = () => {
  if (homeStore.recommendedList.length > 0) {
    currentIndex.value =
      (currentIndex.value - 1 + homeStore.recommendedList.length) % homeStore.recommendedList.length
    resetAutoPlay()
  }
}

// Chạy tự động mỗi 4 giây
const startAutoPlay = () => {
  autoPlayInterval = setInterval(() => {
    nextSlide()
  }, 4000)
}

// Khởi động lại bộ đếm tự động
const resetAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
  startAutoPlay()
}

// Bật tự động chạy khi component xuất hiện
onMounted(() => {
  startAutoPlay()
})

// Dọn dẹp bộ nhớ khi chuyển trang
onUnmounted(() => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
})

watch(
  () => homeStore.recommendedList,
  (newList) => {
    console.log('======= KIỂM TRA CAROUSEL =======')
    console.log('1. Độ dài mảng gợi ý:', newList.length)
    console.log('2. Chi tiết các truyện:', newList)
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="homeStore.recommendedList.length > 0"
    class="mb-12 p-6 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-3xl shadow-2xl shadow-indigo-200 text-white overflow-hidden relative"
  >
    <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

    <!-- Header & Nút điều hướng -->
    <div class="flex items-center justify-between mb-6 relative z-10">
      <div class="flex items-center">
        <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md mr-4">
          <span class="text-2xl">✨</span>
        </div>
        <div>
          <h2 class="text-2xl font-black tracking-tight">DÀNH RIÊNG CHO BẠN</h2>
          <p class="text-xs text-indigo-100 opacity-90 italic">
            Dựa trên sở thích đọc thể loại
            <span class="font-bold underline text-white">{{ homeStore.topCategory }}</span> của bạn
          </p>
        </div>
      </div>

      <!-- Nút Prev / Next (Chỉ hiển thị khi có nhiều hơn 4 truyện) -->
      <div v-if="homeStore.recommendedList.length > 4" class="flex space-x-2">
        <button
          @click="prevSlide"
          class="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors shadow-sm"
          title="Trở về"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          class="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors shadow-sm"
          title="Tiếp theo"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <!-- Danh sách truyện -->
    <TransitionGroup
      name="smooth-fade"
      tag="div"
      class="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10"
    >
      <div
        v-for="manga in visibleMangas"
        :key="manga._id"
        @click="router.push(`/truyen/${manga.slug}`)"
        class="group bg-white/10 backdrop-blur-md p-2 rounded-2xl hover:bg-white/25 cursor-pointer transition duration-300 border border-white/10 shadow-lg"
      >
        <!-- Khung chứa ảnh bìa (Đã thêm class relative) -->
        <div class="overflow-hidden rounded-xl aspect-[3/4] mb-2 relative">
          <img
            :src="`${homeStore.IMAGE_RESOURCES}${manga.thumb_url}`"
            class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />

          <!-- Badge hiển thị Chapter mới nhất -->
          <div
            v-if="manga.chaptersLatest && manga.chaptersLatest.length > 0"
            class="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-md"
          >
            Chương {{ manga.chaptersLatest[0].chapter_name }}
          </div>
        </div>

        <p class="text-[11px] font-bold line-clamp-1 text-center">{{ manga.name }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Hiệu ứng khi truyện mới XUẤT HIỆN */
.smooth-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}
.smooth-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px); /* Phóng to nhẹ và trượt từ dưới lên */
}

/* Hiệu ứng khi truyện cũ BIẾN MẤT */
.smooth-fade-leave-active {
  transition: all 0.4s ease;
  display: none; /* Ẩn ngay lập tức truyện cũ để không làm vỡ bố cục Grid */
}
.smooth-fade-leave-to {
  opacity: 0;
}
</style>
