import { promises as fs } from 'fs'
import { createWriteStream } from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGE_URLS = {
  banners: {
    'banner1.jpg': 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg',
    'banner2.jpg': 'https://images.pexels.com/photos/3802512/pexels-photo-3802512.jpeg',
    'banner3.jpg': 'https://images.pexels.com/photos/3802514/pexels-photo-3802514.jpeg'
  },
  cars: {
    benz: {
      's500-1.jpg': 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg',
      's500-2.jpg': 'https://images.pexels.com/photos/193021/pexels-photo-193021.jpeg',
      's500-3.jpg': 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg'
    },
    bmw: {
      'x7-1.jpg': 'https://images.pexels.com/photos/892522/pexels-photo-892522.jpeg',
      'x7-2.jpg': 'https://images.pexels.com/photos/951318/pexels-photo-951318.jpeg',
      'x7-3.jpg': 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg'
    },
    porsche: {
      '911-1.jpg': 'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg',
      '911-2.jpg': 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg',
      '911-3.jpg': 'https://images.pexels.com/photos/3786091/pexels-photo-3786091.jpeg'
    },
    tesla: {
      'model-y-1.jpg': 'https://images.pexels.com/photos/7516347/pexels-photo-7516347.jpeg',
      'model-y-2.jpg': 'https://images.pexels.com/photos/7516401/pexels-photo-7516401.jpeg',
      'model-y-3.jpg': 'https://images.pexels.com/photos/7516416/pexels-photo-7516416.jpeg'
    }
  }
}

async function downloadImages() {
  const publicDir = path.join(__dirname, '../public')
  
  // 创建必要的目录
  await fs.mkdir(path.join(publicDir, 'images/banners'), { recursive: true })
  await fs.mkdir(path.join(publicDir, 'images/cars/benz'), { recursive: true })
  await fs.mkdir(path.join(publicDir, 'images/cars/bmw'), { recursive: true })
  await fs.mkdir(path.join(publicDir, 'images/cars/porsche'), { recursive: true })
  await fs.mkdir(path.join(publicDir, 'images/cars/tesla'), { recursive: true })

  // 下载轮播图
  for (const [filename, url] of Object.entries(IMAGE_URLS.banners)) {
    try {
      await downloadImage(url, path.join(publicDir, 'images/banners', filename))
      console.log(`成功下载: ${filename}`)
    } catch (error) {
      console.error(`下载失败 ${filename}:`, error.message)
    }
  }

  // 下载汽车图片
  for (const [brand, images] of Object.entries(IMAGE_URLS.cars)) {
    for (const [filename, url] of Object.entries(images)) {
      try {
        await downloadImage(url, path.join(publicDir, 'images/cars', brand, filename))
        console.log(`成功下载: ${brand}/${filename}`)
      } catch (error) {
        console.error(`下载失败 ${brand}/${filename}:`, error.message)
      }
    }
  }
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败 ${url}: ${response.statusCode}`))
        return
      }

      const file = createWriteStream(filepath)
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })

      file.on('error', (err) => {
        fs.unlink(filepath).catch(console.error)
        reject(err)
      })
    }).on('error', reject)
  })
}

downloadImages().catch(console.error) 