<script setup>
defineProps({
  images: Array,
})
</script>

<template>
  <div class="flex flex-col items-center bg-[#111] dark:bg-black w-full">
    <div
      v-for="(src, index) in images"
      :key="index"
      class="relative group w-full max-w-4xl flex justify-center"
    >
      <img
        :src="src"
        class="w-full h-auto block object-contain"
        loading="lazy"
        :alt="'Trang ' + (index + 1)"
      />

      <div
        class="absolute top-4 right-4 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      >
        <span
          class="bg-black/60 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest border border-white/10 shadow-lg"
        >
          {{ index + 1 }} / {{ images.length }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset tuyệt đối để loại bỏ mọi khe hở giữa các ảnh */
img {
  display: block;
  border: none;
  margin: 0;
  padding: 0;
  vertical-align: top;
}
</style>
