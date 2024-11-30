import { promises as fs } from 'fs'
import { createWriteStream, existsSync } from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置项
const CONFIG = {
  maxRetries: 3,           // 最大重试次数
  timeout: 10000,          // 超时时间（毫秒）
  retryDelay: 2000,        // 重试延迟（毫秒）
  skipExisting: true,      // 是否跳过已存在的文件
  overwriteOnRetry: true,  // 重试时是否覆盖失败的下载
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

// 图片源配置
const IMAGE_URLS = {
  // 品牌 logo
  logos: {
    'benz.png': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200',
    'bmw.png': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=200',
    'audi.png': 'https://images.unsplash.com/photo-1605515298946-d664dd8c3f0a?w=200',
    'porsche.png': 'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=200',
    'ferrari.png': 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=200',
    'lamborghini.png': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200',
    'tesla.png': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=200',
    'toyota.png': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200',
    'honda.png': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=200',
    'nissan.png': 'https://images.unsplash.com/photo-1621274147744-cfb5694bb233?w=200',
    'lexus.png': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200',
    'volvo.png': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200'
  },

  // 轮播图
  banners: {
    'banner1.jpg': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200',
    'banner2.jpg': 'https://images.unsplash.com/photo-1599912027611-484b9fc447af?w=1200',
    'banner3.jpg': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200'
  },

  // 汽车图片
  cars: {
    benz: {
      's500-1.jpg': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      's500-2.jpg': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
      's500-3.jpg': 'https://images.unsplash.com/photo-1605515298946-d664dd8c3f0a?w=800',
      'e300-1.jpg': 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800',
      'e300-2.jpg': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?w=800',
      'glc-1.jpg': 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=800',
      'glc-2.jpg': 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?w=800'
    },
    bmw: {
      'x7-1.jpg': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      'x7-2.jpg': 'https://images.pexels.com/photos/892522/pexels-photo-892522.jpeg?w=800',
      'x7-3.jpg': 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?w=800'
    },
    porsche: {
      '911-1.jpg': 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800',
      '911-2.jpg': 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800',
      '911-3.jpg': 'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800'
    },
    tesla: {
      'model-y-1.jpg': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
      'model-y-2.jpg': 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800',
      'model-y-3.jpg': 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800'
    }
  },

  // 默认图片
  misc: {
    'default-avatar.png': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    'default-car.jpg': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'
  }
}

// 备用图片源
const FALLBACK_URLS = {
  'default-car.jpg': [
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?w=800',
    'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=800'
  ],
  'default-avatar.png': [
    'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=200',
    'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?w=200'
  ]
}

// 下载状态跟踪
const downloadStats = {
  total: 0,
  success: 0,
  skipped: 0,
  failed: 0,
  retries: 0
}

// 下载单个图片
async function downloadImage(url, filepath, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      req.destroy()
      reject(new Error('下载超时'))
    }, CONFIG.timeout)

    const req = https.get(url, {
      headers: {
        'User-Agent': CONFIG.userAgent
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP错误: ${response.statusCode}`))
        return
      }

      const file = createWriteStream(filepath)
      response.pipe(file)
      
      file.on('finish', () => {
        clearTimeout(timeout)
        file.close()
        resolve()
      })

      file.on('error', (err) => {
        clearTimeout(timeout)
        fs.unlink(filepath).catch(console.error)
        reject(err)
      })

      response.on('error', (err) => {
        clearTimeout(timeout)
        file.destroy()
        reject(err)
      })
    })

    req.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

// 带重试的下载函数
async function downloadWithRetry(url, filepath, filename) {
  let lastError
  
  for (let i = 0; i <= CONFIG.maxRetries; i++) {
    try {
      if (i > 0) {
        console.log(`第 ${i} 次重试下载: ${filename}`)
        downloadStats.retries++
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay))
      }
      
      await downloadImage(url, filepath)
      downloadStats.success++
      return true
    } catch (error) {
      lastError = error
      console.error(`下载失败 (尝试 ${i + 1}/${CONFIG.maxRetries + 1}): ${filename}:`, error.message)
      
      // 尝试使用备用链接
      if (i === CONFIG.maxRetries && FALLBACK_URLS[filename]) {
        console.log(`尝试使用备用链接下载: ${filename}`)
        for (const fallbackUrl of FALLBACK_URLS[filename]) {
          try {
            await downloadImage(fallbackUrl, filepath)
            downloadStats.success++
            return true
          } catch (fallbackError) {
            lastError = fallbackError
          }
        }
      }
    }
  }

  downloadStats.failed++
  throw lastError
}

// 添加下载进度显示
function showProgress(current, total) {
  const percentage = Math.round((current / total) * 100)
  process.stdout.write(`\r下载进度: ${percentage}% (${current}/${total})`)
}

// 主下载函数
async function downloadImages() {
  const publicDir = path.join(__dirname, '../public')
  const failedDownloads = []
  const skippedFiles = []
  
  // 创建目录结构
  const directories = [
    'images/logos',
    'images/banners',
    'images/cars/benz',
    'images/cars/bmw',
    'images/cars/porsche',
    'images/cars/tesla',
    'images/misc'
  ]

  console.log('创建目录结构...')
  for (const dir of directories) {
    await fs.mkdir(path.join(publicDir, dir), { recursive: true })
  }

  // 计算总文件数
  downloadStats.total = getTotalImageCount()
  console.log(`开始下载 ${downloadStats.total} 个文件...`)

  let currentCount = 0
  const totalFiles = getTotalImageCount()

  // 下载所有图片
  for (const [category, items] of Object.entries(IMAGE_URLS)) {
    if (category === 'cars') {
      for (const [brand, images] of Object.entries(items)) {
        for (const [filename, url] of Object.entries(images)) {
          const filepath = path.join(publicDir, 'images/cars', brand, filename)
          
          if (CONFIG.skipExisting && existsSync(filepath)) {
            currentCount++
            showProgress(currentCount, totalFiles)
            continue
          }

          try {
            await downloadWithRetry(url, filepath, filename)
            currentCount++
            showProgress(currentCount, totalFiles)
          } catch (error) {
            console.error(`\n✗ 下载失败: cars/${brand}/${filename}:`, error.message)
            failedDownloads.push({
              category: 'cars',
              brand,
              filename,
              url,
              error: error.message
            })
          }
        }
      }
    } else {
      for (const [filename, url] of Object.entries(items)) {
        const filepath = path.join(publicDir, 'images', category, filename)
        
        if (CONFIG.skipExisting && existsSync(filepath)) {
          currentCount++
          showProgress(currentCount, totalFiles)
          continue
        }

        try {
          await downloadWithRetry(url, filepath, filename)
          currentCount++
          showProgress(currentCount, totalFiles)
        } catch (error) {
          console.error(`\n✗ 下载失败: ${category}/${filename}:`, error.message)
          failedDownloads.push({
            category,
            filename,
            url,
            error: error.message
          })
        }
      }
    }
  }

  // 生成下载报告
  console.log('\n下载报告:')
  console.log('----------------------------------------')
  console.log(`总文件数: ${downloadStats.total}`)
  console.log(`成功数: ${downloadStats.success}`)
  console.log(`跳过数: ${downloadStats.skipped}`)
  console.log(`失败数: ${downloadStats.failed}`)
  console.log(`重试次数: ${downloadStats.retries}`)
  console.log('----------------------------------------')
  
  if (skippedFiles.length > 0) {
    console.log('\n跳过的文件:')
    skippedFiles.forEach(file => console.log(`- ${file}`))
  }
  
  if (failedDownloads.length > 0) {
    console.log('\n失败列表:')
    failedDownloads.forEach(item => {
      const path = item.category === 'cars'
        ? `cars/${item.brand}/${item.filename}`
        : `${item.category}/${item.filename}`
      console.log(`- ${path} (${item.error})`)
    })
  }

  // 保存下载报告到文件
  const reportPath = path.join(__dirname, '../download-report.json')
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats: downloadStats,
    skipped: skippedFiles,
    failed: failedDownloads
  }, null, 2))
  console.log(`\n下载报告已保存到: ${reportPath}`)
}

function getTotalImageCount() {
  let count = 0
  for (const [category, items] of Object.entries(IMAGE_URLS)) {
    if (category === 'cars') {
      for (const images of Object.values(items)) {
        count += Object.keys(images).length
      }
    } else {
      count += Object.keys(items).length
    }
  }
  return count
}

// 执行下载
console.log('开始下载图片...')
downloadImages()
  .then(() => console.log('\n下载过程完成!'))
  .catch(error => console.error('\n下载过程出错:', error)) 