<template>
  <div class="checkout-container">
    <el-steps :active="activeStep" finish-status="success" class="steps">
      <el-step title="确认订单"/>
      <el-step title="支付"/>
      <el-step title="完成"/>
    </el-steps>

    <div class="checkout-content">
      <!-- 确认订单步骤 -->
      <div v-if="activeStep === 0">
        <el-card class="order-summary">
          <template #header>
            <div class="card-header">
              <span>订单信息</span>
            </div>
          </template>
          
          <el-table :data="cartItems" style="width: 100%">
            <el-table-column label="商品">
              <template #default="{ row }">
                <div class="product-info">
                  <img :src="row.car.images.split(',')[0]" class="product-image">
                  <div>
                    <h4>{{ row.car.brand }} {{ row.car.model }}</h4>
                    <p>{{ row.car.year }}年 | {{ row.car.color }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" prop="car.price" width="150">
              <template #default="{ row }">
                ¥{{ row.car.price.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="quantity" width="100"/>
            <el-table-column label="小计" width="150">
              <template #default="{ row }">
                ¥{{ (row.car.price * row.quantity).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>

          <div class="order-total">
            总计: <span class="price">¥{{ totalAmount.toLocaleString() }}</span>
          </div>
        </el-card>

        <el-button type="primary" @click="nextStep">
          确认订单
        </el-button>
      </div>

      <!-- 支付步骤 -->
      <div v-else-if="activeStep === 1">
        <el-card class="payment-card">
          <h3>选择支付方式</h3>
          <el-radio-group v-model="paymentMethod">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信支付</el-radio>
            <el-radio label="card">银行卡</el-radio>
          </el-radio-group>

          <div class="payment-amount">
            支付金额: <span class="price">¥{{ totalAmount.toLocaleString() }}</span>
          </div>

          <el-button type="primary" @click="handlePayment">
            立即支付
          </el-button>
        </el-card>
      </div>

      <!-- 完成步骤 -->
      <div v-else>
        <el-result
          icon="success"
          title="支付成功"
          sub-title="您的订单已支付完成"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/')">
              返回首页
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const activeStep = ref(0)
const paymentMethod = ref('alipay')
const cartItems = ref([])

const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.car.price * item.quantity)
  }, 0)
})

const fetchCartItems = async () => {
  try {
    const { data } = await axios.get('/api/cart')
    cartItems.value = data
  } catch (error) {
    ElMessage.error('获取订单信息失败')
  }
}

const nextStep = () => {
  activeStep.value++
}

const handlePayment = async () => {
  try {
    // TODO: 实现支付API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('支付成功')
    nextStep()
  } catch (error) {
    ElMessage.error('支付失败')
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
</style> 