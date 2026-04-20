import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from './auth'

export const useMangaStore = defineStore('manga', {
  state: () => ({
    readingHistory: [],
    isFollowed: false,
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
    followedMangas: JSON.parse(localStorage.getItem('manga_followed')) || [],
  }),

  actions: {
    // 1. Lịch sử đọc
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
        last_chapter_name: chapter.name,
        last_chapter_id: String(chapter.id),
      }

      const { data, error } = await supabase
        .from('reading_history')
        .upsert(historyData, { onConflict: 'user_id, manga_slug' })
        .select()

      if (!error && data) {
        const index = this.readingHistory.findIndex((i) => i.manga_slug === manga.slug)
        if (index !== -1) this.readingHistory.splice(index, 1)
        this.readingHistory.unshift(data[0])
      } else if (error) {
        console.error('Lỗi lưu DB:', error.message)
      }
    },

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
      this.readingHistory = data
    },

    // 2. Logic theo dõi truyện (Đã hợp nhất, tránh trùng lặp)
    async checkFollowStatus(slug) {
      const auth = useAuthStore()
      if (auth.user) {
        const { data } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', auth.user.id)
          .eq('manga_slug', slug)
          .maybeSingle()
        this.isFollowed = !!data
      } else {
        this.isFollowed = this.followedMangas.some((m) => m.slug === slug)
      }
    },

    async toggleFollow(manga) {
      const auth = useAuthStore()

      // 1. Tìm vị trí truyện trong mảng Local
      const index = this.followedMangas.findIndex((m) => m.slug === manga.slug)

      // 2. Xử lý logic Toggle
      if (index > -1) {
        // --- TRƯỜNG HỢP: BỎ THEO DÕI ---
        this.followedMangas.splice(index, 1)
        this.isFollowed = false

        // Xóa khỏi DB (nếu đã đăng nhập)
        if (auth.user) {
          const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', auth.user.id)
            .eq('manga_slug', manga.slug)

          if (error) console.error('Lỗi khi xóa bookmark:', error.message)
        }
      } else {
        // --- TRƯỜNG HỢP: THEO DÕI THÊM ---
        const newManga = {
          ...manga,
          isLocal: !!manga.isLocal,
          category: manga.category ? [manga.category[0]] : [],
        }

        this.followedMangas.unshift(newManga)
        this.isFollowed = true

        // Thêm vào DB (nếu đã đăng nhập)
        if (auth.user) {
          // Dùng upsert để tránh lỗi 409 Conflict
          const { error } = await supabase.from('bookmarks').upsert(
            {
              user_id: auth.user.id,
              manga_slug: manga.slug,
              manga_name: manga.name,
              manga_thumb: manga.thumb_url,
              is_local: !!manga.isLocal, // Đảm bảo cột is_local đã tạo trong DB
              category_list: newManga.category || [],
            },
            { onConflict: 'user_id, manga_slug' },
          )

          if (error) console.error('Lỗi khi thêm bookmark:', error.message)
        }
      }

      // 3. Luôn lưu vào LocalStorage để đồng bộ
      localStorage.setItem('manga_followed', JSON.stringify(this.followedMangas))
    },
  },
})
