const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('数据库连接成功');
        connection.release();
    } catch (error) {
        console.error('数据库连接失败:', error);
        throw error;
    }
}

testConnection();

module.exports = pool; 