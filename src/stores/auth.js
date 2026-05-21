import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null, // Thống nhất dùng tên này
    initialized: false,
    authSubscription: null,
    profilePromise: null,
    profilePromiseUserId: null,
  }),
  getters: {
    isAdmin: (state) => state.profile?.role === 'admin',
  },
  actions: {
    async initAuth() {
      if (this.authSubscription) return

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        this.user = session?.user ?? null
        if (this.user) {
          await this.fetchProfile()
        }
      } catch (error) {
        console.error('Lỗi khởi tạo đăng nhập:', error)
        this.user = null
        this.profile = null
      } finally {
        this.initialized = true
      }

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          this.user = session.user
          window.setTimeout(() => {
            this.fetchProfile()
          }, 0)
        } else {
          this.user = null
          this.profile = null
        }
      })

      this.authSubscription = data.subscription
    },

    async fetchProfile() {
      if (!this.user) return null
      if (this.profile?.id === this.user.id) return this.profile

      const userId = this.user.id
      if (this.profilePromise && this.profilePromiseUserId === userId) {
        return this.profilePromise
      }

      this.profilePromiseUserId = userId
      this.profilePromise = (async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (!error && data) {
            this.profile = data // Gán vào biến profile
            return data
          }
        } catch (error) {
          console.error('Lỗi tải hồ sơ người dùng:', error)
        } finally {
          this.profilePromise = null
          this.profilePromiseUserId = null
        }

        return null
      })()

      return this.profilePromise
    },

    async refreshSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      this.user = session?.user ?? null
      if (this.user) {
        await this.fetchProfile()
      } else {
        this.profile = null
      }

      return session
    },

    clearProfile() {
      this.user = null
      this.profile = null
      this.profilePromise = null
      this.profilePromiseUserId = null
    },

    async logout() {
      await supabase.auth.signOut()
      this.clearProfile()
      localStorage.removeItem('manga_followed')
    },
  },
})
