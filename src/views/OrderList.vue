<template>
  <div class="order-list">
    <h2>我的订单</h2>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="error" class="error-message">
      <el-alert
        :title="error"
        type="error"
        show-icon
      />
    </div>
    
    <el-table v-else :data="orders" style="width: 100%">
      <el-table-column prop="order_no" label="订单号" width="180">
        <template #default="{ row }">
          <span class="order-no">{{ row.order_no }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品" min-width="300">
        <template #default="{ row }">
          <div v-for="item in row.items" :key="item.id" class="order-item">
            <img 
              :src="getCarImage(item)" 
              class="car-image"
              @error="handleImageError"
            >
            <div class="item-info">
              <div class="car-name">{{ item.brand }} {{ item.car_name }}</div>
              <div class="price">¥{{ formatPrice(item.price) }}</div>
              <div class="quantity">x{{ item.quantity }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total_amount" label="总价" width="150">
        <template #default="{ row }">
          ¥{{ formatPrice(row.total_amount) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="下单时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button 
            v-if="row.status === 'pending'"
            size="small" 
            type="danger"
            @click="cancelOrder(row.id)"
          >
            取消订单
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="viewDetail(row.id)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { formatDate } from '@/utils/format'

const orders = ref([])
const loading = ref(false)
const error = ref('')

const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'paid': 'success',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待付款',
    'paid': '已付款',
    'shipped': '已发货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status] || status
}

const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    console.log('开始获取订单列表');
    const response = await axios.get('/api/user/orders')
    console.log('获取到订单数据:', response.data);
    orders.value = response.data
  } catch (error) {
    console.error('获取订单列表失败:', error);
    error.value = '获取订单列表失败，请稍后重试'
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const cancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该订单吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await axios.post(`/api/user/orders/${orderId}/cancel`)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error);
      ElMessage.error(error.response?.data?.message || '取消订单失败')
    }
  }
}

const viewDetail = (orderId) => {
  // TODO: 实现查看订单详情
  console.log('查看订单:', orderId)
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString()
}

const getCarImage = (item) => {
  if (!item.car_image) {
    return '/images/default-car.png'
  }
  console.log('原始图片路径:', item.car_image);
  console.log('图片信息:', {
    car_image: item.car_image,
    brand: item.brand,
    car_name: item.car_name
  });

  if (item.car_image.startsWith('http')) {
    return item.car_image
  }

  const carModel = item.car_name.toLowerCase();
  return `/images/cars/benz/${carModel}-2.jpg`;
}

const handleImageError = (e) => {
  e.target.src = '/images/default-car.png'
}

onMounted(() => {
  console.log('OrderList组件已挂载');
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.order-item {
  display: flex;
  gap: 15px;
  margin: 10px 0;
}

.car-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.car-image:not([src]),
.car-image[src=""] {
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.car-image:not([src])::after,
.car-image[src=""]::after {
  content: "暂无图片";
}

.order-no {
  font-family: monospace;
  color: #606266;
}

.car-name {
  font-weight: 500;
  color: #303133;
}

.quantity {
  color: #909399;
}
</style> 