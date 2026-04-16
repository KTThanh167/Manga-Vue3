<script setup>
import TheHeader from '@/components/Layouts/TheHeader.vue'
import TheFooter from '@/components/Layouts/TheFooter.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader />

    <main class="flex-grow">
      <router-view />
    </main>

    <TheFooter />
  </div>
</template>
