import { promises as fs } from 'fs'
import { createWriteStream, existsSync } from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 使用国内CDN和图片源
const IMAGE_URLS = {
  // 品牌 logo
  logos: {
    'benz.png': 'https://img.alicdn.com/imgextra/i4/O1CN01XQqCsM1zK84NxBxqN_!!6000000006694-2-tps-200-200.png',
    'bmw.png': 'https://img.alicdn.com/imgextra/i2/O1CN01Z5JKxg1zYQJqKZtY7_!!6000000006724-2-tps-200-200.png',
    'audi.png': 'https://img.alicdn.com/imgextra/i3/O1CN01Y7uuHN1bVmkFIqhGf_!!6000000003469-2-tps-200-200.png',
    'tesla.png': 'https://img.alicdn.com/imgextra/i4/O1CN01XHqF9H1MkWfjr3tP7_!!6000000001467-2-tps-200-200.png',
    'toyota.png': 'https://img.alicdn.com/imgextra/i2/O1CN01QYu4nX1CxKrqyEPPd_!!6000000000143-2-tps-200-200.png',
    'porsche.png': 'https://img.alicdn.com/imgextra/i3/O1CN01Z5JKxg1zYQJqKZtY7_!!6000000006724-2-tps-200-200.png',
    'volkswagen.png': 'https://img.alicdn.com/imgextra/i4/O1CN01XHqF9H1MkWfjr3tP7_!!6000000001467-2-tps-200-200.png'
  },
  // 轮播图 - 使用汽车之家的图片
  banners: {
    'banner1.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc748.jpg',
    'banner2.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc749.jpg',
    'banner3.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc750.jpg'
  },
  // 汽车图片 - 使用汽车之家的图片
  cars: {
    benz: {
      's500-1.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc751.jpg',
      's500-2.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc752.jpg',
      's500-3.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc753.jpg'
    },
    bmw: {
      'x7-1.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc754.jpg',
      'x7-2.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc755.jpg',
      'x7-3.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc756.jpg'
    }
  },
  // 默认图片
  misc: {
    'default-avatar.png': 'https://img.alicdn.com/imgextra/i4/O1CN01XHqF9H1MkWfjr3tP7_!!6000000001467-2-tps-200-200.png',
    'default-car.jpg': 'https://car3.autoimg.cn/cardfs/product/g30/M01/A4/E8/1024x0_1_q95_autohomecar__ChxknGRYq6qABzOPAAj7y_uWWkc757.jpg'
  }
}

async function downloadImages() {
  const publicDir = path.join(__dirname, '../public')
  const skippedFiles = []
  const failedDownloads = []
  
  // 创建目录结构
  const directories = [
    'images/logos',
    'images/banners',
    'images/cars/benz',
    'images/cars/bmw',
    'images/misc'
  ]

  for (const dir of directories) {
    await fs.mkdir(path.join(publicDir, dir), { recursive: true })
  }

  // 下载所有图片
  const categories = Object.entries(IMAGE_URLS)
  for (const [category, items] of categories) {
    if (category === 'cars') {
      // 处理汽车图片
      for (const [brand, images] of Object.entries(items)) {
        for (const [filename, url] of Object.entries(images)) {
          const filepath = path.join(publicDir, 'images/cars', brand, filename)
          
          // 检查文件是否已存在
          if (existsSync(filepath)) {
            console.log(`⚡ 跳过已存在: cars/${brand}/${filename}`)
            skippedFiles.push(`cars/${brand}/${filename}`)
            continue
          }

          try {
            await downloadImage(url, filepath)
            console.log(`✓ 下载成功: cars/${brand}/${filename}`)
          } catch (error) {
            console.error(`✗ 下载失败: cars/${brand}/${filename}:`, error.message)
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
      // 处理其他类别的图片
      for (const [filename, url] of Object.entries(items)) {
        const filepath = path.join(publicDir, 'images', category, filename)
        
        // 检查文件是否已存在
        if (existsSync(filepath)) {
          console.log(`⚡ 跳过已存在: ${category}/${filename}`)
          skippedFiles.push(`${category}/${filename}`)
          continue
        }

        try {
          await downloadImage(url, filepath)
          console.log(`✓ 下载成功: ${category}/${filename}`)
        } catch (error) {
          console.error(`✗ 下载失败: ${category}/${filename}:`, error.message)
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
  console.log('总图片数:', getTotalImageCount())
  console.log('已存在数:', skippedFiles.length)
  console.log('成功数:', getTotalImageCount() - failedDownloads.length - skippedFiles.length)
  console.log('失败数:', failedDownloads.length)
  
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

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('下载超时'))
    }, 10000)

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
    }).on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

// 执行下载
console.log('开始下载图片...')
downloadImages()
  .then(() => console.log('\n下载过程完成!'))
  .catch(error => console.error('\n下载过程出错:', error)) 