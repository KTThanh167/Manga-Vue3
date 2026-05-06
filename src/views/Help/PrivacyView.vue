<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Tiêu đề trang -->
      <div class="bg-blue-800 px-8 py-10 text-white text-center">
        <h1 class="text-3xl font-extrabold sm:text-4xl mb-4">Chính Sách Bảo Mật</h1>
        <p class="text-blue-200">Cập nhật lần cuối: {{ currentDate }}</p>
      </div>

      <!-- Nội dung Chính sách -->
      <div class="p-8 sm:p-12 text-gray-700 leading-relaxed space-y-8">
        <p class="text-lg">
          Chào mừng bạn đến với <strong>Manga Real</strong>. Việc bảo vệ thông tin cá nhân của người
          dùng là ưu tiên hàng đầu của chúng tôi. Chính sách này giải thích cách chúng tôi thu thập,
          sử dụng và bảo vệ dữ liệu của bạn khi bạn sử dụng nền tảng.
        </p>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            1. Thông tin chúng tôi thu thập
          </h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>
              <strong>Thông tin tài khoản:</strong> Khi bạn đăng ký, chúng tôi thu thập Email, Tên
              hiển thị (Username) và Mật khẩu.
            </li>
            <li>
              <strong>Dữ liệu sử dụng:</strong> Lịch sử đọc truyện, danh sách truyện yêu thích
              (Bookmark) và các bình luận bạn đăng tải trên hệ thống.
            </li>
            <li>
              <strong>Dữ liệu kỹ thuật:</strong> Cookie phiên đăng nhập để giữ bạn luôn trong trạng
              thái đăng nhập khi quay lại web.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            2. Mục đích sử dụng dữ liệu
          </h2>
          <p class="mb-3">Chúng tôi chỉ sử dụng thông tin của bạn cho các mục đích thiết yếu:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>
              Cung cấp, duy trì và cá nhân hóa trải nghiệm đọc truyện của bạn (đồng bộ lịch sử đọc,
              đánh dấu chương).
            </li>
            <li>Quản lý hệ thống, xác thực danh tính và ngăn chặn các hành vi gian lận, spam.</li>
            <li>
              Liên hệ với bạn trong các trường hợp cần thiết (như hỗ trợ kỹ thuật, cấp lại mật
              khẩu).
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            3. Cam kết Bảo mật & Chia sẻ dữ liệu
          </h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>
              <strong>Không bán dữ liệu:</strong> Manga Real cam kết tuyệt đối KHÔNG bán, cho thuê
              hoặc trao đổi thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương
              mại.
            </li>
            <li>
              <strong>Công nghệ bảo mật:</strong> Mật khẩu và dữ liệu xác thực của bạn được mã hóa
              an toàn một chiều bởi hạ tầng máy chủ đám mây chuẩn quốc tế (Supabase). Quản trị viên
              cũng không thể nhìn thấy mật khẩu gốc của bạn.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            4. Quyền kiểm soát dữ liệu của bạn
          </h2>
          <p class="mb-3">Bạn hoàn toàn làm chủ dữ liệu của mình trên nền tảng:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>
              Bạn có thể truy cập trang <strong>Hồ sơ cá nhân (Profile)</strong> để cập nhật hoặc
              thay đổi thông tin bất kỳ lúc nào.
            </li>
            <li>
              Nếu bạn muốn ngừng sử dụng dịch vụ và xóa vĩnh viễn toàn bộ dữ liệu tài khoản, vui
              lòng gửi yêu cầu cho Admin qua trang Liên hệ.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            5. Liên hệ với chúng tôi
          </h2>
          <p>
            Nếu bạn có bất kỳ thắc mắc nào liên quan đến Chính sách bảo mật này, vui lòng liên hệ
            với ban quản trị thông qua trang
            <router-link to="/contact" class="text-blue-600 hover:underline font-medium"
              >Liên Hệ</router-link
            >.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})

// Tự động lấy ngày tháng hiện tại làm ngày "Cập nhật lần cuối"
const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})
</script>
