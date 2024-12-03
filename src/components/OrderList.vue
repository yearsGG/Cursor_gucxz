<template>
  <div class="order-list">
    <transition name="slide">
      <div v-show="show" class="order-container">
        <h2>我的订单</h2>
        <div v-if="loading" class="loading">
          加载中...
        </div>
        <div v-else-if="orders.length === 0" class="no-orders">
          <!-- 暂无订单 -->
        </div>
        <div v-else class="orders">
          <div v-for="order in orders" :key="order.id" class="order-item">
            <div class="order-header">
              <span class="order-id">订单号：{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.createTime) }}</span>
              <span class="order-status">{{ getStatusText(order.status) }}</span>
            </div>
            <div class="order-content">
              <div class="order-products">
                <div v-for="item in order.items" :key="item.id" class="product-item">
                  <img :src="item.productImage" :alt="item.productName">
                  <div class="product-info">
                    <div class="product-name">{{ item.productName }}</div>
                    <div class="product-price">￥{{ item.price }}</div>
                    <div class="product-quantity">x {{ item.quantity }}</div>
                  </div>
                </div>
              </div>
              <div class="order-footer">
                <div class="order-total">
                  总计：<span class="price">￥{{ order.totalAmount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'OrderList',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      orders: [],
      loading: false
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.fetchOrders()
      }
    }
  },
  methods: {
    async fetchOrders() {
      this.loading = true
      try {
        const response = await axios.get('/api/user/orders')
        console.log('订单数据响应:', response.data)
        
        if (response.data && Array.isArray(response.data)) {
          this.orders = response.data
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          this.orders = response.data.data
        } else {
          console.error('订单数据格式不正确:', response.data)
          this.orders = []
        }
      } catch (error) {
        console.error('获取订单失败:', error)
        if (error.response) {
          console.error('错误响应:', error.response.data)
          console.error('状态码:', error.response.status)
        }
        this.orders = []
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        console.error('日期格式化失败:', error)
        return dateString
      }
    },
    getStatusText(status) {
      if (!status) return '未知状态'
      const statusMap = {
        'PENDING': '待付款',
        'PAID': '已付款',
        'SHIPPED': '已发货',
        'DELIVERED': '已送达',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消',
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'delivered': '已送达',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    }
  },
  created() {
    if (this.show) {
      this.fetchOrders()
    }
  }
}
</script>

<style scoped>
.order-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  position: relative;
  min-height: 100px;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 15px;
  padding: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #666;
}

.order-status {
  color: #2196F3;
  font-weight: bold;
}

.product-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.product-price {
  color: #f44336;
}

.product-quantity {
  color: #666;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}

.order-total {
  font-size: 16px;
}

.price {
  color: #f44336;
  font-weight: bold;
}

.loading, .no-orders {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0;
}
</style> 