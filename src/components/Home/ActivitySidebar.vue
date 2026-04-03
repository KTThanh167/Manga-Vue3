<script setup>
import { useHomeStore } from '../../stores/home'
import GlobalChat from '../GlobalChat/GlobalChat.vue'

const homeStore = useHomeStore()
</script>

<template>
  <div class="w-full lg:w-80 shrink-0">
    <div class="sticky top-[100px]">
      <GlobalChat />

      <div class="mt-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Hoạt động</h4>
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm text-gray-600">Tổng truyện:</span>
          <span class="text-sm font-bold text-indigo-600">
            {{ homeStore.totalItems.toLocaleString() }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Đang trực tuyến:</span>
          <span class="flex items-center text-sm font-bold text-green-500">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
            {{ homeStore.onlineCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
