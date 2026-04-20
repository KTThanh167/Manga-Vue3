<script setup>
import { computed } from 'vue'
import { useHomeStore } from '../../stores/home'
import { useRoute, useRouter } from 'vue-router'

const homeStore = useHomeStore()
const route = useRoute()
const router = useRouter()

// 1. Lấy trang hiện tại trực tiếp từ URL để đảm bảo luôn đúng khi F5
const currentPage = computed(() => {
  return Number(route.query.page) || 1
})

// 2. Giả định mỗi trang có 24 item
const itemsPerPage = 24
const totalPages = computed(() => {
  return Math.ceil(homeStore.totalItems / itemsPerPage) || 1
})

// 3. Logic hiển thị các số trang
const visiblePages = computed(() => {
  const current = currentPage.value
  const max = totalPages.value

  if (current === 1) return [1, 2, 3].filter((p) => p <= max)
  if (current === max) return [max - 2, max - 1, max].filter((p) => p > 0)
  return [current - 1, current, current + 1].filter((p) => p > 0 && p <= max)
})

const goToPage = (page) => {
  // Chặn nếu click vào trang hiện tại hoặc trang không hợp lệ
  if (page < 1 || page > totalPages.value || homeStore.loading || page === currentPage.value) return

  router.push({
    query: {
      ...route.query,
      page: page, // Vue Router sẽ tự chuyển page thành string trên URL
    },
  })
}
</script>

<template>
  <div
    v-if="!homeStore.isSearching && homeStore.totalItems > itemsPerPage"
    class="mt-12 flex flex-wrap justify-center items-center gap-2 pb-10"
  >
    <button
      v-if="currentPage > 1"
      @click="goToPage(1)"
      class="px-3 h-10 rounded-xl bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs transition shadow-sm uppercase tracking-tighter"
    >
      Đầu
    </button>

    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-indigo-50 disabled:opacity-30 transition shadow-sm flex items-center justify-center"
    >
      ❮
    </button>

    <div class="flex gap-2">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm border',
          currentPage === page
            ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-indigo-200'
            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300',
        ]"
      >
        {{ page }}
      </button>
    </div>

    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage >= totalPages"
      class="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-indigo-50 disabled:opacity-30 transition shadow-sm flex items-center justify-center"
    >
      ❯
    </button>

    <button
      v-if="currentPage < totalPages"
      @click="goToPage(totalPages)"
      class="px-3 h-10 rounded-xl bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs transition shadow-sm uppercase tracking-tighter"
    >
      Cuối ({{ totalPages }})
    </button>
  </div>
</template>
