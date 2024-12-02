<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <div class="register-form">
      <div class="avatar-upload">
        <img 
          :src="avatarPreview || '/images/default-avatar.png'" 
          class="avatar-preview"
          alt="头像预览"
        >
        <input 
          type="file" 
          id="avatar" 
          @change="handleAvatarChange" 
          accept="image/*"
          style="display: none"
        >
        <button 
          @click="triggerFileInput" 
          class="upload-btn"
          :class="{ 'uploaded': !!avatarFile }"
        >
          <i :class="avatarFile ? 'el-icon-check' : 'el-icon-upload'"></i>
          {{ avatarFile ? '重新上传' : '上传头像' }}
        </button>
      </div>

      <div class="form-group">
        <label for="username">用户名</label>
        <input 
          id="username"
          v-model="formData.username" 
          type="text" 
          placeholder="请输入用户名"
        >
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          id="password"
          v-model="formData.password" 
          type="password" 
          placeholder="请输入密码"
        >
      </div>

      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input 
          id="confirmPassword"
          v-model="formData.confirmPassword" 
          type="password" 
          placeholder="请确认密码"
        >
      </div>

      <div class="form-group">
        <label for="email">邮箱</label>
        <input 
          id="email"
          v-model="formData.email" 
          type="email" 
          placeholder="请输入邮箱"
        >
      </div>

      <div class="form-group">
        <label for="phone">手机号</label>
        <input 
          id="phone"
          v-model="formData.phone" 
          type="tel" 
          placeholder="请输入手机号（选填）"
        >
      </div>

      <div class="form-actions">
        <button 
          @click="handleRegister" 
          :disabled="!isFormValid"
          class="register-btn"
        >
          注册
        </button>
        <router-link to="/login" class="login-link">已有账号？去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const router = useRouter()
    const avatarPreview = ref('')
    const avatarFile = ref(null)
    
    const formData = ref({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: ''
    })

    const handleAvatarChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        avatarFile.value = file
        avatarPreview.value = URL.createObjectURL(file)
      }
    }

    const triggerFileInput = () => {
      document.getElementById('avatar').click()
    }

    const isFormValid = computed(() => {
      return formData.value.username.trim() && 
             formData.value.password && 
             formData.value.confirmPassword &&
             formData.value.email.trim()
    })

    // 表单验证
    const validateForm = () => {
      if (!avatarFile.value) {
        ElMessage.error('请上传头像')
        return false
      }

      const username = formData.value.username.trim()
      if (!username) {
        ElMessage.error('请输入用户名')
        return false
      }

      const password = formData.value.password
      if (!password) {
        ElMessage.error('请输入密码')
        return false
      }

      const confirmPassword = formData.value.confirmPassword
      if (!confirmPassword) {
        ElMessage.error('请确认密码')
        return false
      }

      if (password !== confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return false
      }

      const email = formData.value.email.trim()
      if (!email) {
        ElMessage.error('请输入邮箱')
        return false
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        ElMessage.error('邮箱格式不正确')
        return false
      }

      return true
    }

    const handleRegister = async () => {
      try {
        if (!validateForm()) return
        
        const formDataToSend = new FormData()
        
        // 确保文件存在
        if (!avatarFile.value) {
          ElMessage.error('请上传头像')
          return
        }
        
        // 添加文件和其他字段
        formDataToSend.append('avatar', avatarFile.value)
        formDataToSend.append('username', formData.value.username.trim())
        formDataToSend.append('password', formData.value.password)
        formDataToSend.append('email', formData.value.email.trim())
        if (formData.value.phone) {
          formDataToSend.append('phone', formData.value.phone.trim())
        }

        // 打印FormData内容（调试用）
        for (let [key, value] of formDataToSend.entries()) {
          console.log('FormData:', key, value)
        }

        const response = await axios.post('/api/auth/register', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log('注册响应:', response)
        ElMessage.success('注册成功')
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
      }
    }

    return {
      formData,
      handleRegister,
      avatarPreview,
      avatarFile,
      handleAvatarChange,
      triggerFileInput,
      isFormValid
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  color: #303133;
  margin-bottom: 30px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

input {
  height: 40px;
  padding: 0 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
  outline: none;
}

input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
}

input::placeholder {
  color: #c0c4cc;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.register-btn {
  width: 100%;
  height: 40px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.register-btn:hover {
  background: #66b1ff;
}

.register-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.login-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.login-link:hover {
  color: #66b1ff;
}

/* 添加响应式设计 */
@media (max-width: 480px) {
  .register-container {
    margin: 20px;
    padding: 15px;
  }
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dcdfe6;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.upload-btn:hover {
  background: #66b1ff;
}

.upload-btn.uploaded {
  background: #67c23a;  /* 使用成功状态的绿色 */
}

.upload-btn.uploaded:hover {
  background: #85ce61;  /* 成功状态的hover颜色 */
}
</style> 