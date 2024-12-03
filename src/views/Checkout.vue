<template>
  <div class="checkout-container">
    <el-steps :active="activeStep" finish-status="success" class="steps">
      <el-step title="确认订单"/>
      <el-step title="支付"/>
      <el-step title="完成"/>
    </el-steps>

    <div class="checkout-content">
      <!-- 确认订单步骤 -->
      <template v-if="activeStep === 0">
        <el-card class="order-summary">
          <template #header>
            <div class="card-header">
              <span>订单信息</span>
            </div>
          </template>
          
          <el-table :data="cartItems" style="width: 100%">
            <el-table-column label="商品">
              <template #default="{ row }">
                <div v-if="row?.car" class="product-info">
                  <img 
                    :src="getCarImage(row.car)" 
                    class="product-image"
                    @error="handleImageError"
                  >
                  <div>
                    <h4>{{ row.car.brand }} {{ row.car.model }}</h4>
                    <p>{{ row.car.year }}年 | {{ row.car.color }}</p>
                  </div>
                </div>
                <div v-else class="product-info-error">
                  商品信息不可用
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="150">
              <template #default="{ row }">
                ¥{{ formatPrice(row?.car?.price) }}
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100">
              <template #default="{ row }">
                {{ row?.quantity || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="150">
              <template #default="{ row }">
                ¥{{ formatPrice(calculateSubtotal(row)) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="order-total">
            总计: <span class="price">¥{{ formatPrice(totalAmount) }}</span>
          </div>
        </el-card>

        <el-button 
          type="primary" 
          @click="nextStep"
          :disabled="!cartItems.length"
        >
          确认订单
        </el-button>
      </template>

      <!-- 支付步骤 -->
      <template v-else-if="activeStep === 1">
        <el-card class="payment-card">
          <h3>选择支付方式</h3>
          <el-radio-group v-model="paymentMethod">
            <el-radio value="alipay">支付宝</el-radio>
            <el-radio value="wechat">微信支付</el-radio>
            <el-radio value="card">银行卡</el-radio>
          </el-radio-group>

          <div class="payment-amount">
            支付金额: <span class="price">¥{{ totalAmount.toLocaleString() }}</span>
          </div>

          <el-button 
            type="primary" 
            @click="handlePayment"
            :loading="loading"
            :disabled="loading"
          >
            立即支付
          </el-button>
        </el-card>
      </template>

      <!-- 完成步骤 -->
      <template v-else>
        <el-result
          icon="success"
          title="支付成功"
          sub-title="您的订单已支付完成"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/orders')">
              查看订单
            </el-button>
          </template>
        </el-result>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cart.js'
import axios from 'axios'

const router = useRouter()
const cartStore = useCartStore()
const activeStep = ref(0)
const paymentMethod = ref('alipay')
const cartItems = ref([])
const loading = ref(false)

// 工具函数
const formatPrice = (price) => {
  return (Number(price) || 0).toLocaleString()
}

const getCarImage = (car) => {
  if (!car?.images) return '/images/default-car.jpg'
  const images = car.images.split(',')
  return images[0] || '/images/default-car.jpg'
}

const handleImageError = (e) => {
  e.target.src = '/images/default-car.jpg'
}

// 计算小计金额
const calculateSubtotal = (item) => {
  if (!item?.car?.price || !item?.quantity) return 0
  return item.car.price * item.quantity
}

// 计算总金额
const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + calculateSubtotal(item)
  }, 0)
})

const fetchCartItems = async () => {
  try {
    console.log('开始获取购物车数据')
    const { data } = await axios.get('/api/user/cart')
    console.log('购物车数据:', data)
    
    // 验证数据格式并转换数据结构
    if (Array.isArray(data)) {
      cartItems.value = data.map(item => ({
        cart_item_id: item.cart_item_id,
        quantity: item.quantity,
        car: {
          id: item.id,
          brand_id: item.brand_id,
          brand: item.brand,
          model: item.model,
          price: item.price,
          year: item.year,
          color: item.color,
          images: item.images
        }
      })).filter(item => item && item.car)
    } else {
      throw new Error('购物车数据格式错误')
    }
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('获取订单信息失败')
    cartItems.value = []
  }
}

const nextStep = () => {
  if (!cartItems.value.length) {
    ElMessage.warning('购物车为空')
    return
  }
  activeStep.value++
}

const handlePayment = async () => {
  try {
    loading.value = true
    
    // 创建订单
    const orderData = {
      cartItems: cartItems.value.map(item => ({
        car_id: item.car.id,
        quantity: item.quantity
      }))
    }
    
    const response = await axios.post('/api/orders', orderData)
    
    // 清空购物车
    cartItems.value = []
    try {
      await axios.delete('/api/user/cart/clear')
    } catch (error) {
      // 如果清空购物车失败，但订单已创建，不影响整体流程
      console.warn('清空购物车失败:', error)
    }
    
    // 显示成功消息
    ElMessage.success('支付成功！')
    
    // 先更新状态
    activeStep.value++
    
    // 延迟跳转，让用户看到支付成功的提示
    setTimeout(() => {
      router.push({
        path: '/profile',
        query: { 
          tab: 'orders',
          orderId: response.data.orderId 
        }
      })
    }, 2000)
    
  } catch (error) {
    console.error('支付失败:', error)
    console.log('错误详情:', error.response?.data)
    ElMessage.error(error.response?.data?.message || '支付失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(fetchCartItems)
</script>

<style scoped>
.checkout-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.steps {
  margin-bottom: 40px;
}

.order-summary {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.order-total {
  text-align: right;
  margin-top: 20px;
  font-size: 18px;
}

.payment-card {
  max-width: 500px;
  margin: 0 auto;
}

.payment-amount {
  margin: 30px 0;
  font-size: 18px;
}

.price {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.el-radio-group {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.error-message {
  margin: 20px 0;
  padding: 10px;
}

.total-amount {
  font-size: 24px;
  font-weight: bold;
  text-align: right;
  margin: 20px 0;
}

.product-info-error {
  color: #f56c6c;
  padding: 10px;
  text-align: center;
}
</style> 