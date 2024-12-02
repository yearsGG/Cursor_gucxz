/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80037 (8.0.37)
 Source Host           : localhost:3306
 Source Schema         : car_mall

 Target Server Type    : MySQL
 Target Server Version : 80037 (8.0.37)
 File Encoding         : 65001

 Date: 02/12/2024 22:47:33
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for banners
-- ----------------------------
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort_order` int NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of banners
-- ----------------------------
INSERT INTO `banners` VALUES (1, '/images/banners/banner1.jpg', '/category/suv', '豪华SUV专场', '尊享品质生活', 1, 1, '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `banners` VALUES (2, '/images/banners/banner2.jpg', '/category/electric', '新能源汽车', '驾驭未来科技', 2, 1, '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `banners` VALUES (3, '/images/banners/banner3.jpg', '/category/sports', '跑车系列', '激情与速度的完美邂逅', 3, 1, '2024-12-02 18:49:53', '2024-12-02 18:49:53');

-- ----------------------------
-- Table structure for brands
-- ----------------------------
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `description_long` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of brands
-- ----------------------------
INSERT INTO `brands` VALUES (1, '奔驰', '/images/logos/benz.png', '德国豪华汽车品牌', '梅赛德斯-奔驰是全球历史最悠久的汽车制造商，以其卓越的品质、创新的技术和优雅的设计闻名于世。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (2, '宝马', '/images/logos/bmw.png', '德国运动豪华品牌', '宝马以其卓越的驾驶乐趣和运动性能著称，是全球领先的豪华汽车品牌之一。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (3, '奥迪', '/images/logos/audi.png', '德国科技豪华品牌', '奥迪以其先进的科技、quattro四驱系统和现代设计语言而闻名。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (4, '保时捷', '/images/logos/porsche.png', '德国顶级跑车品牌', '保时捷是跑车领域的标杆，代表着极致的性能和精准的工程技术。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (5, '法拉利', '/images/logos/ferrari.png', '意大利超级跑车品牌', '法拉利是世界上最著名的超级跑车制造商，象征着速度与激情。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (6, '兰博基尼', '/images/logos/lamborghini.png', '意大利奢华跑车品牌', '兰博基尼以其夸张的设计和极致的性能著称。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (7, '特斯拉', '/images/logos/tesla.png', '美国电动车领导者', '特斯拉引领着电动汽车革命，以其创新科技和卓越性能重新定义了汽车行业。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (8, '丰田', '/images/logos/toyota.png', '日本可靠性标杆', '丰田是全球最大的汽车制造商，以其可靠性和混合动力技术闻名。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (9, '本田', '/images/logos/honda.png', '日本科技创新者', '本田以其创新的工程技术和高品质产品而著名。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (10, '日产', '/images/logos/nissan.png', '日本运动科技品牌', '日产以其GT-R超跑和电动车技术闻名于世。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (11, '雷克萨斯', '/images/logos/lexus.png', '日本豪华品牌', '雷克萨斯代表着日本的豪华与工艺，以其卓越的品质和舒适性著称。', '2024-12-02 18:49:53');
INSERT INTO `brands` VALUES (12, '沃尔沃', '/images/logos/volvo.png', '瑞典安全科技品牌', '沃尔沃是全球汽车安全技术的领导者，以其创新的安全系统闻名。', '2024-12-02 18:49:53');

-- ----------------------------
-- Table structure for cars
-- ----------------------------
DROP TABLE IF EXISTS `cars`;
CREATE TABLE `cars`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand_id` int NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12, 2) NOT NULL,
  `year` int NOT NULL,
  `color` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `mileage` int NULL DEFAULT 0,
  `category` enum('sedan','suv','sports','electric','hybrid','mpv','pickup','supercar','luxury','offroad') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `stock` int NOT NULL DEFAULT 0,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `specs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `features` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `engine_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `displacement` float NULL DEFAULT NULL,
  `power` int NULL DEFAULT NULL,
  `torque` int NULL DEFAULT NULL,
  `transmission` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `drive_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `seats` int NULL DEFAULT NULL,
  `fuel_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` enum('available','sold_out','upcoming') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `brand_id`(`brand_id` ASC) USING BTREE,
  CONSTRAINT `cars_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cars
-- ----------------------------
INSERT INTO `cars` VALUES (1, 1, 'S500', 1580000.00, 2024, '曜岩黑', 0, 'sedan', NULL, 5, '全新一代奔驰S500采用最新设计语言，搭载3.0T直列六缸发动机，配备全新MBUX智能系统。', NULL, NULL, '3.0T V6', NULL, NULL, NULL, '8速自动', NULL, NULL, '汽油', '/images/cars/benz/s500-1.jpg,/images/cars/benz/s500-2.jpg,/images/cars/benz/s500-3.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `cars` VALUES (2, 2, 'X7', 1198000.00, 2024, '矿石白', 0, 'suv', NULL, 3, '宝马X7是品牌旗舰级SUV，采用最新设计语言，搭载3.0T直列六缸发动机。', NULL, NULL, '3.0T V8', NULL, NULL, NULL, '8速自动', NULL, NULL, '汽油', '/images/cars/bmw/x7-1.jpg,/images/cars/bmw/x7-2.jpg,/images/cars/bmw/x7-3.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `cars` VALUES (3, 4, '911', 1580000.00, 2024, '竞速黄', 0, 'sports', NULL, 2, '保时捷911是跑车界的标杆，搭载3.0T水平对置六缸发动机。', NULL, NULL, '3.0T H6', NULL, NULL, NULL, '8速自动', NULL, NULL, '汽油', '/images/cars/porsche/911-1.jpg,/images/cars/porsche/911-2.jpg,/images/cars/porsche/911-3.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `cars` VALUES (4, 7, 'Model Y', 266900.00, 2024, '珠白', 0, 'electric', NULL, 10, '特斯拉Model Y是一款纯电动SUV，续航里程可达550公里。', NULL, NULL, '3.0T', NULL, NULL, NULL, '1速固定', NULL, NULL, '电动', '/images/cars/tesla/model-y-1.jpg,/images/cars/tesla/model-y-2.jpg,/images/cars/tesla/model-y-3.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `cars` VALUES (5, 1, 'E300L', 498000.00, 2024, '极地白', 0, 'sedan', NULL, 8, '全新奔驰E300L豪华轿车，搭载2.0T涡轮增压发动机，配备智能驾驶辅助系统。', NULL, NULL, '2.0T L4', NULL, NULL, NULL, '9速自动', NULL, NULL, '汽油', '/images/cars/benz/e300-1.jpg,/images/cars/benz/e300-2.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `cars` VALUES (6, 1, 'GLC300', 578000.00, 2024, '曜岩黑', 0, 'suv', NULL, 5, '奔驰GLC300豪华SUV，完美诠释运动与优雅的结合。', NULL, NULL, '2.0T L4', NULL, NULL, NULL, '9速自动', NULL, NULL, '汽油', '/images/cars/benz/glc-1.jpg,/images/cars/benz/glc-2.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `cars` VALUES (7, 4, '911 GT3', 2280000.00, 2024, '竞速黄', 0, 'sports', '双门跑车', 2, '保时捷911 GT3是纯粹跑车的代表作，搭载4.0L自然吸气水平对置六缸发动机，最大功率510PS。', NULL, NULL, '4.0L H6', 4, 375, 470, '7速PDK双离合', '后驱', 2, '汽油', '/images/cars/porsche/911-gt3-1.jpg,/images/cars/porsche/911-gt3-2.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');
INSERT INTO `cars` VALUES (8, 5, 'F8 Tributo', 3380000.00, 2024, '法拉利红', 0, 'supercar', '双门跑车', 1, '法拉利F8 Tributo搭载3.9L V8双涡轮增压发动机，最大功率720PS，百公里加速2.9秒。', NULL, NULL, '3.9L V8 Twin-Turbo', 3.9, 530, 770, '7速双离合', '后驱', 2, '汽油', '/images/cars/ferrari/f8-1.jpg,/images/cars/ferrari/f8-2.jpg', 'available', '2024-12-02 18:49:53', '2024-12-02 18:49:53');

-- ----------------------------
-- Table structure for cart_items
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `car_id` int NOT NULL,
  `quantity` int NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `car_id`(`car_id` ASC) USING BTREE,
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart_items
-- ----------------------------

-- ----------------------------
-- Table structure for comment_likes
-- ----------------------------
DROP TABLE IF EXISTS `comment_likes`;
CREATE TABLE `comment_likes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `comment_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_like`(`user_id` ASC, `comment_id` ASC) USING BTREE,
  INDEX `comment_id`(`comment_id` ASC) USING BTREE,
  CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comment_likes
-- ----------------------------

-- ----------------------------
-- Table structure for comment_replies
-- ----------------------------
DROP TABLE IF EXISTS `comment_replies`;
CREATE TABLE `comment_replies`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `comment_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `comment_id`(`comment_id` ASC) USING BTREE,
  CONSTRAINT `comment_replies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comment_replies_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comment_replies
-- ----------------------------

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `car_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `car_id`(`car_id` ASC) USING BTREE,
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comments
-- ----------------------------

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `car_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC, `car_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of favorites
-- ----------------------------

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `car_id` int NOT NULL,
  `car_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `car_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12, 2) NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id` ASC) USING BTREE,
  INDEX `car_id`(`car_id` ASC) USING BTREE,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `total_amount` decimal(12, 2) NOT NULL,
  `status` enum('pending','paid','shipped','delivered','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_no`(`order_no` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------

-- ----------------------------
-- Table structure for user_notifications
-- ----------------------------
DROP TABLE IF EXISTS `user_notifications`;
CREATE TABLE `user_notifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `from_user_id` int NOT NULL,
  `type` enum('like','reply') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `comment_id` int NOT NULL,
  `car_id` int NOT NULL,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `from_user_id`(`from_user_id` ASC) USING BTREE,
  INDEX `comment_id`(`comment_id` ASC) USING BTREE,
  INDEX `car_id`(`car_id` ASC) USING BTREE,
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_notifications_ibfk_3` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_notifications_ibfk_4` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_notifications
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
