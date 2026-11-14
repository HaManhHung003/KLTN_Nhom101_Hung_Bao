# BDS Pro — Frontend Web Application

Hệ thống giao diện Web đa vai trò (Khách vãng lai / Khách hàng, Môi giới / Chủ BĐS, Quản trị viên sàn) được xây dựng trên nền tảng **React 19 + TypeScript + Vite + Tailwind CSS v4 + Leaflet**.

---

## 🌟 Tính năng cốt lõi

* **Định vị vị trí tự động (Global Location Context):** Tự động phát hiện vị trí GPS người dùng khi tải trang web/mobile bằng HTML5 Geolocation độ chính xác cao và tự động dịch địa chỉ ngược qua OpenStreetMap Nominatim.
* **Tìm kiếm BĐS trên bản đồ thông minh (`/client/tim-kiem`):**
  - Giao diện chia màn hình: 58% Bản đồ tương tác Leaflet + 42% Danh sách BĐS chuẩn Airbnb.
  - Bộ lọc tức thì: Phân khúc Mua / Thuê, mức giá nhanh, số phòng ngủ, phòng tắm, tiêu chí sắp xếp.
  - Tìm kiếm theo bán kính: 1 km, 3 km, 5 km, 10 km hoặc Toàn bộ khu vực.
  - Ô tìm kiếm tích hợp Gợi ý địa chỉ (Autocomplete) cho Quận/Huyện, Dự án, Tuyến đường.
  - Marker dạng pill hiển thị giá tiền nổi bật, click hiển thị thẻ popup xem trước BĐS.
* **Trợ lý AI Chatbot tích hợp GPS (`/client/chat` & Dock nổi góc màn hình):**
  - Hỗ trợ giải đáp thắc mắc, thẩm định giá, gợi ý BĐS gần vị trí người dùng theo ngân sách.
* **Thiết kế UI/UX Luxury:** Thiết kế chuẩn phong cách hiện đại với gam màu ngọc lục bảo (Emerald), bo góc lớn `rounded-3xl`, viền mờ cao cấp, hiệu ứng chuyển ảnh mượt mà.

---

## 🏗️ Cấu trúc Layout & Phân quyền

| Layout | Tiền tố đường dẫn | Đối tượng | Mô tả giao diện |
| :--- | :--- | :--- | :--- |
| **ClientLayout** | `/client/*` | Client (Guest) / Customer | Header điều hướng, bộ lọc tìm kiếm, bản đồ, trang cá nhân, dock chat nổi |
| **BrokerLayout** | `/broker/*` | Seller / Môi giới | Sidebar quản trị tin đăng, quản lý khách hàng (CRM), lịch hẹn, tin nhắn |
| **AdminLayout** | `/admin/*` | Quản trị viên (Admin) | Dashboard tổng quan hệ thống, kiểm duyệt tin BĐS, quản lý người dùng, giao dịch |

---

## 🗺️ Bản đồ định tuyến (Route Map)

### 1. Cổng Khách hàng (`ClientLayout`)
```text
/client                  # Trang chủ tìm kiếm & khám phá BĐS
/client/tim-kiem         # Tìm kiếm nâng cao kết hợp Bản đồ tương tác Leaflet
/client/property/:id     # Trang chi tiết BĐS, hình ảnh, tiện ích xung quanh, lịch xem
/client/chat             # Trung tâm Trợ lý ảo AI Chatbot & Tin nhắn với Môi giới
/client/deals            # Danh sách giao dịch & đặt cọc của khách hàng
/client/activity         # Lịch hẹn xem nhà và hoạt động gần đây
/client/saved            # Danh sách BĐS đã lưu / yêu thích
/client/profile          # Hồ sơ cá nhân & cài đặt tài khoản
```

### 2. Cổng Môi giới (`BrokerLayout`)
```text
/broker                  # Bảng điều khiển (Dashboard) chỉ số môi giới
/broker/properties       # Quản lý danh sách tin đăng BĐS
/broker/properties/new   # Đăng tin BĐS mới kèm định vị tọa độ bản đồ
/broker/bookings         # Lịch hẹn dẫn khách xem nhà thực tế & online
/broker/customers        # Quản lý khách hàng tiềm năng & CRM
/broker/deals            # Quản lý tiến độ giao dịch và hợp đồng
/broker/profile          # Hồ sơ chuyên gia môi giới & chứng chỉ hành nghề
```

### 3. Cổng Quản trị (`AdminLayout`)
```text
/admin                   # Tổng quan hệ thống sàn BĐS
/admin/moderation        # Hàng đợi kiểm duyệt tin đăng BĐS mới
/admin/properties        # Quản lý toàn bộ kho BĐS trên nền tảng
/admin/users             # Quản lý tài khoản (Khách hàng, Môi giới, Phân quyền)
/admin/transactions      # Giám sát giao dịch cọc & hoa hồng
/admin/logs              # Nhật ký hoạt động hệ thống
/admin/settings          # Cấu hình tham số sàn giao dịch
```

---

## 💻 Cấu trúc thư mục mã nguồn

```text
src/
├── components/
│   ├── admin/             # Các modal và bảng biểu dành cho Admin
│   ├── chat/              # FloatingMessengerChat (Dock chat nổi góc màn hình)
│   ├── client/            # SearchFilterBar, InteractiveSearchMap
│   ├── common/            # PropertyCard, RealMap (Leaflet), LoadingSpinner
│   └── layout/            # ClientChrome, BrokerSidebar, AdminTopBar...
├── context/
│   ├── AuthContext.tsx    # Quản lý trạng thái đăng nhập, User Profile, Token JWT
│   └── LocationContext.tsx# Định vị GPS tự động & Dịch ngược địa chỉ (Reverse Geocode)
├── data/
│   └── mockData.ts        # Dữ liệu khởi tạo & danh mục BĐS
├── layouts/               # ClientLayout, BrokerLayout, AdminLayout
├── pages/                 # Các trang giao diện theo từng vai trò
├── services/              # API services (property, auth, admin, aiChat...)
├── types/                 # Định nghĩa TypeScript Interface (Property, User, Deal...)
└── utils/                 # addressSuggestions, location, format, validation
```

---

## ⚡ Hướng dẫn chạy và build

```bash
# Cài đặt thư viện
npm install

# Khởi chạy chế độ phát triển (Hot reload)
npm run dev
# Mở trình duyệt tại: http://localhost:5173/client

# Kiểm tra lỗi TypeScript & Build sản phẩm
npm run build
```
