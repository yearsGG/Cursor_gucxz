<template>
  <el-dialog
    v-model="dialogVisible"
    title="订单详情"
    width="70%"
    class="order-detail-dialog"
  >
    <div v-if="orderData" class="order-detail">
      <!-- 订单基本信息 -->
      <div class="detail-section">
        <h3>订单信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span>{{ orderData.order_no }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span>{{ formatDate(orderData.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(orderData.status)">
              {{ getStatusText(orderData.status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">订单金额：</span>
            <span class="price">¥{{ formatPrice(orderData.total_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="detail-section">
        <h3>商品信息</h3>
        <el-table 
          :data="tableData" 
          border
          v-loading="loading"
          element-loading-text="加载商品信息..."
        >
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="product-info">
                <div v-if="isDevelopment" style="font-size: 12px; color: #999;">
                  Debug: {{ getCarImage(row) }}
                </div>
                
                <el-image 
                  :src="getCarImage(row)"
                  class="product-image"
                  fit="cover"
                  :preview-src-list="[getCarImage(row)]"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon><picture-filled /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="product-detail">
                  <div class="product-name">
                    {{ getCarName(row) }}
                  </div>
                  <div class="product-specs" v-if="row.year || row.color">
                    {{ row.year }}年 · {{ row.color }}
                  </div>
                  <div class="product-price">¥{{ formatPrice(row.price) }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" align="center" />
          <el-table-column label="小计" width="150" align="right">
            <template #default="{ row }">
              <span class="subtotal">¥{{ formatPrice(row.price * row.quantity) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { formatDate } from '@/utils/format'
import { PictureFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  orderId: {
    type: [String, Number],
    default: ''
  },
  orderData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const tableData = ref([])
const loading = ref(false)

// 添加取消控制器
const controller = ref(null)

// 修改 watch 函数，添加请求取消逻辑
watch(() => props.orderData, async (newOrder) => {
  // 如果存在之前的请求，取消它
  if (controller.value) {
    controller.value.abort()
  }
  
  if (!newOrder?.items?.length) {
    tableData.value = []
    return
  }

  loading.value = true
  // 创建新的 AbortController
  controller.value = new AbortController()
  
  try {
    // 获取每个商品的详细信息
    const itemsWithDetails = await Promise.all(
      newOrder.items.map(async (item) => {
        try {
          const { data } = await axios.get(`/api/cars/${item.car_id}`, {
            signal: controller.value.signal // 添加取消信号
          })
          return {
            ...item,
            car_name: data.model,
            brand: data.brand_name,
            car_image: data.images?.[0] || '',
            year: data.year,
            color: data.color
          }
        } catch (error) {
          // 如果是取消请求的错误，直接返回
          if (axios.isCancel(error)) {
            throw error
          }
          console.error('获取车辆详情失败:', error)
          return item
        }
      })
    )
    
    tableData.value = itemsWithDetails
  } catch (error) {
    // 如果是取消请求的错误，不显示错误消息
    if (!axios.isCancel(error)) {
      console.error('获取商品详情失败:', error)
      ElMessage.error('获取商品详情失败')
      tableData.value = newOrder.items
    }
  } finally {
    loading.value = false
  }
}, { immediate: true })

// 在对话框关闭时取消请求
watch(() => props.visible, (newVisible) => {
  if (!newVisible && controller.value) {
    controller.value.abort()
    controller.value = null
  }
})

// 组件卸载时清理
onUnmounted(() => {
  if (controller.value) {
    controller.value.abort()
    controller.value = null
  }
})

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
  return Number(price || 0).toLocaleString()
}

const getCarImage = (item) => {
  if (!item) return ''
  
  // 优先使用从后端获取的图片
  if (item.car_image) {
    return item.car_image.startsWith('http') 
      ? item.car_image 
      : `/api/uploads/${item.car_image}`
  }
  
  return ''
}

const getCarName = (row) => {
  if (row.car_name) return row.car_name
  if (row.brand && row.model) return `${row.brand} ${row.model}`
  return '未知车型'
}

// 添加环境判断
const isDevelopment = import.meta.env.DEV

// 添加 loading 状态到表格
const tableLoading = computed(() => loading.value)
</script>

<style scoped>
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
  padding: 10px 0;
}

.product-image {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.product-specs {
  font-size: 12px;
  color: #909399;
}

.product-price {
  color: #f56c6c;
  font-weight: 500;
}

.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-table) {
  margin-top: 15px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
}

/* 添加加载状态样式 */
.el-table.is-loading {
  position: relative;
  min-height: 200px;
}
</style>
