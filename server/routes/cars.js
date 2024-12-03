// 获取车辆列表（前台展示用）
router.get('/', async (req, res) => {
  try {
    // 添加日志以便调试
    console.log('正在获取车辆列表...');
    
    const [cars] = await pool.query(
      `SELECT c.*, b.name as brand 
       FROM cars c 
       LEFT JOIN brands b ON c.brand_id = b.id 
       WHERE c.status != 'discontinued'  /* 只过滤掉下架状态，保留其他所有状态 */
       ORDER BY c.created_at DESC`
    );

    // 添加日志以检查返回的数据
    console.log('查询到的车辆数量:', cars.length);
    console.log('车辆状态统计:', cars.reduce((acc, car) => {
      acc[car.status] = (acc[car.status] || 0) + 1;
      return acc;
    }, {}));

    res.json(cars);
  } catch (error) {
    console.error('获取车辆列表失败:', error);
    res.status(500).json({ message: '获取车辆列表失败' });
  }
}); 