<script setup>
import TheHeader from '@/components/Layouts/TheHeader.vue'
import TheFooter from '@/components/Layouts/TheFooter.vue'
</script>

<template>
  <div class="sticky top-0 z-50">
    <TheHeader />
  </div>
  <router-view />
  <div>
    <TheFooter />
  </div>
</template>
