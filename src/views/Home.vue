<template>
  <div class="home">
    <!-- 轮播图部分 -->
    <div class="banner-section">
      <el-carousel height="500px" :interval="4000" type="card">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-content">
            <img :src="banner.image_url" :alt="banner.title">
            <div class="banner-info">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.description }}</p>
              <el-button type="primary" size="large" @click="goToCategory(banner.link)">
                了解更多
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 品牌展示 -->
    <div class="brand-section">
      <h2 class="section-title">热门品牌</h2>
      <div class="brand-list">
        <div v-for="brand in brands" :key="brand.id" class="brand-item" @click="filterByBrand(brand.name)">
          <img :src="brand.logo" :alt="brand.name">
          <span>{{ brand.name }}</span>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <el-menu 
        mode="horizontal" 
        :default-active="activeCategory"
        class="category-menu"
      >
        <el-menu-item 
          v-for="category in categories" 
          :key="category.value"
          :index="category.value"
          @click="filterByCategory(category.value)"
        >
          <el-icon>
            <component :is="category.icon" />
          </el-icon>
          <span>{{ category.label }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 商品展示网格 -->
    <div class="car-section">
      <h2 class="section-title">热门车型</h2>
      <div class="car-grid">
        <el-card 
          v-for="car in cars" 
          :key="car.id" 
          class="car-card"
          @click="goToDetail(car.id)"
        >
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
          <div class="car-info">
            <h3>{{ car.brand }} {{ car.model }}</h3>
            <p class="car-specs">
              <span>{{ car.year }}年</span>
              <span>{{ car.mileage }}公里</span>
              <span>{{ car.color }}</span>
            </p>
            <div class="car-price">
              <span class="price">¥{{ formatPrice(car.price) }}</span>
              <el-button 
                type="primary" 
                @click.stop="addToCart(car)"
                :loading="loading"
              >
                加入购物车
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分页控件 -->
      <div class="pagination">
        <el-pagination
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>

    <!-- 客服悬浮窗 -->
    <div class="customer-service">
      <el-popover
        placement="left"
        :width="300"
        trigger="click"
      >
        <template #reference>
          <el-button type="primary" circle class="service-button">
            <el-icon><Service /></el-icon>
          </el-button>
        </template>
        <div class="service-content">
          <h3>在线客服</h3>
          <p>服务时间：9:00-18:00</p>
          <el-button type="primary" @click="startChat">
            开始对话
          </el-button>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { 
  Service,
  Van,
  Basketball,
  Lightning,
  List,
  Location
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 路由相关
const router = useRouter()
const route = useRoute()

// 状态管理
const userStore = useUserStore()
const loading = ref(false)

// 数据响应式定义
const banners = ref([])
const cars = ref([])
const brands = ref([])
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 分类选项定义
const categories = [
  { label: '全部', value: 'all', icon: 'List' },
  { label: 'SUV', value: 'suv', icon: 'Van' },
  { label: '轿车', value: 'sedan', icon: 'Location' },
  { label: '跑车', value: 'sports', icon: 'Basketball' },
  { label: '新能源', value: 'electric', icon: 'Lightning' }
]

// 格式化价格
const formatPrice = (price) => {
  return price?.toLocaleString() || '0'
}

// 获取车辆图片
const getCarImage = (images) => {
  return images ? images.split(',')[0] : '/images/default-car.jpg'
}

// 获取轮播图数据
const fetchBanners = async () => {
  try {
    const { data } = await axios.get('/api/banners')
    banners.value = data
  } catch (error) {
    console.error('获取轮播图失败:', error)
  }
}

// 获取品牌数据
const fetchBrands = async () => {
  try {
    const { data } = await axios.get('/api/brands')
    brands.value = data
  } catch (error) {
    console.error('获取品牌数据失败:', error)
  }
}

// 获取汽车列表
const fetchCars = async () => {
  try {
    const { data } = await axios.get('/api/cars', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        category: activeCategory.value === 'all' ? '' : activeCategory.value,
        q: route.query.q
      }
    })
    cars.value = data.items
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取汽车列表失败')
  }
}

// 分类筛选
const filterByCategory = (category) => {
  activeCategory.value = category
  currentPage.value = 1
  fetchCars()
}

// 品牌筛选
const filterByBrand = (brand) => {
  router.push({
    path: '/',
    query: { brand }
  })
}

// 跳转到分类
const goToCategory = (link) => {
  if (link) {
    router.push(link)
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchCars()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchCars()
}

// 加入购物车
const addToCart = async (car) => {
  if (loading.value) return
  
  try {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

    loading.value = true
    await axios.post('/api/cart', {
      carId: car.id,
      quantity: 1
    })
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error('加入购物车失败')
  } finally {
    loading.value = false
  }
}

// 跳转到详情页
const goToDetail = (carId) => {
  router.push(`/car/${carId}`)
}

// 客服对话
const startChat = () => {
  ElMessage.info('正在连接客服...')
}

// 监听路由查询参数变化
watch(() => route.query, () => {
  currentPage.value = 1
  fetchCars()
}, { deep: true })

// 页面加载时执行
onMounted(() => {
  fetchBanners()
  fetchBrands()
  fetchCars()
})
</script>

<style scoped>
.home {
  padding: 20px;
}

/* 轮播图样式 */
.banner-section {
  margin-bottom: 40px;
}

.banner-content {
  position: relative;
  height: 100%;
}

.banner-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.banner-info {
  position: absolute;
  bottom: 40px;
  left: 40px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.banner-info h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.banner-info p {
  font-size: 18px;
  margin-bottom: 20px;
}

/* 品牌展示样式 */
.brand-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
  text-align: center;
}

.brand-list {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.brand-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.brand-item:hover {
  transform: translateY(-5px);
}

.brand-item img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 10px;
}

/* 分类导航样式 */
.category-nav {
  margin-bottom: 30px;
}

.category-menu {
  justify-content: center;
}

.el-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 商品网格样式 */
.car-section {
  max-width: 1200px;
  margin: 0 auto;
}

.car-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.car-card {
  cursor: pointer;
  transition: all 0.3s;
}

.car-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.car-image-wrapper {
  position: relative;
  height: 200px;
}

.car-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.car-tags {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.car-info {
  padding: 15px;
}

.car-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.car-specs {
  display: flex;
  gap: 15px;
  color: #666;
  margin: 10px 0;
  font-size: 14px;
}

.car-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

/* 客服悬浮窗样式 */
.customer-service {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000;
}

.service-button {
  width: 50px;
  height: 50px;
  font-size: 24px;
}

.service-content {
  text-align: center;
}

.service-content h3 {
  margin-bottom: 10px;
}

.service-content p {
  color: #666;
  margin-bottom: 15px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .banner-info {
    left: 20px;
    bottom: 20px;
  }

  .banner-info h2 {
    font-size: 24px;
  }

  .banner-info p {
    font-size: 16px;
  }

  .car-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>