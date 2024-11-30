const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dbConfig = require('./config/db.config')

const app = express()

app.use(cors())
app.use(express.json())

const pool = mysql.createPool(dbConfig)

// 测试数据库连接
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('数据库连接成功')
    connection.release()
  } catch (error) {
    console.error('数据库连接失败:', error)
    throw error
  }
}

// 添加错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

const JWT_SECRET = 'your-secret-key'

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { username, password, email, phone } = req.body

    // 验证请求数据
    if (!username || !password || !email) {
      return res.status(400).json({ message: '用户名、密码和邮箱都是必填项' })
    }

    console.log('开始注册用户:', { username, email, phone })

    // 开始事务
    await connection.beginTransaction()

    // 检查用户名是否已存在
    const [existingUsers] = await connection.query(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUsers.length > 0) {
      const existing = existingUsers[0]
      const message = existing.username === username 
        ? '用户名已存在' 
        : '邮箱已被使用'
      
      console.log('注册失败:', message, existing)
      await connection.rollback()
      return res.status(400).json({ message })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('密码加密完成')

    // 插入新用户
    const [result] = await connection.query(
      `INSERT INTO users (username, password, email, phone, role) 
       VALUES (?, ?, ?, ?, 'user')`,
      [username, hashedPassword, email, phone || null]
    )

    // 提交事务
    await connection.commit()
    console.log('用户注册成功:', { userId: result.insertId, username })

    res.status(201).json({
      message: '注册成功',
      userId: result.insertId
    })
  } catch (error) {
    // 回滚事务
    await connection.rollback()
    console.error('注册失败，详细错误:', error)

    // 根据错误类型返回不同的错误信息
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ 
        message: '用户名或邮箱已存在',
        error: error.message 
      })
    } else {
      res.status(500).json({ 
        message: '注册失败，请稍后重试',
        error: error.message 
      })
    }
  } finally {
    connection.release()
  }
})

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { username, password } = req.body

    console.log('尝试登录:', username)

    // 查找用户
    const [users] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )

    if (users.length === 0) {
      console.log('用户不存在:', username)
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    const user = users[0]

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('密码错误:', username)
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    console.log('登录成功:', username)

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ 
      message: '登录失败',
      error: error.message 
    })
  } finally {
    connection.release()
  }
})

// 验证Token的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '未登录' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '登录已过期' })
    }
    req.user = user
    next()
  })
}

// 获取当前用户信息
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, phone, role FROM users WHERE id = ?',
      [req.user.userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }

    res.json(users[0])
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ message: '获取用户信息失败' })
  }
})

// 获取轮播图
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order')
    res.json(rows)
  } catch (error) {
    console.error('获取轮播图失败:', error)
    res.status(500).json({ message: '获取轮播图失败' })
  }
})

// 1. 先定义搜索路由（必须放在其他具体路由之前）
app.get('/api/cars/search', async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    const { q, page = 1, pageSize = 12, sort, brand } = req.query
    
    console.log('搜索请求参数:', { q, page, pageSize, sort, brand })
    
    const offset = (page - 1) * pageSize

    // 基础查询
    let query = `
      SELECT DISTINCT c.*, b.name as brand 
      FROM cars c 
      JOIN brands b ON c.brand_id = b.id 
      WHERE c.status = 'available'
    `
    const params = []

    // 添加搜索条件
    if (q) {
      query += ` AND (
        b.name LIKE ? OR 
        c.model LIKE ? OR 
        CONCAT(b.name, ' ', c.model) LIKE ? OR
        c.description LIKE ? OR 
        c.category LIKE ? OR 
        c.color LIKE ? OR 
        c.engine_type LIKE ? OR 
        c.transmission LIKE ? OR 
        c.fuel_type LIKE ? OR 
        CAST(c.year AS CHAR) LIKE ? OR
        CAST(c.price AS CHAR) LIKE ?
      )`
      const searchTerm = `%${q}%`
      Array(11).fill(searchTerm).forEach(term => params.push(term))
    }

    // 添加品牌筛选
    if (brand) {
      query += ` AND b.name = ?`
      params.push(brand)
    }

    // 添加排序
    if (sort) {
      switch (sort) {
        case 'price_asc':
          query += ` ORDER BY c.price ASC`
          break
        case 'price_desc':
          query += ` ORDER BY c.price DESC`
          break
        case 'newest':
          query += ` ORDER BY c.created_at DESC`
          break
        default:
          query += ` ORDER BY c.created_at DESC`
      }
    } else {
      query += ` ORDER BY c.created_at DESC`
    }

    // 添加分页
    query += ` LIMIT ? OFFSET ?`
    params.push(Number(pageSize), offset)

    console.log('SQL查询:', { query, params })

    // 执行查询
    const [rows] = await connection.query(query, params)
    console.log('查询结果数量:', rows.length)

    // 获取总数
    const [countResult] = await connection.query(
      'SELECT COUNT(DISTINCT c.id) as total FROM cars c JOIN brands b ON c.brand_id = b.id WHERE c.status = "available"'
    )

    res.json({
      items: rows,
      total: countResult[0].total,
      page: Number(page),
      pageSize: Number(pageSize)
    })

  } catch (error) {
    console.error('搜索失败:', error)
    next(error)
  } finally {
    connection.release()
  }
})

// 2. 然后是其他路由
app.get('/api/cars', async (req, res) => {
  try {
    const { page = 1, pageSize = 12, category } = req.query
    const offset = (page - 1) * pageSize

    let query = `
      SELECT c.*, b.name as brand 
      FROM cars c 
      JOIN brands b ON c.brand_id = b.id 
      WHERE c.status = 'available'
    `
    const params = []

    if (category && category !== 'all') {
      query += ' AND c.category = ?'
      params.push(category)
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), offset)

    const [rows] = await pool.query(query, params)
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM cars WHERE status = "available"')
    
    res.json({
      items: rows,
      total: countResult[0].total
    })
  } catch (error) {
    console.error('获取汽车列表失败:', error)
    res.status(500).json({ message: '获取汽车列表失败' })
  }
})

app.get('/api/cars/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, b.name as brand 
      FROM cars c 
      JOIN brands b ON c.brand_id = b.id 
      WHERE c.id = ?
    `, [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ message: '未找到该商品' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('获取汽车详情失败:', error)
    res.status(500).json({ message: '获取商品信息失败' })
  }
})

// 获取购物车数量
app.get('/api/cart/count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
      [req.user.userId]
    )
    res.json({ count: result[0].count })
  } catch (error) {
    console.error('获取购物车数量失败:', error)
    res.status(500).json({ message: '获取购物车数量失败' })
  }
})

// 获取购物车列表
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        c.*,
        b.name as brand
      FROM cart_items ci
      JOIN cars c ON ci.car_id = c.id
      JOIN brands b ON c.brand_id = b.id
      WHERE ci.user_id = ?
    `, [req.user.userId])
    res.json(rows)
  } catch (error) {
    console.error('获取购物车失败:', error)
    res.status(500).json({ message: '获取购物车失败' })
  }
})

// 添加到购物车
app.post('/api/cart', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { carId, quantity } = req.body
    const userId = req.user.userId

    // 开始事务
    await connection.beginTransaction()

    // 检查商品是否存在且有库存
    const [cars] = await connection.query(
      'SELECT id, stock FROM cars WHERE id = ? AND status = "available"',
      [carId]
    )

    if (cars.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: '商品不存在或已下架' })
    }

    const car = cars[0]
    if (car.stock < quantity) {
      await connection.rollback()
      return res.status(400).json({ message: '商品库存不足' })
    }

    // 检查购物车是否已有该商品
    const [existingItems] = await connection.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND car_id = ?',
      [userId, carId]
    )

    if (existingItems.length > 0) {
      // 更新数量
      const newQuantity = existingItems[0].quantity + quantity
      await connection.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      )
    } else {
      // 新增购物车项
      await connection.query(
        'INSERT INTO cart_items (user_id, car_id, quantity) VALUES (?, ?, ?)',
        [userId, carId, quantity]
      )
    }

    // 提交事务
    await connection.commit()
    
    // 返回更新后的购物车数量
    const [cartCount] = await connection.query(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
      [userId]
    )

    res.json({ 
      message: '已加入购物车',
      cartCount: cartCount[0].count
    })

  } catch (error) {
    await connection.rollback()
    console.error('加入购物车失败:', error)
    res.status(500).json({ message: '加入购物车失败' })
  } finally {
    connection.release()
  }
})

// 更新购物车数量
app.put('/api/cart/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { quantity } = req.body
    const cartItemId = req.params.id
    const userId = req.user.userId

    // 开始事务
    await connection.beginTransaction()

    // 检查购物车项是否存在且属于当前用户
    const [cartItems] = await connection.query(
      'SELECT ci.*, c.stock FROM cart_items ci JOIN cars c ON ci.car_id = c.id WHERE ci.id = ? AND ci.user_id = ?',
      [cartItemId, userId]
    )

    if (cartItems.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: '购物车项不存在' })
    }

    const cartItem = cartItems[0]
    if (cartItem.stock < quantity) {
      await connection.rollback()
      return res.status(400).json({ message: '商品库存不足' })
    }

    // 更新数量
    await connection.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    )

    // 提交事务
    await connection.commit()
    res.json({ message: '更新成功' })

  } catch (error) {
    await connection.rollback()
    console.error('更新购物车失败:', error)
    res.status(500).json({ message: '更新购物车失败' })
  } finally {
    connection.release()
  }
})

// 删除购物车项
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const cartItemId = req.params.id
    const userId = req.user.userId

    // 开始事务
    await connection.beginTransaction()

    // 检查购物车项是否存在且属于当前用户
    const [items] = await connection.query(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, userId]
    )

    if (items.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: '购物车项不存在' })
    }

    // 删除购物车项
    await connection.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, userId]
    )

    // 提交事务
    await connection.commit()

    // 返回更新后的购物车数量
    const [cartCount] = await connection.query(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
      [userId]
    )

    res.json({ 
      message: '删除成功',
      cartCount: cartCount[0].count
    })

  } catch (error) {
    await connection.rollback()
    console.error('删除购物车项失败:', error)
    res.status(500).json({ message: '删除失败' })
  } finally {
    connection.release()
  }
})

// 获取品牌列表
app.get('/api/brands', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM brands 
      WHERE 1=1 
      ORDER BY name
    `)
    console.log('获取品牌列表成功:', rows.length)
    res.json(rows)
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    next(error)
  }
})

// 按品牌筛选汽车
app.get('/api/cars/brand/:brandName', async (req, res) => {
  try {
    const { page = 1, pageSize = 12 } = req.query
    const offset = (page - 1) * pageSize
    const brandName = req.params.brandName

    const [rows] = await pool.query(`
      SELECT c.*, b.name as brand 
      FROM cars c 
      JOIN brands b ON c.brand_id = b.id 
      WHERE b.name = ? AND c.status = 'available'
      ORDER BY c.created_at DESC 
      LIMIT ? OFFSET ?
    `, [brandName, Number(pageSize), offset])

    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM cars c 
      JOIN brands b ON c.brand_id = b.id 
      WHERE b.name = ? AND c.status = 'available'
    `, [brandName])

    res.json({
      items: rows,
      total: countResult[0].total
    })
  } catch (error) {
    console.error('获取品牌汽车列表失败:', error)
    res.status(500).json({ message: '获取品牌汽车列表失败' })
  }
})

// 启动服务器
async function startServer() {
  await testDatabaseConnection()
  
  const PORT = 3000
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`)
  })
}

startServer().catch(console.error) 