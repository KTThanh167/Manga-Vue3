import { supabase } from '@/lib/supabaseClient'

// Hàm tiện ích để tạo delay (dùng để tránh lỗi 429 khi gọi API quá nhanh)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const sync50Mangas = async () => {
  try {
    // Kiểm tra API Key an toàn để không bị lỗi trên Vercel
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!rawKey) throw new Error('Chưa cấu hình API Key VITE_GEMINI_API_KEY!')
    const apiKey = rawKey.trim()

    // ==========================================
    // BƯỚC 1: TỰ ĐỘNG DÒ TÌM MODEL MÀ TÀI KHOẢN ĐƯỢC PHÉP DÙNG
    // ==========================================
    const checkRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    )
    const checkData = await checkRes.json()

    if (!checkRes.ok) {
      console.error('❌ Lỗi khi kiểm tra model:', checkData)
      return false
    }

    // Lọc ra những model có hỗ trợ chức năng "embedContent" (tạo vector)
    const embedModels = checkData.models.filter(
      (m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('embedContent'),
    )

    if (embedModels.length === 0) {
      console.error('❌ TÀI KHOẢN CỦA BẠN KHÔNG HỖ TRỢ BẤT KỲ MODEL TẠO VECTOR NÀO!')
      return false
    }

    // Lấy tên model xịn nhất (thường nằm cuối danh sách)
    const targetModelName = embedModels[embedModels.length - 1].name
    console.log(`✅ Đã dò trúng đài! Sử dụng model: ${targetModelName}`)
    // ==========================================

    console.log('Bắt đầu gọi API Otruyen để gom đủ 50 truyện...')

    // Gom đủ 50 truyện từ các trang
    let allItems = []
    let page = 1
    while (allItems.length < 50) {
      const response = await fetch(
        `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${page}`,
      )
      const result = await response.json()
      const items = result.data?.items || []

      if (items.length === 0) break // Hết dữ liệu
      allItems = allItems.concat(items)
      page++
    }

    // Cắt chính xác 50 truyện mới nhất
    const itemsToProcess = allItems.slice(0, 50)
    console.log(`Đã gom đủ ${itemsToProcess.length} truyện. Bắt đầu nạp cho AI...`)

    for (const item of itemsToProcess) {
      try {
        console.log(`Đang xử lý truyện: ${item.slug}`)
        const detailRes = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${item.slug}`)

        if (!detailRes.ok) {
          console.warn(`⚠️ Bỏ qua [${item.slug}] vì API Otruyen báo lỗi ${detailRes.status}`)
          continue
        }

        const detail = await detailRes.json()
        const manga = detail?.data?.item

        if (!manga) {
          console.warn(`⚠️ Bỏ qua [${item.slug}] vì không có dữ liệu chi tiết.`)
          continue
        }

        const categoryText = manga.category
          ? manga.category.map((c) => c.name).join(', ')
          : 'Chưa cập nhật'
        const contentText = manga.content
          ? manga.content.replace(/<[^>]*>?/gm, '')
          : 'Không có mô tả'
        const textToEmbed = `${manga.name}. Thể loại: ${categoryText}. Nội dung: ${contentText}`

        // ==========================================
        // GỌI API BẰNG CHÍNH MODEL VỪA DÒ ĐƯỢC
        // ==========================================
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${targetModelName}:embedContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: {
                parts: [{ text: textToEmbed }],
              },
            }),
          },
        )

        const aiData = await aiResponse.json()

        if (!aiResponse.ok) {
          console.error(
            `❌ Lỗi từ Gemini API với truyện [${item.slug}]:`,
            aiData.error?.message || aiData,
          )
          continue
        }

        const embedding = aiData.embedding.values
        // ==========================================

        // Lưu vào Supabase
        const { error } = await supabase.from('manga_ai').upsert(
          {
            slug: manga.slug,
            title: manga.name,
            content: manga.content || 'Không có mô tả',
            thumb_url: manga.thumb_url
              ? `https://otruyenapi.com/uploads/comics/${manga.thumb_url}`
              : '',
            embedding: embedding,
          },
          { onConflict: 'slug' },
        )

        if (error) {
          console.error(`❌ Lỗi lưu truyện ${manga.name} vào Supabase:`, error)
        } else {
          console.log(`✅ Đã học xong: ${manga.name}`)
        }
      } catch (innerErr) {
        console.error(`❌ Lỗi bất ngờ khi xử lý [${item.slug}]:`, innerErr)
        continue
      }

      // ==========================================
      // BƯỚC QUAN TRỌNG NHẤT: NGHỈ 3 GIÂY ĐỂ TRÁNH LỖI 429
      // ==========================================
      console.log('... đang nghỉ 3 giây để không bị lỗi 429 ...')
      await delay(3000)
    }

    console.log('🎉 Đã hoàn thành tiến trình nạp 50 truyện cho AI!')
    return true
  } catch (error) {
    console.error('Lỗi đồng bộ tổng thể:', error)
    throw error
  }
}
