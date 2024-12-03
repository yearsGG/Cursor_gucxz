const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { JWT_SECRET } = require('../config');

// 注册路由
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { username, password, email, phone } = req.body;

    // 验证必填字段
    if (!username || !password || !email) {
      return res.status(400).json({ message: '用户名、密码和邮箱都是必填项' });
    }

    // 检查用户名和邮箱是否已存在
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入新用户
    const [result] = await connection.query(
      `INSERT INTO users (username, password, email, phone, role) 
       VALUES (?, ?, ?, ?, 'user')`,
      [username, hashedPassword, email, phone || null]
    );

    await connection.commit();

    res.status(201).json({
      message: '注册成功',
      userId: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('注册失败:', error);
    res.status(500).json({ message: '注册失败' });
  } finally {
    connection.release();
  }
});

// 用户登录
router.post('/api/auth/login', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { username, password } = req.body

    // 获取用户信息（包括头像和角色）
    const [users] = await connection.query(
      'SELECT id, username, password, email, avatar, role FROM users WHERE username = ?',
      [username]
    )

    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    // 生成token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)

    // 不返回密码
    delete user.password

    // 确保管理员角色正确设置
    if (username === 'admin') {
      user.role = 'admin'
    }

    console.log('登录返回的用户信息:', {
      ...user,
      password: undefined
    })

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'user' // 确保有默认角色
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ message: '登录失败' })
  } finally {
    connection.release()
  }
})

module.exports = router; 