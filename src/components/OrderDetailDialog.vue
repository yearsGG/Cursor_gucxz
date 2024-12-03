<template>
  <el-dialog
    v-model="dialogVisible"
    title="订单详情"
    width="600px"
    destroy-on-close
  >
    <div class="order-detail">
      <!-- 订单基本信息 -->
      <div class="order-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order?.order_no }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(order?.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(order?.status)">
              {{ getStatusText(order?.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ formatPrice(order?.total_amount) }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 商品列表 -->
      <div class="order-items">
        <h3>商品信息</h3>
        <el-table :data="order?.items" border stripe>
          <el-table-column label="商品名称" min-width="200">
            <template #default="{ row }">
              {{ row.brand }} {{ row.car_name }}
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120" align="right">
            <template #default="{ row }">
              ¥{{ formatPrice(row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column label="小计" width="120" align="right">
            <template #default="{ row }">
              ¥{{ formatPrice(row.price * row.quantity) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatDate } from '@/utils/format'
import axios from 'axios'

const props = defineProps({
  orderId: {
    type: [Number, String],
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const dialogVisible = ref(false)
const order = ref(null)

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.orderId) {
    fetchOrderDetail()
  }
})

watch(() => dialogVisible.value, (newVal) => {
  emit('update:visible', newVal)
})

const fetchOrderDetail = async () => {
  try {
    const { data } = await axios.get(`/api/user/orders/${props.orderId}`)
    order.value = data
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString()
}

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
</script>

<style scoped>
.order-detail {
  padding: 10px;
}

.order-info {
  margin-bottom: 20px;
}

.order-items {
  margin-top: 20px;
}

h3 {
  margin-bottom: 15px;
  font-weight: 500;
  color: #303133;
}
</style> 