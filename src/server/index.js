const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const app = express();

// CORS 配置
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 基本中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// 添加日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin']
    }
  });
  next();
});

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads/avatars')
    // 确保目录存在
    require('fs').mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'avatar-' + uniqueSuffix + ext)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // 验证文件类型
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('只允许上传图片文件'))
      return
    }
    cb(null, true)
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  }
}).single('avatar')

// 数据库连接配置
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'car_mall',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    console.log('数据库连接成功');
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    process.exit(1);
  });

// 注册接口
app.post('/api/auth/register', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('文件上传错误:', err)
      return res.status(400).json({ message: err.message || '文件上传失败' })
    }

    try {
      // 打印完整的请求信息
      console.log('收到注册请求:', {
        body: req.body,
        file: req.file,
        headers: req.headers
      })

      // 验证必填字段
      const { username, password, email } = req.body
      const missingFields = []

      if (!username?.trim()) missingFields.push('用户名')
      if (!password?.trim()) missingFields.push('密码')
      if (!email?.trim()) missingFields.push('邮箱')
      if (!req.file) missingFields.push('头像')

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `以下字段为必填项: ${missingFields.join(', ')}`
        })
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`
      
      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10)
      
      const connection = await pool.getConnection()
      
      try {
        // 检查用户名和邮箱是否已存在
        const [existingUsers] = await connection.execute(
          'SELECT id FROM users WHERE username = ? OR email = ?',
          [username, email]
        )

        if (existingUsers.length > 0) {
          return res.status(400).json({ message: '用户名或邮箱已存在' })
        }

        // 插入新用户
        const [result] = await connection.execute(
          'INSERT INTO users (username, password, email, avatar) VALUES (?, ?, ?, ?)',
          [username.trim(), hashedPassword, email.trim(), avatarUrl]
        )
        
        res.status(201).json({
          message: '注册成功',
          data: {
            id: result.insertId,
            username,
            email,
            avatarUrl
          }
        })
      } finally {
        connection.release()
      }
    } catch (error) {
      console.error('注册失败:', error)
      res.status(500).json({ message: '注册失败' })
    }
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误处理:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '文件大小不能超过 5MB' });
    }
    return res.status(400).json({ message: '文件上传失败' });
  }
  res.status(500).json({ message: '服务器错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 