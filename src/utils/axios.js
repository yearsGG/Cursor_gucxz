import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 15000,
  withCredentials: true
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 对于文件上传请求，不设置 Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => response.data,
  error => {
    console.error('响应错误:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const message = error.response?.data?.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default http