<template>
  <div class="search-results">
    <div class="search-header">
      <h2>搜索结果</h2>
      <div class="search-filters">
        <el-select 
          v-model="sortOption" 
          placeholder="排序方式"
          @change="handleSortChange"
        >
          <el-option label="默认排序" value="" />
          <el-option label="价格从低到高" value="price_asc" />
          <el-option label="价格从高到低" value="price_desc" />
          <el-option label="最新上架" value="newest" />
        </el-select>

        <el-select 
          v-model="selectedBrand" 
          placeholder="品牌筛选"
          @change="handleBrandChange"
        >
          <el-option label="全部品牌" value="" />
          <el-option 
            v-for="brand in brands" 
            :key="brand.id" 
            :label="brand.name" 
            :value="brand.name"
          />
        </el-select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="noResults" class="no-results">
      暂无搜索结果
    </div>

    <div v-else class="search-results-list">
      <div v-for="car in displayResults" :key="car.id" class="car-item">
        <div class="car-image">
          <img :src="getCarImage(car)" @error="handleImageError">
        </div>
        <div class="car-info">
          <h3>{{ car.brand }} {{ car.model }}</h3>
          <p class="car-price">¥{{ formatPrice(car.price) }}</p>
          <p class="car-details">{{ car.year }}年 | {{ car.color }}</p>
          <div class="car-actions">
            <el-button type="primary" @click="viewDetail(car.id)">查看详情</el-button>
            <el-button @click="addToCart(car)">加入购物车</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[12, 24, 36, 48]"
      layout="total, sizes, prev, pager, next"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
      background
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref(null)
const results = ref([]) // 存储搜索结果
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const selectedBrand = ref('')
const sortOption = ref('')

// 计算属性
const displayResults = computed(() => {
  return results.value
})

const hasResults = computed(() => {
  return results.value && results.value.length > 0
})

const noResults = computed(() => {
  return !loading.value && (!results.value || results.value.length === 0)
})

// 搜索方法
const fetchSearchResults = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('发起搜索请求:', {
      q: route.query.q,
      page: currentPage.value,
      pageSize: pageSize.value,
      sort: sortOption.value,
      brand: selectedBrand.value
    })
    
    const response = await axios.get('/api/cars/search', {
      params: {
        q: route.query.q,
        page: currentPage.value,
        pageSize: pageSize.value,
        sort: sortOption.value,
        brand: selectedBrand.value
      }
    })
    
    console.log('搜索结果:', response.data)
    results.value = response.data.items
    total.value = response.data.total
    
  } catch (error) {
    console.error('搜索失败:', error)
    error.value = '搜索失败，请稍后重试'
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.query,
  () => {
    fetchSearchResults()
  },
  { immediate: true }
)

// 处理排序变化
const handleSortChange = (value) => {
  sortOption.value = value
  fetchSearchResults()
}

// 处理品牌筛选变化
const handleBrandChange = (value) => {
  selectedBrand.value = value
  fetchSearchResults()
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchSearchResults()
}

// 添加缺失的方法和变量
const brands = ref([])
const getCarImage = (car) => {
  if (!car.images) return '/images/default-car.jpg'
  return car.images.split(',')[0]
}

const handleImageError = (e) => {
  e.target.src = '/images/default-car.jpg'
}

const formatPrice = (price) => {
  return Number(price).toLocaleString()
}

const viewDetail = (carId) => {
  router.push(`/car/${carId}`)
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchSearchResults()
}

// 获取品牌列表
const fetchBrands = async () => {
  try {
    const { data } = await axios.get('/api/brands')
    brands.value = data
  } catch (error) {
    console.error('获取品牌列表失败:', error)
  }
}

onMounted(() => {
  fetchBrands()
  fetchSearchResults()
})
</script>

<style scoped>
.search-results {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-header h2 {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.search-filters {
  display: flex;
  gap: 20px;
}

.loading {
  padding: 40px;
  text-align: center;
}

.no-results {
  padding: 60px;
  text-align: center;
  color: #909399;
  font-size: 16px;
}

.error {
  padding: 20px;
  color: #f56c6c;
  text-align: center;
}

/* 列表样式 */
.search-results-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.car-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.car-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.car-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.car-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.car-item:hover .car-image img {
  transform: scale(1.05);
}

.car-info {
  padding: 15px;
}

.car-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.car-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0;
}

.car-details {
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.car-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.car-actions .el-button {
  flex: 1;
}

/* 分页样式 */
:deep(.el-pagination) {
  margin-top: 30px;
  justify-content: center;
}
</style> 