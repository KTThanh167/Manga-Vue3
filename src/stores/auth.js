import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null, // Thống nhất dùng tên này
  }),
  getters: {
    isAdmin: (state) => state.profile?.role === 'admin',
  },
  actions: {
    async initAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        this.user = session.user
        await this.fetchProfile()
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          this.user = session.user
          await this.fetchProfile()
        } else {
          this.user = null
          this.profile = null
        }
      })
    },

    async fetchProfile() {
      if (!this.user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single()

      if (!error && data) {
        this.profile = data // Gán vào biến profile
        return data
      }
      return null
    },

    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
      localStorage.removeItem('manga_followed')
    },
  },
})
