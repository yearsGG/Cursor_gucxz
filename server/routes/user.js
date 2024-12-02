const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const pool = require('../db');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件'));
    }
  }
});

// 头像上传路由
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 更新用户头像URL
    await pool.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, req.user.userId]
    );

    res.json({
      success: true,
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    res.status(500).json({
      success: false,
      message: '头像上传失败'
    });
  }
});

module.exports = router; 