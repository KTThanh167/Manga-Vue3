<script setup>
defineProps({
  title: String,
  value: [Number, String],
  icon: String, // Có thể truyền Emoji hoặc Icon chữ
  colorClass: String, // Lớp màu nền (VD: 'bg-blue-500' hoặc 'bg-gradient-to-br from-blue-500 to-indigo-600')
})
</script>

<template>
  <div
    class="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
  >
    <div
      class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent group-hover:animate-[shimmer_1s_forwards] pointer-events-none z-0"
    ></div>

    <div class="flex items-center gap-5 relative z-10">
      <div
        :class="[
          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300',
          colorClass,
        ]"
      >
        <span class="text-white text-xl font-black drop-shadow-md">{{ icon }}</span>
      </div>

      <div class="flex flex-col">
        <h4
          class="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1"
        >
          {{ title }}
        </h4>
        <p class="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Keyframe cho hiệu ứng vệt sáng lướt qua */
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
