-- ====================================================================
-- HỆ THỐNG MUA BÁN & CHO THUÊ BẤT ĐỘNG SẢN (BDS PRO)
-- FULL DATABASE SCRIPT: SCHEMA + SAMPLE DATA (ALL-IN-ONE)
-- ĐỒ ÁN KHÓA LUẬN TỐT NGHIỆP - NHÓM 101
-- ====================================================================

-- 1. Khởi tạo Cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS `bds_pro_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `bds_pro_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- BẢNG 1: NGƯỜI DÙNG (USERS)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('buyer', 'agent', 'admin') NOT NULL DEFAULT 'buyer',
    `avatar` VARCHAR(500) NULL DEFAULT 'https://i.pravatar.cc/150?u=default',
    `verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 2: BẤT ĐỘNG SẢN (PROPERTIES)
DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('apartment', 'house', 'land', 'office', 'villa') NOT NULL,
    `transaction_type` ENUM('sale', 'rent') NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `area` DECIMAL(8, 2) NOT NULL,
    `legal_status` ENUM('so_hong', 'so_do', 'hop_dong', 'cho_so') NOT NULL DEFAULT 'so_hong',
    `address` VARCHAR(255) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'TP. Hồ Chí Minh',
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `status` ENUM('draft', 'pending', 'active', 'sold', 'expired', 'rejected') NOT NULL DEFAULT 'pending',
    `owner_id` VARCHAR(36) NOT NULL,
    `owner_name` VARCHAR(100) NOT NULL,
    `view_count` INT NOT NULL DEFAULT 0,
    `favorite_count` INT NOT NULL DEFAULT 0,
    `description` TEXT NOT NULL,
    `bedrooms` INT NULL DEFAULT 1,
    `bathrooms` INT NULL DEFAULT 1,
    `ai_score` INT NULL DEFAULT 80,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_properties_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_properties_status` (`status`),
    INDEX `idx_properties_city_district` (`city`, `district`),
    INDEX `idx_properties_type_trans` (`type`, `transaction_type`),
    INDEX `idx_properties_price` (`price`),
    INDEX `idx_properties_area` (`area`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 3: HÌNH ẢNH BĐS (PROPERTY_IMAGES)
DROP TABLE IF EXISTS `property_images`;
CREATE TABLE `property_images` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `property_id` VARCHAR(36) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `is_cover` BOOLEAN NOT NULL DEFAULT FALSE,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_images_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `idx_images_property_id` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 4: TIỆN ÍCH BĐS (PROPERTY_AMENITIES)
DROP TABLE IF EXISTS `property_amenities`;
CREATE TABLE `property_amenities` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `property_id` VARCHAR(36) NOT NULL,
    `amenity_name` VARCHAR(100) NOT NULL,
    CONSTRAINT `fk_amenities_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `idx_amenities_property_id` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 5: ĐIỂM TIỆN ÍCH LÂN CẬN (POINTS_OF_INTEREST)
DROP TABLE IF EXISTS `points_of_interest`;
CREATE TABLE `points_of_interest` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `property_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `category` ENUM('school', 'hospital', 'supermarket', 'transport') NOT NULL,
    `distance` INT NOT NULL,
    `rating` DECIMAL(2, 1) NULL DEFAULT 4.5,
    CONSTRAINT `fk_pois_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `idx_pois_property_id` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 6: LỊCH HẸN XEM NHÀ (APPOINTMENTS)
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `property_id` VARCHAR(36) NOT NULL,
    `property_title` VARCHAR(255) NOT NULL,
    `property_image` VARCHAR(500) NULL,
    `buyer_id` VARCHAR(36) NOT NULL,
    `buyer_name` VARCHAR(100) NOT NULL,
    `buyer_phone` VARCHAR(20) NULL,
    `buyer_email` VARCHAR(150) NULL,
    `agent_id` VARCHAR(36) NOT NULL,
    `agent_name` VARCHAR(100) NOT NULL,
    `appointment_date` DATE NOT NULL,
    `appointment_time` VARCHAR(10) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending',
    `tour_type` ENUM('in_person', 'video') NOT NULL DEFAULT 'in_person',
    `note` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appointments_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_appointments_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_appointments_agent` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_appointments_buyer` (`buyer_id`),
    INDEX `idx_appointments_agent` (`agent_id`),
    INDEX `idx_appointments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 7: DANH SÁCH YÊU THÍCH (FAVORITES)
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `property_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_favorites_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_property_favorite` (`user_id`, `property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 8: HỘI THOẠI CHAT (CHAT_THREADS)
DROP TABLE IF EXISTS `chat_threads`;
CREATE TABLE `chat_threads` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `buyer_id` VARCHAR(36) NOT NULL,
    `agent_id` VARCHAR(36) NOT NULL,
    `property_id` VARCHAR(36) NULL,
    `property_title` VARCHAR(255) NULL,
    `property_thumbnail` VARCHAR(500) NULL,
    `last_message` TEXT NULL,
    `last_message_time` VARCHAR(50) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_chat_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_chat_agent` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_chat_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
    INDEX `idx_chat_buyer` (`buyer_id`),
    INDEX `idx_chat_agent` (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 9: TIN NHẮN CHAT (CHAT_MESSAGES)
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `thread_id` VARCHAR(36) NOT NULL,
    `sender_id` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `message_type` ENUM('text', 'image', 'booking') NOT NULL DEFAULT 'text',
    `image_url` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_msg_thread` FOREIGN KEY (`thread_id`) REFERENCES `chat_threads` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_msg_thread` (`thread_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 10: GIAO DỊCH / ĐẶT CỌC (TRANSACTIONS)
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `property_id` VARCHAR(36) NOT NULL,
    `property_title` VARCHAR(255) NOT NULL,
    `property_image` VARCHAR(500) NULL,
    `buyer_id` VARCHAR(36) NOT NULL,
    `buyer_name` VARCHAR(100) NOT NULL,
    `agent_id` VARCHAR(36) NOT NULL,
    `agent_name` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_method` ENUM('vnpay', 'momo', 'bank_transfer') NOT NULL DEFAULT 'vnpay',
    `status` ENUM('pending', 'completed', 'failed', 'refunded', 'disputed') NOT NULL DEFAULT 'pending',
    `receipt_id` VARCHAR(100) NULL UNIQUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_trans_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_trans_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_trans_agent` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_trans_buyer` (`buyer_id`),
    INDEX `idx_trans_agent` (`agent_id`),
    INDEX `idx_trans_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 11: BÁO CÁO VI PHẠM (REPORTS)
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `reporter_id` VARCHAR(36) NOT NULL,
    `reporter_name` VARCHAR(100) NOT NULL,
    `property_id` VARCHAR(36) NOT NULL,
    `property_title` VARCHAR(255) NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('pending', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reports_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `idx_reports_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 12: NHẬT KÝ HỆ THỐNG (AUDIT_LOGS)
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `actor_id` VARCHAR(36) NULL,
    `actor` VARCHAR(100) NOT NULL,
    `actor_role` VARCHAR(50) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `target` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_audit_actor` (`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- NẠP DỮ LIỆU MẪU (MẬT KHẨU TẤT CẢ TÀI KHOẢN LÀ: 123456)
-- ====================================================================

-- 1. Users
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `avatar`, `verified`, `created_at`) VALUES
('u1', 'Nguyễn Minh Anh', 'minhanh@gmail.com', '0901234567', '$2a$10$Wq3vS9k1M/b9p9vRj8tM.u1cQ7aJ1a6O0P.O.O.O.O.O.O.O.O.O.', 'buyer', 'https://i.pravatar.cc/150?u=buyer1', 1, '2026-08-01 08:00:00'),
('u2', 'Trần Văn Bảo', 'vanbao@bdspro.vn', '0912345678', '$2a$10$Wq3vS9k1M/b9p9vRj8tM.u1cQ7aJ1a6O0P.O.O.O.O.O.O.O.O.O.', 'agent', 'https://i.pravatar.cc/150?u=agent1', 1, '2026-07-15 09:30:00'),
('u3', 'Lê Thị Hương', 'admin@bdspro.vn', '0923456789', '$2a$10$Wq3vS9k1M/b9p9vRj8tM.u1cQ7aJ1a6O0P.O.O.O.O.O.O.O.O.O.', 'admin', 'https://i.pravatar.cc/150?u=admin1', 1, '2026-06-01 10:00:00'),
('u4', 'Phạm Đức Hùng', 'hung@gmail.com', '0934567891', '$2a$10$Wq3vS9k1M/b9p9vRj8tM.u1cQ7aJ1a6O0P.O.O.O.O.O.O.O.O.O.', 'agent', 'https://i.pravatar.cc/150?u=agent2', 1, '2026-08-05 11:20:00'),
('u5', 'Phạm Thu Hà', 'thuha@gmail.com', '0945678912', '$2a$10$Wq3vS9k1M/b9p9vRj8tM.u1cQ7aJ1a6O0P.O.O.O.O.O.O.O.O.O.', 'buyer', 'https://i.pravatar.cc/150?u=buyer2', 1, '2026-08-10 14:15:00');

-- 2. Properties
INSERT INTO `properties` (`id`, `title`, `type`, `transaction_type`, `price`, `area`, `legal_status`, `address`, `district`, `city`, `latitude`, `longitude`, `status`, `owner_id`, `owner_name`, `view_count`, `favorite_count`, `description`, `bedrooms`, `bathrooms`, `ai_score`, `created_at`) VALUES
('p1', 'Căn hộ cao cấp Vinhomes Central Park – View sông Sài Gòn', 'apartment', 'rent', 25000000.00, 85.00, 'so_hong', '208 Nguyễn Hữu Cảnh, Bình Thạnh', 'Bình Thạnh', 'TP. Hồ Chí Minh', 10.7951, 106.7215, 'active', 'u2', 'Trần Văn Bảo', 1240, 89, 'Căn hộ 2PN full nội thất cao cấp, view sông thoáng mát. Tiện ích đầy đủ trong khu đô thị Vinhomes Central Park.', 2, 2, 92, '2026-08-01 10:00:00'),
('p2', 'Nhà phố 4 tầng mặt tiền Nguyễn Thị Thập, Quận 7', 'house', 'sale', 12500000000.00, 120.00, 'so_hong', '45 Nguyễn Thị Thập, Quận 7', 'Quận 7', 'TP. Hồ Chí Minh', 10.7340, 106.7210, 'active', 'u2', 'Trần Văn Bảo', 856, 45, 'Nhà phố kinh doanh, mặt tiền 5m, thiết kế hiện đại, phù hợp văn phòng hoặc ở kết hợp kinh doanh.', 4, 3, 88, '2026-07-28 15:30:00'),
-- ('p3', 'Đất nền dự án Aqua City – Sổ hồng riêng' ...) - removed: đã xóa theo yêu cầu,
('p4', 'Văn phòng cho thuê Landmark 81 – 150m² view panorama', 'office', 'rent', 85000000.00, 150.00, 'hop_dong', 'Landmark 81, Vinhomes Central Park', 'Bình Thạnh', 'TP. Hồ Chí Minh', 10.7955, 106.7220, 'active', 'u2', 'Trần Văn Bảo', 678, 34, 'Văn phòng hạng A, view toàn cảnh thành phố, nội thất sẵn sàng vào làm việc.', 0, 2, 85, '2026-07-15 11:00:00'),
('p5', 'Biệt thự liền kề Vinhomes Ocean Park – Hà Nội', 'villa', 'sale', 18500000000.00, 200.00, 'so_hong', 'P5-12, Vinhomes Ocean Park, Gia Lâm', 'Gia Lâm', 'Hà Nội', 21.0120, 105.9320, 'pending', 'u4', 'Phạm Đức Hùng', 120, 10, 'Biệt thự 3 tầng, thiết kế tân cổ điển, sân vườn rộng, khu an ninh cao cấp.', 5, 4, 90, '2026-08-10 16:20:00'),
('p6', 'Studio Masteri Thảo Điền – Full nội thất gần Metro', 'apartment', 'rent', 12000000.00, 45.00, 'so_do', '159 Xa lộ Hà Nội, Thảo Điền', 'Quận 2', 'TP. Hồ Chí Minh', 10.8030, 106.7380, 'active', 'u2', 'Trần Văn Bảo', 945, 67, 'Studio hiện đại, phù hợp expat và chuyên gia trẻ, gần tuyến Metro số 1 và trung tâm.', 1, 1, 94, '2026-08-05 08:30:00');

-- 3. Images
INSERT INTO `property_images` (`id`, `property_id`, `image_url`, `is_cover`, `display_order`) VALUES
('img1', 'p1', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 1, 1),
('img2', 'p1', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0, 2),
('img3', 'p1', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 0, 3),
('img4', 'p2', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 1, 1),
('img5', 'p2', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 0, 2),
-- ('img6', 'p3', 'https://images.unsplash.com/photo-1500382017468-904fc875a87f?w=800', 1, 1),  -- removed: liên quan đến p3 đã xóa
('img7', 'p4', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 1, 1),
('img8', 'p5', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 1, 1),
('img9', 'p6', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1, 1);

-- 4. Amenities
INSERT INTO `property_amenities` (`id`, `property_id`, `amenity_name`) VALUES
('am1', 'p1', 'Hồ bơi vô cực'),
('am2', 'p1', 'Phòng Gym'),
('am3', 'p1', 'Siêu thị VinMart'),
('am4', 'p1', 'Trường học quốc tế'),
('am5', 'p1', 'Bãi đỗ xe ô tô'),
('am6', 'p2', 'Gần Lotte Mart'),
('am7', 'p2', 'Mặt tiền kinh doanh'),
('am8', 'p2', 'Bệnh viện FV'),
('am9', 'p6', 'Tuyến Metro số 1'),
('am10', 'p6', 'Hồ bơi'),
('am11', 'p6', 'Gym');

-- 5. POIs
INSERT INTO `points_of_interest` (`id`, `property_id`, `name`, `category`, `distance`, `rating`) VALUES
('poi1', 'p1', 'Saigon Pearl International School', 'school', 450, 4.6),
('poi2', 'p1', 'Vincom Center Landmark 81', 'supermarket', 800, 4.5),
('poi3', 'p1', 'Bệnh viện Đa khoa Quốc tế Vinmec', 'hospital', 1200, 4.8),
('poi4', 'p2', 'Lotte Mart Nguyễn Thị Thập', 'supermarket', 350, 4.6),
('poi5', 'p2', 'Trường Quốc tế Vinschool Q7', 'school', 600, 4.5),
('poi6', 'p2', 'Bệnh viện Tim Tâm Đức', 'hospital', 900, 4.4),
('poi7', 'p6', 'Ga Metro Thảo Điền', 'transport', 300, 4.7),
('poi8', 'p6', 'Siêu thị An Phú', 'supermarket', 400, 4.3);

-- 6. Appointments
INSERT INTO `appointments` (`id`, `property_id`, `property_title`, `property_image`, `buyer_id`, `buyer_name`, `buyer_phone`, `buyer_email`, `agent_id`, `agent_name`, `appointment_date`, `appointment_time`, `status`, `tour_type`, `note`, `created_at`) VALUES
('a1', 'p1', 'Căn hộ Vinhomes Central Park', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'u1', 'Nguyễn Minh Anh', '0901234567', 'minhanh@gmail.com', 'u2', 'Trần Văn Bảo', '2026-08-18', '09:00', 'confirmed', 'in_person', 'Muốn xem buổi sáng, có mang theo gia đình', '2026-08-14 10:00:00'),
('a2', 'p2', 'Nhà phố Nguyễn Thị Thập', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'u5', 'Phạm Thu Hà', '0945678912', 'thuha@gmail.com', 'u2', 'Trần Văn Bảo', '2026-08-19', '14:30', 'pending', 'in_person', 'Quan tâm mở văn phòng đại diện', '2026-08-15 08:30:00'),
('a3', 'p6', 'Studio Masteri Thảo Điền', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'u1', 'Nguyễn Minh Anh', '0901234567', 'minhanh@gmail.com', 'u2', 'Trần Văn Bảo', '2026-08-12', '10:00', 'completed', 'video', 'Xem nhà online qua video call', '2026-08-10 11:00:00');

-- 7. Favorites
INSERT INTO `favorites` (`id`, `user_id`, `property_id`) VALUES
('fav1', 'u1', 'p1'),
('fav2', 'u1', 'p6'),
('fav3', 'u5', 'p2');

-- 8. Chat Threads & Messages
INSERT INTO `chat_threads` (`id`, `buyer_id`, `agent_id`, `property_id`, `property_title`, `property_thumbnail`, `last_message`, `last_message_time`, `created_at`) VALUES
('c1', 'u1', 'u2', 'p1', 'Căn hộ Vinhomes Central Park', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Đã xác nhận lịch xem nhà lúc 9:00 sáng Thứ Hai!', '10:30', '2026-08-14 09:00:00'),
('c2', 'u5', 'u2', 'p2', 'Nhà phố Nguyễn Thị Thập', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Tôi có thể xem thêm ảnh mặt bằng tầng trệt không?', 'Hôm qua', '2026-08-14 14:00:00');

INSERT INTO `chat_messages` (`id`, `thread_id`, `sender_id`, `content`, `message_type`, `is_read`, `created_at`) VALUES
('m1', 'c1', 'u1', 'Chào anh, tôi quan tâm căn hộ Vinhomes Central Park này.', 'text', 1, '2026-08-14 09:15:00'),
('m2', 'c1', 'u2', 'Chào bạn! Căn hộ này view sông rất thoáng mát và nội thất còn mới 100%.', 'text', 1, '2026-08-14 09:18:00'),
('m3', 'c1', 'u1', 'Tôi muốn đặt lịch xem nhà vào sáng thứ Hai tuần tới.', 'text', 1, '2026-08-14 09:20:00'),
('m4', 'c1', 'u2', 'Đã xác nhận lịch xem nhà lúc 9:00 sáng Thứ Hai!', 'text', 0, '2026-08-14 10:30:00');

-- 9. Transactions
INSERT INTO `transactions` (`id`, `property_id`, `property_title`, `property_image`, `buyer_id`, `buyer_name`, `agent_id`, `agent_name`, `amount`, `payment_method`, `status`, `receipt_id`, `created_at`) VALUES
('t1', 'p1', 'Căn hộ Vinhomes Central Park', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'u1', 'Nguyễn Minh Anh', 'u2', 'Trần Văn Bảo', 5000000.00, 'vnpay', 'completed', 'REC-20260814-001', '2026-08-14 16:05:00');

-- 10. Reports
INSERT INTO `reports` (`id`, `reporter_id`, `reporter_name`, `property_id`, `property_title`, `reason`, `status`, `created_at`) VALUES
-- ('r1', 'u1', 'Nguyễn Minh Anh', 'p3', 'Đất nền dự án Aqua City', 'Thông tin giấy tờ pháp lý cần xác minh thêm', 'pending', '2026-08-14 15:00:00');  -- removed: liên quan đến p3 đã xóa

-- 11. Audit Logs
INSERT INTO `audit_logs` (`id`, `actor_id`, `actor`, `actor_role`, `action`, `target`, `created_at`) VALUES
('log1', 'u2', 'Trần Văn Bảo (Môi giới)', 'agent', 'posted new property', 'Căn hộ Vinhomes Central Park', '2026-08-01 10:00:00'),
('log2', 'u3', 'Lê Thị Hương (Admin)', 'admin', 'approved listing', '#p1 — Căn hộ Vinhomes Central Park', '2026-08-01 10:30:00'),
('log3', 'u1', 'Nguyễn Minh Anh (Khách)', 'buyer', 'completed deposit', 'Vinhomes Central Park — 5.000.000 VNĐ (VNPay)', '2026-08-14 16:05:00');
