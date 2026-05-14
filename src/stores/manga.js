import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from './auth'
import axios from 'axios'

export const useMangaStore = defineStore('manga', {
  //STATE
  state: () => ({
    readingHistory: [],
    isFollowed: false,
    lastReadChapter: null,
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
    loadingBookmarks: false,
    followedMangas: JSON.parse(localStorage.getItem('manga_followed')) || [],
  }),

  // GETTERS
  getters: {
    sortedFollowedMangas: (state) => {
      // Copy mảng để không ảnh hưởng trực tiếp đến state gốc
      return [...state.followedMangas].sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0) // Nếu chưa có updatedAt thì coi như thời gian cũ nhất
        const dateB = new Date(b.updatedAt || 0)

        // Sắp xếp giảm dần (Mới nhất lên đầu)
        return dateB - dateA
      })
    },
  },

  // ACTIONS
  actions: {
    // 1. Lịch sử đọc
    async recordReadingHistory(manga, chapter) {
      try {
        // 1. Kiểm tra quyền truy cập ngay từ đầu
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // 2. Chuẩn hóa danh sách thể loại (Trích xuất mảng tên từ mảng object của API)
        const categoryNames = Array.isArray(manga.category)
          ? manga.category.map((c) => c.name || c)
          : []

        // 3. Xây dựng Payload dữ liệu (Đảm bảo không có giá trị undefined)
        const historyData = {
          user_id: user.id,
          manga_slug: manga.slug,
          manga_name: manga.name || manga.title || 'Truyện không tên',
          category_list: categoryNames,
          last_read_at: new Date().toISOString(),
          last_chapter_name: chapter.chapter_name || chapter.name || 'N/A',
          last_chapter_id: String(chapter.id || chapter.chapter_api_data || ''),
        }

        // 4. Thực hiện lưu vào Database
        const { data, error } = await supabase
          .from('reading_history')
          .upsert(historyData, { onConflict: 'user_id, manga_slug' })
          .select()
          .single()

        if (error) throw error

        // 5. Cập nhật State nội bộ (Pinia) để UI thay đổi ngay lập tức mà không cần F5
        if (data) {
          const index = this.readingHistory.findIndex((i) => i.manga_slug === manga.slug)

          // Nếu truyện đã có trong danh sách local, xóa cái cũ đi
          if (index !== -1) {
            this.readingHistory.splice(index, 1)
          }

          // Đưa bản ghi mới nhất lên đầu mảng
          this.readingHistory.unshift(data)
        }
      } catch (error) {
        // Chỉ log lỗi thực sự cần thiết
        console.error('❌ Lỗi ghi lịch sử đọc:', error.message || error)
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

      // 1. Kiểm tra ưu tiên trong mảng Local trước (Luôn có sẵn và nhanh)
      const isFoundInLocal = this.followedMangas.some((m) => m.slug === slug)

      if (auth.user) {
        // 2. Nếu đăng nhập, check thêm DB để đảm bảo đồng bộ
        const { data } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', auth.user.id)
          .eq('manga_slug', slug)
          .maybeSingle()

        // Nếu có trong DB -> true, nếu không thì lấy theo mảng Local
        this.isFollowed = !!data || isFoundInLocal
      } else {
        // Nếu chưa đăng nhập thì chỉ dùng mảng Local
        this.isFollowed = isFoundInLocal
      }
    },

    async fetchLastRead(slug) {
      const auth = useAuthStore()
      if (!auth.user) return null

      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('manga_slug', slug)
        .order('updated_at', { ascending: false })
        .maybeSingle()

      if (!error) {
        this.lastReadChapter = data
      }
      return data
    },

    // Hàm này sẽ được gọi khi người dùng đăng nhập để đồng bộ bookmark từ DB về Local
    async loadBookmarks() {
      const auth = useAuthStore()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase.from('bookmarks').select('*').eq('user_id', user.id)

        if (error) {
          console.error('Lỗi khi fetch bookmark:', error)
        } else if (data) {
          this.followedMangas = data.map((item) => ({
            ...item,
            name: item.manga_name,
            slug: item.manga_slug,
            thumb_url: item.manga_thumb,
            isLocal: item.is_local,
            category: item.category_list,
            chaptersLatest: item.chapters_latest || [],
            updatedAt: item.updated_at,
          }))
        }
      }

      // 3. UPDATE CHƯƠNG MỚI (Làm tươi dữ liệu)
      // Dù dữ liệu từ DB hay từ LocalStorage, ta vẫn cập nhật lại chapter mới nhất
      if (this.followedMangas.length > 0) {
        this.followedMangas = await Promise.all(
          this.followedMangas.map(async (manga) => {
            try {
              const res = await axios.get(
                `https://otruyenapi.com/v1/api/truyen-tranh/${manga.slug}`,
              )
              if (res.data?.data?.item?.chaptersLatest) {
                return { ...manga, chaptersLatest: res.data.data.item.chaptersLatest }
              }
            } catch (err) {
              console.warn(`Không cập nhật được chương mới cho ${manga.slug}`)
            }
            return manga // Trả về manga cũ nếu API lỗi
          }),
        )
        // Lưu lại bản cập nhật nhất vào LocalStorage
        localStorage.setItem('manga_followed', JSON.stringify(this.followedMangas))
      }
    },

    async toggleFollow(manga) {
      const auth = useAuthStore()

      const index = this.followedMangas.findIndex((m) => m.slug === manga.slug)

      // Xử lý logic Toggle
      if (index > -1) {
        console.log('❌ [Debug] Hành động: BỎ THEO DÕI')

        this.followedMangas.splice(index, 1)
        this.isFollowed = false

        if (auth.user) {
          const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', auth.user.id)
            .eq('manga_slug', manga.slug)

          if (error) console.error('❌ [Error] Lỗi khi xóa bookmark:', error.message)
          else console.log('✅ [Debug] Xóa bookmark thành công')
        }
      } else {
        console.log('✅ [Debug] Hành động: THEO DÕI MỚI')

        // --- CƠ CHẾ TỰ BỔ SUNG DỮ LIỆU ---
        let chaptersToSave = manga.chaptersLatest || []

        if (chaptersToSave.length === 0) {
          console.log('⚠️ Dữ liệu chương bị trống, đang fetch lại từ API...')
          try {
            const res = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${manga.slug}`)

            // LOG ĐỂ XEM DỮ LIỆU TRẢ VỀ CÓ GÌ
            console.log('🔍 [Debug] Dữ liệu từ API:', res.data?.data?.item)

            const apiChapters =
              res.data?.data?.item?.chaptersLatest || res.data?.data?.item?.chapters || []

            if (apiChapters.length > 0) {
              chaptersToSave = apiChapters
              console.log('✅ Fetch thành công, đã gán được:', chaptersToSave.length, 'chương')
            } else {
              console.warn('⚠️ API trả về nhưng không tìm thấy mảng chương nào!')
            }
          } catch (err) {
            console.error('❌ Lỗi fetch lại chương:', err)
          }
        }

        console.log('🚀 [Debug] Giá trị chaptersToSave trước khi lưu:', chaptersToSave)

        const newManga = {
          ...manga,
          isLocal: !!manga.isLocal,
          category: manga.category || [],
          chaptersLatest: chaptersToSave,
        }

        this.followedMangas.unshift(newManga)
        this.isFollowed = true

        if (auth.user) {
          const payload = {
            user_id: auth.user.id,
            manga_slug: manga.slug,
            manga_name: manga.name,
            manga_thumb: manga.thumb_url,
            is_local: !!manga.isLocal,
            category_list: newManga.category || [],
            chapters_latest: chaptersToSave, // Lưu dữ liệu đã có
            updated_at: manga.updatedAt,
          }

          console.log('🚀 Dữ liệu chuẩn bị gửi lên Supabase:', payload)

          const { error } = await supabase
            .from('bookmarks')
            .upsert(payload, { onConflict: 'user_id, manga_slug' })

          if (error) console.error('❌ Lỗi khi thêm bookmark (Upsert):', error.message)
          else console.log('✅ Upsert Supabase thành công')
        } else {
          console.warn('⚠️ [Warning] Không lưu được DB vì auth.user là null')
        }
      }

      localStorage.setItem('manga_followed', JSON.stringify(this.followedMangas))
    },
  },
})
