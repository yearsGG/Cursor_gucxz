<template>
  <div class="car-list">
    <div v-if="isDev" class="debug-info">
      <p>总车辆数: {{ cars.length }}</p>
      <p>状态统计: {{ statusCount }}</p>
    </div>

    <div class="cars-grid">
      <div 
        v-for="car in displayCars" 
        :key="car.id" 
        class="car-card"
        @click="handleCarClick(car)"
      >
        <div class="car-info">
          <div class="car-status">
            <el-tag :type="getStatusType(car)">
              {{ getStatusText(car) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import axios from 'axios'
import { useEventBus } from '@/utils/eventBus'
import { useSocket } from '@/composables/useSocket'

const isDev = process.env.NODE_ENV === 'development'
const cars = ref([])
const eventBus = useEventBus()
const socket = useSocket()

// 添加获取车辆列表的方法
const fetchCars = async () => {
  try {
    const response = await axios.get('/api/cars')
    cars.value = response.data
  } catch (error) {
    console.error('获取车辆列表失败:', error)
  }
}

// 监听车辆状态变化事件
eventBus.on('carStatusChanged', () => {
  fetchCars()
})

// 监听库存变化事件
eventBus.on('carStockChanged', () => {
  fetchCars()
})

const statusCount = computed(() => {
  return cars.value.reduce((acc, car) => {
    acc[car.status] = (acc[car.status] || 0) + 1
    return acc
  }, {})
})

const displayCars = computed(() => {
  return cars.value.filter(car => 
    car.status === 'available' && car.stock > 0
  )
})

const getStatusType = (car) => {
  if (car.stock === 0) return 'info'
  return car.status === 'available' ? 'success' : 'info'
}

const getStatusText = (car) => {
  if (car.stock === 0) return '无货'
  return car.status === 'available' ? '有货' : '已下架'
}

// 添加 WebSocket 监听
socket.on('carUpdate', (data) => {
  if (data.type === 'stockChanged') {
    fetchCars()
  }
})

// 初始化
onMounted(() => {
  fetchCars()
})

// 组件销毁时清理
onUnmounted(() => {
  eventBus.off('carStatusChanged')
  eventBus.off('carStockChanged')
  socket.off('carUpdate')
})
</script>

<style scoped>
.debug-info {
  background: #f5f7fa;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-family: monospace;
}

.car-status {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}
</style> 