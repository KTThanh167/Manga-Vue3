import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from './auth'

export const useMangaStore = defineStore('manga', {
  state: () => ({
    readingHistory: [],
  }),

  actions: {
    async recordReadingHistory(manga) {
      const auth = useAuthStore()
      if (!auth.user) return // Nếu chưa đăng nhập thì không lưu hoặc lưu vào LocalStorage tùy bạn

      const historyData = {
        user_id: auth.user.id,
        manga_name: manga.title,
        manga_slug: manga.slug,
        category_list: manga.categories || [], // Đảm bảo là một mảng
        last_read_at: new Date().toISOString(),
      }

      // Sử dụng upsert: Supabase sẽ dựa vào 'manga_slug' và 'user_id' để quyết định
      // (Lưu ý: Bạn cần thiết lập Unique Constraint trên Database cho cặp user_id + manga_slug)
      const { data, error } = await supabase
        .from('reading_history')
        .upsert(historyData, {
          onConflict: 'user_id, manga_slug',
        })
        .select()

      if (!error) {
        // Cập nhật lại state trong Pinia để UI thay đổi ngay lập tức
        this.fetchReadingHistory()
        console.log(data)
      } else {
        console.error('Lỗi lưu lịch sử:', error.message)
      }
    },

    // stores/manga.js
    async fetchReadingHistory() {
      const auth = useAuthStore()
      if (!auth.user) return

      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('last_read_at', { ascending: false })

      if (error) {
        console.error('Lỗi lấy lịch sử:', error.message)
        return
      }

      // QUAN TRỌNG: Phải gán data vào state của Pinia
      this.readingHistory = data
    },
  },
})
