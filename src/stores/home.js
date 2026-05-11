import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'
import { sortByLatestUpdate } from '@/utils/sortManga'

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

  // Helper: Chuyển tên thể loại thành đường dẫn (Ví dụ: "Ngôn Tình" -> "ngon-tinh")
  const createSlug = (str) => {
    if (!str) return ''
    return str
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/[^\w\-]+/g, '') // Xóa các ký tự đặc biệt
      .replace(/\-\-+/g, '-') // Xóa các gạch ngang liên tiếp
      .replace(/^-+/, '')
      .replace(/-+$/, '')
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
  const runAIRecommendation = async (history) => {
    if (!history?.length) {
      console.warn('AI: Chưa có lịch sử đọc')
      recommendedList.value = mangas.value.slice(0, 8)
      return
    }

    // ========================
    // 1. Tìm category yêu thích
    // ========================
    const categoryCounts = {}

    history.forEach((item) => {
      item.category_list?.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      })
    })

    const keys = Object.keys(categoryCounts)
    if (!keys.length) return

    const favorite = keys.reduce((a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b))

    topCategory.value = favorite

    const categorySlug = createSlug(favorite)

    // ========================
    // 2. Fetch nhiều page
    // ========================
    let allMangas = []

    try {
      const requests = []

      for (let i = 1; i <= 5; i++) {
        requests.push(axios.get(`https://otruyenapi.com/v1/api/the-loai/${categorySlug}?page=${i}`))
      }

      const responses = await Promise.all(requests)

      responses.forEach((res) => {
        if (res.data.status === 'success') {
          allMangas.push(...res.data.data.items)
        }
      })
    } catch (err) {
      console.error('❌ Lỗi fetch category:', err)
      recommendedList.value = mangas.value.slice(0, 8)
      return
    }

    // ========================
    // 3. Filter truyện hợp lệ
    // ========================
    const validMangas = allMangas.filter((m) => {
      return (
        Array.isArray(m.chaptersLatest) &&
        m.chaptersLatest.some((ch) => {
          const num = parseFloat(ch.chapter_name)

          return (
            !isNaN(num) &&
            num > 0 &&
            ch.chapter_api_data &&
            typeof ch.chapter_api_data === 'string' &&
            ch.chapter_api_data.includes('/chuong/')
          )
        })
      )
    })

    if (!validMangas.length) {
      console.warn('⚠️ Không có truyện hợp lệ → fallback')
      recommendedList.value = allMangas.filter((m) => m.chaptersLatest?.length > 0).slice(0, 8)
      return
    }

    // ========================
    // 4. Sort theo độ mới + chapter mới nhất
    // ========================
    const now = Date.now()

    const scored = validMangas.map((m) => {
      // lấy thời gian update (nếu có)
      const updatedAt = new Date(m.updatedAt || m.updated_at || 0).getTime()

      // độ mới (càng mới càng điểm cao)
      const freshnessScore = updatedAt ? now - updatedAt : Infinity

      // độ "hot" = chapter mới nhất (số càng cao càng tốt)
      const latestChapter = parseFloat(m.chaptersLatest?.[0]?.chapter_name || 0)

      return {
        ...m,
        _score: freshnessScore - latestChapter * 1000,
      }
    })

    // sort: mới nhất + chapter cao
    scored.sort((a, b) => a._score - b._score)

    // ========================
    // 5. Lấy top 8
    // ========================
    recommendedList.value = scored.slice(0, 8)

    console.log('✅ Final recommend:', recommendedList.value)
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
        searchResults.value = sortByLatestUpdate(res.data.data.items)
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
    searchResults.value = []

    try {
      const startPage = (page - 1) * 5 + 1
      const endPage = page * 5

      const requests = []
      for (let i = startPage; i <= endPage; i++) {
        requests.push(axios.get(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${i}`))
      }

      const responses = await Promise.all(requests)
      let allScanned = []

      responses.forEach((res) => {
        if (res.data.status === 'success') {
          allScanned.push(...res.data.data.items)
        }
      })

      // 2. Lọc theo slug thể loại
      const matchedMangas = allScanned.filter((m) =>
        m.category?.some((c) => c.slug === categorySlug || createSlug(c.name) === categorySlug),
      )

      // 3. XỬ LÝ KẾT QUẢ
      if (matchedMangas.length > 0) {
        // Sắp xếp lại cho chuẩn xác tuyệt đối theo thời gian
        searchResults.value = sortByLatestUpdate(matchedMangas)

        totalItems.value = 500
      } else {
        // Nếu không có kết quả nào từ API, thử fallback sang API thể loại
        const fallbackRes = await axios.get(
          `https://otruyenapi.com/v1/api/the-loai/${categorySlug}?page=${page}`,
        )
        if (fallbackRes.data.status === 'success') {
          searchResults.value = sortByLatestUpdate(fallbackRes.data.data.items)
          totalItems.value = fallbackRes.data.data.params?.pagination?.totalItems || 0
        }
      }
    } catch (err) {
      console.error('Lỗi lọc thể loại nâng cao:', err)
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
