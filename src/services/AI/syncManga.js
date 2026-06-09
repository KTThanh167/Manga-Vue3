import { supabase } from '@/lib/supabaseClient'

// Hàm tiện ích để tạo delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const sync50Mangas = async () => {
  try {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!rawKey) throw new Error('Chưa cấu hình API Key VITE_GEMINI_API_KEY!')
    const apiKey = rawKey.trim()

    // ==========================================
    // BƯỚC 1: TÌM MODEL VECTOR TỪ GOOGLE THEO API KEY
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

    const embedModels = checkData.models.filter((m) =>
      m.supportedGenerationMethods?.includes('embedContent'),
    )

    console.log(
      '🎯 KẾT QUẢ TỪ GOOGLE - CÁC MODEL BẠN ĐƯỢC PHÉP DÙNG:',
      embedModels.map((m) => m.name),
    )

    if (embedModels.length === 0) {
      console.error('⛔ Lỗi: API Key này không có quyền dùng model Vector.')
      return false
    }

    const targetModelName = embedModels[embedModels.length - 1].name
    console.log(`✅ Chạy với model: ${targetModelName}`)

    // ==========================================
    // BƯỚC 2: LẤY DANH SÁCH TRUYỆN
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
    console.log(`Đã gom đủ ${itemsToProcess.length} truyện. Bắt đầu nạp dữ liệu...`)

    for (const item of itemsToProcess) {
      try {
        console.log(`Đang xử lý truyện: ${item.slug}`)
        const detailRes = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${item.slug}`)

        if (!detailRes.ok) continue

        const detail = await detailRes.json()
        const manga = detail?.data?.item

        if (!manga) continue

        // Xử lý thông tin text và chapter
        const categoryText = manga.category
          ? manga.category.map((c) => c.name).join(', ')
          : 'Chưa cập nhật'
        const contentText = manga.content
          ? manga.content.replace(/<[^>]*>?/gm, '')
          : 'Không có mô tả'
        const textToEmbed = `${manga.name}. Thể loại: ${categoryText}. Nội dung: ${contentText}`

        // Tính tổng số chapter từ tập dữ liệu server_data
        const chapterCount =
          manga.chapters && manga.chapters.length > 0 && manga.chapters[0].server_data
            ? manga.chapters[0].server_data.length
            : 0

        // ==========================================
        // BƯỚC 3: TẠO VECTOR EMBEDDING
        // ==========================================
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${targetModelName}:embedContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: { parts: [{ text: textToEmbed }] },
            }),
          },
        )

        const aiData = await aiResponse.json()

        if (!aiResponse.ok) {
          console.error(`❌ Lỗi API Embedding [${item.slug}]:`, aiData.error?.message || aiData)
          continue
        }

        const embedding = aiData.embedding.values
        const finalVector = embedding.length > 768 ? embedding.slice(0, 768) : embedding

        // ==========================================
        // BƯỚC 4: LƯU VÀO SUPABASE (Đã thêm genres và chapter_count)
        // ==========================================
        const { error } = await supabase.from('manga_ai').upsert(
          {
            slug: manga.slug,
            title: manga.name,
            content: manga.content || 'Không có mô tả',
            thumb_url: manga.thumb_url
              ? `https://otruyenapi.com/uploads/comics/${manga.thumb_url}`
              : '',
            embedding: finalVector,
            genres: categoryText, // Lưu metadata thể loại
            chapter_count: chapterCount, // Lưu metadata số chương
          },
          { onConflict: 'slug' },
        )

        if (error) {
          console.error(`❌ Lỗi lưu Supabase [${manga.name}]:`, error.message)
        } else {
          console.log(`✅ Đã nạp xong: ${manga.name} (${chapterCount} chương)`)
        }
      } catch (innerErr) {
        console.error(`❌ Lỗi tại truyện ${item.slug}:`, innerErr)
      }

      // Delay để tránh bị rate limit API
      await delay(2000)
    }

    console.log('🎉 Đã hoàn thành cập nhật 50 truyện với đầy đủ Metadata!')
    return true
  } catch (error) {
    console.error('Lỗi tổng:', error)
    throw error
  }
}
