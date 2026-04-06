import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

export const useHomeStore = defineStore('home', () => {
  // --- TRẠNG THÁI DỮ LIỆU ---
  const mangas = ref([])
  const recommendedList = ref([])
  const topCategory = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const onlineCount = ref(1)
  const currentUser = ref(null)

  // --- TRẠNG THÁI PHÂN TRANG (MỚI THÊM) ---
  const currentPage = ref(1)
  const totalItems = ref(0) // Tổng số truyện để tính toán nếu cần

  const IMAGE_RESOURCES = 'https://otruyenapi.com/uploads/comics/'

  // --- LOGIC AI GỢI Ý  ---
  const runAIRecommendation = (history, allMangas) => {
    if (!history?.length) return

    // 1. Đếm tần suất các thể loại và tìm yêu thích nhất (2. Trọng số cao nhất)
    const categoryCounts = {}
    history.forEach((item) => {
      item.category_list?.forEach((catName) => {
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
      })
    })

    const favorite = Object.keys(categoryCounts).reduce(
      (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
      null,
    )

    if (favorite) {
      topCategory.value = favorite
      // 3. Lọc ra 4 truyện cùng thể loại đó từ danh sách mới
      recommendedList.value = allMangas
        .filter((m) => m.category?.some((c) => c.name === favorite))
        .slice(0, 4)
    }
  }

  // --- FETCH DỮ LIỆU TỔNG HỢP (REFACTORED ĐỂ HỖ TRỢ PAGE) ---
  const fetchHomeData = async (page = 1) => {
    loading.value = true
    currentPage.value = page // Cập nhật trang hiện tại

    try {
      // Bước 1: Lấy truyện mới từ API (Đã thêm query param page)
      const res = await axios.get(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${page}`)

      if (res.data.status === 'success') {
        mangas.value = res.data.data.items
        // Lưu tổng số truyện nếu API có trả về (để làm phân trang chuẩn hơn)
        totalItems.value = res.data.data.params?.pagination?.totalItems || 0

        // Cuộn lên đầu trang mỗi khi chuyển trang
        if (page > 1) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }

      // Bước 2 & 3: Kiểm tra User, lấy lịch sử từ Supabase và chạy AI nếu có
      const {
        data: { user },
      } = await supabase.auth.getUser()

      currentUser.value = user // Cập nhật user hiện tại vào store

      // Chỉ chạy AI gợi ý ở trang 1 để tránh tính toán lại lặp đi lặp lại khi chuyển trang
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
      error.value = 'Hệ thống đang bận, vui lòng thử lại sau!'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // --- LOGIC ĐẾM NGƯỜI ONLINE (SỬ DỤNG SUPABASE PRESENCE) ---
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
  //LOGIC TÌM KIẾM TRUYỆN THEO THỂ LOẠI / THEO TÊN
  const searchResults = ref([])
  const isSearching = ref(false)

  //Lọc theo tên truyện
  const searchMangas = async (keyword = '', page = 1) => {
    isSearching.value = true
    currentPage.value = page // Lưu lại trang hiện tại vào store
    try {
      // API tìm kiếm của Otruyen: danh-sach/tim-kiem?keyword=abc
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

  // Action lọc theo thể loại
  const filterByCategory = async (categorySlug, page = 1) => {
    isSearching.value = true
    currentPage.value = page // Lưu lại trang hiện tại vào store

    try {
      const res = await axios.get(
        `https://otruyenapi.com/v1/api/the-loai/${categorySlug}?page=${page}`,
      )
      if (res.data.status === 'success') {
        searchResults.value = res.data.data.items
        // Cập nhật totalItems để Component Pagination biết có bao nhiêu trang
        totalItems.value = res.data.data.params?.pagination?.totalItems || 0
      }
    } catch (err) {
      console.error('Lỗi lọc thể loại:', err)
    } finally {
      isSearching.value = false
    }
  }

  //Gợi ý nhanh khi người dùng tìm tên truyện
  // Trong useHomeStore
  const searchSuggestions = ref([])

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
        // Chỉ lấy 5-8 kết quả đầu tiên để làm gợi ý nhanh
        searchSuggestions.value = res.data.data.items.slice(0, 8)
      }
    } catch (err) {
      console.error('Lỗi gợi ý:', err)
    }
  }
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
    searchResults,
    isSearching,
    searchSuggestions,
    // Actions
    fetchHomeData,
    fetchAndListen,
    searchMangas,
    filterByCategory,
    getSuggestions,
  }
})
