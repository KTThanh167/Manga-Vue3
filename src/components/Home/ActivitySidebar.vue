<script setup>
import GlobalChat from '../GlobalChat/GlobalChat.vue'
</script>

<template>
  <div class="w-full lg:w-80 shrink-0">
    <div class="sticky top-[100px] flex flex-col" style="height: calc(100vh - 120px)">
      <GlobalChat class="flex-1 min-h-0 flex flex-col overflow-hidden" />
    </div>
  </div>
</template>
