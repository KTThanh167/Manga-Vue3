export const sortByLatestUpdate = (mangas = []) => {
  // 1. Lọc bỏ các phần tử rác (nếu có)
  const validMangas = mangas.filter((m) => m !== null && typeof m === 'object')

  return validMangas.sort((a, b) => {
    // 2. Lấy thời gian an toàn (Tránh tuyệt đối lỗi NaN)
    const getValidTime = (manga) => {
      const dateStr = manga.updatedAt || manga.updated_at
      if (!dateStr) return 0 // Nếu không có ngày, coi như là cũ nhất (0)

      const time = new Date(dateStr).getTime()
      return isNaN(time) ? 0 : time
    }

    const timeA = getValidTime(a)
    const timeB = getValidTime(b)

    // 3. So sánh: Truyện nào có Timestamp lớn hơn (Mới hơn) thì xếp lên trên
    if (timeA !== timeB) {
      return timeB - timeA
    }

    // 4. Nếu bằng thời gian nhau (hoặc cùng bằng 0), dùng Chapter để phân định
    const getLatestChapter = (manga) => {
      if (!manga.chaptersLatest || !manga.chaptersLatest.length) return 0

      const maxChapter = Math.max(
        ...manga.chaptersLatest.map((ch) => {
          const num = parseFloat(ch.chapter_name)
          return isNaN(num) ? 0 : num
        }),
      )

      // Math.max của mảng rỗng sẽ ra -Infinity, nên cần fallback về 0
      return maxChapter === -Infinity ? 0 : maxChapter
    }

    return getLatestChapter(b) - getLatestChapter(a)
  })
}
