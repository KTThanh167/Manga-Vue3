import axios from 'axios'

const api = axios.create({
  baseURL: 'https://otruyenapi.com/v1/api',
})

export const getNewMangas = async (page = 1) => {
  try {
    const response = await api.get(`/danh-sach/truyen-moi?page=${page}`)
    return response.data.data // Trả về danh sách truyện và thông tin phân trang
  } catch (error) {
    console.error('Lỗi gọi API:', error)
    return null
  }
}
