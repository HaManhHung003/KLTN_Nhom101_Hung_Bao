# BDS Pro Backend — Java 17 + Spring Boot 3 + MySQL + JWT + Swagger

Hệ thống Backend RESTful API tập trung (Centralized REST API) phục vụ đồng thời cho cả:
* 🌐 **Web Portal (ReactJS)**
* 📱 **Mobile App (React Native)**

---

## 🛠️ Công nghệ sử dụng

* **Ngôn ngữ**: Java 17 / 21
* **Framework**: Spring Boot 3.3.4
* **Cơ sở dữ liệu**: MySQL 8.0
* **ORM & Data Access**: Spring Data JPA (Hibernate)
* **Bảo mật**: Spring Security 6 + JJWT (JSON Web Token) + BCrypt Password Encoder
* **Tài liệu API**: Springdoc OpenAPI 3 / Swagger UI
* **Build Tool**: Apache Maven

---

## 🚀 Hướng dẫn khởi chạy Backend

### Bước 1: Chuẩn bị Cơ sở dữ liệu MySQL
1. Đảm bảo MySQL đang chạy (bật qua XAMPP hoặc MySQL Workbench).
2. Import file CSDL gộp: [database/bds_pro_database_full.sql](file:///d:/KLTN/KLTN_Nhom101_Hung_Bao/database/bds_pro_database_full.sql) (đã có sẵn cấu trúc 12 bảng và tài khoản mẫu).

---

### Bước 2: Cấu hình kết nối MySQL trong `application.properties`
Mở file `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bds_pro_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
spring.datasource.username=root
# Nếu dùng XAMPP thì để trống, nếu MySQL có mật khẩu thì điền vào (ví dụ 123456)
spring.datasource.password=123456
```

---

### Bước 3: Khởi chạy dự án

#### 👉 Cách 1: Sử dụng IntelliJ IDEA / Eclipse *(Khuyên dùng)*
1. Mở thư mục `BDS_Pro_Backend` trong **IntelliJ IDEA** (chọn `Open as Maven Project`).
2. Mở file `src/main/java/com/bdspro/BdsProApplication.java`.
3. Bấm nút **Run ▶️ (Shift + F10)**.

#### 👉 Cách 2: Sử dụng dòng lệnh Maven
Mở Terminal / PowerShell tại thư mục `BDS_Pro_Backend`:
```powershell
cd d:\KLTN\KLTN_Nhom101_Hung_Bao\BDS_Pro_Backend
mvn spring-boot:run
```

---

## 📖 Trải nghiệm Giao diện Swagger UI (Kiểm thử API trực quan)

Sau khi server khởi động thành công:
* Truy cập Swagger UI tại: **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**
* Tại đây bạn có thể bấm thử trực tiếp tất cả các API mà không cần mở Postman!

---

## 🔑 Danh sách Tài khoản mẫu (Mật khẩu: `123456`)

| Tên người dùng | Email | Mật khẩu | Vai trò | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Nguyễn Minh Anh** | `minhanh@gmail.com` | `123456` | `buyer` | Khách tìm nhà, đặt lịch, chat, đặt cọc |
| **Trần Văn Bảo** | `vanbao@bdspro.vn` | `123456` | `agent` | Môi giới đăng tin BĐS, quản lý lịch hẹn |
| **Phạm Đức Hùng** | `hung@gmail.com` | `123456` | `agent` | Môi giới đăng tin BĐS |
| **Lê Thị Hương** | `admin@bdspro.vn` | `123456` | `admin` | Quản trị viên, duyệt tin BĐS, xem báo cáo KPI |

---

## 📡 Danh sách Endpoints RESTful API chính

| Phân hệ | Phương thức | Endpoint | Mô tả |
| :--- | :---: | :--- | :--- |
| **Xác thực** | `POST` | `/api/v1/auth/register` | Đăng ký tài khoản mới |
| | `POST` | `/api/v1/auth/login` | Đăng nhập nhận JWT token |
| | `GET` | `/api/v1/auth/profile` | Lấy thông tin cá nhân |
| **Bất động sản** | `GET` | `/api/v1/properties` | Tìm kiếm & lọc đa tiêu chí (giá, quận, loại, status) |
| | `GET` | `/api/v1/properties/detail/{id}` | Xem chi tiết BĐS |
| | `POST` | `/api/v1/properties` | Môi giới đăng tin mới (Chờ duyệt) |
| | `POST` | `/api/v1/properties/my/favorites/toggle/{id}` | Lưu / Bỏ yêu thích tin BĐS |
| **Lịch hẹn** | `POST` | `/api/v1/appointments` | Đặt lịch xem nhà |
| | `GET` | `/api/v1/appointments/my` | Xem danh sách lịch hẹn của tôi |
| | `PATCH`| `/api/v1/appointments/{id}/status` | Xác nhận / Hủy lịch hẹn |
| **Chat & AI** | `POST` | `/api/v1/chat/ai` | Trợ lý ảo AI tư vấn BĐS |
| | `GET` | `/api/v1/chat/threads` | Lấy danh sách phòng chat |
| | `POST` | `/api/v1/chat/threads/{id}/messages` | Gửi tin nhắn mới |
| **Đặt cọc** | `POST` | `/api/v1/transactions/deposit` | Thanh toán đặt cọc giữ chỗ |
| | `GET` | `/api/v1/transactions/my` | Lịch sử giao dịch |
| **Admin** | `GET` | `/api/v1/admin/stats` | Thống kê Dashboard KPIs |
| | `GET` | `/api/v1/admin/moderation` | Hàng đợi kiểm duyệt tin BĐS |
| | `PATCH`| `/api/v1/admin/moderation/{id}` | Phê duyệt (`active`) hoặc Từ chối (`rejected`) tin |

# DB
## 🔑 Tài khoản mẫu có sẵn sau khi import (Mật khẩu: `123456`)

* **Khách tìm nhà (Buyer)**: `minhanh@gmail.com`
* **Môi giới (Agent)**: `vanbao@bdspro.vn` hoặc `hung@gmail.com`
* **Quản trị viên (Admin)**: `admin@bdspro.vn`