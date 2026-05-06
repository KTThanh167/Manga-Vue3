// Hàm phân tích sở thích người dùng
export const getUserInterest = (history) => {
  if (!history || history.length === 0) return null

  const categoryCounts = {}

  // Duyệt qua từng bản ghi lịch sử
  history.forEach((item) => {
    item.category_list.forEach((cat) => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })
  })

  // Tìm thể loại có số lần xuất hiện cao nhất (Trọng số lớn nhất)
  return Object.keys(categoryCounts).reduce((a, b) =>
    categoryCounts[a] > categoryCounts[b] ? a : b,
  )
}

// Hàm lọc truyện gợi ý
export const recommendMangas = (allMangas, topCategory) => {
  if (!topCategory) return []

  // Lọc ra những truyện có chứa thể loại yêu thích nhất
  return allMangas
    .filter((manga) => manga.category && manga.category.some((c) => c.name === topCategory))
    .slice(0, 8) // Lấy tối đa 4 truyện gợi ý
}
