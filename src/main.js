import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import axios from '@/utils/axios'

// 1. 创建应用实例
const app = createApp(App)

// 2. 创建并使用 Pinia（必须在其他插件之前）
const pinia = createPinia()
app.use(pinia)

// 3. 使用其他插件
app.use(router)
app.use(ElementPlus)

// 4. 配置 axios
app.config.globalProperties.$http = axios
window.axios = axios

// 5. 最后挂载应用
app.mount('#app') 