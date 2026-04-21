<script setup>
import { useMangaStore } from '../../stores/manga'
import { useRouter } from 'vue-router'

const props = defineProps({
  manga: Object,
  imageResources: String,
})

const mangaStore = useMangaStore()
const router = useRouter()

// Hàm chuyển danh mục
const goToCategory = (cat) => {
  router.push({ path: '/search', query: { category: cat.slug } })
}

// Hàm "Đọc từ đầu"
const startReading = () => {
  if (!props.manga.chapters || props.manga.chapters.length === 0) {
    alert('Truyện chưa có chương để đọc!')
    return
  }

  // Logic lấy chương đầu tiên (Tùy cấu trúc API của bạn)
  const firstChapter = props.manga.chapters[0].server_data.slice(-1)[0]

  router.push({
    name: 'ReadManga',
    params: {
      slug: props.manga.slug,
      chapter: String(firstChapter.chapter_name),
    },
    query: { api: firstChapter.chapter_api_data },
  })
}

// Hàm "Đọc tiếp"
const continueReading = () => {
  const history = mangaStore.lastReadChapter
  if (!history) return

  router.push({
    name: 'ReadManga',
    params: {
      slug: props.manga.slug,
      chapter: String(history.last_chapter_name),
    },
    query: { api: history.chapter_api_data },
  })
}
</script>

<template>
  <div
    class="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-[20px]"
  >
    <div class="w-full md:w-1/3 lg:w-1/4">
      <div class="overflow-hidden rounded-xl shadow-lg shadow-indigo-100">
        <img
          :src="`${imageResources}${manga.thumb_url}`"
          class="w-full aspect-[2/3] object-cover brightness-95 contrast-105"
          loading="lazy"
        />
      </div>

      <div class="flex flex-col gap-3 mt-4">
        <button
          @click="mangaStore.toggleFollow(manga)"
          :class="[
            'w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2',
            mangaStore.isFollowed
              ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
              : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100',
          ]"
        >
          {{ mangaStore.isFollowed ? 'Đã Theo Dõi' : 'Theo Dõi' }}
        </button>

        <button
          v-if="mangaStore.lastReadChapter"
          @click="continueReading"
          class="w-full py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
        >
          Đọc tiếp
        </button>

        <button
          @click="startReading"
          class="w-full py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition"
        >
          Đọc từ đầu
        </button>
      </div>
    </div>

    <div class="flex-1">
      <h1 class="text-3xl font-bold text-indigo-600 mb-2">{{ manga.name }}</h1>
      <p class="text-gray-500 mb-6 italic">{{ manga.origin_name?.[0] }}</p>

      <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div class="flex items-center gap-2">
          <span class="font-bold text-indigo-600">Tình trạng:</span>
          <span class="bg-blue-50 text-gray-700 px-2 py-0.5 rounded-md font-semibold">{{
            manga.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-indigo-600">Lượt xem:</span>
          <span class="text-gray-700 font-bold">{{ manga.view?.toLocaleString() || 0 }}</span>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="font-bold text-indigo-600 text-sm mb-3 uppercase tracking-wider">Thể loại</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in manga.category"
            :key="cat.id"
            @click="goToCategory(cat)"
            class="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <h2 class="text-indigo-600 font-bold text-lg mb-2">Nội dung tóm tắt</h2>
      <div
        class="text-gray-600 leading-relaxed text-sm overflow-y-auto max-h-48 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner"
        v-html="manga.content"
      ></div>
    </div>
  </div>
</template>
