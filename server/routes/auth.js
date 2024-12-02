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

module.exports = router; 