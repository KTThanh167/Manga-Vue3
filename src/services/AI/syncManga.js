import { supabase } from '@/lib/supabaseClient'

export const sync20Mangas = async () => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY.trim()

    // ==========================================
    // BƯỚC 1: TỰ ĐỘNG DÒ TÌM MODEL MÀ TÀI KHOẢN ĐƯỢC PHÉP DÙNG
    // ==========================================
    console.log('🔍 Đang kiểm tra kho vũ khí AI của bạn...')
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

    console.log('Bắt đầu gọi API Otruyen...')
    const response = await fetch('https://otruyenapi.com/v1/api/danh-sach/truyen-moi')
    const result = await response.json()
    const items = result.data.items.slice(0, 20)

    for (const item of items) {
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
    }

    console.log('🎉 Đã hoàn thành tiến trình nạp dữ liệu AI!')
    return true
  } catch (error) {
    console.error('Lỗi đồng bộ tổng thể:', error)
    throw error
  }
}
