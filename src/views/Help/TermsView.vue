<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Tiêu đề trang -->
      <div class="bg-slate-800 px-8 py-10 text-white text-center">
        <h1 class="text-3xl font-extrabold sm:text-4xl mb-4">Điều Khoản Dịch Vụ</h1>
        <p class="text-slate-300">Cập nhật lần cuối: {{ currentDate }}</p>
      </div>

      <!-- Nội dung Điều khoản -->
      <div class="p-8 sm:p-12 text-gray-700 leading-relaxed space-y-8">
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            1. Chấp nhận Điều khoản
          </h2>
          <p>
            Bằng việc truy cập và sử dụng nền tảng đọc truyện <strong>Manga Real</strong>, bạn xác
            nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản và điều kiện được
            nêu tại trang này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử
            dụng dịch vụ.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            2. Tài khoản Người dùng
          </h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Bạn tự chịu trách nhiệm bảo mật thông tin đăng nhập (Email, Mật khẩu).</li>
            <li>
              Nghiêm cấm hành vi tạo tài khoản hàng loạt để spam, phá hoại hệ thống hoặc quấy rối
              người dùng khác.
            </li>
            <li>
              Admin có quyền đình chỉ hoặc xóa tài khoản vĩnh viễn (Vô hiệu hóa user) nếu phát hiện
              các hành vi vi phạm mà không cần báo trước.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            3. Bản quyền & Nội dung đăng tải
          </h2>
          <p class="mb-3">
            Đây là nền tảng chia sẻ và kết nối cộng đồng. Quy định đối với nội dung như sau:
          </p>
          <ul class="list-disc pl-6 space-y-2">
            <li>
              <strong>Manga Real</strong> tôn trọng quyền sở hữu trí tuệ. Tất cả nội dung truyện
              tranh trên web đều do cộng đồng đóng góp hoặc thu thập từ các nguồn chia sẻ công cộng.
            </li>
            <li>
              Người dùng đóng góp truyện phải tự chịu trách nhiệm về nội dung đăng tải. Tuyệt đối
              cấm các nội dung đồi trụy, phản động, hoặc vi phạm nghiêm trọng pháp luật hiện hành.
            </li>
            <li>
              Nếu bạn là tác giả/người giữ bản quyền và phát hiện nội dung của mình bị đăng tải trái
              phép, vui lòng liên hệ trực tiếp với Admin qua trang Liên Hệ để được hỗ trợ gỡ bỏ ngay
              lập tức.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            4. Quyền Riêng tư & Dữ liệu
          </h2>
          <p>
            Hệ thống chỉ thu thập các thông tin cơ bản (Email, Tên hiển thị) để phục vụ cho việc tạo
            tài khoản, lưu trữ lịch sử đọc truyện và danh sách yêu thích của riêng bạn. Chúng tôi
            cam kết không bán hoặc chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            5. Miễn trừ Trách nhiệm
          </h2>
          <p>
            Manga Real cung cấp dịch vụ "nguyên trạng". Chúng tôi không đảm bảo rằng nền tảng sẽ
            hoạt động liên tục 100% không gặp lỗi, hay toàn bộ dữ liệu sẽ không bao giờ bị mất do
            các sự cố kỹ thuật bất khả kháng.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            6. Thay đổi Điều khoản
          </h2>
          <p>
            Chúng tôi có quyền sửa đổi, bổ sung các điều khoản này vào bất kỳ lúc nào để phù hợp với
            sự phát triển của nền tảng. Các thay đổi sẽ có hiệu lực ngay khi được cập nhật trên
            trang này.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

// Tự động lấy ngày tháng hiện tại làm ngày "Cập nhật lần cuối"
const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>
