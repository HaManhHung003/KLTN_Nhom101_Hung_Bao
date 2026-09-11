-- ====================================================================
-- HỆ THỐNG MUA BÁN & CHO THUÊ BẤT ĐỘNG SẢN (BDS PRO)
-- FULL DATABASE SCRIPT: SCHEMA ĐỒNG BỘ VỚI TYPEORM ENTITIES
-- ĐỒ ÁN KHÓA LUẬN TỐT NGHIỆP - NHÓM 101
-- Cập nhật: 09/2026 – Thêm OTP, chuẩn hóa theo entity thật
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `bds_pro_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `bds_pro_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ====================================================================
-- XÓA BẢNG CŨ (theo thứ tự phụ thuộc FK)
-- ====================================================================
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `conversations`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_threads`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `pois`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `properties`;
DROP TABLE IF EXISTS `users`;

-- ====================================================================
-- BẢNG 1: NGƯỜI DÙNG (USERS)
-- Chuẩn theo User entity của TypeORM
-- ====================================================================
CREATE TABLE `users` (
    `id`                  VARCHAR(36)   NOT NULL PRIMARY KEY,
    `name`                VARCHAR(150)  NOT NULL,
    `email`               VARCHAR(191)  NOT NULL,
    `phone`               VARCHAR(20)   NULL,
    `password_hash`       VARCHAR(255)  NOT NULL,
    `role`                ENUM('buyer','agent','admin') NOT NULL DEFAULT 'buyer',
    `avatar`              VARCHAR(500)  NULL,
    `verified`            TINYINT(1)    NOT NULL DEFAULT 0,
    `active`              TINYINT(1)    NULL DEFAULT 1,
    `refresh_token_hash`  VARCHAR(255)  NULL,
    `otp_code`            VARCHAR(10)   NULL,
    `otp_expiry`          DATETIME      NULL,
    `created_at`          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY `UQ_users_email` (`email`),
    INDEX `IDX_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 2: BẤT ĐỘNG SẢN (PROPERTIES)
-- Chuẩn theo Property entity của TypeORM
-- ====================================================================
CREATE TABLE `properties` (
    `id`               VARCHAR(36)   NOT NULL PRIMARY KEY,
    `title`            VARCHAR(255)  NOT NULL,
    `type`             ENUM('apartment','house','land','office','villa') NOT NULL,
    `transaction_type` ENUM('sale','rent') NOT NULL,
    `price`            DECIMAL(15,2) NOT NULL DEFAULT 0,
    `area`             DECIMAL(10,2) NOT NULL DEFAULT 0,
    `legal_status`     ENUM('so_hong','so_do','hop_dong','cho_so') NOT NULL DEFAULT 'cho_so',
    `address`          VARCHAR(500)  NOT NULL,
    `district`         VARCHAR(120)  NOT NULL,
    `city`             VARCHAR(120)  NOT NULL,
    `latitude`         DOUBLE        NOT NULL DEFAULT 0,
    `longitude`        DOUBLE        NOT NULL DEFAULT 0,
    `amenities`        JSON          NULL,
    `status`           ENUM('draft','pending','active','sold','expired','rejected') NOT NULL DEFAULT 'pending',
    `view_count`       INT           NOT NULL DEFAULT 0,
    `favorite_count`   INT           NOT NULL DEFAULT 0,
    `description`      TEXT          NOT NULL,
    `bedrooms`         INT           NULL,
    `bathrooms`        INT           NULL,
    `ai_score`         INT           NULL,
    `reject_reason`    VARCHAR(500)  NULL,
    `owner_id`         VARCHAR(36)   NOT NULL,
    `created_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_properties_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `IDX_properties_status_trans` (`status`, `transaction_type`),
    INDEX `IDX_properties_city_district` (`city`, `district`),
    INDEX `IDX_properties_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 3: MEDIA (ẢNH/VIDEO BĐS)
-- Chuẩn theo Media entity của TypeORM (tên bảng: media)
-- ====================================================================
CREATE TABLE `media` (
    `id`          VARCHAR(36)   NOT NULL PRIMARY KEY,
    `url`         VARCHAR(1000) NOT NULL,
    `type`        VARCHAR(20)   NOT NULL DEFAULT 'image',
    `sort_order`  INT           NOT NULL DEFAULT 0,
    `property_id` VARCHAR(36)   NOT NULL,
    `created_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_media_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `IDX_media_property` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 4: ĐIỂM TIỆN ÍCH LÂN CẬN (POIS)
-- Chuẩn theo Poi entity của TypeORM (tên bảng: pois)
-- ====================================================================
CREATE TABLE `pois` (
    `id`          VARCHAR(36)   NOT NULL PRIMARY KEY,
    `name`        VARCHAR(200)  NOT NULL,
    `category`    ENUM('school','hospital','supermarket','transport') NOT NULL,
    `distance`    INT           NOT NULL DEFAULT 0,
    `rating`      DECIMAL(3,1)  NULL DEFAULT 4.5,
    `property_id` VARCHAR(36)   NOT NULL,
    `created_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_pois_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `IDX_pois_property` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 5: YÊU THÍCH (FAVORITES)
-- Chuẩn theo Favorite entity của TypeORM
-- ====================================================================
CREATE TABLE `favorites` (
    `id`          VARCHAR(36) NOT NULL PRIMARY KEY,
    `user_id`     VARCHAR(36) NOT NULL,
    `property_id` VARCHAR(36) NOT NULL,
    `created_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY `UQ_favorites_user_property` (`user_id`, `property_id`),
    CONSTRAINT `FK_favorites_user`     FOREIGN KEY (`user_id`)     REFERENCES `users`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_favorites_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 6: LỊCH HẸN XEM NHÀ (APPOINTMENTS)
-- Chuẩn theo Appointment entity của TypeORM
-- ====================================================================
CREATE TABLE `appointments` (
    `id`               VARCHAR(36)  NOT NULL PRIMARY KEY,
    `property_id`      VARCHAR(36)  NOT NULL,
    `buyer_id`         VARCHAR(36)  NOT NULL,
    `agent_id`         VARCHAR(36)  NOT NULL,
    `appointment_date` DATE         NOT NULL,
    `appointment_time` VARCHAR(10)  NOT NULL,
    `status`           ENUM('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
    `tour_type`        ENUM('in_person','video') NOT NULL DEFAULT 'in_person',
    `note`             TEXT         NULL,
    `created_at`       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_appointments_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_appointments_buyer`    FOREIGN KEY (`buyer_id`)    REFERENCES `users`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_appointments_agent`    FOREIGN KEY (`agent_id`)    REFERENCES `users`      (`id`) ON DELETE CASCADE,
    INDEX `IDX_appointments_buyer`  (`buyer_id`),
    INDEX `IDX_appointments_agent`  (`agent_id`),
    INDEX `IDX_appointments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 7: GIAO DỊCH / ĐẶT CỌC (TRANSACTIONS)
-- ====================================================================
CREATE TABLE `transactions` (
    `id`             VARCHAR(36)   NOT NULL PRIMARY KEY,
    `property_id`    VARCHAR(36)   NOT NULL,
    `buyer_id`       VARCHAR(36)   NOT NULL,
    `agent_id`       VARCHAR(36)   NOT NULL,
    `amount`         DECIMAL(15,2) NOT NULL,
    `payment_method` ENUM('vnpay','momo','bank_transfer') NOT NULL DEFAULT 'vnpay',
    `status`         ENUM('pending','completed','failed','refunded','disputed') NOT NULL DEFAULT 'pending',
    `receipt_id`     VARCHAR(100)  NULL UNIQUE,
    `created_at`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_trans_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_trans_buyer`    FOREIGN KEY (`buyer_id`)    REFERENCES `users`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_trans_agent`    FOREIGN KEY (`agent_id`)    REFERENCES `users`      (`id`) ON DELETE CASCADE,
    INDEX `IDX_trans_buyer`  (`buyer_id`),
    INDEX `IDX_trans_agent`  (`agent_id`),
    INDEX `IDX_trans_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 8: BÁO CÁO VI PHẠM (REPORTS)
-- Chuẩn theo Report entity: reporter_id NULL, property_id NOT NULL
-- ====================================================================
CREATE TABLE `reports` (
    `id`          VARCHAR(36)  NOT NULL PRIMARY KEY,
    `reporter_id` VARCHAR(36)  NULL,
    `property_id` VARCHAR(36)  NOT NULL,
    `reason`      VARCHAR(500) NOT NULL,
    `status`      ENUM('pending','resolved','dismissed') NOT NULL DEFAULT 'pending',
    `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users`      (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_reports_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `IDX_reports_status`   (`status`),
    INDEX `IDX_reports_property` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 9: THÔNG BÁO (NOTIFICATIONS)
-- Chuẩn theo Notification entity: user_id, title, message, type, read, link
-- ====================================================================
CREATE TABLE `notifications` (
    `id`         VARCHAR(36)  NOT NULL PRIMARY KEY,
    `user_id`    VARCHAR(36)  NOT NULL,
    `title`      VARCHAR(200) NOT NULL,
    `message`    TEXT         NOT NULL,
    `type`       ENUM('info','success','warning') NOT NULL DEFAULT 'info',
    `read`       TINYINT(1)   NOT NULL DEFAULT 0,
    `link`       VARCHAR(500) NULL,
    `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `IDX_notifications_user_read` (`user_id`, `read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 10: NHẬT KÝ HOẠT ĐỘNG (ACTIVITY_LOGS)
-- Chuẩn theo ActivityLog entity: actor_id, actor_name, action, detail, ip
-- ====================================================================
CREATE TABLE `activity_logs` (
    `id`         VARCHAR(36)  NOT NULL PRIMARY KEY,
    `actor_id`   VARCHAR(36)  NULL,
    `actor_name` VARCHAR(150) NULL,
    `action`     VARCHAR(100) NOT NULL,
    `detail`     VARCHAR(500) NULL,
    `ip`         VARCHAR(50)  NULL,
    `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `IDX_activity_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 11: CUỘC TRÒ CHUYỆN (CONVERSATIONS)
-- Chuẩn theo Conversation entity TypeORM
-- ====================================================================
CREATE TABLE `conversations` (
    `id`              VARCHAR(36)  NOT NULL PRIMARY KEY,
    `user_a_id`       VARCHAR(36)  NOT NULL,
    `user_b_id`       VARCHAR(36)  NOT NULL,
    `property_id`     VARCHAR(36)  NULL,
    `last_message`    TEXT         NULL,
    `last_message_at` DATETIME     NULL,
    `created_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_conversations_user_a` FOREIGN KEY (`user_a_id`)   REFERENCES `users`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_conversations_user_b` FOREIGN KEY (`user_b_id`)   REFERENCES `users`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_conversations_prop`   FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
    INDEX `IDX_conversations_user_a` (`user_a_id`),
    INDEX `IDX_conversations_user_b` (`user_b_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- BẢNG 12: TIN NHẮN TRỰC TIẾP (MESSAGES)
-- Chuẩn theo Message entity TypeORM
-- ====================================================================
CREATE TABLE `messages` (
    `id`              VARCHAR(36)  NOT NULL PRIMARY KEY,
    `conversation_id` VARCHAR(36)  NOT NULL,
    `sender_id`       VARCHAR(36)  NOT NULL,
    `content`         TEXT         NOT NULL,
    `read_at`         DATETIME     NULL,
    `created_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_messages_conv`   FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_messages_sender` FOREIGN KEY (`sender_id`)       REFERENCES `users`         (`id`) ON DELETE CASCADE,
    INDEX `IDX_messages_conv`   (`conversation_id`),
    INDEX `IDX_messages_sender` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- DỮ LIỆU MẪU
-- Mật khẩu tất cả tài khoản: 123456
-- Hash bcrypt của "123456" (rounds=10)
-- ====================================================================

-- TÀI KHOẢN MẪU
-- admin@bdspro.vn   / 123456  → role: admin
-- vanbao@bdspro.vn  / 123456  → role: agent  (host đăng bài)
-- minhanh@gmail.com / 123456  → role: buyer
-- Hash bcrypt của "123456" (bcryptjs rounds=10): $2a$10$6Q1vDRLF1yoROA3ra4d00.UGVVQoWx34Dr1Z0M0W6KdolISCnZj.a
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `avatar`, `verified`, `active`, `created_at`) VALUES
('u1', 'Nguyễn Minh Anh',  'minhanh@gmail.com', '0901234567', '$2a$10$6Q1vDRLF1yoROA3ra4d00.UGVVQoWx34Dr1Z0M0W6KdolISCnZj.a', 'buyer', 'https://api.dicebear.com/7.x/initials/svg?seed=NMA',  1, 1, NOW()),
('u2', 'Trần Văn Bảo',     'vanbao@bdspro.vn',  '0912345678', '$2a$10$6Q1vDRLF1yoROA3ra4d00.UGVVQoWx34Dr1Z0M0W6KdolISCnZj.a', 'agent', 'https://api.dicebear.com/7.x/initials/svg?seed=TVB', 1, 1, NOW()),
('u3', 'Lê Thị Hương',     'admin@bdspro.vn',   '0923456789', '$2a$10$6Q1vDRLF1yoROA3ra4d00.UGVVQoWx34Dr1Z0M0W6KdolISCnZj.a', 'admin','https://api.dicebear.com/7.x/initials/svg?seed=LTH', 1, 1, NOW());

-- BẤT ĐỘNG SẢN MẪU
INSERT INTO `properties` (`id`, `title`, `type`, `transaction_type`, `price`, `area`, `legal_status`, `address`, `district`, `city`, `latitude`, `longitude`, `amenities`, `status`, `view_count`, `favorite_count`, `description`, `bedrooms`, `bathrooms`, `ai_score`, `owner_id`, `created_at`) VALUES
('p1', 'Căn hộ cao cấp Vinhomes Central Park – View sông Sài Gòn', 'apartment', 'rent',
 25000000, 85, 'so_hong', '208 Nguyễn Hữu Cảnh, Bình Thạnh', 'Bình Thạnh', 'TP. Hồ Chí Minh',
 10.7951, 106.7215, '["Hồ bơi","Gym","Siêu thị","Bãi đỗ xe"]', 'active',
 1240, 89, 'Căn hộ 2PN full nội thất cao cấp, view sông thoáng mát.', 2, 2, 92, 'u2', NOW()),

('p2', 'Nhà phố 4 tầng mặt tiền Nguyễn Thị Thập, Quận 7', 'house', 'sale',
 12500000000, 120, 'so_hong', '45 Nguyễn Thị Thập, Quận 7', 'Quận 7', 'TP. Hồ Chí Minh',
 10.7340, 106.7210, '["Mặt tiền kinh doanh","Gần Lotte Mart","Bệnh viện FV"]', 'active',
 856, 45, 'Nhà phố kinh doanh, mặt tiền 5m, thiết kế hiện đại.', 4, 3, 88, 'u2', NOW()),

('p3', 'Biệt thự liền kề Vinhomes Ocean Park – Hà Nội', 'villa', 'sale',
 18500000000, 200, 'so_hong', 'P5-12, Vinhomes Ocean Park, Gia Lâm', 'Gia Lâm', 'Hà Nội',
 21.0120, 105.9320, '["Sân vườn","Hồ bơi riêng","An ninh 24/7"]', 'pending',
 120, 10, 'Biệt thự 3 tầng, thiết kế tân cổ điển, sân vườn rộng.', 5, 4, 90, 'u2', NOW()),

('p4', 'Studio Masteri Thảo Điền – Full nội thất gần Metro', 'apartment', 'rent',
 12000000, 45, 'so_do', '159 Xa lộ Hà Nội, Thảo Điền', 'Quận 2', 'TP. Hồ Chí Minh',
 10.8030, 106.7380, '["Tuyến Metro số 1","Hồ bơi","Gym"]', 'active',
 945, 67, 'Studio hiện đại, phù hợp expat và chuyên gia trẻ.', 1, 1, 94, 'u2', NOW());

-- MEDIA (ẢNH BĐS)
INSERT INTO `media` (`id`, `url`, `type`, `sort_order`, `property_id`, `created_at`) VALUES
('m1', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'image', 1, 'p1', NOW()),
('m2', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'image', 2, 'p1', NOW()),
('m3', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'image', 1, 'p2', NOW()),
('m4', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'image', 1, 'p3', NOW()),
('m5', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'image', 1, 'p4', NOW());

-- YÊU THÍCH
INSERT INTO `favorites` (`id`, `user_id`, `property_id`, `created_at`) VALUES
('fav1', 'u1', 'p1', NOW()),
('fav2', 'u1', 'p4', NOW());

-- LỊCH HẸN
INSERT INTO `appointments` (`id`, `property_id`, `buyer_id`, `agent_id`, `appointment_date`, `appointment_time`, `status`, `tour_type`, `note`, `created_at`) VALUES
('a1', 'p1', 'u1', 'u2', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00', 'confirmed',  'in_person', 'Muốn xem buổi sáng, có mang theo gia đình', NOW()),
('a2', 'p2', 'u1', 'u2', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:30', 'pending',    'in_person', 'Quan tâm mở văn phòng đại diện', NOW()),
('a3', 'p4', 'u1', 'u2', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '10:00', 'completed',  'video',     'Xem nhà online qua video call', NOW());

-- CUỘC TRÒ CHUYỆN MẪU (CHAT CONVERSATIONS)
INSERT INTO `conversations` (`id`, `user_a_id`, `user_b_id`, `property_id`, `last_message`, `last_message_at`, `created_at`, `updated_at`) VALUES
('conv1', 'u1', 'u2', 'p1', 'Chào anh Bảo, tôi rất quan tâm đến căn hộ Vinhomes Central Park này. Căn hộ còn phòng trống và có thể dọn vào ở ngay không?', NOW(), NOW(), NOW());

-- TIN NHẮN MẪU (CHAT MESSAGES)
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `read_at`, `created_at`, `updated_at`) VALUES
('msg1', 'conv1', 'u1', 'Chào anh Bảo, tôi rất quan tâm đến căn hộ Vinhomes Central Park này. Căn hộ còn phòng trống và có thể dọn vào ở ngay không?', NOW(), NOW(), NOW()),
('msg2', 'conv1', 'u2', 'Chào bạn Minh Anh! Căn hộ này hiện đang trống và sẵn sàng bàn giao dọn vào ở ngay ạ. Bạn có muốn hẹn lịch đi xem thực tế không?', NOW(), NOW(), NOW());

