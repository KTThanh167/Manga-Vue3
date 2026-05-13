import { supabase } from '@/lib/supabaseClient'

// Hàm tiện ích để tạo delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const sync50Mangas = async () => {
  try {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!rawKey) throw new Error('Chưa cấu hình API Key VITE_GEMINI_API_KEY!')
    const apiKey = rawKey.trim()

    // ==========================================
    // BƯỚC 1: KHÁM BỆNH - ÉP GOOGLE "KHAI" RA MODEL CÓ SẴN
    // ==========================================
    console.log('🔍 Đang hỏi Google xem API Key này được dùng model Vector nào...')
    const checkRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    )
    const checkData = await checkRes.json()

    if (!checkRes.ok) {
      console.error('❌ Lỗi không thể lấy danh sách model:', checkData)
      return false
    }

    // Lọc ra đúng những model có chức năng tạo Vector (embedContent)
    const embedModels = checkData.models.filter((m) =>
      m.supportedGenerationMethods?.includes('embedContent'),
    )

    console.log(
      '🎯 KẾT QUẢ TỪ GOOGLE - CÁC MODEL BẠN ĐƯỢC PHÉP DÙNG:',
      embedModels.map((m) => m.name),
    )

    if (embedModels.length === 0) {
      console.error(
        '⛔ TOANG RỒI! API Key này KHÔNG CÓ QUYỀN dùng bất kỳ model Vector nào của Google. Giải pháp duy nhất: Dùng Gmail khác đăng nhập Google AI Studio và tạo Key mới.',
      )
      return false
    }

    // Tự động gắp luôn cái model cuối cùng (thường là mới nhất) trong danh sách để xài
    const targetModelName = embedModels[embedModels.length - 1].name
    console.log(`✅ Google đã cấp phép. Bắt đầu chạy với model: ${targetModelName}`)
    // ==========================================

    console.log('Bắt đầu gọi API Otruyen để gom đủ 50 truyện...')

    let allItems = []
    let page = 1
    while (allItems.length < 50) {
      const response = await fetch(
        `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${page}`,
      )
      const result = await response.json()
      const items = result.data?.items || []

      if (items.length === 0) break
      allItems = allItems.concat(items)
      page++
    }

    const itemsToProcess = allItems.slice(0, 50)
    console.log(`Đã gom đủ ${itemsToProcess.length} truyện. Bắt đầu nạp cho AI...`)

    for (const item of itemsToProcess) {
      try {
        console.log(`Đang xử lý truyện: ${item.slug}`)
        const detailRes = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${item.slug}`)

        if (!detailRes.ok) continue

        const detail = await detailRes.json()
        const manga = detail?.data?.item

        if (!manga) continue

        const categoryText = manga.category
          ? manga.category.map((c) => c.name).join(', ')
          : 'Chưa cập nhật'
        const contentText = manga.content
          ? manga.content.replace(/<[^>]*>?/gm, '')
          : 'Không có mô tả'
        const textToEmbed = `${manga.name}. Thể loại: ${categoryText}. Nội dung: ${contentText}`

        // ==========================================
        // BƯỚC 2: GỌI API BẰNG CHÍNH MODEL GOOGLE VỪA CẤP
        // ==========================================
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${targetModelName}:embedContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: { parts: [{ text: textToEmbed }] },
              // Không truyền outputDimensionality nữa để AI trả về mặc định
            }),
          },
        )

        const aiData = await aiResponse.json()

        if (!aiResponse.ok) {
          console.error(`❌ Lỗi API với truyện [${item.slug}]:`, aiData.error?.message || aiData)
          continue
        }

        const embedding = aiData.embedding.values

        // ==========================================
        // BƯỚC 3: LƯU VÀO SUPABASE VÀ ÉP CÂN NẾU CẦN
        // ==========================================
        // Nếu API dở chứng trả về 3072 chiều, ta dùng JS cắt gọn nó xuống 768 chiều trước khi lưu!
        const finalVector = embedding.length > 768 ? embedding.slice(0, 768) : embedding

        const { error } = await supabase.from('manga_ai').upsert(
          {
            slug: manga.slug,
            title: manga.name,
            content: manga.content || 'Không có mô tả',
            thumb_url: manga.thumb_url
              ? `https://otruyenapi.com/uploads/comics/${manga.thumb_url}`
              : '',
            embedding: finalVector,
          },
          { onConflict: 'slug' },
        )

        if (error) {
          console.error(`❌ Lỗi lưu Supabase [${manga.name}]:`, error.message)
        } else {
          console.log(`✅ Đã nạp xong: ${manga.name}`)
        }
      } catch (innerErr) {
        console.error(`❌ Lỗi bất ngờ:`, innerErr)
      }

      await delay(3000)
    }

    console.log('🎉 Đã hoàn thành tiến trình nạp 50 truyện!')
    return true
  } catch (error) {
    console.error('Lỗi tổng:', error)
    throw error
  }
}
