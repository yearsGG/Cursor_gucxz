<template>
  <div class="search-results">
    <div class="search-header">
      <h2>搜索结果: "{{ searchQuery }}"</h2>
      <div class="search-filters">
        <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
          <el-option label="价格从低到高" value="price_asc" />
          <el-option label="价格从高到低" value="price_desc" />
          <el-option label="最新上架" value="newest" />
        </el-select>
        
        <el-select v-model="selectedBrand" placeholder="品牌筛选" @change="handleFilter">
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

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="cars.length === 0" class="empty-state">
      <el-empty description="未找到相关商品">
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </template>
      </el-empty>
    </div>

    <div v-else class="search-results-list">
      <el-card 
        v-for="car in cars" 
        :key="car.id" 
        class="car-item"
        @click="goToDetail(car.id)"
      >
        <div class="car-content">
          <div class="car-image-wrapper">
            <img 
              :src="getCarImage(car.images)"
              class="car-image"
              :alt="car.model"
            >
            <div class="car-tags">
              <el-tag v-if="car.stock <= 3" type="danger">库存紧张</el-tag>
              <el-tag v-if="car.category === 'electric'" type="success">新能源</el-tag>
            </div>
          </div>

          <div class="car-details">
            <h3>{{ car.brand }} {{ car.model }}</h3>
            <div class="car-specs">
              <el-tag>{{ car.year }}年</el-tag>
              <el-tag>{{ car.mileage }}公里</el-tag>
              <el-tag>{{ car.color }}</el-tag>
              <el-tag>{{ car.engine_type }}</el-tag>
              <el-tag>{{ car.transmission }}</el-tag>
              <el-tag>{{ car.fuel_type }}</el-tag>
            </div>
            <p class="car-description">{{ car.description }}</p>
          </div>

          <div class="car-actions">
            <span class="price">¥{{ formatPrice(car.price) }}</span>
            <div class="action-buttons">
              <el-button 
                type="primary" 
                @click.stop="addToCart(car)"
                :loading="loading"
              >
                加入购物车
              </el-button>
              <el-button @click.stop="goToDetail(car.id)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const cars = ref([])
const brands = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const sortBy = ref('')
const selectedBrand = ref('')

// 获取搜索关键词
const searchQuery = computed(() => route.query.q || '')

// 格式化价格
const formatPrice = (price) => {
  return price?.toLocaleString() || '0'
}

// 获取图片URL
const getCarImage = (images) => {
  return images ? images.split(',')[0] : '/images/default-car.jpg'
}

// 获取搜索结果
const fetchSearchResults = async () => {
  loading.value = true
  try {
    console.log('发起搜索请求:', {
      q: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      sort: sortBy.value,
      brand: selectedBrand.value
    })

    const { data } = await axios.get('/api/cars/search', {
      params: {
        q: searchQuery.value,
        page: currentPage.value,
        pageSize: pageSize.value,
        sort: sortBy.value,
        brand: selectedBrand.value
      }
    })

    console.log('搜索结果:', data)
    cars.value = data.items
    total.value = data.total
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败: ' + error.message)
  } finally {
    loading.value = false
  }
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

// 处理排序
const handleSort = () => {
  currentPage.value = 1
  fetchSearchResults()
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchSearchResults()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchSearchResults()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchSearchResults()
}

// 加入购物车
const addToCart = async (car) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await axios.post('/api/cart', {
      carId: car.id,
      quantity: 1
    })
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error('加入购物车失败')
  }
}

// 跳转到详情页
const goToDetail = (carId) => {
  router.push(`/car/${carId}`)
}

// 监听路由参数变化
watch(
  () => route.query,
  () => {
    currentPage.value = 1
    fetchSearchResults()
  },
  { deep: true }
)

// 页面加载
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
}

.search-header h2 {
  margin-bottom: 20px;
  color: #303133;
}

.search-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 列表样式 */
.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.car-item {
  cursor: pointer;
  transition: all 0.3s;
}

.car-item:hover {
  transform: translateX(5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.car-content {
  display: flex;
  gap: 20px;
}

.car-image-wrapper {
  width: 300px;
  height: 200px;
  position: relative;
  flex-shrink: 0;
}

.car-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.car-tags {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.car-details {
  flex: 1;
  padding: 10px 0;
}

.car-details h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #303133;
}

.car-specs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.car-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.car-actions {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 10px 0;
  min-width: 150px;
}

.price {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
}
</style> 