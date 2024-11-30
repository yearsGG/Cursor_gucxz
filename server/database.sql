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
    description_long TEXT,
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
    category ENUM(
        'sedan',      -- 轿车
        'suv',        -- SUV
        'sports',     -- 跑车
        'electric',   -- 纯电动
        'hybrid',     -- 混合动力
        'mpv',        -- MPV
        'pickup',     -- 皮卡
        'supercar',   -- 超跑
        'luxury',     -- 豪华车
        'offroad'     -- 越野车
    ) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    specs TEXT,
    features TEXT,
    engine_type VARCHAR(50),
    transmission VARCHAR(50),
    fuel_type VARCHAR(30),
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
INSERT INTO brands (name, logo, description, description_long) VALUES
('奔驰', '/images/logos/benz.png', '德国豪华汽车品牌', '梅赛德斯-奔驰是全球历史最悠久的汽车制造商，以其卓越的品质、创新的技术和优雅的设计闻名于世。'),
('宝马', '/images/logos/bmw.png', '德国运动豪华品牌', '宝马以其卓越的驾驶乐趣和运动性能著称，是全球领先的豪华汽车品牌之一。'),
('奥迪', '/images/logos/audi.png', '德国科技豪华品牌', '奥迪以其先进的科技、quattro四驱系统和现代设计语言而闻名。'),
('保时捷', '/images/logos/porsche.png', '德国顶级跑车品牌', '保时捷是跑车领域的标杆，代表着极致的性能和精准的工程技术。'),
('法拉利', '/images/logos/ferrari.png', '意大利超级跑车品牌', '法拉利是世界上最著名的超级跑车制造商，象征着速度与激情。'),
('兰博基尼', '/images/logos/lamborghini.png', '意大利奢华跑车品牌', '兰博基尼以其夸张的设计和极致的性能著称。'),
('特斯拉', '/images/logos/tesla.png', '美国电动车领导者', '特斯拉引领着电动汽车革命，以其创新科技和卓越性能重新定义了汽车行业。'),
('丰田', '/images/logos/toyota.png', '日本可靠性标杆', '丰田是全球最大的汽车制造商，以其可靠性和混合动力技术闻名。'),
('本田', '/images/logos/honda.png', '日本科技创新者', '本田以其创新的工程技术和高品质产品而著名。'),
('日产', '/images/logos/nissan.png', '日本运动科技品牌', '日产以其GT-R超跑和电动车技术闻名于世。'),
('雷克萨斯', '/images/logos/lexus.png', '日本豪华品牌', '雷克萨斯代表着日本的豪华与工艺，以其卓越的品质和舒适性著称。'),
('沃尔沃', '/images/logos/volvo.png', '瑞典安全科技品牌', '沃尔沃是全球汽车安全技术的领导者，以其创新的安全系统闻名。');

-- 插入轮播图数据
INSERT INTO banners (image_url, link, title, description, sort_order) VALUES
('/images/banners/banner1.jpg', '/category/suv', '豪华SUV专场', '尊享品质生活', 1),
('/images/banners/banner2.jpg', '/category/electric', '新能源汽车', '驾驭未来科技', 2),
('/images/banners/banner3.jpg', '/category/sports', '跑车系列', '激情与速度的完美邂逅', 3);

-- 插入汽车数据
INSERT INTO cars (brand_id, model, price, year, color, category, stock, mileage, description, images, engine_type, transmission, fuel_type) VALUES
((SELECT id FROM brands WHERE name = '奔驰'), 
 'S500', 1580000, 2024, '曜岩黑', 'sedan', 5, 0, 
 '全新一代奔驰S500采用最新设计语言，搭载3.0T直列六缸发动机，配备全新MBUX智能系统。',
 '/images/cars/benz/s500-1.jpg,/images/cars/benz/s500-2.jpg,/images/cars/benz/s500-3.jpg', '3.0T V6', '8速自动', '汽油'),

((SELECT id FROM brands WHERE name = '宝马'),
 'X7', 1198000, 2024, '矿石白', 'suv', 3, 0,
 '宝马X7是品牌旗舰级SUV，采用最新设计语言，搭载3.0T直列六缸发动机。',
 '/images/cars/bmw/x7-1.jpg,/images/cars/bmw/x7-2.jpg,/images/cars/bmw/x7-3.jpg', '3.0T V8', '8速自动', '汽油'),

((SELECT id FROM brands WHERE name = '保时捷'),
 '911', 1580000, 2024, '竞速黄', 'sports', 2, 0,
 '保时捷911是跑车界的标杆，搭载3.0T水平对置六缸发动机。',
 '/images/cars/porsche/911-1.jpg,/images/cars/porsche/911-2.jpg,/images/cars/porsche/911-3.jpg', '3.0T H6', '8速自动', '汽油'),

((SELECT id FROM brands WHERE name = '特斯拉'),
 'Model Y', 266900, 2024, '珠白', 'electric', 10, 0,
 '特斯拉Model Y是一款纯电动SUV，续航里程可达550公里。',
 '/images/cars/tesla/model-y-1.jpg,/images/cars/tesla/model-y-2.jpg,/images/cars/tesla/model-y-3.jpg', '3.0T', '1速固定', '电动');

-- 插入更多汽车数据
INSERT INTO cars (brand_id, model, price, year, color, category, stock, mileage, description, images, engine_type, transmission, fuel_type) VALUES
((SELECT id FROM brands WHERE name = '奔驰'), 
 'E300L', 498000, 2024, '极地白', 'sedan', 8, 0, 
 '全新奔驰E300L豪华轿车，搭载2.0T涡轮增压发动机，配备智能驾驶辅助系统。',
 '/images/cars/benz/e300-1.jpg,/images/cars/benz/e300-2.jpg', '2.0T L4', '9速自动', '汽油'),

((SELECT id FROM brands WHERE name = '奔驰'),
 'GLC300', 578000, 2024, '曜岩黑', 'suv', 5, 0,
 '奔驰GLC300豪华SUV，完美诠释运动与优雅的结合。',
 '/images/cars/benz/glc-1.jpg,/images/cars/benz/glc-2.jpg', '2.0T L4', '9速自动', '汽油');

-- 添加更多汽车配置选项
ALTER TABLE cars ADD COLUMN body_type VARCHAR(50) AFTER category;  -- 车身类型
ALTER TABLE cars ADD COLUMN drive_type VARCHAR(50) AFTER transmission;  -- 驱动方式
ALTER TABLE cars ADD COLUMN seats INT AFTER drive_type;  -- 座位数
ALTER TABLE cars ADD COLUMN displacement FLOAT AFTER engine_type;  -- 排量
ALTER TABLE cars ADD COLUMN power INT AFTER displacement;  -- 功率(kW)
ALTER TABLE cars ADD COLUMN torque INT AFTER power;  -- 扭矩(N·m)

-- 插入更多测试数据
INSERT INTO cars (
    brand_id, model, price, year, color, category, 
    body_type, stock, mileage, description, 
    engine_type, displacement, power, torque,
    transmission, drive_type, seats,
    fuel_type, images
) VALUES
((SELECT id FROM brands WHERE name = '保时捷'), 
 '911 GT3', 2280000, 2024, '竞速黄', 'sports',
 '双门跑车', 2, 0,
 '保时捷911 GT3是纯粹跑车的代表作，搭载4.0L自然吸气水平对置六缸发动机，最大功率510PS。',
 '4.0L H6', 4.0, 375, 470,
 '7速PDK双离合', '后驱', 2,
 '汽油',
 '/images/cars/porsche/911-gt3-1.jpg,/images/cars/porsche/911-gt3-2.jpg'),

((SELECT id FROM brands WHERE name = '法拉利'),
 'F8 Tributo', 3380000, 2024, '法拉利红', 'supercar',
 '双门跑车', 1, 0,
 '法拉利F8 Tributo搭载3.9L V8双涡轮增压发动机，最大功率720PS，百公里加速2.9秒。',
 '3.9L V8 Twin-Turbo', 3.9, 530, 770,
 '7速双离合', '后驱', 2,
 '汽油',
 '/images/cars/ferrari/f8-1.jpg,/images/cars/ferrari/f8-2.jpg');
  