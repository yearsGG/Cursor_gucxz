<template>
  <div class="cart-container">
    <h2>购物车</h2>
    
    <div v-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="$router.push('/')">
          去购物
        </el-button>
      </el-empty>
    </div>
    
    <div v-else>
      <el-table :data="cartItems" style="width: 100%">
        <el-table-column label="商品">
          <template #default="{ row }">
            <div class="car-info">
              <img 
                :src="getImageUrl(row.images)"
                class="car-image"
                :alt="row.model"
              >
              <div>
                <h4>{{ row.brand }} {{ row.model }}</h4>
                <p>{{ row.year }}年 | {{ row.color }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="单价" width="150">
          <template #default="{ row }">
            ¥{{ formatPrice(row.price) }}
          </template>
        </el-table-column>
        
        <el-table-column label="数量" width="150">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.quantity" 
              :min="1" 
              :max="row.stock"
              @change="updateQuantity(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              @click="removeItem(row.cart_item_id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="cart-footer">
        <div class="total">
          总计: <span class="price">¥{{ formatPrice(totalAmount) }}</span>
        </div>
        <el-button 
          type="primary" 
          size="large"
          @click="goToCheckout"
        >
          去结算
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const cartItems = ref([])

const formatPrice = (price) => {
  return price?.toLocaleString() || '0'
}

const getImageUrl = (images) => {
  return images ? images.split(',')[0] : '/images/default-car.jpg'
}

const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

const fetchCartItems = async () => {
  try {
    if (!userStore.isLoggedIn) {
      router.push('/login')
      return
    }

    const { data } = await axios.get('/api/cart')
    cartItems.value = data
  } catch (error) {
    if (error.response?.status === 401) {
      router.push('/login')
    } else {
      ElMessage.error('获取购物车失败')
    }
  }
}

const updateQuantity = async (item) => {
  try {
    await axios.put(`/api/cart/${item.cart_item_id}`, {
      quantity: item.quantity
    })
    ElMessage.success('更新成功')
  } catch (error) {
    ElMessage.error('更新数量失败')
    fetchCartItems()
  }
}

const removeItem = async (cartItemId) => {
  try {
    await ElMessageBox.confirm(
      '确定要从购物车中删除该商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await axios.delete(`/api/cart/${cartItemId}`)
    await fetchCartItems()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const goToCheckout = () => {
  router.push('/checkout')
}

onMounted(fetchCartItems)
</script>

<style scoped>
.cart-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.car-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.car-image {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
}

.total {
  margin-right: 20px;
  font-size: 18px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 24px;
}

.empty-cart {
  padding: 100px 0;
}
</style> 