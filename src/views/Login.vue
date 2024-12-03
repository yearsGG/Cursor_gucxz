<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>登录</h2>
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名"/>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="formData.password" 
            type="password" 
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="form-footer">
          <router-link to="/register">还没有账号？立即注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const formData = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await axios.post('/api/auth/login', {
      username: formData.value.username,
      password: formData.value.password
    })

    const { token, user } = response.data
    
    // 打印详细的登录信息
    console.log('登录响应:', response.data)
    console.log('用户信息:', user)
    console.log('用户角色:', user.role)
    
    // 保存token和用户信息
    userStore.setToken(token)
    userStore.setUser(user)
    
    // 设置axios默认header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // 打印store中的用户角色
    console.log('Store中的用户角色:', userStore.userRole)
    
    ElMessage.success('登录成功')

    // 根据角色跳转
    if (userStore.userRole === 'admin') {
      console.log('准备跳转到管理后台')
      await router.push({
        name: 'AdminDashboard',
        replace: true
      })
    } else {
      console.log('准备跳转到首页')
      await router.push({
        path: '/',
        replace: true
      })
    }

  } catch (error) {
    console.error('登录错误:', error)
    if (error.response?.status === 401) {
      ElMessage.error('用户名或密码错误')
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 180px);
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.form-footer a {
  color: #409EFF;
  text-decoration: none;
}

.form-footer a:hover {
  color: #66b1ff;
}
</style> 