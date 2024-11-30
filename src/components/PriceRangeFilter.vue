<template>
  <div class="price-filter">
    <el-form inline>
      <el-form-item label="价格区间">
        <el-select v-model="selectedRange" @change="handleChange">
          <el-option
            v-for="range in priceRanges"
            :key="range.value"
            :label="range.label"
            :value="range.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="自定义">
        <el-input-number 
          v-model="minPrice" 
          :min="0" 
          :step="1000"
          placeholder="最低价"
        />
        <span class="separator">-</span>
        <el-input-number 
          v-model="maxPrice" 
          :min="0" 
          :step="1000"
          placeholder="最高价"
        />
        <el-button type="primary" @click="handleCustomRange">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  priceRanges: {
    type: Array,
    default: () => [
      { label: '全部', value: '' },
      { label: '30万以下', value: '0-300000' },
      { label: '30-50万', value: '300000-500000' },
      { label: '50-100万', value: '500000-1000000' },
      { label: '100万以上', value: '1000000-999999999' }
    ]
  }
})

const emit = defineEmits(['change'])

const selectedRange = ref('')
const minPrice = ref(null)
const maxPrice = ref(null)

const handleChange = (value) => {
  emit('change', value)
}

const handleCustomRange = () => {
  if (minPrice.value !== null && maxPrice.value !== null) {
    if (minPrice.value > maxPrice.value) {
      [minPrice.value, maxPrice.value] = [maxPrice.value, minPrice.value]
    }
    emit('change', `${minPrice.value}-${maxPrice.value}`)
  }
}
</script>

<style scoped>
.price-filter {
  margin: 20px 0;
}

.separator {
  margin: 0 10px;
}
</style> 