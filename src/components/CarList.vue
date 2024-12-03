<template>
  <div class="car-list">
    <div v-if="isDev" class="debug-info">
      <p>总车辆数: {{ cars.length }}</p>
      <p>状态统计: {{ statusCount }}</p>
    </div>

    <div v-for="car in cars" :key="car.id" class="car-item">
      <div class="car-status" v-if="car.status !== 'available'">
        <el-tag :type="getStatusType(car.status)">
          {{ getStatusText(car.status) }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const isDev = process.env.NODE_ENV === 'development'

const statusCount = computed(() => {
  return cars.value.reduce((acc, car) => {
    acc[car.status] = (acc[car.status] || 0) + 1
    return acc
  }, {})
})

const getStatusType = (status) => {
  const types = {
    'available': 'success',
    'low_stock': 'warning',
    'out_of_stock': 'danger',
    'discontinued': 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'available': '有货',
    'low_stock': '库存紧张',
    'out_of_stock': '缺货',
    'discontinued': '已下架'
  }
  return texts[status] || status
}
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