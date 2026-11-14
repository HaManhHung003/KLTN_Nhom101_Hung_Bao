# 🏡 KLTN_Nhom101_Hung_Bao — BDS Pro (Web & Mobile App)

> **Đề tài Khóa luận Tốt nghiệp:** Xây dựng hệ thống nền tảng số hóa quy trình tìm kiếm, giao dịch và quản lý bất động sản (mua bán & cho thuê) đa nền tảng (**Web & Mobile App**), tích hợp cổng thanh toán ký quỹ tự động (Escrow & SePay Webhook), định vị GPS thời gian thực và trợ lý trí tuệ nhân tạo AI Chatbot.  
> **Nhóm thực hiện:** Nhóm 101 — Hà Mạnh Hưng & Cao Văn Bảo  
> **Cập nhật:** Tháng 11/2026 — Nhánh `VanBao`

---

## 📁 Cấu trúc Thư mục Dự án

```text
KLTN_Nhom101_Hung_Bao/
│
├── BDS_Pro_Frontend_Web/    # 🌐 Nền tảng Website (Client, Broker & Admin Portal)
│                            #    (React 19 + TypeScript + Vite + Tailwind CSS v4 + Leaflet Map)
│
├── BDS_Pro_Frontend_App/    # 📱 Ứng dụng Di động Native đa nền tảng (iOS & Android)
│                            #    (React Native + Expo SDK 58 + TypeScript + AsyncStorage)
│
├── BDS_Pro_Backend/         # ⚙️ Máy chủ RESTful API & Webhook IPN Receiver
│                            #    (NestJS 10 + TypeScript + TypeORM + MySQL + JWT + Swagger)
│
├── database/                # 🗄️ Cơ sở dữ liệu MySQL Schema & Dữ liệu thực tế
│                            #    (bds_pro_database_full.sql: 20 BĐS, 59 ảnh HD, 80 POIs)
│
└── docs/                    # 📄 Tài liệu Phân tích Nghiệp vụ & Kiến trúc Hệ thống
                             #    (PHAN-TICH-NGHIEP-VU.md)
```

---

## 🌟 Các Tính năng Nổi bật Đã Hoàn thiện

### 1. Hệ thống Thanh toán Đặt cọc Ký quỹ An toàn (Escrow & SePay Webhook)
* **Đặt cọc trực tuyến:** Người mua chọn mức cọc (5 triệu, 20 triệu, 50 triệu, 100 triệu) kèm cam kết pháp lý giữ chỗ.
* **Cổng thanh toán đa dạng:**
  * **VietQR VPBank:** STK `0332536815` — Chủ tài khoản: `CAO VĂN BẢO`.
  * **Ví điện tử MoMo:** SĐT `0332536815` — Chủ tài khoản: `Cao Văn Bảo`.
* **Tự động hóa 100% qua SePay Webhook (IPN):**
  * Backend xác thực chữ ký số Secret Key `spsk_test_...` và phân tích cú pháp nội dung chuyển khoản `BDSCOC [mã_căn]`.
  * **Radar Polling 2.5s:** Màn hình quét QR trên Web và App tự động nhận diện tiền vào và **tự động chuyển ngay sang Bước 3 (Biên nhận cọc điện tử)** mà người dùng không cần chạm chuột.
  * Cung cấp nút **`⚡ Test nhận tiền tự động (Demo KLTN)`** để mô phỏng biến động số dư SePay tức thì khi thuyết trình.
* **Quy trình Ký quỹ Sàn (Escrow Service):** Admin có quyền kiểm duyệt, phê duyệt "Giải ngân cho Môi giới" (Payout) hoặc "Hoàn cọc cho Người mua" (Refund).

### 2. Ứng dụng Di động Native Đa nền tảng (`BDS_Pro_Frontend_App`)
* Xây dựng trên nền tảng **React Native (Expo SDK 58 + TypeScript)**, đồng bộ 100% dữ liệu với Web.
* **Thanh điều hướng dưới đáy (Bottom Navigation) 5 tab:**
  1. 🏠 **Khám phá:** Tìm kiếm BĐS, lọc Mua/Thuê, xem danh sách dạng thẻ cao cấp.
  2. 📍 **Quanh đây (GPS):** Quét bán kính `1km`, `3km`, `5km`, `10km` quanh tọa độ GPS người dùng, tính khoảng cách chính xác theo km (Haversine formula).
  3. 💼 **Ký quỹ:** Theo dõi lịch sử cọc, mã biên nhận `#REC_...` và trạng thái Escrow.
  4. ❤️ **Đã lưu:** Quản lý danh sách BĐS yêu thích (đồng bộ Database).
  5. 👤 **Tài khoản:** Hồ sơ cá nhân, đổi vai trò, Đăng ký, Đăng nhập và **Đăng xuất (tự động out ra LoginScreen)**.
* **Đăng nhập & Đăng xuất chuẩn App:**
  * Lưu phiên đăng nhập an toàn bằng `AsyncStorage`.
  * Nút **Đăng nhập nhanh 1-chạm (Demo KLTN)**: Khách hàng (Cao Văn Bảo) / Môi giới (Hà Mạnh Hưng) / Admin.
  * Khi bấm **Đăng xuất**: App lập tức out thẳng ra màn hình Đăng nhập.
* **Trợ lý Ảo AI Chatbot nổi (`AiChatbotModal`):** Nút tròn nổi `[ 🤖 Trợ lý AI ]` tư vấn BĐS gần bạn dưới 3 tỷ, thủ tục pháp lý sổ hồng và tính bảng lãi suất vay trả góp ngân hàng.
* **Đặt lịch xem nhà (`BookingModal`):** Đặt lịch hẹn xem trực tiếp tại nhà hoặc Video Call 1-1, chọn ngày giờ và ghi chú gửi môi giới.
* **Báo cáo tin đăng vi phạm (`ReportListingModal`):** Gắn cờ báo cáo tin ảo, giá sai sự thật, môi giới không liên lạc được.
* **Tiện ích xung quanh (POIs):** Đo khoảng cách thực tế đến Ga Metro, Bệnh viện, Siêu thị, Trường Quốc tế.
* **Đăng tin BĐS mới (`PostPropertyModal`):** Dành cho Chủ nhà/Môi giới đăng bán/cho thuê trực tiếp từ app.

### 3. Nền tảng Website Chuyên nghiệp (`BDS_Pro_Frontend_Web`)
* Giao diện phong cách Luxury Airbnb: 58% Bản đồ số tương tác Leaflet + 42% Danh sách BĐS.
* Bản đồ số với cơ chế cô lập Stacking Context (`isolation: isolate`), chống che khuất thanh tìm kiếm và menu gợi ý.
* Tự động định vị GPS HTML5 Geolocation kết hợp Reverse Geocoding địa chỉ tiếng Việt (OpenStreetMap Nominatim).
* Gợi ý địa chỉ thông minh (Address Autocomplete) phân nhóm: Quận/Huyện, Tuyến đường, Dự án nổi tiếng.

### 4. Cơ sở Dữ liệu & Dữ liệu Thực tế Chuẩn mực
* Bộ dữ liệu khảo sát thực tế gồm **20 dự án cao cấp tại TP.HCM & Hà Nội** (Vinhomes Central Park, The River Thủ Thiêm, Masteri Thảo Điền, Vạn Phúc City, Mizuki Park, Eco Green Saigon, HaDo Centrosa Garden, Vinhomes Smart City...).
* Đầy đủ **59 hình ảnh chất lượng cao** và **80 địa điểm tiện ích ngoại khu (POIs)**.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy Hệ thống

### 1. Khởi động Cơ sở dữ liệu MySQL
* Khởi động dịch vụ MySQL (cổng mặc định `3306`).
* Tạo database và import file dữ liệu mẫu:
  ```sql
  CREATE DATABASE IF NOT EXISTS bds_pro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  USE bds_pro_db;
  SOURCE database/bds_pro_database_full.sql;
  ```

### 2. Khởi động Máy chủ Backend (NestJS Server)
```powershell
cd BDS_Pro_Backend
npm install
npm run start:dev
```
* **API Base URL:** `http://localhost:4000/api/v1`
* **Swagger API Documentation:** `http://localhost:4000/api/v1/docs`

### 3. Khởi động Giao diện Website (React + Vite)
```powershell
cd BDS_Pro_Frontend_Web
npm install
npm run dev
```
* **Địa chỉ Website:** `http://localhost:5173/`

### 4. Khởi động Ứng dụng Di động (React Native / Expo)
```powershell
cd BDS_Pro_Frontend_App
npm install
npm start
```
* **Metro Bundler Dashboard:** `http://localhost:8081/`
* **Chạy trên Điện thoại thật:** Tải app **Expo Go** trên iPhone hoặc Android, kết nối cùng mạng Wi-Fi và quét mã QR hiển thị trên màn hình.
* **Chạy xem trước trên Web:** Nhấn phím **`w`** trên terminal để mở giao diện mobile trực tiếp trên trình duyệt.

---

## 👥 Nhóm Thực hiện Đề tài
* **Hà Mạnh Hưng**
* **Cao Văn Bảo**
* *Khóa luận Tốt nghiệp 2026 — Nhóm 101*
