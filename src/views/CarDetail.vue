<template>
  <div class="car-detail">
    <el-card v-if="car">
      <div class="car-info">
        <div class="car-images">
          <el-carousel height="400px">
            <el-carousel-item v-for="image in carImages" :key="image">
              <img :src="image" :alt="car.model">
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="car-content">
          <h1>{{ car.brand }} {{ car.model }}</h1>
          <div class="price">¥{{ car.price.toLocaleString() }}</div>
          
          <div class="specs">
            <h3>基本信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="品牌">{{ car.brand }}</el-descriptions-item>
              <el-descriptions-item label="型号">{{ car.model }}</el-descriptions-item>
              <el-descriptions-item label="年份">{{ car.year }}年</el-descriptions-item>
              <el-descriptions-item label="颜色">{{ car.color }}</el-descriptions-item>
              <el-descriptions-item label="里程">{{ car.mileage }}公里</el-descriptions-item>
              <el-descriptions-item label="库存">{{ car.stock }}辆</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="description">
            <h3>详细描述</h3>
            <p>{{ car.description }}</p>
          </div>

          <div class="actions">
            <el-button type="primary" size="large" @click="addToCart">
              加入购物车
            </el-button>
            <el-button size="large" @click="contactService">
              联系客服
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-empty v-else description="未找到商品信息" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const car = ref(null)

const carImages = computed(() => {
  return car.value?.images?.split(',') || []
})

const fetchCarDetail = async () => {
  try {
    // TODO: 实现获取商品详情API
    const { data } = await axios.get(`/api/cars/${route.params.id}`)
    car.value = data
  } catch (error) {
    ElMessage.error('获取商品信息失败')
  }
}

const addToCart = async () => {
  try {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }
    
    await axios.post('/api/cart', {
      carId: car.value.id,
      quantity: 1
    })
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error('加入购物车失败')
  }
}

const contactService = () => {
  ElMessage.info('正在连接客服...')
}

onMounted(fetchCarDetail)
</script>

<style scoped>
.car-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.car-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.car-images {
  width: 100%;
}

.car-images img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.car-content {
  padding: 20px;
}

.price {
  color: #f56c6c;
  font-size: 28px;
  font-weight: bold;
  margin: 20px 0;
}

.specs {
  margin: 20px 0;
}

.description {
  margin: 20px 0;
}

.actions {
  margin-top: 30px;
  display: flex;
  gap: 20px;
}

h3 {
  margin-bottom: 15px;
  color: #303133;
}
</style> 