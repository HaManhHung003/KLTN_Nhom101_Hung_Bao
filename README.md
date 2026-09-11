# KLTN_Nhom101_Hung_Bao — BDS Pro

Hệ thống số hóa quy trình tìm kiếm, giao dịch và quản lý bất động sản (cho thuê & mua bán) đa nền tảng (Web & Mobile App).

---

## 📁 Cấu trúc thư mục dự án

```text
KLTN_Nhom101_Hung_Bao/
│
├── BDS_Pro_Frontend/        # 🌐 Web Client, Broker & Admin Portal (ReactJS + TypeScript + Vite + Tailwind)
├── BDS_Pro_Backend/         # ⚙️ Centralized RESTful API Server (Java 17/21 + Spring Boot 3 + MySQL + JWT)
├── database/                # 🗄️ MySQL Database Schema & Dữ liệu mẫu (bds_pro_database_full.sql)
└── docs/                    # 📄 Tài liệu phân tích nghiệp vụ & đặc tả hệ thống
```

---

## 🚀 Khởi chạy hệ thống

### 1. Cơ sở dữ liệu (MySQL)
* Import file [database/bds_pro_database_full.sql](file:///d:/KLTN/KLTN_Nhom101_Hung_Bao/database/bds_pro_database_full.sql) vào phpMyAdmin hoặc MySQL Workbench.

### 2. Backend (Spring Boot)
* Mở thư mục [BDS_Pro_Backend](file:///d:/KLTN/KLTN_Nhom101_Hung_Bao/BDS_Pro_Backend) bằng IntelliJ IDEA hoặc chạy lệnh:
  ```powershell
  cd BDS_Pro_Backend
  mvn spring-boot:run
  ```
* Xem tài liệu API Swagger UI tại: `http://localhost:8080/swagger-ui.html`

### 3. Frontend Web (ReactJS)
* Mở thư mục [BDS_Pro_Frontend](file:///d:/KLTN/KLTN_Nhom101_Hung_Bao/BDS_Pro_Frontend) và chạy:
  ```powershell
  cd BDS_Pro_Frontend
  npm install
  npm run dev
  ```
* Truy cập Web: `http://localhost:5173/client`

---

## 👥 Nhóm thực hiện
* **Khóa luận tốt nghiệp — Nhóm 101** (Mạnh Hưng & Văn Bảo)
