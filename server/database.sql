-- 删除现有的数据库（如果需要重新创建）
DROP DATABASE IF EXISTS car_mall;

-- 创建数据库
CREATE DATABASE car_mall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE car_mall;

-- 删除现有的表（按照外键依赖的顺序删除）
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS users;

-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建品牌表
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    logo VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建汽车表
CREATE TABLE cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30),
    mileage INT DEFAULT 0,
    category ENUM('sedan', 'suv', 'sports', 'electric') NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    specs TEXT,
    images TEXT,
    status ENUM('available', 'sold_out', 'upcoming') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建轮播图表
CREATE TABLE banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    title VARCHAR(100),
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建购物车表
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建订单表
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled', 'completed') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_time TIMESTAMP NULL,
    shipping_address TEXT,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建订单详情表
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    car_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建收藏表
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, car_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试数据
-- 插入管理员用户（密码：admin123）
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2b$10$rE1yE7BRpPfUxC1vBeQk5.QhPDqYrMaXvPQzA4mZmhOh6De1DvMp.', 'admin@example.com', 'admin');

-- 插入品牌数据
INSERT INTO brands (name, logo, description) VALUES
('奔驰', '/images/logos/benz.png', '德国豪华汽车品牌，以优雅设计和卓越性能著称'),
('宝马', '/images/logos/bmw.png', '德国豪华汽车品牌，驾驶乐趣的代名词'),
('保时捷', '/images/logos/porsche.png', '德国跑车制造商，性能与豪华的完美结合'),
('特斯拉', '/images/logos/tesla.png', '美国电动汽车品牌，科技创新的领导者');

-- 插入轮播图数据
INSERT INTO banners (image_url, link, title, description, sort_order) VALUES
('/images/banners/banner1.jpg', '/category/suv', '豪华SUV专场', '尊享品质生活', 1),
('/images/banners/banner2.jpg', '/category/electric', '新能源汽车', '驾驭未来科技', 2),
('/images/banners/banner3.jpg', '/category/sports', '跑车系列', '激情与速度的完美邂逅', 3);

-- 插入汽车数据
INSERT INTO cars (brand_id, model, price, year, color, category, stock, mileage, description, images) VALUES
((SELECT id FROM brands WHERE name = '奔驰'), 
 'S500', 1580000, 2024, '曜岩黑', 'sedan', 5, 0, 
 '全新一代奔驰S500采用最新设计语言，搭载3.0T直列六缸发动机，配备全新MBUX智能系统。',
 '/images/cars/benz/s500-1.jpg,/images/cars/benz/s500-2.jpg,/images/cars/benz/s500-3.jpg'),

((SELECT id FROM brands WHERE name = '宝马'),
 'X7', 1198000, 2024, '矿石白', 'suv', 3, 0,
 '宝马X7是品牌旗舰级SUV，采用最新设计语言，搭载3.0T直列六缸发动机。',
 '/images/cars/bmw/x7-1.jpg,/images/cars/bmw/x7-2.jpg,/images/cars/bmw/x7-3.jpg'),

((SELECT id FROM brands WHERE name = '保时捷'),
 '911', 1580000, 2024, '竞速黄', 'sports', 2, 0,
 '保时捷911是跑车界的标杆，搭载3.0T水平对置六缸发动机。',
 '/images/cars/porsche/911-1.jpg,/images/cars/porsche/911-2.jpg,/images/cars/porsche/911-3.jpg'),

((SELECT id FROM brands WHERE name = '特斯拉'),
 'Model Y', 266900, 2024, '珍珠白', 'electric', 10, 0,
 '特斯拉Model Y是一款纯电动SUV，续航里程可达550公里。',
 '/images/cars/tesla/model-y-1.jpg,/images/cars/tesla/model-y-2.jpg,/images/cars/tesla/model-y-3.jpg');
  