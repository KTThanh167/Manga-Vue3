<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Quản Lý Người Dùng</h3>
        <div class="flex gap-2">
          <button
            @click="showAddUserModal = true"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            ➕ Thêm User
          </button>
          <button
            @click="refreshUsers"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      <!-- Trạng thái Loading -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">Đang tải dữ liệu...</p>
      </div>

      <!-- Trạng thái Lỗi -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500 mb-2">
          <span class="text-3xl">⚠️</span>
        </div>
        <p class="text-red-600 font-medium">{{ error }}</p>
        <p class="text-gray-500 text-sm mt-2">
          Vui lòng kiểm tra cấu hình database hoặc liên hệ admin.
        </p>
        <button
          @click="refreshUsers"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Thử lại
        </button>
      </div>

      <!-- Trạng thái Trống -->
      <div v-else-if="users.length === 0" class="text-center py-8 text-gray-500">
        Chưa có dữ liệu người dùng
      </div>

      <!-- Bảng Dữ Liệu -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Username
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Loại
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Trạng Thái
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ngày Tạo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ user.username || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.user_type === 'supabase'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800',
                  ]"
                >
                  {{ user.user_type === 'supabase' ? 'Supabase Auth' : 'Custom' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{ user.role || 'user' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ user.is_active ? 'Hoạt động' : 'Vô hiệu' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(user.created_at || user.updated_at).toLocaleDateString('vi-VN') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="changeUserRole(user)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors"
                >
                  {{ user.role === 'admin' ? 'Hạ Quyền' : 'Lên Admin' }}
                </button>

                <!-- Chỉ hiện nút Vô hiệu hóa với user Custom -->
                <button
                  v-if="user.user_type !== 'supabase'"
                  @click="toggleUserStatus(user)"
                  class="text-yellow-600 hover:text-yellow-900 mr-3 transition-colors"
                >
                  {{ user.is_active ? 'Vô hiệu' : 'Kích hoạt' }}
                </button>

                <button
                  @click="deleteUser(user)"
                  class="text-red-600 hover:text-red-900 transition-colors"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Thêm User -->
    <div
      v-if="showAddUserModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-96 transform transition-all">
        <h3 class="text-xl font-bold mb-4 text-green-600">Thêm User Khách (Custom)</h3>

        <form @submit.prevent="addUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-green-500 focus:border-green-500"
              placeholder="user@example.com"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              v-model="newUser.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-green-500 focus:border-green-500"
              placeholder="Tên hiển thị"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              v-model="newUser.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-green-500 focus:border-green-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="loadingAddUser"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <span v-if="loadingAddUser" class="inline-block mr-2 animate-spin">⏳</span>
              {{ loadingAddUser ? 'Đang thêm...' : 'Lưu User' }}
            </button>
            <button
              type="button"
              @click="closeAddUserModal"
              class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabaseClient'
import { message } from 'ant-design-vue'

const users = ref([])
const loading = ref(false)
const loadingAddUser = ref(false)
const showAddUserModal = ref(false)
const error = ref('')
const newUser = ref({
  email: '',
  username: '',
  role: 'user',
})

// Kiểm tra quyền Admin (Sử dụng chung cho mọi thao tác nhạy cảm)
const checkIsAdmin = async () => {
  const result = await supabase.auth.getUser()
  const user = result?.data?.user

  if (!user) {
    message.error('Bạn chưa đăng nhập hoặc phiên đã hết hạn.')
    return false
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile || profile.role !== 'admin') {
    message.error('Từ chối truy cập: Bạn cần quyền Admin để thực hiện thao tác này.')
    return false
  }

  return true
}

// Tối ưu hóa: Lấy dữ liệu song song (Promise.all) để tải trang nhanh hơn
const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const [{ data: profileUsers, error: profileError }, { data: customUsers, error: customError }] =
      await Promise.all([
        supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
        supabase.from('custom_users').select('*').order('updated_at', { ascending: false }),
      ])

    if (profileError) throw profileError
    if (customError) throw customError

    const allUsers = [
      ...(profileUsers || []).map((user) => ({ ...user, user_type: 'supabase', is_active: true })),
      ...(customUsers || []).map((user) => ({ ...user, user_type: 'custom' })),
    ]

    users.value = allUsers
  } catch (err) {
    console.error('Lỗi tải danh sách người dùng:', err)
    error.value = 'Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối database.'
  } finally {
    loading.value = false
  }
}

const refreshUsers = () => {
  fetchUsers()
}

// Thay đổi role
const changeUserRole = async (user) => {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return

  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const table = user.user_type === 'supabase' ? 'profiles' : 'custom_users'

    const { error } = await supabase.from(table).update({ role: newRole }).eq('id', user.id)
    if (error) throw error

    await fetchUsers()
    message.success(`Đã cập nhật quyền thành công!`)
  } catch (error) {
    console.error('Lỗi cập nhật quyền:', error)
    message.error('Không thể cập nhật quyền.')
  }
}

// Bật/tắt trạng thái (Chỉ áp dụng cho custom_users)
const toggleUserStatus = async (user) => {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return

  try {
    const { error } = await supabase
      .from('custom_users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)

    if (error) throw error

    await fetchUsers()
    message.success(`Đã ${user.is_active ? 'vô hiệu hóa' : 'kích hoạt'} user thành công!`)
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái:', error)
    message.error('Không thể cập nhật trạng thái.')
  }
}

// Xóa User
const deleteUser = async (user) => {
  if (!confirm(`Bạn có chắc muốn xóa hồ sơ "${user.username || user.email}"?`)) return

  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return

  try {
    // Cảnh báo đặc biệt cho user Auth
    if (user.user_type === 'supabase') {
      message.warning(
        'LƯU Ý: Thao tác này chỉ xóa hồ sơ hiển thị (Profile). Để xóa vĩnh viễn tài khoản đăng nhập của người này, bạn cần vào Dashboard Supabase -> mục Authentication -> Users để xóa.',
      )
    }

    const table = user.user_type === 'supabase' ? 'profiles' : 'custom_users'
    const { error } = await supabase.from(table).delete().eq('id', user.id)
    if (error) throw error

    await fetchUsers()
    message.success('Đã xóa hồ sơ người dùng thành công!')
  } catch (error) {
    console.error('Lỗi khi xóa:', error)
    message.error('Không thể xóa người dùng.')
  }
}

// Thêm custom user
const addUser = async () => {
  loadingAddUser.value = true

  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    loadingAddUser.value = false
    return
  }

  try {
    const { error } = await supabase.from('custom_users').insert([
      {
        email: newUser.value.email,
        username: newUser.value.username,
        role: newUser.value.role,
        is_active: true,
      },
    ])

    if (error) throw error

    await fetchUsers()
    closeAddUserModal()
    message.success('Đã thêm User thành công!')
  } catch (error) {
    console.error('Lỗi thêm user:', error)
    message.error('Không thể thêm user: ' + (error?.message || 'Lỗi không xác định'))
  } finally {
    loadingAddUser.value = false
  }
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
  newUser.value = { email: '', username: '', role: 'user' }
}

onMounted(() => {
  fetchUsers()
})

defineExpose({
  refreshUsers,
})
</script>
