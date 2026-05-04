<script setup>
defineEmits(['changeSection'])
</script>

<template>
  <div class="bg-white shadow rounded-lg mb-8">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Quản Lý Nhanh</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="$emit('changeSection', 'users')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium transition"
        >
          👥 Quản Lý User
        </button>
        <!-- <button
          @click="$emit('changeSection', 'reports')"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md text-sm font-medium transition"
        >
          🚨 Báo Cáo
        </button>
        <button
          @click="$emit('changeSection', 'settings')"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-md text-sm font-medium transition"
        >
          ⚙️ Cài Đặt
        </button> -->
        <button
          @click="$emit('changeSection', 'local_mangas')"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md text-sm font-medium transition"
        >
          📚 Truyện Nội Bộ
        </button>
      </div>
    </div>
  </div>
</template>
