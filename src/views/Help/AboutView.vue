<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Phần Header -->
      <div class="text-center mb-16">
        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          <span class="text-blue-600">Manga Real</span>
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          Nền tảng đọc truyện tranh trực tuyến hiện đại, mượt mà và thông minh.
        </p>
      </div>

      <!-- Khối nội dung chính -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- 1. Mục tiêu dự án -->
        <div class="p-8 sm:p-10 border-b border-gray-100">
          <div class="flex items-center mb-4 justify-center">
            <span class="text-3xl mr-4">🎯</span>
            <h2 class="text-2xl font-bold text-gray-900 mb-0">Sứ Mệnh & Mục Tiêu</h2>
          </div>
          <p class="text-gray-600 leading-relaxed text-lg text-center">
            Manga Real được xây dựng với mong muốn tạo ra một không gian kết nối giữa những người
            đam mê truyện tranh và các nhóm dịch giả. Với giao diện trực quan, tốc độ tải trang tối
            ưu và đặc biệt là kho truyện phong phú luôn được cập nhật liên tục, dự án kỳ vọng mang
            lại trải nghiệm giải trí tuyệt vời nhất cho độc giả.
          </p>
        </div>

        <!-- 2. Công nghệ sử dụng -->
        <div class="p-8 sm:p-10 bg-gray-50 border-b border-gray-100">
          <div class="flex items-center mb-6">
            <span class="text-3xl mr-4">💻</span>
            <h2 class="text-2xl font-bold text-gray-900">Công Nghệ Cốt Lõi</h2>
          </div>
          <p class="text-gray-600 mb-6">
            Hệ thống được phát triển dựa trên các công nghệ web tiên tiến nhất hiện nay:
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              class="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div class="font-bold text-green-600 text-lg">Vue 3</div>
              <div class="text-sm text-gray-500 mt-1">Frontend Framework</div>
            </div>
            <div
              class="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div class="font-bold text-sky-500 text-lg">Tailwind CSS</div>
              <div class="text-sm text-gray-500 mt-1">UI / Styling</div>
            </div>
            <div
              class="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div class="font-bold text-emerald-600 text-lg">Supabase</div>
              <div class="text-sm text-gray-500 mt-1">Database & Auth</div>
            </div>
            <div
              class="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div class="font-bold text-purple-600 text-lg">Gemini AI</div>
              <div class="text-sm text-gray-500 mt-1">Vector Embedding</div>
            </div>
            <div
              class="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div class="font-bold text-purple-600 text-lg">Ant Design Vue</div>
              <div class="text-sm text-gray-500 mt-1">UI Component Library</div>
            </div>
          </div>
        </div>

        <!-- 3. Về tác giả -->
        <div class="p-8 sm:p-10">
          <div class="flex items-center mb-4 justify-center">
            <span class="text-3xl mr-4">👨‍💻</span>
            <h2 class="text-2xl font-bold text-gray-900 mb-0">Về Tác Giả</h2>
          </div>
          <div class="prose prose-blue prose-lg text-gray-600 text-center">
            <p>
              Xin chào, mình là <strong>Thành</strong> - một lập trình viên Web Frontend đam mê công
              nghệ và truyện tranh.
            </p>
            <p class="mt-4">
              <strong>Manga Real</strong> không chỉ là một trang web đọc truyện, mà còn là
              <strong>Đồ án Tốt nghiệp (Graduation Project)</strong> chứa đựng rất nhiều tâm huyết
              của mình. Dự án là nơi mình đúc kết và áp dụng thực tế những kiến thức đã học, từ việc
              quản lý state, xây dựng cơ sở dữ liệu thời gian thực, cho đến việc tích hợp trí tuệ
              nhân tạo (AI) vào các tính năng hệ thống.
            </p>
            <p class="mt-4">
              Rất mong nhận được sự ủng hộ, đóng góp ý kiến từ độc giả và các thầy cô để dự án ngày
              một hoàn thiện hơn!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
onMounted(() => {
  window.scrollTo(0, 0)
})
</script>
