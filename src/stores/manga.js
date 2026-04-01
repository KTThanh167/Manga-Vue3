import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from './auth'

export const useMangaStore = defineStore('manga', {
  state: () => ({
    readingHistory: [],
  }),

  actions: {
    // stores/manga.js
    // stores/manga.js
    async recordReadingHistory(manga, chapter) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const historyData = {
        user_id: user.id,
        manga_slug: manga.slug,
        manga_name: manga.title,
        category_list: manga.categories || [],
        last_read_at: new Date().toISOString(),
        // ĐẢM BẢO TÊN CỘT KHỚP VỚI HÌNH ẢNH SUPABASE BẠN GỬI
        last_chapter_name: chapter.name,
        last_chapter_id: String(chapter.id),
      }

      const { data, error } = await supabase
        .from('reading_history')
        .upsert(historyData, {
          onConflict: 'user_id, manga_slug', // Giúp cập nhật dòng cũ, không tạo dòng mới
        })
        .select()

      if (!error && data) {
        // Cập nhật State để UI bên trang Lịch sử nhảy dữ liệu ngay
        const index = this.readingHistory.findIndex((i) => i.manga_slug === manga.slug)
        if (index !== -1) {
          this.readingHistory.splice(index, 1)
        }
        this.readingHistory.unshift(data[0])
      } else if (error) {
        console.error('Lỗi lưu DB:', error.message)
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
