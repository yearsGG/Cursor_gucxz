<template>
  <div class="customer-service">
    <el-popover
      v-model:visible="showChat"
      placement="left"
      :width="400"
      trigger="click"
    >
      <template #reference>
        <el-button type="primary" circle class="service-button">
          <el-icon><Service /></el-icon>
        </el-button>
      </template>

      <div class="chat-container">
        <div class="chat-header">
          <h3>在线客服</h3>
          <span class="service-status">在线</span>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['message', msg.type]"
          >
            <el-avatar 
              :size="32"
              :src="msg.type === 'user' ? userAvatar : serviceAvatar"
            />
            <div class="message-content">
              {{ msg.content }}
            </div>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keyup.enter.native="sendMessage"
          />
          <el-button 
            type="primary" 
            @click="sendMessage"
            :loading="sending"
          >
            发送
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Service } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const showChat = ref(false)
const messages = ref([])
const inputMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const sessionId = ref(Date.now().toString())

const userAvatar = '/images/default-avatar.png'
const serviceAvatar = '/images/service-avatar.png'

// 添加默认欢迎消息
messages.value.push({
  type: 'service',
  content: '您好！我是您的专属汽车顾问，请问有什么可以帮您？'
})

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  const userMsg = inputMessage.value.trim()
  messages.value.push({
    type: 'user',
    content: userMsg
  })
  
  inputMessage.value = ''
  sending.value = true
  
  try {
    const response = await axios.post('/api/customer-service/chat', {
      message: userMsg,
      sessionId: sessionId.value
    })
    
    messages.value.push({
      type: 'service',
      content: response.data.message
    })
  } catch (error) {
    ElMessage.error('发送消息失败，请重试')
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

watch(showChat, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})
</script>

<style scoped>
.chat-container {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-status {
  color: #67C23A;
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content {
  background: #f4f4f5;
  padding: 10px;
  border-radius: 8px;
  max-width: 70%;
}

.message.user .message-content {
  background: #ecf5ff;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #eee;
}

.service-button {
  width: 50px;
  height: 50px;
  font-size: 24px;
}
</style> 