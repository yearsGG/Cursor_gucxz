<template>
  <div class="admin-overview">
    <div v-loading="loading" 
      element-loading-text="加载中..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
    >
      <!-- 统计卡片 -->
      <el-row :gutter="20">
        <el-col :span="6" v-for="card in statsCards" :key="card.title">
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>{{ card.title }}</span>
                <component :is="card.icon" :size="24" :color="card.color" />
              </div>
            </template>
            <div class="card-content">
              <div class="value">{{ formatValue(card.value) }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <!-- 销售趋势图 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>销售趋势</span>
                <el-radio-group v-model="salesTimeRange" size="small">
                  <el-radio-button value="week">本周</el-radio-button>
                  <el-radio-button value="month">本月</el-radio-button>
                  <el-radio-button value="year">全年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div id="sales-chart" style="width: 100%; height: 400px;"></div>
          </el-card>
        </el-col>

        <!-- 热门车型排行 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>热门车型</span>
                <el-select v-model="popularTimeRange" size="small">
                  <el-option label="最近7天" value="week" />
                  <el-option label="最近30天" value="month" />
                  <el-option label="最近90天" value="quarter" />
                </el-select>
              </div>
            </template>
            <el-table :data="popularCars" style="width: 100%">
              <el-table-column label="车型" min-width="200">
                <template #default="{ row }">
                  <div class="car-info">
                    <img 
                      :src="row.image || '/images/default-car.png'" 
                      class="car-image"
                      @error="handleImageError"
                    >
                    <div class="car-detail">
                      <div class="car-name">{{ row.brand }} {{ row.model }}</div>
                      <div class="car-price">¥{{ formatPrice(row.price) }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="total_sales" label="销量" width="100" align="right" />
              <el-table-column label="趋势" width="100" align="center">
                <template #default="{ row }">
                  <span :class="{ 'trend-up': row.trend > 0, 'trend-down': row.trend < 0 }">
                    {{ formatTrend(row.trend) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最新订单 -->
      <el-row class="order-row">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>最新订单</span>
                <el-button type="primary" link @click="handleMenuSelect('orders')">
                  查看全部
                </el-button>
              </div>
            </template>
            <el-table :data="latestOrders" style="width: 100%">
              <el-table-column prop="order_no" label="订单号" width="180">
                <template #default="{ row }">
                  <span class="order-no">{{ row.order_no }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="user.username" label="用户" width="120" />
              <el-table-column label="车型" min-width="200">
                <template #default="{ row }">
                  <div class="car-info">
                    <img 
                      :src="row.car.image || '/images/default-car.png'" 
                      class="car-image"
                      @error="handleImageError"
                    >
                    <div class="car-detail">
                      <div class="car-name">{{ row.car.brand }} {{ row.car.model }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="金额" width="150">
                <template #default="{ row }">
                  ¥{{ formatPrice(row.amount) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getOrderStatusType(row.status)">
                    {{ getOrderStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="下单时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Money, 
  ShoppingCart, 
  User, 
  Van 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { formatDate } from '@/utils/format'

const loading = ref(false)
const salesTimeRange = ref('week')
const popularTimeRange = ref('week')
const salesChart = ref(null)
const popularCars = ref([])
const latestOrders = ref([])
const isComponentMounted = ref(true)

// 统计数据
const statsData = ref({
  totalSales: 0,
  orderCount: 0,
  customerCount: 0,
  avgOrderValue: 0
})

// 统计卡片配置
const statsCards = computed(() => [
  {
    title: '总销售额',
    value: statsData.value.totalSales || 0,
    icon: Money,
    color: '#409EFF'
  },
  {
    title: '订单数量',
    value: statsData.value.orderCount || 0,
    icon: ShoppingCart,
    color: '#67C23A'
  },
  {
    title: '用户数量',
    value: statsData.value.customerCount || 0,
    icon: User,
    color: '#E6A23C'
  },
  {
    title: '平均订单金额',
    value: statsData.value.avgOrderValue || 0,
    icon: Van,
    color: '#F56C6C'
  }
])

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await axios.get('/api/admin/orders/stats')
    const data = response.data
    statsData.value = {
      totalSales: data.total_sales || 0,
      orderCount: data.total_orders || 0,
      customerCount: data.unique_customers || 0,
      avgOrderValue: data.total_orders ? Math.round(data.total_sales / data.total_orders) : 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取销售趋势数据
const fetchSalesTrend = async () => {
  try {
    const response = await axios.get(`/api/admin/stats/sales-trend?range=${salesTimeRange.value}`)
    const data = response.data
    
    if (!isComponentMounted.value) return
    
    // 初始化图表
    if (!salesChart.value) {
      const chartDom = document.getElementById('sales-chart')
      if (!chartDom) return
      salesChart.value = echarts.init(chartDom)
    }
    
    // 设置图表数据
    salesChart.value.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { 
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      legend: {
        data: ['销售额', '订单数']
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: data.map(item => item.date)
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额',
          axisLabel: {
            formatter: (value) => `¥${value.toLocaleString()}`
          }
        },
        {
          type: 'value',
          name: '订单数',
          position: 'right',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#91cc75'
            }
          },
          axisLabel: {
            formatter: '{value}单'
          }
        }
      ],
      series: [
        {
          name: '销售额',
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            color: '#409EFF'
          },
          data: data.map(item => item.sales_amount)
        },
        {
          name: '订单数',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          itemStyle: {
            color: '#91cc75'
          },
          lineStyle: {
            width: 2
          },
          data: data.map(item => item.order_count)
        }
      ]
    })
  } catch (error) {
    if (!isComponentMounted.value) return
    console.error('获取销售趋势失败:', error)
    ElMessage.error('获取销售趋势失败')
  }
}

// 获取热门车型数据
const fetchPopularCars = async () => {
  try {
    const response = await axios.get(`/api/admin/stats/popular-cars?range=${popularTimeRange.value}`)
    if (!isComponentMounted.value) return
    popularCars.value = response.data
  } catch (error) {
    if (!isComponentMounted.value) return
    console.error('获取热门车型失败:', error)
    ElMessage.error('获取热门车型失败')
  }
}

// 获取最新订单
const fetchLatestOrders = async () => {
  try {
    const response = await axios.get('/api/admin/stats/latest-orders')
    if (!isComponentMounted.value) return
    latestOrders.value = response.data
  } catch (error) {
    if (!isComponentMounted.value) return
    console.error('获取最新订单失败:', error)
    ElMessage.error('获取最新订单失败')
  }
}

// 监听时间范围变化
watch(salesTimeRange, fetchSalesTrend)
watch(popularTimeRange, fetchPopularCars)

// 初始化
onMounted(() => {
  isComponentMounted.value = true
  fetchStats()
  fetchSalesTrend()
  fetchPopularCars()
  fetchLatestOrders()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 清理
onUnmounted(() => {
  isComponentMounted.value = false
  if (salesChart.value) {
    salesChart.value.dispose()
    salesChart.value = null
  }
  window.removeEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  if (salesChart.value && isComponentMounted.value) {
    salesChart.value.resize()
  }
}

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = '/images/default-car.png'
}

// 格式化价格
const formatPrice = (price) => {
  return Number(price || 0).toLocaleString()
}

// 格式化趋势
const formatTrend = (trend) => {
  if (!trend) return '--'
  const prefix = trend > 0 ? '+' : ''
  return `${prefix}${trend.toFixed(1)}%`
}

// 格式化值
const formatValue = (value) => {
  if (typeof value === 'number') {
    if (value === 0) return '0'
    return value >= 10000 
      ? (value / 10000).toFixed(1) + '万'
      : value.toLocaleString()
  }
  return value || '0'
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'paid': 'success',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return types[status] || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const texts = {
    'pending': '待付款',
    'paid': '已付款',
    'shipped': '已发货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status] || status
}

const handleMenuSelect = inject('handleMenuSelect')
</script>

<style scoped>
.admin-overview {
  padding: 20px;
}

.chart-row {
  margin-top: 20px;
}

.stats-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.car-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.car-image {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
}

.car-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.car-name {
  font-weight: 500;
}

.car-price {
  color: #f56c6c;
  font-size: 14px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.trend {
  font-size: 14px;
}

.trend.up {
  color: #67c23a;
}

.trend.down {
  color: #f56c6c;
}
</style> 