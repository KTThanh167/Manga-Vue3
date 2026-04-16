import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

export const useHomeStore = defineStore('home', () => {
  // ==========================================
  // 1. TRẠNG THÁI DỮ LIỆU (STATE)
  // ==========================================
  const mangas = ref([]) // Danh sách truyện hiển thị chính
  const recommendedList = ref([]) // Danh sách truyện gợi ý từ AI
  const topCategory = ref(null) // Thể loại người dùng yêu thích nhất
  const loading = ref(true) // Trạng thái loading toàn trang
  const error = ref(null) // Lưu lỗi nếu API gặp sự cố
  const onlineCount = ref(1) // Số người đang trực tuyến
  const currentUser = ref(null) // Thông tin user đang đăng nhập
  const listTitle = ref('Truyện mới cập nhật') // Tiêu đề động cho các trang danh sách

  // --- PHÂN TRANG & RESOURCES ---
  const currentPage = ref(1)
  const totalItems = ref(0)
  const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

  // --- TRẠNG THÁI TÌM KIẾM & LỌC ---
  const searchResults = ref([]) // Kết quả tìm kiếm hoặc lọc theo thể loại
  const isSearching = ref(false) // Loading riêng cho phần search/filter
  const searchSuggestions = ref([]) // Gợi ý nhanh khi gõ từ khóa

  // ==========================================
  // 2. CÁC HÀM XỬ LÝ CHÍNH (ACTIONS)
  // ==========================================

  /**
   * ACTION DÙNG CHUNG: Lấy dữ liệu theo danh mục slug (truyen-moi, truyen-hoan-thanh, ...)
   * Giúp tái sử dụng cho nhiều trang khác nhau (LatestView, CompletedView)
   */
  const fetchListData = async (slug, page = 1) => {
    loading.value = true
    currentPage.value = page

    try {
      const res = await axios.get(`https://otruyenapi.com/v1/api/danh-sach/${slug}?page=${page}`)

      if (res.data.status === 'success') {
        let rawItems = res.data.data.items

        // Sửa từ 'truyen-hoan-thanh' thành 'hoan-thanh' cho đúng với API
        if (slug === 'hoan-thanh') {
          mangas.value = rawItems
          listTitle.value = 'Truyện đã hoàn thành'
        } else {
          mangas.value = rawItems
          listTitle.value = 'Truyện mới cập nhật'
        }

        totalItems.value = res.data.data.params?.pagination?.totalItems || 0
      }
    } catch (err) {
      error.value = 'Không thể kết nối đến máy chủ, vui lòng thử lại!'
      console.error('Lỗi fetchListData:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * TRANG CHỦ: Lấy truyện mới và kết hợp logic AI gợi ý
   */
  const fetchHomeData = async (page = 1) => {
    // Bước 1: Lấy data truyện mới bằng hàm dùng chung
    await fetchListData('truyen-moi', page)

    // Bước 2: Xử lý AI nếu có user đăng nhập (chỉ chạy ở trang 1 để tối ưu)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      currentUser.value = user

      if (user && page === 1) {
        const { data: history } = await supabase
          .from('reading_history')
          .select('category_list')
          .eq('user_id', user.id)
          .order('last_read_at', { ascending: false })
          .limit(20)

        runAIRecommendation(history, mangas.value)
      }
    } catch (err) {
      console.error('Lỗi logic AI:', err)
    }
  }

  /**
   * LOGIC AI: Phân tích lịch sử đọc để tìm thể loại yêu thích nhất
   */
  const runAIRecommendation = (history, allMangas) => {
    if (!history?.length) return

    const categoryCounts = {}
    history.forEach((item) => {
      item.category_list?.forEach((catName) => {
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
      })
    })

    // Tìm thể loại xuất hiện nhiều nhất
    const favorite = Object.keys(categoryCounts).reduce(
      (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
      null,
    )

    if (favorite) {
      topCategory.value = favorite
      // Lọc ra 4 truyện cùng thể loại để gợi ý
      recommendedList.value = allMangas
        .filter((m) => m.category?.some((c) => c.name === favorite))
        .slice(0, 4)
    }
  }

  /**
   * TÌM KIẾM: Tìm truyện theo từ khóa
   */
  const searchMangas = async (keyword = '', page = 1) => {
    isSearching.value = true
    currentPage.value = page
    try {
      const res = await axios.get(
        `https://otruyenapi.com/v1/api/tim-kiem?keyword=${keyword}&page=${page}`,
      )
      if (res.data.status === 'success') {
        searchResults.value = res.data.data.items
        totalItems.value = res.data.data.params?.pagination?.totalItems || 0
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err)
    } finally {
      isSearching.value = false
    }
  }

  /**
   * GỢI Ý NHANH: Hiển thị list kết quả nhỏ khi đang gõ search
   */
  const getSuggestions = async (keyword) => {
    if (!keyword.trim()) {
      searchSuggestions.value = []
      return
    }
    try {
      const res = await axios.get(
        `https://otruyenapi.com/v1/api/tim-kiem?keyword=${keyword}&page=1`,
      )
      if (res.data.status === 'success') {
        searchSuggestions.value = res.data.data.items.slice(0, 8)
      }
    } catch (err) {
      console.error('Lỗi lấy gợi ý:', err)
    }
  }

  /**
   * LỌC THEO THỂ LOẠI: Lấy danh sách truyện theo category slug
   */
  const filterByCategory = async (categorySlug, page = 1) => {
    isSearching.value = true
    currentPage.value = page
    try {
      const res = await axios.get(
        `https://otruyenapi.com/v1/api/the-loai/${categorySlug}?page=${page}`,
      )
      if (res.data.status === 'success') {
        searchResults.value = res.data.data.items
        totalItems.value = res.data.data.params?.pagination?.totalItems || 0
      }
    } catch (err) {
      console.error('Lỗi lọc thể loại:', err)
    } finally {
      isSearching.value = false
    }
  }

  /**
   * ĐẾM NGƯỜI ONLINE: Sử dụng Supabase Presence để theo dõi thời gian thực
   */
  const fetchAndListen = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    currentUser.value = user

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user?.id || 'guest-' + Math.random().toString(36).substring(7),
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        onlineCount.value = Object.keys(channel.presenceState()).length
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_name: user?.user_metadata?.username || 'Khách',
          })
        }
      })

    return channel
  }

  // ==========================================
  // 3. XUẤT DỮ LIỆU (EXPORTS)
  // ==========================================
  return {
    // State
    mangas,
    recommendedList,
    topCategory,
    loading,
    error,
    onlineCount,
    currentUser,
    currentPage,
    totalItems,
    IMAGE_RESOURCES,
    listTitle,
    searchResults,
    isSearching,
    searchSuggestions,
    // Actions
    fetchHomeData,
    fetchListData,
    fetchAndListen,
    searchMangas,
    filterByCategory,
    getSuggestions,
  }
})
