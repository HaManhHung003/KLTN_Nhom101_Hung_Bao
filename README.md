# KLTN_Nhom101_Hung_Bao — BDS Pro

Hệ thống nền tảng số hóa quy trình tìm kiếm, giao dịch và quản lý bất động sản (mua bán & cho thuê) đa nền tảng (Web & Mobile App), tích hợp trợ lý AI thông minh và bản đồ định vị GPS thời gian thực.

---

## 📁 Cấu trúc thư mục dự án

```text
KLTN_Nhom101_Hung_Bao/
│
├── BDS_Pro_Frontend/        # 🌐 Web Client, Broker & Admin Portal
│                            #    (React 19 + TypeScript + Vite + Tailwind CSS v4 + Leaflet)
├── BDS_Pro_Backend/         # ⚙️ RESTful API & WebSocket Server
│                            #    (NestJS 10 + TypeScript + TypeORM + MySQL + JWT + Socket.io)
├── database/                # 🗄️ MySQL Database Schema & Dữ liệu mẫu chuẩn thực tế
│                            #    (bds_pro_database_full.sql: 20 BĐS, 59 ảnh HD, 80 POIs)
└── docs/                    # 📄 Tài liệu phân tích nghiệp vụ, tài liệu kiến trúc & đặc tả
                             #    (PHAN-TICH-NGHIEP-VU.md)
```

---

## 🌟 Tính năng nổi bật mới hoàn thiện

1. **Tự động định vị vị trí người dùng (Auto Geolocation):**
   - Tự động lấy tọa độ GPS chính xác qua HTML5 Geolocation (`enableHighAccuracy: true`) ngay khi truy cập trang trên Web và Mobile.
   - Tự động phân giải địa chỉ thực tế (Reverse Geocoding) thông qua OpenStreetMap Nominatim (tên Phường, Quận, Tỉnh/TP).
2. **Tìm kiếm & Khám phá trên Bản đồ số tương tác (Interactive Real Map):**
   - Bản đồ Leaflet với cơ chế cô lập ngữ cảnh xếp chồng (`isolation: isolate`), chống che khuất dropdown gợi ý địa chỉ.
   - Thẻ hiển thị giá tiền nổi bật phong cách Airbnb, click xem nhanh thông tin chi tiết và dẫn tới trang BĐS.
   - Quét bán kính xung quanh vị trí thực tế hoặc địa điểm tìm kiếm: `1 km`, `3 km`, `5 km`, `10 km`, hoặc `Toàn bộ`.
3. **Gợi ý địa chỉ thông minh (Address Autocomplete):**
   - Tự động gợi ý các Quận/Huyện, Tuyến đường huyết mạch và Dự án/Khu đô thị nổi tiếng ngay khi nhập liệu.
4. **Trợ lý ảo AI Chatbot tích hợp GPS:**
   - AI Chatbot tự động nhận diện tọa độ và bán kính của người dùng để trả lời chính xác các câu hỏi như: *"Tìm căn hộ gần tôi dưới 2,5 tỷ"*.
5. **Dữ liệu thực tế chuẩn xác:**
   - Bộ dữ liệu gồm 20 dự án thực tế tại TP.HCM & Hà Nội (Vinhomes Central Park, The River Thủ Thiêm, Masteri Thảo Điền, Vinhomes Grand Park, Mizuki Park, Eco Green Saigon, Kingdom 101, HaDo Centrosa Garden, Vinhomes Smart City...) kèm 59 hình ảnh chất lượng cao và 80 địa điểm tiện ích xung quanh (POIs).

---

## 🚀 Hướng dẫn khởi chạy hệ thống

### 1. Cơ sở dữ liệu (MySQL)
* Đảm bảo MySQL service đang chạy trên cổng `3306` (hoặc cấu hình trong `.env`).
* Tạo cơ sở dữ liệu `bds_pro_db` và import file [database/bds_pro_database_full.sql](file:///d:/KLTN_Nhom101_Hung_Bao/database/bds_pro_database_full.sql):
  ```sql
  CREATE DATABASE IF NOT EXISTS bds_pro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  USE bds_pro_db;
  SOURCE database/bds_pro_database_full.sql;
  ```

### 2. Khởi chạy Backend (NestJS Server)
* Mở thư mục [BDS_Pro_Backend](file:///d:/KLTN_Nhom101_Hung_Bao/BDS_Pro_Backend) và cài đặt dependencies nếu chưa có:
  ```powershell
  cd BDS_Pro_Backend
  npm install
  npm run start:dev
  ```
* Máy chủ API chạy tại: `http://localhost:4000` (API Base: `http://localhost:4000/api/v1`)
* Tài liệu Swagger API Docs: `http://localhost:4000/docs`

### 3. Khởi chạy Frontend Web (React + Vite)
* Mở thư mục [BDS_Pro_Frontend](file:///d:/KLTN_Nhom101_Hung_Bao/BDS_Pro_Frontend) và chạy:
  ```powershell
  cd BDS_Pro_Frontend
  npm install
  npm run dev
  ```
* Truy cập Web Client: `http://localhost:5173/client`
* Truy cập Tìm kiếm BĐS trên Bản đồ: `http://localhost:5173/client/tim-kiem`
* Truy cập Cổng Môi giới: `http://localhost:5173/broker`
* Truy cập Cổng Quản trị Admin: `http://localhost:5173/admin`

---

## 👥 Nhóm thực hiện
* **Khóa luận tốt nghiệp — Nhóm 101** (Mạnh Hưng & Văn Bảo)
