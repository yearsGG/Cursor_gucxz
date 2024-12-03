<template>
  <div class="admin-comments">
    <h2>评论管理</h2>
    <el-table :data="comments" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="用户" width="150">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar 
              :size="32" 
              :src="row.user?.avatar ? `/uploads/avatars/${row.user.avatar}` : '/images/default-avatar.png'"
            />
            <span>{{ row.user?.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="评论内容">
        <template #default="{ row }">
          <div class="comment-content">
            <el-button 
              link 
              type="primary" 
              @click="showCommentDetail(row)"
            >
              {{ row.content }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="车型" width="180">
        <template #default="{ row }">
          <div class="car-info">
            <img 
              :src="row.car?.images ? row.car.images.split(',')[0] : '/images/default-car.png'"
              class="car-image"
              :alt="row.car?.model"
            >
            <span>{{ row.car?.brand }} {{ row.car?.model }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="评论详情"
      width="50%"
    >
      <div class="comment-detail" v-if="currentComment">
        <div class="user-section">
          <el-avatar 
            :size="50" 
            :src="currentComment.user?.avatar ? `/uploads/avatars/${currentComment.user.avatar}` : '/images/default-avatar.png'"
          />
          <div class="user-info">
            <h3>{{ currentComment.user?.username }}</h3>
            <p class="user-meta">
              <span>邮箱: {{ currentComment.user?.email }}</span>
              <span>注册时间: {{ formatDate(currentComment.user?.created_at) }}</span>
            </p>
          </div>
        </div>

        <div class="car-section">
          <h4>评论车辆</h4>
          <div class="car-info">
            <img 
              :src="currentComment.car?.images ? currentComment.car.images.split(',')[0] : '/images/default-car.png'"
              class="car-detail-image"
              :alt="currentComment.car?.model"
            >
            <div class="car-meta">
              <h5>{{ currentComment.car?.brand }} {{ currentComment.car?.model }}</h5>
              <p>价格: ¥{{ currentComment.car?.price?.toLocaleString() }}</p>
              <p>年份: {{ currentComment.car?.year }}</p>
            </div>
          </div>
        </div>

        <div class="comment-section">
          <h4>评论内容</h4>
          <div class="comment-text">
            {{ currentComment.content }}
          </div>
          <div class="comment-meta">
            <span>评论时间: {{ formatDate(currentComment.createdAt) }}</span>
            <span v-if="currentComment.likes">
              点赞数: {{ currentComment.likes }}
            </span>
          </div>
        </div>

        <template v-if="currentComment.replies?.length">
          <h4>回复列表</h4>
          <div class="replies-section">
            <div 
              v-for="reply in currentComment.replies" 
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-user">
                <el-avatar 
                  :size="24" 
                  :src="reply.user?.avatar ? `/uploads/avatars/${reply.user.avatar}` : '/images/default-avatar.png'"
                />
                <span>{{ reply.user?.username }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
              <div class="reply-time">{{ formatDate(reply.createdAt) }}</div>
            </div>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const comments = ref([])
const dialogVisible = ref(false)
const currentComment = ref(null)

const formatDate = (date) => {
  if (!date) return '未知时间';
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

const fetchComments = async () => {
  try {
    const response = await axios.get('/api/admin/comments')
    comments.value = response.data
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  }
}

const showCommentDetail = async (comment) => {
  try {
    // 获取评论详细信息，包括回复
    const response = await axios.get(`/api/admin/comments/${comment.id}/detail`)
    currentComment.value = response.data
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取评论详情失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await axios.delete(`/api/admin/comments/${row.id}`)
    ElMessage.success('删除成功')
    fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(fetchComments)
</script>

<style scoped>
.admin-comments {
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.car-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.car-image {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.comment-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 评论详情样式 */
.comment-detail {
  padding: 20px;
}

.user-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.user-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.car-section {
  margin-bottom: 30px;
}

.car-detail-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}

.car-meta {
  margin-top: 10px;
}

.comment-section {
  margin-bottom: 30px;
}

.comment-text {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 10px 0;
}

.comment-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.replies-section {
  margin-top: 10px;
}

.reply-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.reply-content {
  margin: 5px 0;
  padding-left: 34px;
}

.reply-time {
  font-size: 12px;
  color: #999;
  padding-left: 34px;
}

/* 添加图片加载失败时的样式 */
.car-image:not([src]),
.car-image[src=""],
.car-detail-image:not([src]),
.car-detail-image[src=""] {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.car-image:not([src])::after,
.car-image[src=""]::after {
  content: "暂无图片";
}

.car-detail-image:not([src])::after,
.car-detail-image[src=""]::after {
  content: "暂无图片";
  font-size: 14px;
}
</style> 