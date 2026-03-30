import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
  // 1. State: Nơi lưu trữ dữ liệu user
  state: () => ({
    user: null,
    userProfile: null,
  }),

  // 2. Actions: Các hàm xử lý logic
  actions: {
    async fetchProfile() {
      // Lấy user đang đăng nhập từ session
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        this.user = user
        // Lấy thông tin chi tiết (role, username) từ bảng profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error) {
          this.userProfile = data
          return data
        }
      }
      return null
    },

    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.userProfile = null
    },
  },
})
