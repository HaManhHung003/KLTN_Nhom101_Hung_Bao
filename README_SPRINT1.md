# 🚀 BDS Pro - Sprint 1: Portal Public + Guest & Bản đồ thông minh (v3.5)

> **Cập nhật:** Tháng 11/2026  
> **Phạm vi:** Hoàn thiện trải nghiệm **Guest / Client** trên Web & Mobile, chuẩn hoá **3 nhóm tác nhân chính** (Client / Customer / Seller), tích hợp **Định vị GPS tự động**, **Bản đồ tương tác Leaflet**, **Gợi ý địa chỉ Autocomplete**, **Trợ lý ảo AI Chatbot** và bộ dữ liệu thực tế 20 dự án BĐS hàng đầu.

---

## 📋 Tóm tắt

Sprint 1 tập trung xây dựng toàn diện **Portal Public & Tìm kiếm BĐS** dành cho khách vãng lai (Client / Guest) và người dùng, cho phép:

- Khám phá toàn bộ danh mục BĐS mua bán và cho thuê mà **không bắt buộc đăng ký / đăng nhập**.
- Tự động định vị GPS của người dùng ngay khi vừa truy cập ứng dụng (Web & Mobile).
- Tìm kiếm theo bán kính tùy chọn (`1km`, `3km`, `5km`, `10km`) quanh vị trí thực tế hoặc địa điểm tra cứu.
- Trải nghiệm Trợ lý ảo AI Chatbot tư vấn giá và gợi ý BĐS thông minh dựa trên vị trí GPS của người dùng.
- Trải nghiệm bản đồ số mượt mà, khắc phục triệt để lỗi che khuất gợi ý địa chỉ.

---

## 🏗️ Kiến trúc 3 Nhóm Tác Nhân Cốt Lõi

```text
┌────────────────────────────────────────────────────────┐
│             ADMIN (Quản trị viên hệ thống sàn)         │
├────────────────────────────────────────────────────────┤
│    SELLER (Người bán / Môi giới BĐS được cấp tài khoản)│
├────────────────────────────────────────────────────────┤
│    CUSTOMER (Khách hàng đã đăng ký & đăng nhập)        │
├────────────────────────────────────────────────────────┤
│    CLIENT (Khách vãng lai chưa đăng nhập) ◄── Sprint 1 │
└────────────────────────────────────────────────────────┘
```

---

## 🌟 Những nâng cấp đột phá mới (v3.5)

### 1. Định vị GPS tự động trên Web & Mobile (`LocationContext.tsx`)
* Tự động kích hoạt HTML5 Geolocation (`enableHighAccuracy: true`) ngay khi truy cập trang web hoặc mở ứng dụng mobile.
* Tự động lưu cache tọa độ vào `localStorage` giúp tải tức thì trong các phiên truy cập tiếp theo.
* Tích hợp **Reverse Geocoding** thông qua OpenStreetMap Nominatim: chuyển đổi kinh/vĩ độ thành tên Phường, Quận, Thành phố chuẩn xác mà không phụ thuộc API key tốn phí.
* Cung cấp nút ghim GPS với hiệu ứng pulsing beacon để người dùng cập nhật lại tọa độ bất cứ lúc nào.

### 2. Tìm kiếm BĐS theo Bán kính & Tra cứu địa chỉ trên Map
* Bộ lọc bán kính 1-click: `1 km`, `3 km`, `5 km`, `10 km`, `Tất cả`.
* Tính toán khoảng cách chính xác theo công thức **Haversine** từ tọa độ người dùng đến từng căn hộ.
* Ô tìm kiếm hỗ trợ **Gợi ý địa chỉ tức thì (Autocomplete)**: gợi ý Quận/Huyện, Tuyến đường trung tâm và các Khu đô thị / Dự án BĐS nổi tiếng.
* Khi nhập một địa chỉ bất kỳ và bấm Tra cứu, hệ thống tự động Geocode tâm bản đồ và quét bán kính xung quanh địa điểm đó.

### 3. Khắc phục triệt để lỗi Menu gợi ý bị Bản đồ che khuất (Leaflet Stacking Isolation)
* **Nguyên nhân gốc rễ:** Leaflet map panes mặc định mang `z-index: 200 – 1000`. Do `.leaflet-container` không có ngữ cảnh cô lập, các lớp bản đồ bị vẽ đè lên dropdown tìm kiếm.
* **Xử lý:** 
  - Khai báo CSS: `.leaflet-container { position: relative !important; z-index: 0 !important; isolation: isolate !important; }`.
  - Phân tầng lại z-index nội bộ của Leaflet (`z-index: 10..70`) thấp hơn các thành phần dropdown/menu của ứng dụng (`z-index: 50+`).
  - Menu gợi ý địa chỉ hiển thị nổi bật, bóng mờ sắc nét `shadow-2xl backdrop-blur-xl`.

### 4. Trợ lý ảo AI Chatbot tích hợp Vị trí GPS thời gian thực
* AI Chatbot tự động nhận tọa độ GPS và tên địa chỉ người dùng thông qua `LocationContext`.
* Trả lời và đề xuất chính xác các yêu cầu dạng: *"Tìm căn hộ gần tôi dưới 2,5 tỷ"*, *"Khu vực quanh tôi có dự án nào đang cho thuê không?"*.
* Cung cấp dock chat nổi góc màn hình 2 chế độ tiện dụng: `[ 💬 Môi giới | 🤖 Trợ lý AI GPS ]`.

### 5. Tái thiết kế UI/UX phong cách Luxury (Airbnb Modern)
* Giao diện phân chia màn hình tối ưu: **58% Bản đồ tương tác Leaflet** + **42% Danh sách BĐS kết quả**.
* Marker bản đồ dạng **Pill hiển thị giá tiền thực tế**, trạng thái active chuyển sang màu xanh ngọc (Emerald), click mở thẻ preview sang trọng.
* Thẻ BĐS ([`PropertyCard.tsx`](file:///d:/KLTN_Nhom101_Hung_Bao/BDS_Pro_Frontend/src/components/common/PropertyCard.tsx)): Bo góc hiện đại `rounded-3xl`, carousel chấm hover chuyển ảnh nhanh, tag chứng nhận pháp lý sổ hồng riêng, thông số diện tích và phòng ngủ tinh tế.
* Nút chuyển đổi giao diện trên điện thoại di động: `[ 🗺️ Bản đồ ]` ⇄ `[ 📋 Xem danh sách ]`.

### 6. Bộ dữ liệu chuẩn xác 20 BĐS thực tế & 59 hình ảnh chất lượng cao
* Khảo sát và nạp dữ liệu chuẩn xác của 20 dự án thực tế tại TP.HCM & Hà Nội:
  - *Vinhomes Central Park (Landmark 81)* — Q. Bình Thạnh
  - *The River Thủ Thiêm & Masteri Thảo Điền* — TP. Thủ Đức
  - *Vinhomes Grand Park (The Origami, Rainbow)* — TP. Thủ Đức
  - *KĐT Vạn Phúc City ven sông Sài Gòn* — TP. Thủ Đức
  - *KĐT Mizuki Park Nam Long* — Bình Chánh
  - *Eco Green Saigon & Chateau Phú Mỹ Hưng* — Quận 7
  - *Kingdom 101 & HaDo Centrosa Garden* — Quận 10
  - *Vinhomes Smart City Tây Mỗ & Vinhomes Ocean Park* — Hà Nội
* Kèm 59 hình ảnh căn hộ thực tế chất lượng cao và 80 địa điểm tiện ích xung quanh (POIs) đo đạc khoảng cách chuẩn xác.
* Đã xuất lưu đồng bộ vào [database/bds_pro_database_full.sql](file:///d:/KLTN_Nhom101_Hung_Bao/database/bds_pro_database_full.sql).

---

## 🧪 Hướng dẫn kiểm thử nhanh các tính năng mới

1. **Kiểm tra tự động định vị GPS:**
   - Truy cập `http://localhost:5173/client/tim-kiem`.
   - Trình duyệt hiển thị popup xin quyền vị trí -> Bấm **Allow (Cho phép)**.
   - Quan sát ô tìm kiếm hiển thị chấm xanh phát sóng (pulsing beacon) và badge: `Quanh: [Tên vị trí của bạn] (5km)`.
   - Vòng tròn màu xanh hiển thị bán kính quét quanh chấm ghim vị trí của bạn trên bản đồ.

2. **Kiểm tra gợi ý địa chỉ và chống che khuất:**
   - Nhập từ khóa: `Vạn Phúc` hoặc `Sala` hoặc `Quận 2`.
   - Danh sách gợi ý địa chỉ nổi lên mượt mà và nằm hoàn toàn trên lớp bản đồ, không bị cắt xén.

3. **Kiểm tra Chatbot AI định vị:**
   - Bấm vào biểu tượng Chatbot AI ở góc phải màn hình hoặc truy cập `/client/chat`.
   - Đặt câu hỏi: *"Tìm căn hộ gần tôi dưới 2,5 tỷ"* -> Chatbot đọc tọa độ GPS của bạn và trả về các căn hộ gần nhất kèm khoảng cách chi tiết (ví dụ: Origami Vinhomes Grand Park cách 3.2km giá 2.45 tỷ).

---

## ✅ Acceptance Criteria đạt được

- [x] Tự động định vị GPS khi người dùng mở trang Web hoặc Mobile App.
- [x] Hiển thị gợi ý địa chỉ tự động (Autocomplete) không bị bản đồ Leaflet che khuất.
- [x] Lọc và quét BĐS theo bán kính 1km, 3km, 5km, 10km quanh vị trí GPS hoặc địa điểm tra cứu.
- [x] Trợ lý AI Chatbot phân tích tọa độ người dùng để tư vấn BĐS gần nhất.
- [x] Giao diện UI/UX chuẩn Luxury phong cách Airbnb (thẻ bo tròn, marker giá nổi bật).
- [x] Cập nhật bộ dữ liệu thực tế 20 căn hộ/dự án chuẩn xác kèm 59 ảnh HD và 80 POIs.
- [x] Build toàn diện Frontend & Backend đạt 0 lỗi biên dịch.

---

*Khóa luận tốt nghiệp — Nhóm 101 Mạnh Hưng & Văn Bảo · Tháng 11/2026*
