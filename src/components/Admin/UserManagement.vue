<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Quản Lý Người Dùng</h3>
        <div class="flex gap-2">
          <button
            @click="showAddUserModal = true"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            ➕ Thêm User
          </button>
          <button
            @click="refreshUsers"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">Đang tải...</p>
      </div>
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500 mb-2">
          <span class="text-lg">⚠️</span>
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
      <div v-else-if="users.length === 0" class="text-center py-8 text-gray-500">
        Chưa có dữ liệu người dùng
      </div>
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
            <tr v-for="user in users" :key="user.id">
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
                      : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{ user.user_type === 'supabase' ? 'Supabase' : 'Custom' }}
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
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ user.is_active ? 'Hoạt động' : 'Vô hiệu' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(user.created_at).toLocaleDateString('vi-VN') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="changeUserRole(user)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  {{ user.role === 'admin' ? 'Hạ Quyền' : 'Lên Admin' }}
                </button>
                <button
                  @click="toggleUserStatus(user)"
                  class="text-yellow-600 hover:text-yellow-900 mr-3"
                >
                  {{ user.is_active ? 'Vô hiệu' : 'Kích hoạt' }}
                </button>
                <button @click="deleteUser(user)" class="text-red-600 hover:text-red-900">
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
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 class="text-xl font-bold mb-4 text-green-600">Thêm User Mới</h3>

        <form @submit.prevent="addUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              placeholder="user@example.com"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              v-model="newUser.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              placeholder="tên hiển thị"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              v-model="newUser.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="loadingAddUser"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              <span v-if="loadingAddUser" class="inline-block mr-2">⏳</span>
              {{ loadingAddUser ? 'Đang thêm...' : 'Thêm User' }}
            </button>
            <button
              type="button"
              @click="closeAddUserModal"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
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

// Lấy danh sách user từ cả profiles và custom_users
const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    // Lấy users từ profiles (Supabase Auth)
    const { data: profileUsers, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Lấy users từ custom_users (thêm thủ công)
    const { data: customUsers, error: customError } = await supabase
      .from('custom_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      error.value = `Lỗi tải profiles: ${profileError.message}`
    }
    if (customError) {
      console.error('Error fetching custom users:', customError)
      if (!error.value) error.value = `Lỗi tải custom users: ${customError.message}`
    }

    // Merge và đánh dấu loại user
    const allUsers = [
      ...(profileUsers || []).map((user) => ({ ...user, user_type: 'supabase', is_active: true })),
      ...(customUsers || []).map((user) => ({ ...user, user_type: 'custom' })),
    ]

    users.value = allUsers
  } catch (error) {
    console.error('Error fetching users:', error)
    error.value = 'Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối database.'
  } finally {
    loading.value = false
  }
}

// Kiểm tra admin role hiện tại
const checkIsAdmin = async () => {
  const result = await supabase.auth.getUser()
  const user = result?.data?.user
  if (!user) {
    error.value = 'Bạn chưa đăng nhập.'
    return false
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile) {
    error.value =
      'Không tìm thấy profile admin. Vui lòng liên hệ quản trị viên và kiểm tra bảng profiles.'
    return false
  }

  if (profile.role !== 'admin') {
    error.value = 'Bạn cần quyền admin để thực hiện thao tác này.'
    return false
  }

  return true
}

// Refresh danh sách user
const refreshUsers = () => {
  fetchUsers()
}

// Thay đổi role user
const changeUserRole = async (user) => {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const table = user.user_type === 'supabase' ? 'profiles' : 'custom_users'

    const { error } = await supabase.from(table).update({ role: newRole }).eq('id', user.id)

    if (error) throw error

    // Refresh danh sách
    await fetchUsers()
    alert(`Đã cập nhật quyền thành công!`)
  } catch (error) {
    console.error('Error updating role:', error)
    alert('Không thể cập nhật quyền')
  }
}

// Toggle trạng thái user
const toggleUserStatus = async (user) => {
  if (user.user_type === 'supabase') {
    alert('Không thể vô hiệu hóa user Supabase Auth. Chỉ có thể xóa.')
    return
  }

  try {
    const { error } = await supabase
      .from('custom_users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)

    if (error) throw error

    await fetchUsers()
    alert(`Đã ${user.is_active ? 'vô hiệu hóa' : 'kích hoạt'} user thành công!`)
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Không thể cập nhật trạng thái')
  }
}

// Xóa user
const deleteUser = async (user) => {
  if (!confirm(`Bạn có chắc muốn xóa user "${user.username || user.email}"?`)) return

  try {
    const table = user.user_type === 'supabase' ? 'profiles' : 'custom_users'

    const { error } = await supabase.from(table).delete().eq('id', user.id)

    if (error) throw error

    // Refresh danh sách
    await fetchUsers()
    alert('Đã xóa user thành công!')
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Không thể xóa user')
  }
}

// Thêm user mới
const addUser = async () => {
  loadingAddUser.value = true
  try {
    const admin = await checkIsAdmin()
    if (!admin) {
      throw new Error('Chỉ admin mới được thêm user.')
    }

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
    alert('Đã thêm user thành công!')
  } catch (error) {
    console.error('Error adding user:', error)
    alert('Không thể thêm user: ' + (error?.message || error))
  } finally {
    loadingAddUser.value = false
  }
}

// Đóng modal thêm user
const closeAddUserModal = () => {
  showAddUserModal.value = false
  newUser.value = {
    email: '',
    username: '',
    role: 'user',
  }
}

onMounted(() => {
  fetchUsers()
})

// Expose functions for parent component
defineExpose({
  refreshUsers,
})
</script>
