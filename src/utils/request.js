import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:3000',  // 指向后端服务器地址
  timeout: 15000,
  withCredentials: true
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params
    })
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('收到响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response.data
  },
  error => {
    console.error('响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    })
    
    const message = error.response?.data?.message || '请求失败'
    ElMessage.error(message)
    
    return Promise.reject(error)
  }
)

export default request 