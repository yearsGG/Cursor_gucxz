<template>
  <div class="chat-container">
    <div class="chat-header">
      <span class="service-title">智能客服</span>
      <span class="service-status">
        <el-tag size="small" type="success">在线</el-tag>
      </span>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div class="message service">
        <el-avatar icon="el-icon-service" />
        <div class="message-content">
          <div class="message-bubble">
            您好！我是智能客服助手，很高兴为您服务。请问有什么可以帮您？
          </div>
          <div class="message-time">{{ formatTime(new Date()) }}</div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['message', msg.type]">
        <el-avatar :icon="msg.type === 'user' ? 'el-icon-user' : 'el-icon-service'" />
        <div class="message-content">
          <div class="message-bubble" v-html="formatMessage(msg.content)"></div>
          <div class="message-time">{{ formatTime(msg.time) }}</div>
        </div>
      </div>

      <!-- 输入提示 -->
      <div class="typing-indicator" v-if="sending">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="请输入您的问题..."
        :disabled="sending"
        @keydown="handleKeyDown"
      />
      <div class="button-group">
        <el-button 
          type="primary" 
          :loading="sending"
          @click="handleSend"
          :disabled="!inputMessage.trim()"
        >
          发送
        </el-button>
        <el-button @click="handleClose">
          关闭对话
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 定义 props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const messages = ref([])
const inputMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const sessionId = ref(Date.now().toString())

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

// 格式化消息内容（支持markdown）
const formatMessage = (content) => {
  const html = marked(content)
  return DOMPurify.sanitize(html)
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 发送消息
const handleSend = async () => {
  const userMsg = inputMessage.value.trim()
  if (!userMsg) return
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: userMsg,
    time: new Date()
  })
  
  inputMessage.value = ''
  sending.value = true
  scrollToBottom()
  
  try {
    const response = await axios.post('/api/customer-service/chat', {
      message: userMsg,
      sessionId: sessionId.value
    })
    
    // 添加客服回复
    messages.value.push({
      type: 'service',
      content: response.data.message,
      time: new Date()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

// 添加按下回车发送消息的处理
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 监听对话框显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToBottom()
      // 如果是首次打开，可以自动发送欢迎消息
      if (messages.value.length === 0) {
        messages.value.push({
          type: 'service',
          content: '您好！我是智能客服助手，很高兴为您服务。请问有什么可以帮您？',
          time: new Date()
        })
      }
    })
  }
})

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  height: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-title {
  font-size: 16px;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.message.service .message-bubble {
  background: #fff;
}

.message.user .message-bubble {
  background: #409eff;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 12px;
}

.chat-input .el-input {
  flex: 1;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
  width: fit-content;
  margin-bottom: 20px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
  animation: typing 1s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Markdown 样式 */
.message-bubble :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.message-bubble :deep(code) {
  font-family: monospace;
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 2px;
}

.message.user .message-bubble :deep(pre),
.message.user .message-bubble :deep(code) {
  background: rgba(255,255,255,0.1);
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style> 