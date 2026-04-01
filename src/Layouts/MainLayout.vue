<script setup>
import TheHeader from '@/components/Layouts/TheHeader.vue'
import TheFooter from '@/components/Layouts/TheFooter.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div class="sticky top-0 z-50">
      <TheHeader />
    </div>

    <main class="flex-grow">
      <router-view />
    </main>

    <div class="mt-auto">
      <TheFooter />
    </div>
  </div>
</template>
