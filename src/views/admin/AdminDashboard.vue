<template>
  <div class="admin-dashboard">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="overview">
            <el-icon><DataLine /></el-icon>
            <span>总览</span>
          </el-menu-item>
          
          <el-menu-item index="orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          
          <el-menu-item index="cars">
            <el-icon><Van /></el-icon>
            <span>车辆管理</span>
          </el-menu-item>
          
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          
          <el-menu-item index="comments">
            <el-icon><ChatDotRound /></el-icon>
            <span>评论管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <component :is="currentComponent" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { DataLine, Van, List, User, ChatDotRound } from '@element-plus/icons-vue'
import AdminOverview from './components/AdminOverview.vue'
import AdminCars from './components/AdminCars.vue'
import AdminOrders from './components/AdminOrders.vue'
import AdminUsers from './components/AdminUsers.vue'
import AdminComments from './components/AdminComments.vue'

const router = useRouter()
const userStore = useUserStore()
const activeMenu = ref('overview')
const currentComponent = shallowRef(AdminOverview)

// 组件映射
const componentMap = {
  overview: AdminOverview,
  cars: AdminCars,
  orders: AdminOrders,
  users: AdminUsers,
  comments: AdminComments
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  activeMenu.value = index
  currentComponent.value = componentMap[index]
}

// 提供给子组件使用
provide('handleMenuSelect', handleMenuSelect)

// 检查管理员权限
onMounted(() => {
  if (!userStore.isLoggedIn || userStore.userRole !== 'admin') {
    router.push('/')
  }
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.admin-menu {
  height: 100%;
  border-right: none;
  background-color: #304156;
}

.el-menu-item {
  color: #bfcbd9;
}

.el-menu-item.is-active {
  color: #409EFF;
  background-color: #263445;
}

.el-menu-item:hover {
  background-color: #263445;
}

.el-main {
  padding: 20px;
  background-color: #f0f2f5;
}
</style> 