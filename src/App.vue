<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header>
      <nav class="nav-header">
        <!-- 左侧 Logo -->
        <router-link to="/" class="logo">
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
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 右侧导航链接 -->
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/cart">
            <el-badge :value="cartCount" :hidden="cartCount === 0">
              购物车
            </el-badge>
          </router-link>
          <!-- 根据登录状态显示不同的链接 -->
          <template v-if="userStore.isLoggedIn">
            <el-dropdown>
              <span class="user-menu">
                {{ userStore.user?.username }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <router-link v-else to="/login">登录</router-link>
        </div>
      </nav>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main>
      <router-view></router-view>
    </el-main>

    <!-- 页脚 -->
    <el-footer>
      <p>© 2024 汽车商城 版权所有</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 初始化路由和状态管理
const router = useRouter()
const userStore = useUserStore()

// 搜索相关
const searchQuery = ref('')
const cartCount = ref(0)

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  // 跳转到首页并带上搜索参数
  router.push({
    path: '/',
    query: { q: searchQuery.value }
  })
}

// 退出登录
const logout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 获取购物车数量
const fetchCartCount = async () => {
  // 只在用户登录时获取购物车数量
  if (!userStore.isLoggedIn) {
    cartCount.value = 0
    return
  }

  try {
    const { data } = await axios.get('/api/cart/count')
    cartCount.value = data.count
  } catch (error) {
    // 如果是401错误，清除用户状态
    if (error.response?.status === 401) {
      userStore.logout()
      cartCount.value = 0
    } else {
      console.error('获取购物车数量失败:', error)
    }
  }
}

// 监听登录状态变化
watch(() => userStore.isLoggedIn, (newVal) => {
  if (newVal) {
    fetchCartCount()
  } else {
    cartCount.value = 0
  }
})

// 在 onMounted 中调用
onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchCartCount()
  }
})
</script>

<style scoped>
/* 布局容器 */
.layout-container {
  min-height: 100vh;
}

/* 顶部导航栏样式 */
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

/* Logo 样式 */
.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-decoration: none;
}

/* 搜索栏样式 */
.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.search-input {
  width: 100%;
}

/* 导航链接样式 */
.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  color: #606266;
  text-decoration: none;
}

.nav-links a:hover {
  color: #409EFF;
}

.nav-links a.router-link-active {
  color: #409EFF;
  font-weight: bold;
}

/* 用户菜单样式 */
.user-menu {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 页脚样式 */
.el-footer {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}
</style> 