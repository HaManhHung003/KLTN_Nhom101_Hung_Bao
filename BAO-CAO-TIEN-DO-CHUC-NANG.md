# 📊 BÁO CÁO TIẾN ĐỘ & PHÂN TÍCH CHỨC NĂNG HỆ THỐNG BDS PRO
> **Đề tài:** Xây dựng hệ thống mua bán và cho thuê bất động sản đa nền tảng (Web & Mobile App)  
> **Nhóm thực hiện:** Nhóm 101 — Mạnh Hưng & Văn Bảo  
> **Cập nhật ngày:** Tháng 11/2026  

---

## 📑 MỤC LỤC
1. [Phần 1: Các chức năng đã có sẵn khi clone source code ban đầu](#phần-1-các-chức-năng-đã-có-sẵn-khi-clone-source-code-ban-đầu)
2. [Phần 2: Các chức năng đã hoàn thành trong phiên làm việc này](#phần-2-các-chức-năng-đã-hoàn-thành-trong-phiên-làm-việc-này)
3. [Phần 3: Các chức năng và định hướng cần phát triển tiếp theo](#phần-3-các-chức-năng-và-định-hướng-cần-phát-triển-tiếp-theo)

---

## PHẦN 1: CÁC CHỨC NĂNG ĐÃ CÓ SẴN KHI CLONE SOURCE CODE BAN ĐẦU

Khi bắt đầu clone dự án về, hệ thống đã có sẵn khung kiến trúc cơ bản và các module nền móng sau:

### 1. Kiến trúc hệ thống & Cơ sở dữ liệu
* **Backend:** Xây dựng trên nền tảng **NestJS 10 + TypeORM + MySQL**, hỗ trợ kiến trúc module hóa theo chuẩn RESTful API.
* **Frontend:** Nền tảng **React 19 + TypeScript + Vite + Tailwind CSS**, phân chia layout theo 3 portal cơ bản.
* **Cơ sở dữ liệu ban đầu:** Tệp `bds_pro_database_full.sql` chứa các bảng chính: `users`, `properties`, `media`, `appointments`, `conversations`, `messages`, `favorites`, `pois`.

### 2. Module Xác thực & Quản lý người dùng (Authentication & Users)
* **Đăng ký tài khoản:** Cho phép người dùng đăng ký tài khoản với 2 vai trò cơ bản: Khách hàng mua/thuê (`buyer`) và Môi giới (`agent`).
* **Đăng nhập hệ thống:** Xác thực người dùng qua JWT (Access Token & Refresh Token) lưu trong trình duyệt.
* **Quên mật khẩu:** Gửi mã xác thực OTP qua Email (Nodemailer) để đặt lại mật khẩu.
* **Phân quyền cơ bản:** Route guards kiểm tra vai trò người dùng trước khi truy cập các trang chuyên biệt.

### 3. Module Quản lý Bất động sản (Properties)
* **CRUD BĐS cơ bản:** API cho phép tạo mới, xem danh sách, cập nhật thông tin và xóa bài đăng BĐS.
* **Tải ảnh:** Hỗ trợ tải ảnh BĐS qua dịch vụ Cloudinary hoặc lưu trữ cục bộ.
* **Hiển thị danh sách & Chi tiết:** Giao diện xem danh sách BĐS dạng lưới và trang xem chi tiết thông số phòng ngủ, phòng tắm, diện tích, giá bán/thuê.

### 4. Module Đặt lịch xem nhà & Trò chuyện (Appointments & Messaging)
* **Lịch hẹn xem nhà:** Khách hàng có thể tạo yêu cầu lịch hẹn xem BĐS với thời gian cụ thể; Môi giới có thể xem danh sách lịch hẹn cần xác nhận.
* **Tin nhắn 1-1:** Khung chat cơ bản giữa Khách hàng và Môi giới gắn với từng bài đăng BĐS.

### 5. Cổng Quản trị viên (Admin Portal)
* **Kiểm duyệt tin đăng:** Hàng đợi kiểm duyệt danh sách tin BĐS mới đăng (chuyển trạng thái từ `pending` sang `active` hoặc `rejected`).
* **Quản lý tài khoản:** Danh sách người dùng trong hệ thống (khóa tài khoản, xem vai trò).

---

## PHẦN 2: CÁC CHỨC NĂNG ĐÃ HOÀN THÀNH TRONG PHIÊN LÀM VIỆC NÀY

Trong phiên làm việc này, toàn bộ các lỗi hiển thị, cơ chế định vị GPS, trí tuệ nhân tạo AI Chatbot, bản đồ số tương tác và dữ liệu thực tế đã được nâng cấp và hoàn thiện vượt bậc:

### 1. Khắc phục triệt để lỗi Menu gợi ý bị Bản đồ che khuất (Leaflet Stacking Isolation)
* **Vấn đề trước đó:** Khi người dùng gõ từ khóa vào ô tìm kiếm, bảng danh sách gợi ý địa chỉ bị lớp gạch bản đồ Leaflet cắt ngang và đè lên (do Leaflet panes mặc định mang `z-index: 200 – 1000`).
* **Giải pháp hoàn thiện:**
  - Cập nhật trong `src/index.css`: Thiết lập `.leaflet-container` với `position: relative !important; z-index: 0 !important; isolation: isolate !important;`, giữ toàn bộ các lớp bản đồ bị cô lập tuyệt đối bên trong stacking context riêng biệt.
  - Phân tầng lại các pane nội bộ của Leaflet (`z-index: 10..70`) thấp hơn các thành phần dropdown/menu của ứng dụng (`z-index: 50+`).
  - Thanh tìm kiếm và menu dropdown gợi ý được nâng lên `relative z-50` kết hợp đổ bóng `shadow-2xl backdrop-blur-xl`, hiển thị nổi bật 100% trên bề mặt bản đồ.

### 2. Tự động định vị vị trí GPS đa nền tảng (`LocationContext.tsx`)
* **Tự động kích hoạt khi mở Web/App:** Khi vừa truy cập trang, hệ thống tự động gọi HTML5 Geolocation (`enableHighAccuracy: true`) để xin tọa độ GPS của người dùng mà không bắt buộc phải bấm nút thủ công.
* **Lưu cache thông minh:** Tự động ghi nhớ tọa độ vào `localStorage`, giúp tải tức thì vị trí trong những lần truy cập kế tiếp.
* **Dịch ngược địa chỉ (Reverse Geocoding):** Tích hợp dịch vụ OpenStreetMap Nominatim hoàn toàn miễn phí, tự động chuyển đổi kinh/vĩ độ thành tên Phường, Quận, Tỉnh/TP trực quan (ví dụ: *Hiệp Bình Phước, TP. Thủ Đức*).
* **Nút ghim GPS chủ động:** Cung cấp nút định vị kèm hiệu ứng sóng radar phát sáng (pulsing beacon) để người dùng làm mới tọa độ bất cứ lúc nào.

### 3. Tìm kiếm BĐS theo Bán kính quét & Tra cứu địa chỉ trên Map
* **Bộ lọc bán kính 1-click:** Cung cấp các mức bán kính chuẩn: `1 km`, `3 km`, `5 km`, `10 km` hoặc `Tất cả`.
* **Tính khoảng cách theo công thức Haversine:** Tự động đo khoảng cách chính xác từ tọa độ GPS của người dùng đến từng căn hộ và sắp xếp ưu tiên căn gần nhất.
* **Vòng tròn bán kính trực quan (Leaflet Circle):** Hiển thị vòng tròn màu xanh ngọc bao quanh vị trí người dùng trên bản đồ số, thể hiện rõ vùng quét BĐS.
* **Tra cứu địa chỉ linh hoạt:** Khi gõ bất kỳ địa chỉ nào vào ô tìm kiếm và bấm Tra cứu, bản đồ tự động dịch chuyển tâm và quét BĐS quanh địa điểm đó.

### 4. Gợi ý địa chỉ tự động thông minh (Address Autocomplete)
* Xây dựng module `addressSuggestions.ts` hỗ trợ gợi ý địa chỉ tức thì ngay khi gõ phím.
* Phân loại gợi ý thành 3 nhóm rõ ràng có icon riêng:
  - **Quận / Huyện & Thành phố:** Quận 1, Quận 2, Quận 7, Bình Thạnh, TP. Thủ Đức, Nam Từ Liêm...
  - **Dự án & Khu đô thị nổi tiếng:** Vinhomes Central Park, The River Thủ Thiêm, Masteri Thảo Điền, Sala Đại Quang Minh, KĐT Vạn Phúc City, Mizuki Park, Vinhomes Smart City...
  - **Tuyến đường huyết mạch:** Hai Bà Trưng, Mai Chí Thọ, Xa lộ Hà Nội, Nguyễn Thị Thập...
* Tự động bổ sung kết quả tra cứu trực tuyến nếu từ khóa tìm kiếm nằm ngoài danh sách có sẵn.

### 5. Trợ lý ảo AI Chatbot tích hợp Vị trí GPS thời gian thực
* **Định vị trong hội thoại AI:** Chatbot AI tự động nhận tọa độ GPS và tên địa chỉ người dùng thông qua `LocationContext`.
* **Phân tích và gợi ý BĐS gần nhất:** Trả lời chính xác các yêu cầu phức tạp như:
  - *"Tìm căn hộ gần tôi dưới 2,5 tỷ"* -> Chatbot nhận diện vị trí hiện tại, tìm các căn hộ trong bán kính gần nhất có giá thỏa mãn và trả về danh sách kèm khoảng cách chi tiết (ví dụ: Origami Vinhomes Grand Park cách 3.2km giá 2.45 tỷ).
  - *"Tư vấn thủ tục pháp lý sổ hồng riêng"*, *"Tính lãi suất vay ngân hàng mua nhà"*.
* **Dock chat nổi 2 chế độ phong cách hiện đại:** Nằm gọn gàng ở góc dưới bên phải màn hình: `[ 💬 Môi giới | 🤖 Trợ lý AI GPS ]`.

### 6. Nâng cấp toàn diện giao diện UI/UX (Luxury Airbnb Style)
* **Giao diện phân chia màn hình tối ưu:** **58% Bản đồ tương tác Leaflet** + **42% Danh sách BĐS kết quả**.
* **Thanh tìm kiếm & bộ lọc:** Bộ chuyển đổi Mua / Thuê segmented pill, nút ghim định vị pulsing, popover chọn nhanh khoảng giá (Dưới 2 tỷ, 2-5 tỷ, 5-10 tỷ...) không cần kéo slider phức tạp.
* **Thẻ BĐS (`PropertyCard.tsx`):** Bo góc lớn `rounded-3xl`, viền mờ cao cấp, hiệu ứng zoom ảnh mượt, carousel chấm hover chuyển ảnh nhanh, badge xác thực pháp lý.
* **Bản đồ tương tác (`RealMap.tsx`):** Marker dạng **Pill hiển thị giá tiền thực tế**, trạng thái active chuyển sang màu xanh ngọc (Emerald), click mở thẻ preview sang trọng kèm nút xem chi tiết.
* **Thanh chuyển đổi Mobile:** Nút nổi tròn bo góc `[ 🗺️ Bản đồ ]` ⇄ `[ 📋 Xem danh sách ]` thuận tiện khi thao tác trên điện thoại bằng một tay.

### 7. Bộ dữ liệu mẫu 20 BĐS thực tế & 59 hình ảnh chất lượng cao & 80 POIs
* Khảo sát và nạp dữ liệu chuẩn xác của **20 dự án thực tế tại TP.HCM & Hà Nội**:
  - *Vinhomes Central Park (Landmark 81)* — Q. Bình Thạnh
  - *The River Thủ Thiêm & Masteri Thảo Điền* — TP. Thủ Đức
  - *Vinhomes Grand Park (The Origami & The Rainbow)* — TP. Thủ Đức
  - *KĐT Vạn Phúc City ven sông Sài Gòn* — TP. Thủ Đức
  - *KĐT Mizuki Park Nam Long* — Bình Chánh
  - *The Sun Avenue & Đảo Kim Cương (Diamond Island)* — TP. Thủ Đức
  - *Eco Green Saigon & Lâu đài Chateau Phú Mỹ Hưng* — Quận 7
  - *Kingdom 101 & HaDo Centrosa Garden* — Quận 10
  - *Vinhomes Smart City Tây Mỗ & Vinhomes Ocean Park* — Hà Nội
* Đầy đủ **59 hình ảnh chất lượng cao** và **80 địa điểm tiện ích xung quanh (POIs)** đo đạc khoảng cách thực tế (Metro, Vincom, BV Vinmec, ĐH Bách Khoa...).
* Dữ liệu đã được nạp hoàn chỉnh vào MySQL và đồng bộ sang file `database/bds_pro_database_full.sql`.

### 8. Hoàn thiện hệ thống tài liệu & Dọn dẹp dự án
* Bổ sung mục phân tích ma trận chức năng Tìm kiếm & Khám phá BĐS theo 3 tác nhân (Client / Customer / Seller) vào `docs/PHAN-TICH-NGHIEP-VU.md`.
* Đồng bộ lại toàn bộ các file tài liệu: `README.md`, `README_SPRINT1.md`, `BDS_Pro_Frontend/README.md`.
* Dọn dẹp sạch sẽ toàn bộ các file tạm, test script và thư mục rác trong workspace.
* Kiểm thử build toàn bộ Frontend & Backend đạt **0 lỗi**.

---

## PHẦN 3: CÁC CHỨC NĂNG VÀ ĐỊNH HƯỚNG CẦN PHÁT TRIỂN TIẾP THEO

Dưới đây là các chức năng tiếp theo được phân nhóm theo lộ trình thực hiện để hoàn thiện đồ án tốt nghiệp đạt điểm tối đa:

### 1. Module Đặt cọc & Thanh toán trực tuyến (Escrow / Deposit Payment) — Ưu tiên số 1
* **Tích hợp Cổng thanh toán:** Kết nối cổng thanh toán trực tuyến phổ biến tại Việt Nam (VNPay Sandbox, MoMo, hoặc tạo mã QR chuyển khoản VietQR tự động kiểm tra biến động số dư).
* **Cơ chế giữ cọc trung gian (Escrow Service):**
  - Tiền cọc được hệ thống sàn tạm giữ an toàn trong thời gian hai bên gặp mặt thẩm định pháp lý và ký hợp đồng.
  - Tự động hoàn cọc hoặc giải ngân cho môi giới/chủ nhà khi hai bên xác nhận hoàn tất giao dịch hoặc có vi phạm cam kết.
* **Biên lai & Hợp đồng đặt cọc điện tử:** Tự động sinh file PDF hợp đồng đặt cọc có mã QR bảo mật và chữ ký số điện tử để người dùng tải về.

### 2. Nâng cấp AI Chatbot với LLM thông minh (Google Gemini API) & RAG — Ưu tiên số 2
* **Tích hợp mô hình ngôn ngữ lớn (Google Gemini 1.5 Flash):** Thay thế phản hồi cứng bằng mô hình AI tạo sinh thông minh, có khả năng đàm thoại tự nhiên và hiểu ngữ cảnh sâu sắc.
* **Kỹ thuật RAG (Retrieval-Augmented Generation):**
  - Nhúng (Embed) dữ liệu 20+ BĐS, tiện ích, chính sách pháp lý vào cơ sở dữ liệu vector.
  - Khi người dùng hỏi bất kỳ câu hỏi nào (ví dụ: *"Có căn nào gần trường Bách Khoa yên tĩnh cho sinh viên ở không?"*), hệ thống tự động truy xuất các căn phù hợp nhất cung cấp vào context của Gemini để AI trả lời sát thực tế 100%.
* **Tìm kiếm bằng giọng nói (Voice Search / Voice AI):** Tích hợp Web Speech API cho phép người dùng bấm nút micro để nói yêu cầu tìm kiếm thay vì gõ chữ.

### 3. Mở rộng tính năng CRM Chuyên nghiệp cho Môi giới (Seller Portal) — Ưu tiên số 3
* **Bảng Kanban quản lý phễu khách hàng (Lead Funnel):**
  - Phân loại khách hàng theo các cột: *Khách mới quan tâm* -> *Đã liên hệ* -> *Đã hẹn xem nhà* -> *Đang đàm phán giá* -> *Đã đặt cọc* -> *Giao dịch thành công*.
* **Báo cáo & Phân tích hiệu suất (Broker Analytics):**
  - Biểu đồ số lượt xem tin đăng theo ngày/tuần, tỷ lệ chuyển đổi từ lượt xem sang cuộc gọi/tin nhắn.
  - Thống kê căn hộ nào đang nhận được nhiều sự quan tâm nhất trong khu vực.
* **Công cụ tự động ghép khách (Smart Matching):** Khi môi giới đăng một căn hộ mới, hệ thống tự động quét danh sách nhu cầu của khách hàng để thông báo có người phù hợp.

### 4. Hệ thống Thông báo thời gian thực & Lịch cá nhân (Notifications & Calendar Sync)
* **Real-time Push Notifications:** Sử dụng WebSocket (`Socket.io`) hoặc Web Push để đẩy thông báo tức thì lên màn hình khi có:
  - Tin nhắn mới từ môi giới / khách hàng.
  - Lịch hẹn xem nhà được xác nhận hoặc dời giờ.
  - Tin đăng BĐS được Admin duyệt công khai.
* **Đồng bộ Google Calendar / Apple Calendar:** Khi khách hàng đặt lịch xem nhà thành công, hệ thống cung cấp nút *"Thêm vào Google Calendar"* và tự động gửi tệp `.ics` qua Email xác nhận.

### 5. Ứng dụng Di động chuyên dụng (PWA / Mobile App)
* **Triển khai PWA (Progressive Web App):** Cấu hình `manifest.json` và Service Worker để người dùng có thể cài đặt ứng dụng BDS Pro trực tiếp lên màn hình chính của iPhone và Android mà không cần tải từ App Store/CH Play.
* **Trải nghiệm Mobile tối ưu:** Tận dụng tối đa camera để quét mã QR căn hộ khi đến xem thực tế và cảm biến GPS nền để dẫn đường trực tiếp từ vị trí hiện tại đến căn hộ.

### 6. Kiểm thử tự động (E2E Test) & Triển khai lên Máy chủ (DevOps / Deployment)
* **Bộ kiểm thử tự động với Playwright:** Viết test tự động cho toàn bộ luồng nghiệp vụ cốt lõi:
  - Khách vãng lai vào trang -> Tự động nhận GPS -> Gõ tìm kiếm "Vạn Phúc" -> Lọc bán kính 5km -> Click marker xem BĐS -> Đặt lịch xem -> Chat AI.
* **Đóng gói Docker & Triển khai Production:**
  - Dockerize Backend NestJS và MySQL database.
  - Triển khai Frontend lên Vercel / Netlify (hỗ trợ HTTPS và CDN toàn cầu).
  - Triển khai Backend lên máy chủ Cloud (VPS Ubuntu / AWS / Render) với chứng chỉ SSL/TLS miễn phí từ Let's Encrypt.

---

## 📌 BẢNG TỔNG HỢP TRẠNG THÁI CHỨC NĂNG

| STT | Nhóm chức năng | Tên tính năng cụ thể | Trạng thái |
|:---:|:---|:---|:---:|
| 1 | **Xác thực & Tài khoản** | Đăng ký, Đăng nhập JWT, Quên mật khẩu OTP Email | <span style="color:green">✅ Đã hoàn thành (Sẵn có)</span> |
| 2 | **Quản lý BĐS** | CRUD tin đăng, tải ảnh, duyệt tin BĐS (Admin) | <span style="color:green">✅ Đã hoàn thành (Sẵn có)</span> |
| 3 | **Giao dịch cơ bản** | Đặt lịch xem nhà, Nhắn tin trao đổi 1-1 | <span style="color:green">✅ Đã hoàn thành (Sẵn có)</span> |
| 4 | **Bản đồ số tương tác** | Tích hợp Leaflet, Pill Marker hiển thị giá, Card Preview | <span style="color:green">✅ Đã hoàn thành (Mới xong)</span> |
| 5 | **Sửa lỗi hiển thị bản đồ** | Cô lập Stacking Context Leaflet chống che menu gợi ý | <span style="color:green">✅ Đã hoàn thành (Mới xong)</span> |
| 6 | **Định vị vị trí GPS** | Tự động định vị GPS trên Web/Mobile & Reverse Geocode OSM | <span style="color:green">✅ Đã hoàn thành (Mới xong)</span> |
| 7 | **Tìm kiếm nâng cao** | Lọc bán kính 1-10km (Haversine), Autocomplete gợi ý địa chỉ | <span style="color:green">✅ Đã hoàn thành (Mới xong)</span> |
| 8 | **Trí tuệ nhân tạo (AI)** | Chatbot AI định vị GPS tư vấn căn hộ theo ngân sách | <span style="color:green">✅ Đã hoàn thành (Mới xong)</span> |
| 9 | **Thiết kế giao diện** | Tái thiết kế UI/UX Luxury phong cách Airbnb (Emerald) | <span style="color:green">✅ Đã hoàn thành (Mới xong)</span> |
| 10 | **Dữ liệu thực tế** | Bộ 20 dự án thực tế, 59 hình ảnh HD, 80 tiện ích POIs | <span style="color:green">✅ Đã hoàn thành (Mới xong)</span> |
| 11 | **Thanh toán trực tuyến** | Tích hợp VNPay / MoMo / VietQR, Giữ cọc trung gian (Escrow) | <span style="color:orange">⏳ Cần làm tiếp theo</span> |
| 12 | **Nâng cấp AI nâng cao** | Tích hợp Google Gemini 1.5 API + RAG dữ liệu BĐS | <span style="color:orange">⏳ Cần làm tiếp theo</span> |
| 13 | **CRM Môi giới nâng cao** | Bảng Kanban theo dõi phễu khách hàng & Báo cáo biểu đồ | <span style="color:orange">⏳ Cần làm tiếp theo</span> |
| 14 | **Thông báo thời gian thực** | Socket.io Push Notifications, Đồng bộ Google Calendar | <span style="color:orange">⏳ Cần làm tiếp theo</span> |
| 15 | **Ứng dụng di động** | Đóng gói PWA cho điện thoại di động | <span style="color:orange">⏳ Cần làm tiếp theo</span> |
| 16 | **Kiểm thử & Triển khai** | Viết E2E Test tự động (Playwright) & Deploy Cloud Production | <span style="color:orange">⏳ Cần làm tiếp theo</span> |

---

*Báo cáo được tổng hợp đầy đủ phục vụ theo dõi tiến độ đồ án tốt nghiệp Nhóm 101.*

