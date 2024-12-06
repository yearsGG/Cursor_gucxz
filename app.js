const corsOptions = {
  origin: function(origin, callback) {
    // 允许所有来源访问
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));

// 注册路由处理
app.post('/api/auth/register', async (req, res) => {
  try {
    // ... 现有的注册逻辑 ...

    // 修改响应方式
    res.status(201).json({
      success: true,
      message: '注册成功',
      user: {
        id: result.insertId,
        username: username,
        email: email,
        avatar: avatarPath
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    // 如果数据已经插入但响应失败，返回成功状态
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // 确保CORS头被正确设置
  const origin = req.headers.origin;
  if (origin && corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: '用户名已存在'
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: err.message || '服务器错误'
  });
});

app.get('/api/auth/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    res.json({ available: rows.length === 0 });
  } catch (error) {
    console.error('检查用户名时出错:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/brands', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brands');
    res.json(rows);
  } catch (error) {
    console.error('获取品牌数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/cars', async (req, res) => {
  try {
    const { page = 1, pageSize = 12, category = '' } = req.query;
    let query = 'SELECT * FROM cars WHERE status IN ("available", "restocking")';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    const [countResult] = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as total'),
      params
    );
    const total = countResult[0].total;
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * pageSize;
    params.push(parseInt(pageSize), offset);
    
    const [rows] = await pool.query(query, params);
    
    res.json({
      data: rows,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取车辆数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners');
    res.json(rows);
  } catch (error) {
    console.error('获取轮播图数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新车辆状态
app.put('/api/admin/cars/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 先获取当前车辆信息
    const [car] = await pool.query('SELECT stock, status FROM cars WHERE id = ?', [id]);
    
    if (!car.length) {
      return res.status(404).json({
        status: null,
        message: '未找到该车辆'
      });
    }

    const stock = car[0].stock;
    const currentStatus = car[0].status;
    
    // 确定新状态
    let newStatus;
    if (currentStatus === 'available') {
      newStatus = 'restocking';  // 有货 -> 补货中
    } else if (currentStatus === 'restocking') {
      newStatus = 'discontinued';  // 补货中 -> 已下架
    } else {
      newStatus = 'available';  // 已下架 -> 有货
      // 检查库存
      if (stock === 0) {
        return res.status(400).json({
          status: 'discontinued',
          message: '库存为0，无法上架商品'
        });
      }
      if (stock < 1) {
        return res.status(400).json({
          status: 'discontinued',
          message: '库存不足1件，无法上架商品'
        });
      }
    }
    
    const [result] = await pool.query(
      'UPDATE cars SET status = ? WHERE id = ?',
      [newStatus, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: null,
        message: '更新失败'
      });
    }
    
    res.json({
      status: newStatus,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新车辆状态失败:', error);
    res.status(500).json({
      status: null,
      message: '更新失败'
    });
  }
}); 