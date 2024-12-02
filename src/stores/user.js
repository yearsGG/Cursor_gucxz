import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUser(user) {
      if (user && user.avatar) {
        if (!user.avatar.startsWith('http')) {
          user.avatar = `http://localhost:3000${user.avatar}`
        }
      }
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.user?.role || 'guest'
  }
}) 