import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
  // 1. State: Nơi lưu trữ dữ liệu user
  state: () => ({
    user: null,
    userProfile: null,
  }),
  // 2. Getters: Các hàm tính toán dựa trên state
  getters: {
    isAdmin: (state) => state.userProfile?.role === 'admin',
  },
  // 3. Actions: Các hàm xử lý logic
  actions: {
    async fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        this.user = user
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error) {
          this.userProfile = data
          // Gộp thêm role từ app_metadata vào để chắc chắn
          if (!this.userProfile.role) {
            this.userProfile.role = user.app_metadata?.role
          }
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
