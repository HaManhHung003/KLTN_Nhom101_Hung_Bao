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
    UNIQUE KEY `UQ_users_phone` (`phone`),
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
('u3', 'Lê Thị Hương',     'admin@bdspro.vn',   '0923456789', '$2a$10$6Q1vDRLF1yoROA3ra4d00.UGVVQoWx34Dr1Z0M0W6KdolISCnZj.a', 'admin','https://api.dicebear.com/7.x/initials/svg?seed=LTH', 1, 1, NOW()),
('u4', 'Phạm Hoàng Nam',    'hoangnam@bdspro.vn', '0934567890', '$2a$10$6Q1vDRLF1yoROA3ra4d00.UGVVQoWx34Dr1Z0M0W6KdolISCnZj.a', 'agent', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces', 1, 1, NOW());

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

-- BẤT ĐỘNG SẢN BỔ SUNG (p5 -> p20: Đa dạng phân khúc, khu vực, giá bán và cho thuê)
INSERT INTO `properties` (`id`, `title`, `type`, `transaction_type`, `price`, `area`, `legal_status`, `address`, `district`, `city`, `latitude`, `longitude`, `amenities`, `status`, `view_count`, `favorite_count`, `description`, `bedrooms`, `bathrooms`, `ai_score`, `owner_id`, `created_at`) VALUES
('p5', 'Căn hộ Penthouse The River Thủ Thiêm – Trực diện sông Sài Gòn', 'apartment', 'sale', 32000000000, 240, 'so_hong', 'Khu chức năng số 3, KĐT mới Thủ Thiêm, TP. Thủ Đức', 'Quận 2', 'TP. Hồ Chí Minh', 10.7832, 106.7155, '["Hồ bơi vô cực","Sân golf mini","Phòng tiệc Cigar Wine","Bến du thuyền"]', 'active', 2450, 142, 'Siêu phẩm Penthouse The River Thủ Thiêm bàn giao thô tiêu chuẩn cao cấp, trần cao 4.2m view ôm trọn sông Sài Gòn.', 4, 4, 96, 'u2', NOW()),
('p6', 'Nhà phố cổ điển Hai Bà Trưng, Phường Tân Định, Quận 1', 'house', 'sale', 16800000000, 95, 'so_hong', '214 Hai Bà Trưng, Phường Tân Định, Quận 1', 'Quận 1', 'TP. Hồ Chí Minh', 10.7915, 106.6908, '["Mặt tiền đường lớn","Thang máy gia đình","Gần chợ Tân Định"]', 'active', 1890, 98, 'Nhà phố 1 trệt 3 lầu kiên cố mặt tiền trung tâm Quận 1, đang cho thuê 65tr/tháng.', 3, 3, 91, 'u2', NOW()),
('p7', 'Căn hộ dịch vụ cao cấp Saigon Pavilion Bà Huyện Thanh Quan, Quận 3', 'apartment', 'rent', 18000000, 65, 'so_hong', '53-55 Bà Huyện Thanh Quan, Phường Võ Thị Sáu, Quận 3', 'Quận 3', 'TP. Hồ Chí Minh', 10.7788, 106.6872, '["Hồ bơi sân thượng","Phòng xông hơi Sauna","Dọn phòng 2 lần/tuần"]', 'active', 920, 54, 'Căn hộ 1 phòng ngủ full nội thất phong cách Bắc Âu, bếp từ Bosch, bồn tắm nằm cao cấp.', 1, 1, 89, 'u4', NOW()),
('p8', 'Biệt thự đơn lập Chateau Phú Mỹ Hưng – Không gian nghỉ dưỡng ven sông', 'villa', 'sale', 45000000000, 380, 'so_hong', 'Khu biệt thự Lâu Đài Chateau, Tân Phú, Quận 7', 'Quận 7', 'TP. Hồ Chí Minh', 10.7250, 106.7180, '["Sân vườn cảnh quan","Hồ bơi nước muối","Hầm rượu vang","Garage 3 ô tô"]', 'active', 3100, 185, 'Dinh thự mang kiến trúc cổ điển Châu Âu quý tộc trong compound khép kín đắt giá nhất Phú Mỹ Hưng.', 5, 5, 98, 'u4', NOW()),
('p9', 'Căn hộ 2PN The Sun Avenue Mai Chí Thọ – Nhà mới tinh decor sang trọng', 'apartment', 'rent', 15000000, 75, 'so_hong', '28 Mai Chí Thọ, Phường An Phú, TP. Thủ Đức', 'Quận 2', 'TP. Hồ Chí Minh', 10.7885, 106.7580, '["Hồ bơi tràn viền","Khu nướng BBQ","Phòng đọc sách"]', 'active', 1420, 73, 'Căn hộ lầu cao tháp 4 view thoáng mát Mai Chí Thọ, đầy đủ tivi, tủ lạnh, máy giặt sấy.', 2, 2, 90, 'u2', NOW()),
('p10', 'Nhà riêng hẻm xe hơi Lê Văn Sỹ, Phường 13, Quận Phú Nhuận', 'house', 'sale', 8900000000, 78, 'so_hong', '380 Lê Văn Sỹ, Phường 13, Quận Phú Nhuận', 'Phú Nhuận', 'TP. Hồ Chí Minh', 10.7925, 106.6740, '["Hẻm xe tải 6m thông thoáng","Khu dân trí cao","Gần chợ Lê Văn Sỹ"]', 'active', 1670, 84, 'Nhà xây 1 trệt 2 lầu sân thượng kiên cố, hoàn công 2023. Hẻm thẳng đẹp xe hơi ngủ trong nhà.', 3, 3, 87, 'u4', NOW()),
('p11', 'Căn hộ chung cư Mizuki Park Bình Chánh – Không gian xanh ven sông', 'apartment', 'sale', 2950000000, 72, 'so_hong', 'Đại lộ Nguyễn Văn Linh, Bình Hưng, Bình Chánh', 'Bình Chánh', 'TP. Hồ Chí Minh', 10.7180, 106.6620, '["Kênh đào sinh thái","Đường dạo bộ ven sông","Hồ bơi resort"]', 'active', 2150, 110, 'Căn hộ 2PN 2WC tầng trung block MP4, view kênh đào thoáng mát quanh năm.', 2, 2, 93, 'u2', NOW()),
('p12', 'Đất nền thổ cư sổ đỏ riêng Đường số 8, Phường Linh Xuân, TP. Thủ Đức', 'land', 'sale', 3400000000, 110, 'so_do', 'Đường số 8, Phường Linh Xuân, TP. Thủ Đức', 'Thủ Đức', 'TP. Hồ Chí Minh', 10.8750, 106.7720, '["Điện âm nước máy","Đường nhựa 8m vỉa hè","Xây dựng tự do"]', 'active', 1480, 67, 'Lô đất vuông vức ngang 5m x dài 22m, 100% thổ cư ODT, sát Làng Đại Học Quốc Gia.', 0, 0, 85, 'u4', NOW()),
('p13', 'Mặt bằng kinh doanh văn phòng Shophouse Sala Đại Quang Minh', 'office', 'rent', 42000000, 140, 'so_hong', 'Đường Nguyễn Cơ Thạch, KĐT Sala, TP. Thủ Đức', 'Quận 2', 'TP. Hồ Chí Minh', 10.7710, 106.7190, '["Mặt tiền đường 45m","Hầm đỗ xe thông minh","Điều hòa Daikin"]', 'active', 1780, 92, 'Shophouse góc 2 mặt tiền khu Saritown Sala. Trần cao thoáng đãng, sàn lát đá Granite.', 2, 2, 92, 'u2', NOW()),
('p14', 'Căn hộ 1PN Vinhomes Grand Park Origami – Đầy đủ tiện ích All-in-one', 'apartment', 'rent', 7500000, 48, 'hop_dong', 'Đại đô thị Vinhomes Grand Park, Long Thạnh Mỹ, TP. Thủ Đức', 'Thủ Đức', 'TP. Hồ Chí Minh', 10.8440, 106.8370, '["Đại công viên 36ha","Biển hồ nhân tạo","Xe buýt điện VinBus"]', 'active', 2890, 140, 'Căn hộ Studio + 1 phong cách Nhật Bản tối giản, đầy đủ bếp, giường, máy lạnh Inverter.', 1, 1, 88, 'u4', NOW()),
('p15', 'Nhà phố liền kề Vạn Phúc City ven sông Sài Gòn, TP. Thủ Đức', 'house', 'sale', 19500000000, 150, 'so_hong', 'Khu đô thị Vạn Phúc City, Quốc lộ 13, Hiệp Bình Phước', 'Thủ Đức', 'TP. Hồ Chí Minh', 10.8350, 106.7120, '["Hồ Đại Nhật 16ha","Công viên nhạc nước","Bến du thuyền Dragon Bay"]', 'active', 2100, 115, 'Nhà phố thương mại xây dựng 1 hầm 4 tầng, bề ngang 7m x dài 21m cực kỳ đẳng cấp.', 4, 5, 95, 'u2', NOW()),
('p16', 'Căn hộ Eco Green Saigon Nguyễn Văn Linh – View công viên Hương Tràm', 'apartment', 'sale', 4200000000, 68, 'so_hong', '39 Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7', 'Quận 7', 'TP. Hồ Chí Minh', 10.7420, 106.7195, '["Công viên nội khu 3.5ha","Khách sạn Hyatt 69 tầng","Hồ bơi resort"]', 'active', 1750, 95, 'Căn hộ 2PN 2WC tòa HR3, ban công Đông Nam mát mẻ cả ngày, thiết bị vệ sinh Duravit Đức.', 2, 2, 91, 'u4', NOW()),
('p17', 'Căn hộ Duplex cao cấp Diamond Island Đảo Kim Cương – 3 mặt sông', 'apartment', 'rent', 55000000, 165, 'so_hong', 'Số 1 Đường số 104, Phường Bình Trưng Tây, TP. Thủ Đức', 'Quận 2', 'TP. Hồ Chí Minh', 10.7675, 106.7450, '["Hồ bơi nước khoáng 2300m²","Lâu đài thiên văn","Bến du thuyền riêng"]', 'active', 2200, 130, 'Căn hộ thông tầng Duplex tháp Brilliant view trực diện ngã 3 sông Sài Gòn tuyệt đẹp.', 3, 3, 97, 'u2', NOW()),
('p18', 'Nhà mặt tiền đường số 7, Khu Cư xá Đô Thành, Phường 4, Quận 3', 'house', 'rent', 35000000, 110, 'so_hong', '25 Đường số 7, Cư xá Đô Thành, Phường 4, Quận 3', 'Quận 3', 'TP. Hồ Chí Minh', 10.7735, 106.6820, '["Mặt tiền đường 10m","Khu ẩm thực văn phòng sầm uất","Có hầm xe"]', 'active', 1540, 62, 'Nhà phố 1 trệt 2 lầu ngang 5m x sâu 22m, lý tưởng mở văn phòng công ty hoặc showroom.', 4, 4, 89, 'u4', NOW()),
('p19', 'Đất biệt thự sinh thái KĐT Nam Hòa Xuân – View sông Cổ Cò, Đà Nẵng', 'land', 'sale', 5800000000, 250, 'so_do', 'Đường Nguyễn Phước Lan, KĐT Nam Hòa Xuân, Ngũ Hành Sơn', 'Ngũ Hành Sơn', 'Đà Nẵng', 15.9920, 108.2380, '["Mặt tiền 15m lề 5m","Hạ tầng ngầm hóa","Sát sông Cổ Cò"]', 'active', 1820, 76, 'Lô góc 2 mặt tiền biệt thự ngang 10m x dài 25m hướng Đông Nam, cách bãi tắm 7 phút.', 0, 0, 92, 'u2', NOW()),
('p20', 'Căn hộ 2PN Vinhomes Smart City Tây Mỗ – Hà Nội, bàn giao full đồ', 'apartment', 'rent', 9500000, 55, 'so_hong', 'Đại lộ Thăng Long, Tây Mỗ, Nam Từ Liêm', 'Nam Từ Liêm', 'Hà Nội', 20.9980, 105.7450, '["Vườn Nhật Zen Park 6ha","Hồ điều hòa cát trắng","TTTM Vincom Mega Mall"]', 'active', 2340, 105, 'Căn hộ 2PN 1WC tầng 15 phân khu Sapphire view công viên trung tâm, full đồ.', 2, 1, 89, 'u4', NOW());


-- ====================================================================
-- BẤT ĐỘNG SẢN MẪU CHUẨN XÁC THỰC TẾ (20 CĂN HỘ & BĐS NỔI BẬT)
-- ====================================================================
INSERT INTO `properties` (`id`, `title`, `type`, `transaction_type`, `price`, `area`, `legal_status`, `address`, `district`, `city`, `latitude`, `longitude`, `amenities`, `status`, `view_count`, `favorite_count`, `description`, `bedrooms`, `bathrooms`, `ai_score`, `owner_id`, `created_at`) VALUES
('p1', 'Căn hộ 2PN Vinhomes Central Park – Tòa Park 6 View Sông Sài Gòn & Landmark 81', 'apartment', 'rent', 24000000.00, 82.50, 'so_hong', 'Tòa Park 6, KĐT Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, Phường 22', 'Bình Thạnh', 'TP. Hồ Chí Minh', 10.7951, 106.7215, '["Hồ bơi tràn bờ","Công viên ven sông 14ha","TTTM Landmark 81","Trường liên cấp Vinschool","Bệnh viện Vinmec","Phòng Gym Technogym"]', 'active', 3420, 185, 'Căn hộ tầng 25 tòa Park 6 thuộc đại đô thị Vinhomes Central Park. Thiết kế 2 phòng ngủ, 2 phòng tắm với ban công kính rộng trực diện sông Sài Gòn và tòa tháp Landmark 81. Nội thất full cao cấp phong cách Modern Luxury: Sofa da Ý, TV Sony 65 inch, tủ lạnh side-by-side Samsung, máy rửa bát Bosch, giường nệm cao su thiên nhiên. Đã bao gồm phí quản lý tòa nhà, dọn vào ở ngay.', 2, 2, 96, 'u2', NOW()),
('p10', 'Căn hộ HaDo Centrosa Garden Quận 10 – Tháp Iris 1 Full Nội Thất Sang Trọng', 'apartment', 'sale', 9800000000.00, 86.00, 'so_hong', 'Tháp Iris 1, HaDo Centrosa Garden, 200 Đường 3 Tháng 2, Phường 12', 'Quận 10', 'TP. Hồ Chí Minh', 10.7765, 106.678, '["Hồ bơi tràn chân mây 50m","Vườn treo Babylon chân mây","21 khu vườn cảnh quan","Siêu thị Finelife","Trường học quốc tế nội khu"]', 'active', 3102, 189, 'Ốc đảo xanh giữa trung tâm Quận 10 được phát triển bởi Tập đoàn Hà Đô. Căn 2 phòng ngủ + 1 phòng đa năng 2WC, diện tích 86m². Vị trí góc 2 mặt thoáng view nhìn về trung tâm Quận 1 pháo hoa Landmark 81 cực đẹp. Sổ hồng vĩnh viễn đã cấp, hỗ trợ vay ngân hàng 70%.', 2, 2, 96, 'u4', NOW()),
('p11', 'Căn hộ The Sun Avenue Mai Chí Thọ – 2PN Tháp 3 View Đẹp Thoáng Mát', 'apartment', 'rent', 15500000.00, 75.00, 'so_hong', 'Tháp SAV.3, The Sun Avenue, 28 Mai Chí Thọ, Phường An Phú', 'Quận 2', 'TP. Hồ Chí Minh', 10.7885, 106.758, '["Hồ bơi tràn viền view đại lộ","Phố thương mại shophouse trải dài 1.4km","Khu gym & yoga","Bảo vệ camera 24/24"]', 'active', 1850, 98, 'Căn hộ 2 phòng ngủ 2WC tầng 18 tháp 3 The Sun Avenue do Novaland làm chủ đầu tư. Di chuyển chỉ 7 phút qua Hầm Thủ Thiêm là đến Quận 1. Nhà đã trang bị đầy đủ máy giặt, tủ lạnh, lò vi sóng, bếp điện từ, tivi thông minh, 3 máy lạnh Inverter. Giá thuê tốt nhất trục Mai Chí Thọ.', 2, 2, 91, 'u2', NOW()),
('p12', 'Căn hộ Duplex Đảo Kim Cương Diamond Island – 3 Mặt Sông Sài Gòn Độc Bản', 'apartment', 'rent', 58000000.00, 165.00, 'so_hong', 'Tháp Brilliant, Đảo Kim Cương, Số 1 Đường 104, Phường Bình Trưng Tây', 'Quận 2', 'TP. Hồ Chí Minh', 10.7675, 106.745, '["Hòn đảo tự nhiên duy nhất trong lòng TP","Hồ bơi khoáng mặn 2300m²","Lâu đài thiên văn trẻ em","Bến du thuyền tư nhân","Khu spa & gym view sông"]', 'active', 2750, 178, 'Căn hộ thông tầng Duplex tháp Brilliant cao cấp nhất Đảo Kim Cương. Thiết kế 3 phòng ngủ 3 phòng tắm với phòng khách trần cao 6m lộng lẫy kính kịch trần ngắm trọn khúc uốn sông Giồng Ông Tố và sông Sài Gòn. Nội thất thiết kế riêng theo phong cách Modern Classic, bồn tắm sục Jacuzzi massage, view hoàng hôn đỉnh chóp.', 3, 3, 97, 'u2', NOW()),
('p13', 'Căn hộ 2PN Vinhomes Smart City Tây Mỗ – Hà Nội, Phân Khu Tonkin Đẳng Cấp', 'apartment', 'sale', 3650000000.00, 65.00, 'so_hong', 'Tòa TK1, Phân khu The Tonkin, Vinhomes Smart City, Đại Lộ Thăng Long', 'Nam Từ Liêm', 'Hà Nội', 20.998, 105.745, '["Vườn Nhật Zen Park 6.1ha","Công viên trung tâm hồ cát trắng","TTTM Vincom Mega Mall","Hệ sinh thái thông minh 4 trục AI","Bể bơi nhiệt đới ngoài trời"]', 'active', 2890, 147, 'Căn hộ 2 phòng ngủ 2WC tòa TK1 phân khu The Tonkin chuẩn Ruby cao cấp nhất Vinhomes Smart City. Phong cách kiến trúc Indochine Đông Dương kết hợp hiện đại. Bàn giao thiết bị liền tường nhập khẩu thương hiệu Bosch, Grohe, hệ thống điều hòa Multi âm trần cao cấp. View nội khu vườn nhiệt đới cực kỳ thư thái.', 2, 2, 94, 'u4', NOW()),
('p14', 'Căn hộ Studio Vinhomes Smart City Sapphire – View Hồ Điều Hòa Cát Trắng', 'apartment', 'rent', 6800000.00, 32.50, 'so_hong', 'Tòa S2.03, Phân khu Sapphire, Vinhomes Smart City, Tây Mỗ', 'Nam Từ Liêm', 'Hà Nội', 20.9965, 105.7435, '["Hệ thống xe VinBus kết nối nội đô","Khu nướng BBQ bãi biển","Sân tập thể thao","Bảo vệ an ninh FaceID"]', 'active', 1720, 89, 'Studio tầng 16 tòa S2.03 view hồ cát trắng lãng mạn. Đã hoàn thiện full nội thất: Sofa nỉ cao cấp, giường ngủ thông minh có hộc kéo, tủ quần áo kịch trần, tủ lạnh Electrolux, máy giặt, điều hòa 2 chiều. Xách vali vào ở ngay, miễn phí gửi xe máy và sử dụng các tiện ích thể thao.', 1, 1, 90, 'u2', NOW()),
('p15', 'Căn hộ Lumière Riverside An Phú – Chuẩn Sống Xanh Hạng Sang Cạnh Ga Metro', 'apartment', 'sale', 7800000000.00, 74.00, 'so_hong', 'Tháp West, Lumière Riverside, 259 Xa Lộ Hà Nội, Phường An Phú', 'Quận 2', 'TP. Hồ Chí Minh', 10.8045, 106.741, '["Vườn treo thẳng đứng phủ xanh mặt ngoài","Hồ bơi vô cực ngắm pháo hoa","Khu trung tâm thương mại cao cấp","Trường mầm non quốc tế","Phòng Gym view panorama"]', 'active', 3650, 215, 'Kiệt tác căn hộ xanh Organic Lifestyle do Masterise Homes phát triển cùng đối tác hàng đầu thế giới Atkins & HBA. Căn hộ 2PN 2WC tầng 19 tháp West view trực diện sông Sài Gòn và bán đảo Thanh Đa. Toàn bộ thiết bị vệ sinh mạ vàng Kohler cao cấp, kính Low-E tràn viền kịch trần, đá Marble tự nhiên phòng khách.', 2, 2, 97, 'u4', NOW()),
('p16', 'Căn hộ Masteri Centre Point – Compound Khép Kín Cao Cấp Nhất Vinhomes Grand Park', 'apartment', 'sale', 3450000000.00, 70.00, 'so_hong', 'Tòa C (Celia), Masteri Centre Point, Đại đô thị Vinhomes Grand Park', 'Thủ Đức', 'TP. Hồ Chí Minh', 10.843, 106.836, '["Hồ bơi phi thuyền 2 tầng","Khu compound khép kín bảo vệ 4 lớp","Sảnh lễ tân chuẩn khách sạn 5 sao","Khu vui chơi trẻ em trong nhà","Sân tập golf 3D"]', 'active', 2790, 153, 'Phân khu compound khép kín cao cấp nhất đại đô thị Vinhomes Grand Park do Masterise Homes bàn giao. Căn 2PN 2WC view trực diện công viên 36ha và Vincom Mega Mall. Tiêu chuẩn bàn giao vượt trội: Cửa chính chống cháy Hafele khóa nhận diện khuôn mặt, thiết bị bếp Bosch nhập khẩu, vệ sinh Kohler.', 2, 2, 95, 'u2', NOW()),
('p17', 'Căn hộ D\'Leroi Soleil Quảng An – 3PN View Toàn Cảnh Hồ Tây Lộng Gió', 'apartment', 'rent', 38000000.00, 112.00, 'so_hong', 'Tòa tháp A, D\'Leroi Soleil, 59 Xuân Diệu, Phường Quảng An', 'Tây Hồ', 'Hà Nội', 21.062, 105.828, '["Hồ bơi bốn mùa chân mây","View trực diện Hồ Tây 3 mặt","Phố đi bộ ẩm thực Tây Hồ","Trung tâm thương mại Lion Mall","Dịch vụ tiền sảnh Concierge"]', 'active', 3200, 172, 'Tòa căn hộ quý tộc tại bán đảo Quảng An đắt giá nhất thủ đô Hà Nội. Căn 3 phòng ngủ 2WC tầng 15 view ôm trọn 500ha mặt nước Hồ Tây thơ mộng. Nội thất tân cổ điển Pháp dát vàng điểm nhấn, sàn gỗ sồi tự nhiên, hệ thống điều hòa Daikin trung tâm VRV. Không khí trong lành, cộng đồng cư dân phần lớn là đại sứ và chuyên gia quốc tế.', 3, 2, 96, 'u4', NOW()),
('p18', 'Căn hộ Vinhomes Ocean Park Gia Lâm – 2PN View Biển Hồ Nước Mặn Cát Trắng', 'apartment', 'sale', 3100000000.00, 64.00, 'so_hong', 'Tòa S1.08, Phân khu Sapphire 1, KĐT Vinhomes Ocean Park, Đa Tốn', 'Gia Lâm', 'Hà Nội', 21.012, 105.932, '["Biển hồ nước mặn 6.1ha lớn nhất Việt Nam","Hồ Ngọc Trai 24.5ha","Đại học tinh hoa VinUni","Bệnh viện Vinmec","Hệ thống nướng BBQ bãi cát"]', 'active', 2450, 135, 'Thành phố Biển hồ giữa lòng thủ đô. Căn hộ 2 phòng ngủ 2WC tầng 11 phân khu Sapphire 1, chỉ vài bước chân ra quảng trường biển hồ nước mặn. Thiết kế vuông vức, ban công thoáng đón gió đông nam mát rượi. Đầy đủ nội thất hiện đại, sổ hồng lâu dài sẵn sàng sang tên.', 2, 2, 93, 'u2', NOW()),
('p19', 'Nhà phố liền kề Vạn Phúc City – Mặt Tiền Shophouse Kinh Doanh Ven Sông', 'house', 'sale', 19500000000.00, 140.00, 'so_hong', 'Đường Nguyễn Thị Nhung, Khu đô thị Vạn Phúc City, Hiệp Bình Phước', 'Thủ Đức', 'TP. Hồ Chí Minh', 10.835, 106.712, '["Hồ Đại Nhật 16ha","Công viên nhạc nước ánh sáng","Bến du thuyền Dragon Bay","Trường quốc tế Emasi","Bệnh viện Vạn Phúc"]', 'active', 3100, 175, 'Nhà phố thương mại đẳng cấp đại lộ Nguyễn Thị Nhung (lộ giới 35m). Kết cấu 1 hầm 4 tầng nổi kiên cố, mặt tiền rộng 7m lý tưởng mở văn phòng, spa thẩm mỹ viện hoặc ngân hàng. Thiết kế kiến trúc tân cổ điển Châu Âu sang trọng, thang máy nhập khẩu tải trọng 650kg.', 4, 5, 96, 'u2', NOW()),
('p2', 'Căn hộ 1PN Masteri Thảo Điền – Tháp T2 Cạnh Ga Metro Số 1 Bến Thành', 'apartment', 'rent', 16500000.00, 48.00, 'so_hong', 'Tòa T2, Masteri Thảo Điền, 159 Xa Lộ Hà Nội, Phường Thảo Điền', 'Quận 2', 'TP. Hồ Chí Minh', 10.803, 106.738, '["Kết nối thẳng Ga Metro","TTTM Vincom Mega Mall","Hồ bơi vô cực","Sân tennis","Phòng gym chuẩn quốc tế","Khu BBQ"]', 'active', 2892, 142, 'Căn hộ 1 phòng ngủ tháp T2 Masteri Thảo Điền lầu trung, view nội khu hồ bơi và khu biệt thự Thảo Điền cực thoáng. Chỉ 2 phút đi bộ kết nối thẳng Ga Metro An Phú (Tuyến số 1). Nhà decor phong cách Scandinavian trẻ trung, máy giặt sấy inverter, bếp từ Bosch, smart TV, khóa vân tay Hafele. Phù hợp chuyên gia nước ngoài, nhân sự văn phòng.', 1, 1, 94, 'u2', NOW()),
('p20', 'Biệt Thự Đơn Lập Lâu Đài Chateau Phú Mỹ Hưng – Đẳng Cấp Thượng Lưu Ven Sông', 'villa', 'sale', 52000000000.00, 395.00, 'so_hong', 'Khu Biệt Thự Lâu Đài Chateau, Phường Tân Phú, Phú Mỹ Hưng', 'Quận 7', 'TP. Hồ Chí Minh', 10.725, 106.718, '["Khu compound an ninh 24/7 khép kín","Hồ bơi riêng gia đình","Sân vườn nhiệt đới riêng biệt","Hầm rượu vang phong cách Pháp","Bến du thuyền ven sông Cảnh Quan"]', 'active', 4890, 310, 'Dinh thự mang phong cách cổ điển Phục Hưng Pháp tọa lạc tại khu compound biệt lập đắt giá nhất Phú Mỹ Hưng Quận 7. Diện tích đất 395m², diện tích sàn xây dựng gần 600m² gồm 1 trệt 2 lầu và hầm xe 3 ô tô. Sân vườn xanh mát bao quanh ngát hương hoa, view trực diện nhánh sông Cảnh Quan thanh bình.', 5, 6, 99, 'u4', NOW()),
('p3', 'Siêu Căn Hộ Hạng Sang The River Thủ Thiêm – 3PN View Trực Diện Sông Sài Gòn', 'apartment', 'sale', 31500000000.00, 125.00, 'so_hong', 'Tháp The Thames, KĐT The River Thủ Thiêm, Đại Lộ Vòng Cung, Thủ Thiêm', 'Quận 2', 'TP. Hồ Chí Minh', 10.7832, 106.7155, '["Thang máy riêng từng căn","Hồ bơi Olympic 50m","Phòng tiệc Cigar & Wine Lounge","Rạp chiếu phim gia đình","Bến du thuyền","Gym & Spa 5 sao"]', 'active', 4212, 230, 'Biểu tượng phong cách sống thượng lưu tại bán đảo Thủ Thiêm do Refico phát triển. Căn hộ 3 phòng ngủ có sảnh thang máy riêng biệt lập lập trình nhận diện khuôn mặt. Chiều cao trần 3.4m, kính Low-E 3 lớp chống ồn cách nhiệt toàn phần view triệu đô về trung tâm Quận 1 và sông Sài Gòn. Bàn giao full thiết bị cao cấp châu Âu: Poggenpohl, Miele, Duravit, Hansgrohe.', 3, 3, 98, 'u4', NOW()),
('p4', 'Căn hộ Sarimi Sala Đại Quang Minh – 2PN Thiết Kế Hiện Đại View Công Viên 5ha', 'apartment', 'sale', 9200000000.00, 88.00, 'so_hong', 'Block A2, Sarimi Sala, Số 10 Mai Chí Thọ, KĐT Sala, Thủ Thiêm', 'Quận 2', 'TP. Hồ Chí Minh', 10.771, 106.719, '["Công viên sinh thái Sala","Hồ bơi muối khoáng","Hầm xe thông minh","Trường quốc tế Việt Úc (VAS)","Phòng xông hơi","Sân golf tập mini"]', 'active', 2980, 167, 'Căn hộ thuộc phân khu căn hộ thấp tầng cao cấp nhất Sala Sarimi. Mật độ chỉ 6 căn/sàn với 3 thang máy tốc độ cao. Diện tích 88m² 2 phòng ngủ, 2WC, phòng khách rộng rãi nối liền logia ngắm toàn cảnh lâm viên sinh thái. Đã có sổ hồng riêng lâu dài, công chứng sang tên ngay trong ngày.', 2, 2, 95, 'u2', NOW()),
('p5', 'Căn hộ 2PN Vinhomes Grand Park Origami – Nội Thất Nhật Bản Tối Giản', 'apartment', 'sale', 2450000000.00, 59.00, 'so_hong', 'Tòa S7.02, Phân khu The Origami, Vinhomes Grand Park, Long Thạnh Mỹ', 'Thủ Đức', 'TP. Hồ Chí Minh', 10.844, 106.837, '["Vườn Nhật Zen Park","Đại công viên 36ha","Vincom Mega Mall lớn nhất miền Nam","Xe buýt điện VinBus nội ngoại khu","Bệnh viện quốc tế Vinmec"]', 'active', 3820, 245, 'Căn hộ 2PN 1WC tầng 12 tòa S7.02 The Origami - Phân khu mang đậm dấu ấn xứ sở hoa anh đào hợp tác giữa Vingroup & Mitsubishi. Căn góc thoáng đãng view trực diện vườn thiền sỏi trắng và hồ cá Koi. Đã trang bị full nội thất cao cấp: máy lạnh Daikin tất cả các phòng, bếp từ Hafele, sàn gỗ An Cường. Giá bán cực tốt 2.45 tỷ bao toàn bộ thuế phí.', 2, 1, 97, 'u4', NOW()),
('p6', 'Căn hộ Studio The Rainbow Vinhomes Grand Park – Đầy Đủ Nội Thất Tiện Nghi', 'apartment', 'rent', 5500000.00, 34.00, 'so_hong', 'Tòa S1.05, Phân khu The Rainbow, Vinhomes Grand Park, Long Thạnh Mỹ', 'Thủ Đức', 'TP. Hồ Chí Minh', 10.8415, 106.8395, '["Hồ bơi nội khu","Sân thể thao đa năng","Trạm VinBus 24/7","Công viên Cầu Vồng"]', 'active', 1982, 112, 'Studio nhỏ gọn tối ưu công năng, tầng cao thoáng mát, view nội khu công viên ánh sáng. Đầy đủ tiện nghi: giường tủ thông minh, bếp từ, máy lạnh, tủ lạnh, máy giặt, rèm cửa chống nắng. Thích hợp cho sinh viên Đại học FPT, HUTECH, sinh viên Làng Đại Học hoặc nhân viên Khu Công Nghệ Cao.', 1, 1, 89, 'u2', NOW()),
('p7', 'Căn hộ 2PN Mizuki Park Bình Chánh – Block MP4 View Kênh Đào Sinh Thái', 'apartment', 'sale', 2850000000.00, 72.00, 'so_hong', 'Block MP4, Khu đô thị Mizuki Park, Đại lộ Nguyễn Văn Linh, Bình Hưng', 'Bình Chánh', 'TP. Hồ Chí Minh', 10.718, 106.662, '["Kênh đào sinh thái 17.000m²","Đường dạo bộ ven sông","Hồ bơi resort người lớn trẻ em","Khu thể thao ngoài trời","Siêu thị Co.op Food nội khu"]', 'active', 2650, 154, 'Dự án do tập đoàn Nam Long hợp tác cùng 2 đối tác chiến lược Nhật Bản Hankyu Hanshin & Nishi Nippon Railroad. Căn 2PN 2WC tầng 8 ban công Đông Nam lộng gió view trọn kênh đào. Môi trường sống xanh thanh bình, an ninh 3 lớp tuyệt đối, chỉ mất 15 phút di chuyển về Phú Mỹ Hưng Quận 7 và Quận 5.', 2, 2, 93, 'u2', NOW()),
('p8', 'Căn hộ Eco Green Saigon Quận 7 – Tòa HR2 Bàn Giao Cao Cấp View Công Viên', 'apartment', 'sale', 4350000000.00, 71.50, 'so_hong', 'Tòa HR2, Eco Green Saigon, 39 Nguyễn Văn Linh, Tân Thuận Tây', 'Quận 7', 'TP. Hồ Chí Minh', 10.742, 106.7195, '["Công viên nội khu Eco Green 3.5ha","Khách sạn Hyatt Place 69 tầng","Hồ bơi tràn bờ","Hệ thống kính Solar Control chống tia UV","Thiết bị vệ sinh Duravit Đức"]', 'active', 2190, 138, 'Tọa lạc mặt tiền Nguyễn Văn Linh liền kề cầu Thủ Thiêm 4 tương lai kết nối thẳng trung tâm tài chính Thủ Thiêm. Căn hộ 2PN 2WC bố trí layout hình cánh quạt giúp 100% các phòng đều có cửa sổ đón gió và ánh sáng tự nhiên. Trang thiết bị bàn giao cao cấp: Bếp Teka, khóa vân tay Samsung, điều hòa Daikin âm trần.', 2, 2, 92, 'u4', NOW()),
('p9', 'Căn hộ 2PN Kingdom 101 Tô Hiến Thành – Trái Tim Quận 10 Tiện Nghi Đẳng Cấp', 'apartment', 'rent', 19000000.00, 78.00, 'so_hong', 'Tòa Kingsley (Block B), Kingdom 101, 334 Tô Hiến Thành, Phường 14', 'Quận 10', 'TP. Hồ Chí Minh', 10.7746, 106.6669, '["Hồ bơi chân mây tầng 5","Công viên nội khu khép kín","Phòng xông hơi đá muối Himalaya","Phòng gym chuẩn 5 sao","Sát bên ĐH Bách Khoa TP.HCM"]', 'active', 2470, 160, 'Tổ hợp căn hộ cao cấp ngay ngã tư Tô Hiến Thành - Lý Thường Kiệt. Căn hộ 2 phòng ngủ 2WC tầng cao hướng gió Nam mát mẻ quanh năm. Thiết kế hiện đại tinh tế, nội thất full nhập khẩu: Sofa chữ L, smart TV 55 inch, bàn ăn mặt đá Ceramic, máy rửa chén âm tủ, máy giặt có sấy.', 2, 2, 94, 'u2', NOW());

-- MEDIA (HÌNH ẢNH CHẤT LƯỢNG CAO TỪNG CĂN HỘ)
INSERT INTO `media` (`id`, `url`, `type`, `sort_order`, `property_id`, `created_at`) VALUES
('m_p1_1', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200', 'image', 1, 'p1', NOW()),
('m_p1_2', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200', 'image', 2, 'p1', NOW()),
('m_p1_3', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200', 'image', 3, 'p1', NOW()),
('m_p1_4', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', 'image', 4, 'p1', NOW()),
('m_p10_1', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200', 'image', 1, 'p10', NOW()),
('m_p10_2', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200', 'image', 2, 'p10', NOW()),
('m_p10_3', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', 'image', 3, 'p10', NOW()),
('m_p11_1', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200', 'image', 1, 'p11', NOW()),
('m_p11_2', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200', 'image', 2, 'p11', NOW()),
('m_p11_3', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200', 'image', 3, 'p11', NOW()),
('m_p12_1', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200', 'image', 1, 'p12', NOW()),
('m_p12_2', 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200', 'image', 2, 'p12', NOW()),
('m_p12_3', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', 'image', 3, 'p12', NOW()),
('m_p13_1', 'https://images.unsplash.com/photo-1502005035787-84f9be5e52c8?w=1200', 'image', 1, 'p13', NOW()),
('m_p13_2', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200', 'image', 2, 'p13', NOW()),
('m_p13_3', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200', 'image', 3, 'p13', NOW()),
('m_p14_1', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', 'image', 1, 'p14', NOW()),
('m_p14_2', 'https://images.unsplash.com/photo-1502005229762-ee1afd5703f8?w=1200', 'image', 2, 'p14', NOW()),
('m_p15_1', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'image', 1, 'p15', NOW()),
('m_p15_2', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200', 'image', 2, 'p15', NOW()),
('m_p15_3', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'image', 3, 'p15', NOW()),
('m_p16_1', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200', 'image', 1, 'p16', NOW()),
('m_p16_2', 'https://images.unsplash.com/photo-1502005229762-ee1afd5703f8?w=1200', 'image', 2, 'p16', NOW()),
('m_p16_3', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200', 'image', 3, 'p16', NOW()),
('m_p17_1', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'image', 1, 'p17', NOW()),
('m_p17_2', 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200', 'image', 2, 'p17', NOW()),
('m_p17_3', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'image', 3, 'p17', NOW()),
('m_p18_1', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', 'image', 1, 'p18', NOW()),
('m_p18_2', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200', 'image', 2, 'p18', NOW()),
('m_p18_3', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200', 'image', 3, 'p18', NOW()),
('m_p19_1', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', 'image', 1, 'p19', NOW()),
('m_p19_2', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'image', 2, 'p19', NOW()),
('m_p2_1', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', 'image', 1, 'p2', NOW()),
('m_p2_2', 'https://images.unsplash.com/photo-1502005229762-ee1afd5703f8?w=1200', 'image', 2, 'p2', NOW()),
('m_p2_3', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200', 'image', 3, 'p2', NOW()),
('m_p20_1', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'image', 1, 'p20', NOW()),
('m_p20_2', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'image', 2, 'p20', NOW()),
('m_p20_3', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'image', 3, 'p20', NOW()),
('m_p3_1', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'image', 1, 'p3', NOW()),
('m_p3_2', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200', 'image', 2, 'p3', NOW()),
('m_p3_3', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'image', 3, 'p3', NOW()),
('m_p3_4', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'image', 4, 'p3', NOW()),
('m_p4_1', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200', 'image', 1, 'p4', NOW()),
('m_p4_2', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200', 'image', 2, 'p4', NOW()),
('m_p4_3', 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200', 'image', 3, 'p4', NOW()),
('m_p5_1', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', 'image', 1, 'p5', NOW()),
('m_p5_2', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', 'image', 2, 'p5', NOW()),
('m_p5_3', 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?w=1200', 'image', 3, 'p5', NOW()),
('m_p6_1', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200', 'image', 1, 'p6', NOW()),
('m_p6_2', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', 'image', 2, 'p6', NOW()),
('m_p7_1', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200', 'image', 1, 'p7', NOW()),
('m_p7_2', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', 'image', 2, 'p7', NOW()),
('m_p7_3', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200', 'image', 3, 'p7', NOW()),
('m_p8_1', 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200', 'image', 1, 'p8', NOW()),
('m_p8_2', 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1200', 'image', 2, 'p8', NOW()),
('m_p8_3', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', 'image', 3, 'p8', NOW()),
('m_p9_1', 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200', 'image', 1, 'p9', NOW()),
('m_p9_2', 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=1200', 'image', 2, 'p9', NOW()),
('m_p9_3', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200', 'image', 3, 'p9', NOW());

-- POIS (TIỆN ÍCH XUNG QUANH CHUẨN XÁC)
INSERT INTO `pois` (`id`, `name`, `category`, `distance`, `rating`, `property_id`, `created_at`, `updated_at`) VALUES
('poi_p1_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p1', NOW(), NOW()),
('poi_p1_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p1', NOW(), NOW()),
('poi_p1_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p1', NOW(), NOW()),
('poi_p1_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p1', NOW(), NOW()),
('poi_p10_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p10', NOW(), NOW()),
('poi_p10_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p10', NOW(), NOW()),
('poi_p10_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p10', NOW(), NOW()),
('poi_p10_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p10', NOW(), NOW()),
('poi_p11_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p11', NOW(), NOW()),
('poi_p11_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p11', NOW(), NOW()),
('poi_p11_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p11', NOW(), NOW()),
('poi_p11_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p11', NOW(), NOW()),
('poi_p12_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p12', NOW(), NOW()),
('poi_p12_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p12', NOW(), NOW()),
('poi_p12_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p12', NOW(), NOW()),
('poi_p12_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p12', NOW(), NOW()),
('poi_p13_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p13', NOW(), NOW()),
('poi_p13_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p13', NOW(), NOW()),
('poi_p13_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p13', NOW(), NOW()),
('poi_p13_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p13', NOW(), NOW()),
('poi_p14_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p14', NOW(), NOW()),
('poi_p14_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p14', NOW(), NOW()),
('poi_p14_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p14', NOW(), NOW()),
('poi_p14_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p14', NOW(), NOW()),
('poi_p15_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p15', NOW(), NOW()),
('poi_p15_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p15', NOW(), NOW()),
('poi_p15_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p15', NOW(), NOW()),
('poi_p15_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p15', NOW(), NOW()),
('poi_p16_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p16', NOW(), NOW()),
('poi_p16_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p16', NOW(), NOW()),
('poi_p16_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p16', NOW(), NOW()),
('poi_p16_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p16', NOW(), NOW()),
('poi_p17_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p17', NOW(), NOW()),
('poi_p17_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p17', NOW(), NOW()),
('poi_p17_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p17', NOW(), NOW()),
('poi_p17_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p17', NOW(), NOW()),
('poi_p18_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p18', NOW(), NOW()),
('poi_p18_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p18', NOW(), NOW()),
('poi_p18_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p18', NOW(), NOW()),
('poi_p18_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p18', NOW(), NOW()),
('poi_p19_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p19', NOW(), NOW()),
('poi_p19_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p19', NOW(), NOW()),
('poi_p19_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p19', NOW(), NOW()),
('poi_p19_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p19', NOW(), NOW()),
('poi_p2_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p2', NOW(), NOW()),
('poi_p2_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p2', NOW(), NOW()),
('poi_p2_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p2', NOW(), NOW()),
('poi_p2_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p2', NOW(), NOW()),
('poi_p20_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p20', NOW(), NOW()),
('poi_p20_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p20', NOW(), NOW()),
('poi_p20_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p20', NOW(), NOW()),
('poi_p20_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p20', NOW(), NOW()),
('poi_p3_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p3', NOW(), NOW()),
('poi_p3_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p3', NOW(), NOW()),
('poi_p3_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p3', NOW(), NOW()),
('poi_p3_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p3', NOW(), NOW()),
('poi_p4_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p4', NOW(), NOW()),
('poi_p4_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p4', NOW(), NOW()),
('poi_p4_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p4', NOW(), NOW()),
('poi_p4_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p4', NOW(), NOW()),
('poi_p5_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p5', NOW(), NOW()),
('poi_p5_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p5', NOW(), NOW()),
('poi_p5_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p5', NOW(), NOW()),
('poi_p5_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p5', NOW(), NOW()),
('poi_p6_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p6', NOW(), NOW()),
('poi_p6_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p6', NOW(), NOW()),
('poi_p6_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p6', NOW(), NOW()),
('poi_p6_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p6', NOW(), NOW()),
('poi_p7_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p7', NOW(), NOW()),
('poi_p7_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p7', NOW(), NOW()),
('poi_p7_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p7', NOW(), NOW()),
('poi_p7_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p7', NOW(), NOW()),
('poi_p8_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p8', NOW(), NOW()),
('poi_p8_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p8', NOW(), NOW()),
('poi_p8_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p8', NOW(), NOW()),
('poi_p8_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p8', NOW(), NOW()),
('poi_p9_1', 'Trường Quốc Tế Liên Cấp', 'school', 450, 4.8, 'p9', NOW(), NOW()),
('poi_p9_2', 'Trung Tâm Thương Mại & Siêu Thị', 'supermarket', 300, 4.7, 'p9', NOW(), NOW()),
('poi_p9_3', 'Bệnh Viện Đa Khoa Quốc Tế', 'hospital', 800, 4.9, 'p9', NOW(), NOW()),
('poi_p9_4', 'Trạm Ga Metro & Bến Xe Buýt Điện', 'transport', 150, 4.6, 'p9', NOW(), NOW());

-- YÊU THÍCH MẪU
INSERT INTO `favorites` (`id`, `user_id`, `property_id`, `created_at`) VALUES
('fav1', 'u1', 'p1', NOW()),
('fav2', 'u1', 'p5', NOW()),
('fav3', 'u1', 'p9', NOW());

-- LỊCH HẸN MẪU
INSERT INTO `appointments` (`id`, `property_id`, `buyer_id`, `agent_id`, `appointment_date`, `appointment_time`, `status`, `tour_type`, `note`, `created_at`) VALUES
('a1', 'p1', 'u1', 'u2', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00', 'confirmed', 'in_person', 'Khách hẹn đi cùng gia đình xem hướng ban công', NOW()),
('a2', 'p5', 'u1', 'u4', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '14:30', 'pending', 'in_person', 'Khách muốn tìm hiểu gói vay ngân hàng mua nhà dưới 2.5 tỷ', NOW()),
('a3', 'p2', 'u1', 'u2', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00', 'completed', 'video', 'Xem nhà online qua video call', NOW());

-- CUỘC TRÒ CHUYỆN MẪU
INSERT INTO `conversations` (`id`, `user_a_id`, `user_b_id`, `property_id`, `last_message`, `last_message_at`, `created_at`, `updated_at`) VALUES
('conv1', 'u1', 'u2', 'p1', 'Chào anh Bảo, căn hộ Vinhomes Central Park này còn phòng trống và sẵn sàng bàn giao dọn vào ở ngay không?', NOW(), NOW(), NOW()),
('conv2', 'u1', 'u4', 'p5', 'Chào anh Nam, căn hộ Origami 2PN giá 2.45 tỷ này có hỗ trợ vay ngân hàng Techcombank không?', NOW(), NOW(), NOW());

-- TIN NHẮN MẪU
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `read_at`, `created_at`, `updated_at`) VALUES
('msg1', 'conv1', 'u1', 'Chào anh Bảo, căn hộ Vinhomes Central Park này còn phòng trống và sẵn sàng bàn giao dọn vào ở ngay không?', NOW(), NOW(), NOW()),
('msg2', 'conv1', 'u2', 'Chào bạn Minh Anh! Căn hộ này hiện đang trống và sẵn sàng dọn vào ở ngay ạ. Bạn có muốn hẹn lịch đi xem thực tế không?', NOW(), NOW(), NOW()),
('msg3', 'conv2', 'u1', 'Chào anh Nam, căn hộ Origami 2PN giá 2.45 tỷ này có hỗ trợ vay ngân hàng Techcombank không?', NOW(), NOW(), NOW()),
('msg4', 'conv2', 'u4', 'Dạ chào bạn! Căn hộ đã có sổ hồng riêng, ngân hàng Techcombank hỗ trợ vay đến 70% giá trị hợp đồng trong 25 năm ạ.', NOW(), NOW(), NOW());
