console.log('API URL:', process.env.VITE_API_URL)
if (!process.env.VITE_API_URL) {
  console.error('错误: VITE_API_URL 未设置!')
  process.exit(1)
} 