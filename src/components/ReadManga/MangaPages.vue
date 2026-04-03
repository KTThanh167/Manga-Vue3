<script setup>
defineProps({
  images: Array,
})
</script>

<template>
  <div class="flex flex-col">
    <div v-for="(src, index) in images" :key="index" class="relative group">
      <img :src="src" class="w-full h-auto block" loading="lazy" :alt="'Trang ' + (index + 1)" />
      <span
        class="absolute top-2 right-2 text-[10px] bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
      >
        {{ index + 1 }} / {{ images.length }}
      </span>
    </div>
  </div>
</template>

<style scoped>
img {
  display: block;
  border: none;
  margin: 0;
}
</style>
