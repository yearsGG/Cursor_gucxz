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
            <el-button 
              @click="toggleFavorite" 
              :type="isFavorited ? 'success' : 'warning'"
            >
              <i :class="isFavorited ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
            <el-button 
              type="primary" 
              icon="el-icon-service"
              @click="openCustomerService"
            >
              咨询客服
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-empty v-else description="未找到商品信息" />

    <div class="comments-section">
      <h3>用户评论</h3>
      
      <div class="comment-form" v-if="userStore.isLoggedIn">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="写下您的评论..."
        />
        <el-button 
          type="primary" 
          @click="submitComment"
          :loading="submitting"
          style="margin-top: 10px"
        >
          发表评论
        </el-button>
      </div>
      <div v-else class="login-tip">
        <el-link type="primary" @click="router.push('/login')">登录</el-link> 后参与评论
      </div>

      <div class="comments-list">
        <div v-if="comments.length === 0" class="no-comments">
          暂无评论，快来抢沙发吧！
        </div>
        <el-card v-else v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="username">{{ comment.username }}</span>
            <span class="time">{{ formatDate(comment.created_at) }}</span>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <div class="like-button" @click="handleLike(comment)">
              <span :class="{ 'liked': comment.is_liked }">
                ♥ {{ comment.likes_count }}
              </span>
            </div>
            <el-button type="text" @click="showReplyInput(comment)">
              <i class="el-icon-chat-dot-round"></i>
              回复 ({{ comment.replies_count || 0 }})
            </el-button>
          </div>
          
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <span class="username">{{ reply.username }}</span>：
              <span class="reply-content">{{ reply.content }}</span>
              <span class="time">{{ formatDate(reply.created_at) }}</span>
            </div>
          </div>
          
          <div v-if="comment.showReplyInput" class="reply-form">
            <el-input
              v-model="comment.replyContent"
              type="textarea"
              :rows="2"
              placeholder="写下您的回复..."
            />
            <div class="reply-actions">
              <el-button size="small" @click="comment.showReplyInput = false">取消</el-button>
              <el-button 
                type="primary" 
                size="small" 
                @click="submitReply(comment)"
                :loading="comment.submittingReply"
              >
                回复
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { formatDate } from '@/utils/format'
import eventBus from '@/utils/eventBus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const car = ref(null)
const isFavorited = ref(false)
const comments = ref([])
const newComment = ref('')
const submitting = ref(false)

const carImages = computed(() => {
  return car.value?.images?.split(',') || []
})

const checkFavoriteStatus = async () => {
  if (userStore.isLoggedIn) {
    try {
      const response = await axios.get(`/api/favorites/check/${route.params.id}`)
      isFavorited.value = response.data.isFavorited
    } catch (error) {
      console.error('获取收藏状态失败:', error)
    }
  }
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    const response = await axios.post('/api/favorites/toggle', {
      carId: route.params.id
    })
    
    isFavorited.value = response.data.isFavorited
    ElMessage.success(isFavorited.value ? '收藏成功' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

const fetchCarDetail = async () => {
  try {
    const { data } = await axios.get(`/api/cars/${route.params.id}`)
    car.value = data
    await checkFavoriteStatus()
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

const fetchComments = async () => {
  try {
    const { data } = await axios.get(`/api/comments/${route.params.id}`)
    comments.value = data
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    await axios.post('/api/comments', {
      carId: route.params.id,
      content: newComment.value.trim()
    })
    
    newComment.value = ''
    ElMessage.success('评论发表成功')
    await fetchComments()
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleLike = async (comment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    const { data } = await axios.post(`/api/comments/${comment.id}/like`)
    comment.is_liked = data.liked
    if (data.liked) {
      comment.likes_count = (comment.likes_count || 0) + 1
    } else {
      comment.likes_count = Math.max((comment.likes_count || 1) - 1, 0)
    }
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

const showReplyInput = (comment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  comment.showReplyInput = true
  comment.replyContent = ''
}

const submitReply = async (comment) => {
  if (!comment.replyContent?.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  comment.submittingReply = true
  try {
    await axios.post(`/api/comments/${comment.id}/reply`, {
      content: comment.replyContent.trim()
    })
    
    comment.showReplyInput = false
    await fetchComments()
    ElMessage.success('回复成功')
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败，请重试')
  } finally {
    comment.submittingReply = false
  }
}

onMounted(() => {
  fetchCarDetail()
  fetchComments()
})

watch(() => route.params.id, () => {
  fetchCarDetail()
  fetchComments()
})

// 判断是否可购买
const isAvailable = computed(() => {
  return ['available', 'low_stock'].includes(car.value?.status)
})

// 获取操作按钮文本
const getActionText = computed(() => {
  if (!car.value) return '加载中'
  
  const texts = {
    'available': '加入购物车',
    'low_stock': '库存紧张，立即购买',
    'out_of_stock': '暂时缺货',
    'discontinued': '已下架'
  }
  return texts[car.value.status] || '加入购物车'
})

// 获状态类型
const getStatusType = (status) => {
  const types = {
    'available': 'success',
    'low_stock': 'warning',
    'out_of_stock': 'danger',
    'discontinued': 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    'available': '有货',
    'low_stock': '库存紧张',
    'out_of_stock': '缺货',
    'discontinued': '已下架'
  }
  return texts[status] || status
}

const openCustomerService = () => {
  eventBus.emit('open-customer-service')
}
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

.action-buttons {
  display: flex;
  gap: 15px;
  margin: 20px 0;
}

.el-button [class^="el-icon-"] {
  margin-right: 5px;
}

.el-button.is-warning {
  background-color: #E6A23C;
  border-color: #E6A23C;
  color: white;
}

.el-button.is-warning:hover {
  background-color: #ebb563;
  border-color: #ebb563;
  color: white;
}

.comments-section {
  margin-top: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.comment-form {
  margin: 20px 0;
  max-width: 800px;
  margin: 20px auto;
}

.login-tip {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.comments-list {
  margin-top: 30px;
}

.comment-item {
  margin-bottom: 15px;
}

.comment-header {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.username {
  font-weight: bold;
  color: #409EFF;
}

.time {
  color: #909399;
  font-size: 0.9em;
}

.comment-content {
  line-height: 1.6;
  color: #303133;
}

.no-comments {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.comment-actions {
  margin-top: 10px;
  display: flex;
  gap: 15px;
}

.comment-actions .el-button {
  padding: 0;
  height: auto;
}

.comment-actions .el-button i {
  margin-right: 4px;
}

.liked {
  color: #E6A23C;
}

.replies-list {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.reply-item {
  padding: 5px 0;
  font-size: 14px;
}

.reply-item .username {
  color: #409EFF;
  font-weight: bold;
}

.reply-item .time {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

.reply-form {
  margin-top: 10px;
}

.reply-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.like-button {
  cursor: pointer;
  user-select: none;
}

.like-button span {
  color: #999;
  transition: color 0.3s ease;
}

.like-button .liked {
  color: #ff4757; /* 点赞后的红色 */
}

/* 可选：添加鼠标悬停效果 */
.like-button:hover span {
  color: #ff4757;
}
</style> 