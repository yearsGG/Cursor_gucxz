<template>
  <div class="advanced-filter">
    <el-collapse>
      <el-collapse-item title="高级筛选">
        <el-form :model="filters" label-width="100px">
          <el-form-item label="车身类型">
            <el-checkbox-group v-model="filters.bodyTypes">
              <el-checkbox 
                v-for="type in bodyTypes" 
                :key="type.value" 
                :label="type.value"
              >
                {{ type.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="驱动方式">
            <el-radio-group v-model="filters.driveType">
              <el-radio 
                v-for="type in driveTypes" 
                :key="type.value" 
                :label="type.value"
              >
                {{ type.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="燃料类型">
            <el-select v-model="filters.fuelType" placeholder="请选择">
              <el-option
                v-for="type in fuelTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="变速箱">
            <el-select v-model="filters.transmission" placeholder="请选择">
              <el-option
                v-for="type in transmissionTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleApply">应用筛选</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const bodyTypes = [
  { label: '两厢轿车', value: '两厢' },
  { label: '三厢轿车', value: '三厢' },
  { label: '掀背车', value: '掀背' },
  { label: 'SUV', value: 'SUV' },
  { label: '跑车', value: '跑车' }
]

const driveTypes = [
  { label: '前驱', value: '前驱' },
  { label: '后驱', value: '后驱' },
  { label: '四驱', value: '四驱' }
]

const fuelTypes = [
  { label: '汽油', value: '汽油' },
  { label: '柴油', value: '柴油' },
  { label: '纯电', value: '电动' },
  { label: '混动', value: '混合动力' }
]

const transmissionTypes = [
  { label: '手动', value: 'manual' },
  { label: '自动', value: 'auto' },
  { label: 'DCT双离合', value: 'dct' },
  { label: 'CVT无级变速', value: 'cvt' }
]

const emit = defineEmits(['filter'])

const filters = reactive({
  bodyTypes: [],
  driveType: '',
  fuelType: '',
  transmission: ''
})

const handleApply = () => {
  emit('filter', { ...filters })
}

const handleReset = () => {
  filters.bodyTypes = []
  filters.driveType = ''
  filters.fuelType = ''
  filters.transmission = ''
  emit('filter', { ...filters })
}
</script>

<style scoped>
.advanced-filter {
  margin: 20px 0;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-checkbox-group,
.el-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style> 