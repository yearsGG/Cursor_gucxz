<template>
  <div class="admin-orders">
    <h2>订单管理</h2>
    <div v-loading="loading">
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="180">
          <template #default="{ row }">
            <span class="order-no">{{ row.order_no }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="user.username" label="用户" width="120" />
        <el-table-column prop="total_amount" label="金额">
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
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">
              查看详情
            </el-button>
            <el-dropdown 
              v-if="row.status !== 'cancelled'"
              @command="(command) => handleStatusChange(row.id, command)"
              trigger="click"
            >
              <el-button size="small" type="primary">
                更改状态
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="status in availableStatuses" 
                    :key="status.value"
                    :command="status.value"
                    :disabled="row.status === status.value"
                  >
                    {{ status.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="订单详情"
      width="70%"
      class="order-detail-dialog"
    >
      <div class="order-detail" v-if="currentOrder">
        <!-- 订单基本信息 -->
        <div class="detail-section">
          <h3>订单信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">订单号：</span>
              <span>{{ currentOrder.order_no }}</span>
            </div>
            <div class="info-item">
              <span class="label">下单时间：</span>
              <span>{{ formatDate(currentOrder.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单状态：</span>
              <el-tag :type="getStatusType(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="label">订单金额：</span>
              <span class="price">¥{{ formatPrice(currentOrder.total_amount) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 用户信息 -->
        <div class="detail-section">
          <h3>用户信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">用户名：</span>
              <span>{{ currentOrder.user.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span>{{ currentOrder.user.email }}</span>
            </div>
          </div>
        </div>
        
        <!-- 商品列表 -->
        <div class="detail-section">
          <h3>商品信息</h3>
          <el-table :data="currentOrder.items" border>
            <el-table-column label="商品" min-width="300">
              <template #default="{ row }">
                <div class="product-info">
                  <img 
                    :src="getCarImage(row)"
                    class="product-image"
                    @error="handleImageError"
                  >
                  <div class="product-detail">
                    <div class="product-name">{{ row.brand }} {{ row.car_name }}</div>
                    <div class="product-price">¥{{ formatPrice(row.price) }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" align="center" />
            <el-table-column label="小计" width="150" align="right">
              <template #default="{ row }">
                ¥{{ formatPrice(row.price * row.quantity) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import axios from 'axios'
import { formatDate } from '@/utils/format'

const orders = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentOrder = ref(null)

const availableStatuses = [
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '已付款' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

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

const formatPrice = (price) => {
  return Number(price).toLocaleString()
}

const getCarImage = (item) => {
  if (!item.car_image) {
    return '/images/default-car.png'
  }
  if (item.car_image.startsWith('http')) {
    return item.car_image
  }
  return item.car_image.startsWith('/') ? item.car_image : `/${item.car_image}`
}

const handleImageError = (e) => {
  e.target.src = '/images/default-car.png'
}

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/admin/orders')
    console.log('订单数据:', response.data);
    orders.value = response.data
  } catch (error) {
    console.error('获取订单列表失败:', error);
    console.error('错误详情:', error.response?.data);
    ElMessage.error(error.response?.data?.message || '获取订单列表失败')
  } finally {
    loading.value = false;
  }
}

const handleView = (row) => {
  currentOrder.value = row
  dialogVisible.value = true
}

const handleStatusChange = async (orderId, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单状态更改为"${getStatusText(status)}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await axios.put(`/api/admin/orders/${orderId}/status`, { status })
    ElMessage.success('订单状态已更新')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新订单状态失败:', error)
      ElMessage.error(error.response?.data?.message || '更新订单状态失败')
    }
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.admin-orders {
  padding: 20px;
}

.order-no {
  font-family: monospace;
  color: #606266;
}

.el-dropdown {
  margin-left: 8px;
}

.order-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  margin-right: 10px;
  min-width: 70px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
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

.product-detail {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-name {
  font-weight: 500;
}

.product-price {
  color: #f56c6c;
}

:deep(.order-detail-dialog) {
  .el-dialog__body {
    padding: 0;
  }
}
</style> 