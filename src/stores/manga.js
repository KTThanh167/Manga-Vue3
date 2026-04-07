import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from './auth'

export const useMangaStore = defineStore('manga', {
  state: () => ({
    readingHistory: [],
    isFollowed: false, // Trạng thái theo dõi truyện
    categories: [
      { name: 'Tất cả', slug: '' },
      { name: 'Action', slug: 'action' },
      { name: 'Adult', slug: 'adult' },
      { name: 'Adventure', slug: 'adventure' },
      { name: 'Anime', slug: 'anime' },
      { name: 'Comedy', slug: 'comedy' },
      { name: 'Comic', slug: 'comic' },
      { name: 'Cooking', slug: 'cooking' },
      { name: 'Cổ Đại', slug: 'co-dai' },
      { name: 'Doujinshi', slug: 'doujinshi' },
      { name: 'Drama', slug: 'drama' },
      { name: 'Ecchi', slug: 'ecchi' },
      { name: 'Fantasy', slug: 'fantasy' },
      { name: 'Gender Bender', slug: 'gender-bender' },
      { name: 'Harem', slug: 'harem' },
      { name: 'Historical', slug: 'historical' },
      { name: 'Horror', slug: 'horror' },
      { name: 'Isekai', slug: 'isekai' },
      { name: 'Josei', slug: 'josei' },
      { name: 'Live Action', slug: 'live-action' },
      { name: 'Manga', slug: 'manga' },
      { name: 'Manhua', slug: 'manhua' },
      { name: 'Manhwa', slug: 'manhwa' },
      { name: 'Martial Arts', slug: 'martial-arts' },
      { name: 'Mature', slug: 'mature' },
      { name: 'Mecha', slug: 'mecha' },
      { name: 'Mystery', slug: 'mystery' },
      { name: 'Ngôn Tình', slug: 'ngon-tinh' },
      { name: 'One Shot', slug: 'one-shot' },
      { name: 'Psychological', slug: 'psychological' },
      { name: 'Romance', slug: 'romance' },
      { name: 'School Life', slug: 'school-life' },
      { name: 'Sci-fi', slug: 'sci-fi' },
      { name: 'Seinen', slug: 'seinen' },
      { name: 'Shoujo', slug: 'shoujo' },
      { name: 'Shoujo Ai', slug: 'shoujo-ai' },
      { name: 'Shounen', slug: 'shounen' },
      { name: 'Shounen Ai', slug: 'shounen-ai' },
      { name: 'Slice of Life', slug: 'slice-of-life' },
      { name: 'Smut', slug: 'smut' },
      { name: 'Sports', slug: 'sports' },
      { name: 'Supernatural', slug: 'supernatural' },
      { name: 'Tragedy', slug: 'tragedy' },
      { name: 'Trinh Thám', slug: 'trinh-tham' },
      { name: 'Truyện Màu', slug: 'truyen-mau' },
      { name: 'Webtoon', slug: 'webtoon' },
      { name: 'Xuyên Không', slug: 'xuyen-khong' },
    ],
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
    //Logic theo dõi truyện
    // 1. Kiểm tra xem truyện này user đã theo dõi chưa
    async checkFollowStatus(slug) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        this.isFollowed = false
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('manga_slug', slug)
        .maybeSingle() // Trả về 1 dòng hoặc null, không báo lỗi nếu không tìm thấy

      this.isFollowed = !!data
    },
    // 2. Xử lý Toggle Theo dõi / Bỏ theo dõi
    async toggleFollow(manga) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('Vui lòng đăng nhập để sử dụng tính năng theo dõi!')
        return
      }

      try {
        if (this.isFollowed) {
          // Nếu đã theo dõi -> Thực hiện Xóa
          const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('manga_slug', manga.slug)

          if (!error) this.isFollowed = false
        } else {
          // Nếu chưa theo dõi -> Thực hiện Thêm
          const { error } = await supabase.from('bookmarks').insert({
            user_id: user.id,
            manga_slug: manga.slug,
            manga_name: manga.name,
            manga_thumb: manga.thumb_url,
            category_list: manga.category?.map((c) => c.name) || [],
          })

          if (!error) this.isFollowed = true
        }
      } catch (err) {
        console.error('Lỗi thao tác bookmark:', err)
      }
    },
  },
})
