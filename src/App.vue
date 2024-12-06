<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <nav class="nav-header">
        <!-- 左侧 Logo -->
        <router-link to="/" class="logo">
          <el-icon class="logo-icon"><Shop /></el-icon>
          汽车商城
        </router-link>

        <!-- 中间搜索栏 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索汽车品牌、型号..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 右侧导航链接 -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <el-icon><HomeFilled /></el-icon>
            首页
          </router-link>
          <router-link to="/cart" class="nav-link">
            <el-badge :value="cartCount" :hidden="cartCount === 0">
              <el-icon><ShoppingCart /></el-icon>
              购物车
            </el-badge>
          </router-link>
          
          <!-- 用户菜单 -->
          <template v-if="isLoggedIn">
            <el-dropdown trigger="click">
              <span class="user-menu">
                <el-avatar 
                  :size="32"
                  :src="user?.avatar || '/images/default-avatar.png'"
                  @error="handleAvatarError"
                />
                <span class="username">{{ user?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <router-link to="/profile" class="dropdown-link">
                      <el-icon><User /></el-icon>
                    个人中心
                    </router-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-icon><List /></el-icon>
                    我的订单
                  </el-dropdown-item>
                  <el-dropdown-item v-if="userRole === 'admin'">
                    <router-link to="/admin" class="dropdown-link">
                      <el-icon><Setting /></el-icon>
                      管理后台
                    </router-link>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <router-link v-else to="/login" class="nav-link">
            <el-icon><User /></el-icon>
            登录
          </router-link>
          
          <!-- 添加客服入口 -->
          <el-button 
            type="primary" 
            plain
            @click="showCustomerService = true"
          >
            <el-icon><Service /></el-icon>
            在线客服
          </el-button>
        </div>
      </nav>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <!-- 页脚 -->
    <el-footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>专业的汽车交易平台</p>
          <p>为您提供优质的购车体验</p>
        </div>
        <div class="footer-section">
          <h3>联系方式</h3>
          <p>电话：400-123-4567</p>
          <p>邮箱：support@carmall.com</p>
        </div>
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-links">
            <el-icon><Platform /></el-icon>
            <el-icon><ChatDotRound /></el-icon>
            <el-icon><Share /></el-icon>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 汽车商城 版权所有</p>
      </div>
    </el-footer>

    <!-- 添加客服对话框 -->
    <el-dialog
      v-model="showCustomerService"
      title="智能客服"
      width="500px"
      :close-on-click-modal="false"
      :before-close="handleCloseDialog"
      destroy-on-close
    >
      <CustomerService 
        :show="showCustomerService" 
        @close="handleCloseDialog"
      />
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { 
  Search, 
  ArrowDown, 
  HomeFilled,
  ShoppingCart,
  User,
  List,
  SwitchButton,
  Platform,
  ChatDotRound,
  Share,
  Shop,
  Setting,
  Service
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import CustomerService from '@/components/CustomerService.vue'
import eventBus from '@/utils/eventBus'

// 确保在使用 store 之前已经初始化
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 使用 storeToRefs 来保持响应性
const { user, isLoggedIn, userRole } = storeToRefs(userStore)

// 3. 修改 watch 和其他使用 store 的地方
const fetchCartCount = async () => {
  if (!isLoggedIn.value) {  // 使用解构后的响应式引用
    cartCount.value = 0
    return
  }

  try {
    const { data } = await axios.get('/api/cart/count')
    cartCount.value = data.count
  } catch (error) {
    if (error.response?.status === 401) {
      userStore.logout()
      cartCount.value = 0
    } else {
      console.error('获取购物车数量失败:', error)
    }
  }
}

// 修改 watch 使用解构后的响应式引用
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    fetchCartCount()
  } else {
    cartCount.value = 0
  }
})

// 修改 onMounted 使用解构后的响应式引用
onMounted(() => {
  if (isLoggedIn.value) {
    fetchCartCount()
  }
  
  eventBus.on('open-customer-service', () => {
    showCustomerService.value = true
  })
})

// 其他变量声明
const searchQuery = ref('')
const cartCount = ref(0)
const showCustomerService = ref(false)

// 其他方法
const handleCloseDialog = () => {
  showCustomerService.value = false
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  })
}

const logout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const handleAvatarError = (e) => {
  console.error('头像加载失败:', user.value?.avatar)  // 使用解构后的响应式引用
  e.target.src = '/images/default-avatar.png'
}

onUnmounted(() => {
  eventBus.off('open-customer-service')
})
</script>

<style scoped>
/* 布局容器 */
.layout-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 */
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-header {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* Logo 样式 */
.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;
}

.logo:hover {
  color: #79bbff;
}

.logo-icon {
  font-size: 28px;
}

/* 搜索栏样式 */
.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.search-input {
  width: 100%;
  transition: all 0.3s;
}

.search-input:focus-within {
  transform: translateY(-2px);
}

/* 导航链接样式 */
.nav-links {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-link {
  color: #606266;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #409EFF;
  background: #ecf5ff;
}

.nav-link.router-link-active {
  color: #409EFF;
  font-weight: bold;
}

/* 用户菜单样式 */
.user-menu {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-menu:hover {
  background: #f5f7fa;
}

.username {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 页脚样式 */
.footer {
  background: #2c3e50;
  color: #fff;
  padding: 40px 0 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding: 0 20px;
}

.footer-section h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #fff;
}

.footer-section p {
  color: #b3c0d1;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 20px;
  font-size: 24px;
}

.social-links .el-icon {
  cursor: pointer;
  transition: color 0.3s;
}

.social-links .el-icon:hover {
  color: #409EFF;
}

.footer-bottom {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: #b3c0d1;
}

.dropdown-link {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.el-dropdown-item {
  padding: 0;
}

.el-dropdown-item .dropdown-link {
  padding: 5px 12px;
}

.el-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.customer-service-btn {
  margin-left: 16px;
}

/* 确保对话框内容区域有合适的高度 */
:deep(.el-dialog__body) {
  padding: 0;
  height: 600px;
}
</style> 