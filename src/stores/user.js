import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const user = ref(null)
  const isLoggedIn = ref(false)
  const userRole = ref('')

  // 设置 token
  const setToken = (newToken) => {
    token.value = newToken
  }

  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData
    userRole.value = userData?.role || ''
    isLoggedIn.value = true
  }

  // 登录方法
  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
  }

  // 退出登录方法
  const logout = () => {
    token.value = ''
    user.value = null
    isLoggedIn.value = false
    userRole.value = ''
  }

  return {
    token,
    user,
    isLoggedIn,
    userRole,
    setToken,
    setUser,
    login,
    logout
  }
}) 