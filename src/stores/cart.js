import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  
  actions: {
    clearCart() {
      this.items = []
    },
    
    addItem(item) {
      this.items.push(item)
    },
    
    removeItem(itemId) {
      const index = this.items.findIndex(item => item.id === itemId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    }
  }
}) 