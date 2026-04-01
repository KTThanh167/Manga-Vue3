<script setup>
defineProps(['username'])
defineEmits(['logout'])
</script>

<template>
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">Xin chào, {{ username }}</span>
          <button
            @click="$emit('logout')"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
