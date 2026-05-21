<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabaseClient'
import { message, Modal } from 'ant-design-vue'

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

// === LOGIC TÌM KIẾM, SẮP XẾP & PHÂN TRANG ===
const currentPage = ref(1)
const itemsPerPage = ref(10) // Số user hiển thị trên 1 trang
const searchQuery = ref('')
const sortBy = ref('time_desc') // Mặc định: Mới nhất

// 1. Hàm lọc và sắp xếp (Chạy tự động mỗi khi mảng users, ô tìm kiếm hoặc dropdown thay đổi)
const filteredAndSortedUsers = computed(() => {
  let result = [...users.value]

  // Lọc theo từ khóa (Tìm cả Username lẫn Email)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((user) => {
      const nameMatch = (user.username || '').toLowerCase().includes(query)
      const emailMatch = (user.email || '').toLowerCase().includes(query)
      return nameMatch || emailMatch
    })
  }

  // Sắp xếp
  result.sort((a, b) => {
    // Lấy chuỗi chuẩn để so sánh tên (Ưu tiên Username, nếu rỗng thì dùng Email)
    const nameA = (a.username || a.email).toLowerCase()
    const nameB = (b.username || b.email).toLowerCase()

    // Lấy thời gian chuẩn (Ưu tiên created_at, nếu không có thì lấy updated_at)
    const timeA = new Date(a.created_at || a.updated_at).getTime()
    const timeB = new Date(b.created_at || b.updated_at).getTime()

    if (sortBy.value === 'name_asc') {
      return nameA.localeCompare(nameB)
    } else if (sortBy.value === 'name_desc') {
      return nameB.localeCompare(nameA)
    } else if (sortBy.value === 'time_asc') {
      return timeA - timeB
    } else {
      // time_desc (Mặc định)
      return timeB - timeA
    }
  })

  return result
})

// 2. Tính tổng số trang dựa trên danh sách ĐÃ LỌC
const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedUsers.value.length / itemsPerPage.value) || 1
})

// 3. Cắt danh sách để hiển thị trên trang hiện tại
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAndSortedUsers.value.slice(start, end)
})

// Reset về trang 1 nếu người dùng gõ tìm kiếm hoặc đổi kiểu sắp xếp
watch([searchQuery, sortBy], () => {
  currentPage.value = 1
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
// ======================================

// Kiểm tra quyền Admin
const checkIsAdmin = async () => {
  try {
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
  } catch (error) {
    console.error('Lỗi kiểm tra quyền admin:', error)
    message.error('Kết nối bị gián đoạn. Vui lòng thử lại.')
    return false
  }
}

// Lấy dữ liệu song song
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

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (err) {
    console.error('Lỗi tải danh sách người dùng:', err)
    error.value = 'Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối database.'
  } finally {
    loading.value = false
  }
}

const refreshUsers = () => {
  searchQuery.value = ''
  sortBy.value = 'time_desc'
  currentPage.value = 1
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
  Modal.confirm({
    title: 'Xác nhận xóa người dùng?',
    content: `Bạn có chắc muốn xóa hồ sơ "${user.username || user.email}" không?`,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    centered: true,
    async onOk() {
      const isAdmin = await checkIsAdmin()
      if (!isAdmin) return

      try {
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
    },
  })
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

<template>
  <div
    class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl rounded-3xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
  >
    <div
      class="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"
    ></div>

    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10"
    >
      <div>
        <h3
          class="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3"
        >
          <span class="text-blue-500 text-2xl drop-shadow-sm">👥</span> Quản Lý Người Dùng
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Phân quyền, kích hoạt và quản lý tài khoản thành viên
        </p>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button
          @click="refreshUsers"
          :disabled="loading"
          class="shrink-0 p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <svg
            :class="{ 'animate-spin': loading }"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        </button>
        <button
          @click="showAddUserModal = true"
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            ></path>
          </svg>
          Thêm User
        </button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm theo Tên hiển thị hoặc Email..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 font-medium"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <div class="shrink-0 relative">
        <select
          v-model="sortBy"
          class="w-full md:w-48 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
        >
          <option value="time_desc">⏱️ Gần đây nhất</option>
          <option value="time_asc">🕰️ Cũ nhất</option>
          <option value="name_asc">🔤 Tên A ➡️ Z</option>
          <option value="name_desc">🔤 Tên Z ➡️ A</option>
        </select>
        <div
          class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 relative z-10">
      <div class="relative w-12 h-12 mb-4">
        <div
          class="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-800"
        ></div>
        <div
          class="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
        ></div>
      </div>
      <p class="text-gray-500 dark:text-gray-400 font-medium">Đang tải dữ liệu người dùng...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-16 relative z-10 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20"
    >
      <span class="text-4xl mb-3">⚠️</span>
      <p class="text-red-600 dark:text-red-400 font-bold mb-1">{{ error }}</p>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-5">
        Vui lòng kiểm tra cấu hình database hoặc liên hệ admin.
      </p>
      <button
        @click="refreshUsers"
        class="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md shadow-red-500/30"
      >
        Thử lại
      </button>
    </div>

    <div
      v-else-if="filteredAndSortedUsers.length === 0"
      class="flex flex-col items-center justify-center py-20 relative z-10 text-gray-500 dark:text-gray-400"
    >
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
      <p class="font-medium text-lg">Không tìm thấy tài khoản nào khớp với "{{ searchQuery }}"</p>
      <button
        @click="searchQuery = ''"
        class="mt-4 text-blue-500 hover:text-blue-600 font-bold underline"
      >
        Xóa bộ lọc
      </button>
    </div>

    <div v-else>
      <div
        class="relative z-10 overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm"
      >
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700/80">
          <thead class="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Username
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden md:table-cell"
              >
                Email
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Loại
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Role
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Trạng Thái
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden lg:table-cell"
              >
                Cập Nhật Gần Nhất
              </th>
              <th
                class="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800/80">
            <tr
              v-for="user in paginatedUsers"
              :key="user.id"
              class="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    {{
                      user.username
                        ? user.username.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()
                    }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">{{
                      user.username || 'N/A'
                    }}</span>
                    <span class="text-[11px] text-gray-500 dark:text-gray-400 md:hidden">{{
                      user.email
                    }}</span>
                  </div>
                </div>
              </td>

              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell"
              >
                {{ user.email }}
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border',
                    user.user_type === 'supabase'
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                      : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
                  ]"
                >
                  {{ user.user_type === 'supabase' ? 'Supabase' : 'Custom' }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border flex w-fit items-center gap-1.5',
                    user.role === 'admin'
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                  ]"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      user.role === 'admin'
                        ? 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]'
                        : 'bg-emerald-500'
                    "
                  ></span>
                  {{ user.role || 'user' }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border',
                    user.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700',
                  ]"
                >
                  {{ user.is_active ? 'Hoạt động' : 'Vô hiệu' }}
                </span>
              </td>

              <td
                class="px-6 py-4 whitespace-nowrap text-[12px] font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell"
              >
                <div class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {{
                    new Date(user.updated_at || user.created_at).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="changeUserRole(user)"
                    :class="
                      user.role === 'admin'
                        ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                        : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                    "
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    {{ user.role === 'admin' ? 'Hạ Quyền' : 'Lên Admin' }}
                  </button>

                  <button
                    v-if="user.user_type !== 'supabase'"
                    @click="toggleUserStatus(user)"
                    :class="
                      user.is_active
                        ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                    "
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    {{ user.is_active ? 'Vô hiệu' : 'Kích hoạt' }}
                  </button>

                  <button
                    @click="deleteUser(user)"
                    class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                    title="Xóa người dùng"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors duration-300"
      >
        <div class="text-[13px] font-medium text-gray-500 dark:text-gray-400">
          Hiển thị
          <span class="font-bold text-gray-900 dark:text-white">{{
            (currentPage - 1) * itemsPerPage + 1
          }}</span>
          -
          <span class="font-bold text-gray-900 dark:text-white">{{
            Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)
          }}</span>
          trong tổng số
          <span class="font-bold text-gray-900 dark:text-white">{{
            filteredAndSortedUsers.length
          }}</span>
          tài khoản
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="p-2 md:px-4 md:py-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span class="hidden md:block">Trước</span>
          </button>

          <span
            class="px-4 py-2 text-[13px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20"
          >
            Trang {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="p-2 md:px-4 md:py-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1"
          >
            <span class="hidden md:block">Sau</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showAddUserModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-500">✨</span> Thêm User Khách
          </h3>
          <button
            @click="closeAddUserModal"
            class="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="addUser" class="space-y-4">
          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Email đăng nhập</label
            >
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Username</label
            >
            <input
              v-model="newUser.username"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Tên hiển thị trên web"
            />
          </div>

          <div>
            <label
              class="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >Quyền hạn (Role)</label
            >
            <select
              v-model="newUser.role"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="user">Thành viên (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div class="flex gap-3 mt-8 pt-4">
            <button
              type="button"
              @click="closeAddUserModal"
              class="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              :disabled="loadingAddUser"
              class="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 active:scale-95 flex justify-center items-center gap-2"
            >
              <svg
                v-if="loadingAddUser"
                class="animate-spin w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              {{ loadingAddUser ? 'Đang lưu...' : 'Thêm User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
