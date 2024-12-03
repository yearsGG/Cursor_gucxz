import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 15000,
  withCredentials: true,
  retry: 3,
  retryDelay: 1000
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
  async error => {
    const config = error.config

    if (!config || !config.retry) {
      console.error('响应错误:', error)
      ElMessage.error(error.response?.data?.message || '请求失败')
      return Promise.reject(error)
    }

    config.__retryCount = config.__retryCount || 0

    if (config.__retryCount >= config.retry) {
      console.error('重试次数已用完:', error)
      ElMessage.error('网络请求失败，请检查网络连接')
      return Promise.reject(error)
    }

    config.__retryCount += 1
    console.log(`正在进行第 ${config.__retryCount} 次重试`)

    const backoff = new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, config.retryDelay || 1000)
    })

    await backoff
    return http(config)
  }
)

export default http