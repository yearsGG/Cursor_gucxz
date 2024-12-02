<template>
  <div class="profile-container">
    <div class="center-buttons">
      <div class="button-row">
        <button @click="toggleDetails" class="function-btn view-profile-btn">
          查看个人信息
          <span class="arrow" :class="{ 'arrow-down': !showDetails }">▼</span>
        </button>
        <button 
          v-for="(btn, index) in functionButtons" 
          :key="index"
          @click="btn.action"
          class="function-btn"
          :class="{ active: btn.isActive }"
        >
          {{ btn.text }}
          <span v-if="btn.hasArrow" class="arrow" :class="{ 'arrow-down': !btn.isActive }">▼</span>
          <span v-if="btn.badge > 0" class="badge">{{ btn.badge }}</span>
        </button>
      </div>
    </div>

    <transition name="slide">
      <div v-show="showDetails" class="profile-form">
        <h2>个人信息</h2>
        
        <div class="avatar-upload">
          <img 
            :src="userInfo.avatar || '/images/default-avatar.png'" 
            class="avatar-preview"
            alt="用户头像"
          >
          <input 
            type="file" 
            ref="avatarInput"
            @change="handleAvatarChange" 
            accept="image/*"
            style="display: none"
          >
          <el-button 
            type="primary"
            @click="triggerAvatarUpload"
            :loading="uploading"
          >
            更换头像
          </el-button>
        </div>

        <div class="form-group">
          <label for="username">账号</label>
          <input 
            id="username"
            type="text" 
            v-model="userInfo.username" 
            disabled
            placeholder="用户名"
          >
        </div>
        <div class="form-group" v-if="editing">
          <label for="oldPassword">原密码</label>
          <input 
            id="oldPassword"
            type="password" 
            v-model="userInfo.oldPassword"
            placeholder="请输入原密码"
          >
        </div>
        <div class="form-group" v-if="editing">
          <label for="newPassword">新密码</label>
          <input 
            id="newPassword"
            type="password" 
            v-model="userInfo.newPassword"
            placeholder="请输入新密码"
          >
        </div>
        <div class="form-group" v-if="editing">
          <label for="confirmPassword">确认新密码</label>
          <input 
            id="confirmPassword"
            type="password" 
            v-model="userInfo.confirmPassword"
            placeholder="请再次输入新密码"
          >
        </div>
        <div class="form-group">
          <label for="email">电子邮箱</label>
          <input 
            id="email"
            type="email" 
            v-model="userInfo.email" 
            :disabled="!editing"
            placeholder="请输入邮箱"
          >
        </div>
        <div class="form-group">
          <label for="phone">手机号码</label>
          <input 
            id="phone"
            type="text" 
            v-model="userInfo.phone" 
            :disabled="!editing"
            placeholder="请输入手机号"
          >
        </div>
        
        <div class="button-group">
          <button v-if="!editing" @click="startEdit" class="edit-btn">修改信息</button>
          <template v-else>
            <button @click="saveChanges" class="save-btn">保存</button>
            <button @click="cancelEdit" class="cancel-btn">取消</button>
          </template>
        </div>
      </div>
    </transition>

    <OrderList :show="showOrders" />

    <!-- 收藏列表 -->
    <transition name="slide">
      <div v-show="showFavorites" class="favorites-container">
        <div class="favorites-list">
          <el-card v-for="car in favorites" :key="car.id" class="favorite-item">
            <div class="car-info">
              <img 
                :src="car.images ? car.images.split(',')[0] : require('@/assets/default-car.jpg')" 
                class="car-image"
                @error="handleImageError"
              >
              <h3>{{ car.brand }} {{ car.model }}</h3>
              <p class="price">￥{{ car.price }}</p>
              <p>{{ car.year }}年 | {{ car.mileage }}公里</p>
              <div class="actions">
                <el-button type="primary" size="small" @click="viewDetail(car.id)">
                  查看详情
                </el-button>
                <el-button type="danger" size="small" @click="removeFavorite(car.id)">
                  取消收藏
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </transition>

    <!-- 消息中心面板 -->
    <transition name="slide">
      <div v-show="showMessages" class="messages-container">
        <div class="messages-header">
          <h3>消息中心</h3>
          <el-button 
            link
            size="small" 
            @click="markAllAsRead"
            v-if="hasUnreadMessages"
          >
            全部标记为已读
          </el-button>
        </div>

        <el-tabs v-model="messageType">
          <el-tab-pane label="点赞" name="like">
            <div v-if="likeMessages.length === 0" class="empty-message">
              暂无点赞消息
            </div>
            <el-collapse v-else>
              <el-collapse-item v-for="msg in likeMessages" :key="msg.id">
                <template #title>
                  <div class="message-title" :class="{ 'unread': !msg.is_read }">
                    <span class="username">{{ msg.from_username }}</span>
                    点赞了你的评论
                    <span class="time">{{ formatDate(msg.created_at) }}</span>
                  </div>
                </template>
                <div class="message-content">
                  <div class="original-comment">
                    <div>你的评论：{{ msg.comment_content }}</div>
                    <div class="likes-count">
                      <span class="like-icon">♥</span>
                      <span>{{ msg.total_likes || 0 }} 人点赞</span>
                    </div>
                  </div>
                  <div class="car-info">
                    相关车辆：{{ msg.car_model }}
                  </div>
                  <el-button 
                    link
                    size="small"
                    @click="viewCarDetail(msg.car_id)"
                  >
                    查看详情
                  </el-button>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>

          <el-tab-pane label="回复" name="reply">
            <div v-if="replyMessages.length === 0" class="empty-message">
              暂无回复消息
            </div>
            <el-collapse v-else>
              <el-collapse-item v-for="msg in replyMessages" :key="msg.id">
                <template #title>
                  <div class="message-title" :class="{ 'unread': !msg.is_read }">
                    <span class="username">{{ msg.from_username }}</span>
                    回复了你的评论
                    <span class="time">{{ formatDate(msg.created_at) }}</span>
                  </div>
                </template>
                <div class="message-content">
                  <div class="original-comment">
                    <div>你的评论：{{ msg.comment_content }}</div>
                  </div>
                  <div class="reply-content">
                    <span class="username">{{ msg.from_username }}</span> 回复：{{ msg.content }}
                  </div>
                  <div class="car-info">
                    相关车辆：{{ msg.car_model }}
                  </div>
                  <el-button 
                    link
                    size="small"
                    @click="viewCarDetail(msg.car_id)"
                  >
                    查看详情
                  </el-button>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
        </el-tabs>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import OrderList from '@/components/OrderList.vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/format'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserProfile',
  components: {
    OrderList
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const showDetails = ref(false)
    const showOrders = ref(false)
    const showFavorites = ref(false)
    const userInfo = ref({
      username: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      email: '',
      phone: ''
    })
    const messages = ref([])
    const messageLoading = ref(false)
    const messageError = ref(null)
    const showMessages = ref(false)
    const messageType = ref('like')
    const functionButtons = ref([
      { 
        text: '我的订单', 
        action: () => toggleOrders(),
        isActive: false,
        hasArrow: true
      },
      { 
        text: '我的收藏', 
        action: () => toggleFavorites(),
        isActive: false,
        hasArrow: true
      },
      { 
        text: '消息中心', 
        action: () => toggleMessages(),
        isActive: false,
        hasArrow: true,
        badge: 0
      }
    ])

    // 添加切换函数
    const toggleMessages = () => {
      showMessages.value = !showMessages.value
      functionButtons.value[2].isActive = showMessages.value
      if (showMessages.value) {
        showDetails.value = false
        showOrders.value = false
        showFavorites.value = false
        fetchMessages()
      }
    }

    const toggleOrders = () => {
      showOrders.value = !showOrders.value
      functionButtons.value[0].isActive = showOrders.value
      if (showOrders.value) {
        showDetails.value = false
        showFavorites.value = false
        showMessages.value = false
      }
    }

    const toggleFavorites = () => {
      showFavorites.value = !showFavorites.value
      functionButtons.value[1].isActive = showFavorites.value
      if (showFavorites.value) {
        showDetails.value = false
        showOrders.value = false
        showMessages.value = false
        getFavorites()
      }
    }

    const toggleDetails = () => {
      showDetails.value = !showDetails.value
      if (showDetails.value) {
        showOrders.value = false
        showFavorites.value = false
        showMessages.value = false
      }
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/user/profile')
        userInfo.value = {
          ...response.data,
          avatar: userStore.user?.avatar // 确保包含头像URL
        }
      } catch (error) {
        if (error.response?.status === 401) {
          userStore.logout()
        } else {
          console.error('获取用户信息失败:', error)
        }
      }
    }

    // 获消息
    const fetchMessages = async () => {
      messageLoading.value = true;
      messageError.value = null;
      
      try {
        console.log('开始获取消息');
        console.log('用户ID:', userStore.userId);
        console.log('Token:', userStore.token);

        const { data } = await axios.get('/api/comments/notifications', {
          headers: {
            Authorization: `Bearer ${userStore.token}`
          }
        });
        
        console.log('获取到的原始消息数据:', data);
        
        if (!Array.isArray(data)) {
          console.error('返回的数据不是数组:', data);
          messages.value = [];
          return;
        }
        
        messages.value = data.map(msg => ({
          ...msg,
          type: msg.type.toLowerCase(),
          is_read: Boolean(msg.is_read),
          total_likes: Number(msg.total_likes || 0)
        }));
        
        console.log('处理后的消息:', messages.value);
        
        // 更新未读消息数量
        functionButtons.value[2].badge = messages.value.filter(msg => !msg.is_read).length;
      } catch (error) {
        console.error('获取消息失败:', error);
        if (error.response) {
          console.log('错误响应:', error.response.data);
          console.log('状态码:', error.response.status);
        }
        messageError.value = error.message;
        messages.value = [];
      } finally {
        messageLoading.value = false;
      }
    };

    // 初始化
    onMounted(() => {
      if (!userStore.isLoggedIn) {
        return
      }
      fetchUserInfo()
      fetchMessages()
    })

    // 定时刷新消息
    let messageInterval
    onMounted(() => {
      messageInterval = setInterval(() => {
        if (showMessages.value) {
          fetchMessages()
        }
      }, 30000)
    })

    // 清理定时器
    onBeforeUnmount(() => {
      if (messageInterval) {
        clearInterval(messageInterval)
      }
    })

    // 添加计算属性
    const likeMessages = computed(() => {
      if (!Array.isArray(messages.value)) {
        return [];
      }
      return messages.value.filter(msg => msg.type === 'like');
    })

    const replyMessages = computed(() => {
      if (!Array.isArray(messages.value)) {
        return [];
      }
      return messages.value.filter(msg => msg.type === 'reply');
    })

    const hasUnreadMessages = computed(() => {
      return Array.isArray(messages.value) && messages.value.some(msg => !msg.is_read);
    })

    // 添加查看详情方法
    const viewCarDetail = (carId) => {
      router.push(`/car/${carId}`);
    }

    // 添加标记已读方法
    const markAllAsRead = async () => {
      try {
        await axios.put('/api/comments/notifications/read');
        messages.value = messages.value.map(msg => ({ ...msg, is_read: true }));
        functionButtons.value[2].badge = 0;
        ElMessage.success('已全部标记为已读');
      } catch (error) {
        console.error('标记已读失败:', error);
        ElMessage.error('操作失败，请重试');
      }
    }

    // 添加 getFavorites 方法
    const favorites = ref([])
    
    const getFavorites = async () => {
      try {
        const response = await axios.get('/api/favorites')
        favorites.value = response.data
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        ElMessage.error('获取收藏列表失败')
      }
    }

    // 添加移除收藏方法
    const removeFavorite = async (carId) => {
      try {
        await axios.post('/api/favorites/toggle', { carId })
        await getFavorites()
        ElMessage.success('已取消收藏')
      } catch (error) {
        console.error('取消收藏失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    }

    // 添加查看详情方法
    const viewDetail = (carId) => {
      router.push(`/car/${carId}`)
    }

    // 添加头像相关的响应式变量
    const avatarInput = ref(null)
    const uploading = ref(false)

    // 触发文件选择
    const triggerAvatarUpload = () => {
      avatarInput.value.click()
    }

    // 处理头像变更
    const handleAvatarChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        ElMessage.error('请选择图片文件')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过5MB')
        return
      }

      try {
        uploading.value = true
        
        // 创建FormData对象
        const formData = new FormData()
        formData.append('avatar', file)

        // 添加时间戳防止缓存
        const timestamp = new Date().getTime()
        
        // 发送上传请求
        const response = await axios.post(`/api/user/avatar?t=${timestamp}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        // 更新用户头像（添加时间戳防止缓存）
        userInfo.value.avatar = `${response.data.avatarUrl}?t=${timestamp}`
        userStore.setUser({
          ...userStore.user,
          avatar: `${response.data.avatarUrl}?t=${timestamp}`
        })

        ElMessage.success('头像更新成功')
        
        // 清除文件输入值，允许重复选择同一文件
        event.target.value = ''
      } catch (error) {
        console.error('头像上传失败:', error)
        ElMessage.error('头像上传失败')
      } finally {
        uploading.value = false
      }
    }

    return {
      userInfo,
      messages,
      messageLoading,
      messageError,
      showMessages,
      messageType,
      functionButtons,
      likeMessages,
      replyMessages,
      hasUnreadMessages,
      fetchUserInfo,
      fetchMessages,
      viewCarDetail,
      markAllAsRead,
      toggleMessages,
      toggleOrders,
      toggleFavorites,
      toggleDetails,
      showDetails,
      showOrders,
      showFavorites,
      favorites,
      getFavorites,
      removeFavorite,
      viewDetail,
      formatDate,
      avatarInput,
      uploading,
      triggerAvatarUpload,
      handleAvatarChange
    }
  },

  data() {
    return {
      editing: false,
      originalInfo: null,
      functionButtons: [
        { 
          text: '我的订单', 
          action: () => this.toggleOrders(),
          isActive: false,
          hasArrow: true
        },
        { 
          text: '我的收藏', 
          action: () => this.toggleFavorites(),
          isActive: false,
          hasArrow: true
        },
        { 
          text: '消息中心', 
          action: () => this.toggleMessages(),
          isActive: false,
          hasArrow: true,
          badge: 0
        }
      ]
    }
  },

  computed: {
    likeMessages() {
      if (!Array.isArray(this.messages)) {
        return [];
      }
      return this.messages.filter(msg => msg.type === 'like' || msg.type === 'LIKE');
    },
    replyMessages() {
      if (!Array.isArray(this.messages)) {
        return [];
      }
      return this.messages.filter(msg => msg.type === 'reply' || msg.type === 'REPLY');
    },
    hasUnreadMessages() {
      return Array.isArray(this.messages) && this.messages.some(msg => !msg.is_read);
    }
  },
  methods: {
    startEdit() {
      this.editing = true
      this.originalInfo = { ...this.userInfo }
    },
    cancelEdit() {
      this.editing = false
      this.userInfo = { ...this.originalInfo }
      this.userInfo.oldPassword = ''
      this.userInfo.newPassword = ''
      this.userInfo.confirmPassword = ''
    },
    async saveChanges() {
      if (this.userInfo.newPassword) {
        if (!this.userInfo.oldPassword) {
          alert('请输入原密码')
          return
        }
        if (this.userInfo.newPassword !== this.userInfo.confirmPassword) {
          alert('两次输入的新密码不一致')
          return
        }
      }
      
      try {
        await axios.put('/api/user/profile', {
          phone: this.userInfo.phone,
          email: this.userInfo.email,
          oldPassword: this.userInfo.oldPassword,
          newPassword: this.userInfo.newPassword || undefined
        })
        
        this.editing = false
        this.userInfo.oldPassword = ''
        this.userInfo.newPassword = ''
        this.userInfo.confirmPassword = ''
        alert('信息更新成功')
      } catch (error) {
        console.error('更新用户信息失败:', error)
        alert('更新失败，请重试')
      }
    },
    handleImageError(e) {
      e.target.src = require('@/assets/default-car.jpg')
    }
  },
  beforeDestroy() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval)
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
}

.center-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: auto 0;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.function-btn {
  padding: 15px 30px;
  font-size: 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  text-align: center;
  position: relative;
}

.function-btn:hover {
  background: #1976D2;
  transform: scale(1.05);
}

.view-profile-btn {
  background: #4CAF50;
}

.view-profile-btn:hover {
  background: #45a049;
}

.back-btn {
  background: #757575;
  color: white;
}

.profile-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.button-group {
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.edit-btn {
  background: #4CAF50;
  color: white;
}

.save-btn {
  background: #2196F3;
  color: white;
}

.cancel-btn {
  background: #f44336;
  color: white;
}

.arrow {
  display: inline-block;
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.arrow-down {
  transform: rotate(180deg);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0;
}

.favorites-container {
  margin-top: 20px;
}

.favorites-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.favorite-item {
  margin-bottom: 20px;
}

.car-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin-bottom: 10px;
}

.car-info {
  text-align: center;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.center-buttons {
  position: sticky;
  top: 0;
  background: #fff;
  padding: 20px 0;
  z-index: 10;
}

.function-btn.active {
  background: #1976D2;
}

.function-btn .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
}

.messages-container {
  margin-top: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-title.unread {
  font-weight: bold;
}

.message-title .username {
  color: #409EFF;
}

.message-title .time {
  color: #909399;
  font-size: 0.9em;
}

.message-content {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.original-comment {
  margin-bottom: 10px;
  color: #606266;
}

.reply-content {
  margin-bottom: 10px;
  color: #303133;
}

.car-info {
  color: #909399;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.empty-message {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.likes-count {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-icon {
  color: #ff4757;
  font-size: 16px;
}

.username {
  color: #409EFF;
  font-weight: bold;
}

.message-content {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.original-comment {
  margin-bottom: 12px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.reply-content {
  margin: 12px 0;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #67C23A;
}

.car-info {
  color: #909399;
  font-size: 14px;
  margin: 8px 0;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-title.unread::before {
  content: "●";
  color: #ff4757;
  font-size: 12px;
}

.time {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
}

/* 修改点赞按钮样式，添加浏览器前缀 */
.like-button {
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 修改表单元素样式，添加浏览器前缀 */
input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  /* ... 其他样式保持不变 ... */
}

/* 修改禁用状态的输入框样式 */
input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* 添加表单标签样式 */
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

/* 添加输入框焦点样式 */
input:focus {
  outline: none;
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 添加错误状态样式 */
.error input {
  border-color: #F56C6C;
}

.error-message {
  color: #F56C6C;
  font-size: 12px;
  margin-top: 5px;
}

/* 添加必填字段标记 */
.required label::after {
  content: '*';
  color: #F56C6C;
  margin-left: 4px;
}

/* 改进表单组样式 */
.form-group {
  margin-bottom: 20px;
  position: relative;
}

/* 添加输入框过渡效果 */
input {
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 1.5;
}

input:hover {
  border-color: #c0c4cc;
}

/* 添加占位符文本样式 */
input::placeholder {
  color: #909399;
  opacity: 1;
}

/* 添加 WebKit 特定的占位符样式 */
input::-webkit-input-placeholder {
  color: #909399;
  opacity: 1;
}

/* 添加 Firefox 特定的占位符样式 */
input::-moz-placeholder {
  color: #909399;
  opacity: 1;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dcdfe6;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
</style> 