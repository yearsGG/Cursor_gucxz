<template>
  <div class="home">
    <!-- 轮播图部分 -->
    <div class="banner">
      <el-carousel height="400px">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <img :src="banner.image_url" :alt="banner.title">
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <el-menu mode="horizontal" :default-active="activeCategory">
        <el-menu-item 
          v-for="category in categories" 
          :key="category.value"
          :index="category.value"
          @click="filterByCategory(category.value)"
        >
          {{ category.label }}
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 商品展示网格 -->
    <div class="car-grid">
      <el-card 
        v-for="car in cars" 
        :key="car.id" 
        class="car-card"
        @click="goToDetail(car.id)"
      >
        <!-- 商品图片 -->
        <img 
          :src="car.images ? car.images.split(',')[0] : '/images/default-car.jpg'" 
          class="car-image"
          :alt="car.model"
        >
        <!-- 商品信息 -->
        <div class="car-info">
          <h3>{{ car.brand }} {{ car.model }}</h3>
          <p class="year-mileage">
            {{ car.year }}年 | {{ car.mileage }}公里
          </p>
          <p class="price">¥{{ car.price?.toLocaleString() }}</p>
          <el-button 
            type="primary" 
            @click.stop="addToCart(car)"
          >
            加入购物车
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 客服悬浮窗 -->
    <div class="customer-service">
      <el-popover
        placement="left"
        :width="300"
        trigger="click"
      >
        <template #reference>
          <el-button type="primary" circle>
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
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Service } from '@element-plus/icons-vue'

// 路由相关
const router = useRouter()
const route = useRoute()

// 状态管理
const userStore = useUserStore()

// 数据响应式定义
const banners = ref([])
const cars = ref([])
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 分类选项定义
const categories = [
  { label: '全部', value: 'all' },
  { label: 'SUV', value: 'suv' },
  { label: '轿车', value: 'sedan' },
  { label: '跑车', value: 'sports' },
  { label: '新能源', value: 'electric' }
]

// 获取轮播图数据
const fetchBanners = async () => {
  try {
    const { data } = await axios.get('/api/banners')
    banners.value = data
  } catch (error) {
    console.error('获取轮播图失败:', error)
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
  try {
    // 检查登录状态
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

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

// 客服对话
const startChat = () => {
  ElMessage.info('正在连接客服...')
}

// 监听路由查询参数变化
watch(() => route.query.q, () => {
  currentPage.value = 1
  fetchCars()
})

// 页面加载时执行
onMounted(() => {
  fetchBanners()
  fetchCars()
})
</script>

<style scoped>
/* 主容器样式 */
.home {
  padding: 20px;
}

/* 轮播图样式 */
.banner {
  margin-bottom: 30px;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 分类导航样式 */
.category-nav {
  margin-bottom: 30px;
}

/* 商品网格样式 */
.car-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* 商品卡片样式 */
.car-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.car-card:hover {
  transform: translateY(-5px);
}

.car-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* 商品信息样式 */
.car-info {
  padding: 15px;
}

.car-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.year-mileage {
  color: #666;
  margin: 5px 0;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0;
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
</style>