import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
  }

  const login = async (userInfo) => {
    try {
      const response = await request.post('/api/auth/login', userInfo)
      // 从response.data中获取token和user信息
      const { token: newToken, user } = response.data
      setToken(newToken)
      setUserInfo(user)
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const getUserInfo = async () => {
    try {
      const response = await request.get('/api/auth/user/info')
      // 从response.data中获取用户信息
      setUserInfo(response.data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  const register = async (userInfo) => {
    try {
      // 如果包含文件，使用 FormData
      const formData = new FormData()
      Object.keys(userInfo).forEach(key => {
        formData.append(key, userInfo[key])
      })
      
      const response = await request.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // 检查响应中是否包含必要的数据
      if (response && response.token && response.user) {
        setToken(response.token)
        setUserInfo(response.user)
        return response
      } else {
        throw new Error('注册成功但返回数据格式不正确')
      }
    } catch (error) {
      console.error('注册错误:', error)
      // 如果是后端返回的错误消息，直接显示
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        // 否则显示通用错误消息
        ElMessage.error('注册失败，请稍后重试')
      }
      throw error
    }
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    login,
    logout,
    getUserInfo,
    register
  }
}) 