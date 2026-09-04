# 🚀 BDS Pro - Sprint 1: Portal Public + Guest (v3.0)

> **Ngày:** 04/09/2026
> **Phạm vi:** Hoàn thiện trải nghiệm **Guest** trên Web, chuẩn hoá **4 vai trò** (guest / user / host / admin).

---

## 📋 Tóm tắt

Sau khi hoàn thành module Đăng ký / Đăng nhập, Sprint 1 tập trung xây dựng **Portal Public** dành cho khách vãng lai, cho phép họ:

- Khám phá toàn bộ tính năng nền tảng mà **không cần đăng ký**
- Truy cập đầy đủ các trang công khai: Landing, BĐS, Bản đồ, So sánh, Blog, Giới thiệu, Liên hệ
- Chuyển đổi Guest → User/Host dễ dàng qua **LoginRequiredModal** thân thiện

---

## 🏗️ Kiến trúc 4 Role

```
┌─────────────────────────────────────────────┐
│          ADMIN (Quản trị viên)              │
├─────────────────────────────────────────────┤
│       HOST (Môi giới / Chủ BĐS)             │
├─────────────────────────────────────────────┤
│       USER (Người tìm/thuê BĐS)             │
├─────────────────────────────────────────────┤
│       GUEST (Khách vãng lai)    ◄── Sprint 1 │
└─────────────────────────────────────────────┘
```

---

## 🆕 Thay đổi trong Sprint 1

### 1. Tài liệu (`docs/`)

- **`docs/PHAN-TICH-NGHIEP-VU.md`** — Bổ sung **Phụ lục v3.0**:
  - Ma trận chức năng chi tiết theo 4 role
  - Phân tích chức năng Guest (Portal Public)
  - 7 Use case chi tiết cho Guest
  - Phân tích dữ liệu mới (Blog, Liên hệ, So sánh)
  - Thiết kế UI/UX & API Endpoint mới
  - Lộ trình Sprint tiếp theo (Sprint 2-7)

### 2. Database (`database/`)

- **`database/bds_pro_migration_v3_public_guest.sql`** — Migration mới:
  - `blog_categories` (6 chuyên mục mẫu)
  - `blog_posts` (6 bài viết mẫu)
  - `contact_messages` (3 mẫu)
  - `site_stats` (6 metrics)
  - `global_points_of_interest` (17 POI toàn TP.HCM)

### 3. Backend NestJS (`BDS_Pro_Backend/src/`)

#### Module mới:

- **`modules/blog/`** — Blog CRUD + public read
  - `BlogModule`, `BlogService`, `BlogController`
  - Entities: `BlogCategory`, `BlogPost`
  - DTOs: `CreateBlogPostDto`, `UpdateBlogPostDto`, `QueryBlogDto`
  - Mapper: `toPublicBlogPost()`
  - Endpoints: `GET /blog/categories`, `GET /blog/posts`, `GET /blog/posts/slug/:slug`, `GET /blog/posts/:id/related`
  - Admin: `GET/POST/PATCH/DELETE /blog/posts/all`, `/blog/posts`, etc.

- **`modules/public/`** — Public APIs cho Guest
  - `PublicModule`, `PublicService`, `PublicController`
  - Entities: `GlobalPoi`, `ContactMessage`, `SiteStat`
  - Endpoints:
    - `GET /public/stats` — Thống kê nền tảng
    - `GET /public/pois` — POI toàn cục (filter category/city)
    - `GET /public/pois/nearby?lat&lng&radius` — POI trong bán kính (MySQL ST_Distance_Sphere)
    - `POST /public/contact` — Gửi form liên hệ
    - Admin: `GET/PATCH/DELETE /public/contact[/:id]`

#### Cập nhật:

- **`common/enums/index.ts`** — Thêm `BlogPostStatus`, `ContactStatus`; mở rộng `PoiCategory`
- **`app.module.ts`** — Đăng ký `BlogModule`, `PublicModule`
- **`database/seeds/seed.ts`** — Bổ sung seed: 6 blog categories, 6 blog posts, 3 contact messages, 6 site stats, 17 global POIs

### 4. Frontend React (`BDS_Pro_Frontend/src/`)

#### Services mới:

- **`services/blog.service.ts`** — `listCategories`, `getPosts`, `getFeatured`, `getPostBySlug`, `getRelated` + admin CRUD
- **`services/public.service.ts`** — `getStats`, `listPois`, `getNearbyPois`, `createContact` + admin
- **`services/compareStorage.ts`** — localStorage cho Guest (max 3 BĐS)

#### Layout mới:

- **`layouts/PublicLayout.tsx`** — Layout bọc các trang public
- **`components/layout/public/PublicHeader.tsx`** — Header sticky gradient (có counter so sánh)
- **`components/layout/public/PublicFooter.tsx`** — Footer 4 cột

#### Components Public:

- **`components/public/BlogCard.tsx`** — 3 variants (default / compact / featured)
- **`components/public/ContactForm.tsx`** — Form liên hệ (validate phía client)

#### Pages Public mới:

- **`pages/public/LandingPage.tsx`** — Redesign hoàn toàn (hero, search shortcut, featured, 4 role cards, blog, testimonials, CTA)
- **`pages/public/PublicPropertyListPage.tsx`** — Danh sách BĐS + filter (loại, giao dịch, khu vực, giá, PN)
- **`pages/public/PublicPropertyDetailPage.tsx`** — Chi tiết BĐS cho Guest (CTA chat/lưu/đặt lịch → LoginRequiredModal)
- **`pages/public/PublicMapPage.tsx`** — Bản đồ tổng quan Leaflet + marker BĐS + POI
- **`pages/public/ComparePage.tsx`** — Bảng so sánh tối đa 3 BĐS
- **`pages/public/BlogListPage.tsx`** — Danh sách blog với filter chuyên mục + search
- **`pages/public/BlogDetailPage.tsx`** — Chi tiết bài viết + bài liên quan + CTA
- **`pages/public/AboutPage.tsx`** — Giới thiệu sứ mệnh, đội ngũ, lộ trình
- **`pages/public/ContactPage.tsx`** — Form liên hệ + info + FAQ

#### Routes:

- **`routes/AppRouter.tsx`** — Thêm PublicLayout cho 9 routes mới

#### Types:

- **`types/index.ts`** — Thêm `BlogCategory`, `BlogPost`, `ContactMessage`, `SiteStats`; mở rộng `PoiCategory`

---

## 🚦 Hướng dẫn chạy

### 1. Database (MySQL)

```bash
# Chạy schema đầy đủ trước
mysql -u root -p < database/bds_pro_database_full.sql

# Sau đó chạy migration v3.0
mysql -u root -p bds_pro_db < database/bds_pro_migration_v3_public_guest.sql

# Hoặc dùng script seed tự động
cd BDS_Pro_Backend
npm run seed
```

### 2. Backend

```bash
cd BDS_Pro_Backend
npm install
npm run build
npm run start
# → Server: http://localhost:4000
# → API docs: http://localhost:4000/api/docs
# → New endpoints:
#    GET  /api/v1/public/stats
#    GET  /api/v1/public/pois
#    POST /api/v1/public/contact
#    GET  /api/v1/blog/categories
#    GET  /api/v1/blog/posts
#    GET  /api/v1/blog/posts/slug/:slug
```

### 3. Frontend

```bash
cd BDS_Pro_Frontend
npm install
npm run dev
# → Web: http://localhost:5173
```

### 4. Test nhanh (Guest flow)

1. Mở `http://localhost:5173/` → Landing Page
2. Click "Khám phá BĐS" → `/bat-dong-san`
3. Click 1 BĐS → Chi tiết
4. Click "Lưu tin" → **LoginRequiredModal** xuất hiện
5. Click "So sánh" trên các BĐS → `/so-sanh` để xem bảng so sánh
6. Click "Blog" → `/blog` → đọc bài viết
7. Click "Liên hệ" → gửi form
8. Đăng ký tài khoản → chuyển sang portal User/Host/Admin

### 5. Test tài khoản có sẵn (sau khi seed)

```
Email                     | Password | Role
--------------------------|----------|----------
admin@bdspro.vn           | 123456   | admin
vanbao@bdspro.vn          | 123456   | agent (host)
hung@gmail.com            | 123456   | agent (host)
minhanh@gmail.com         | 123456   | buyer (user)
thuha@gmail.com           | 123456   | buyer (user)
```

---

## ✅ Acceptance Criteria đạt được

- [x] FR-PUB01: Landing Page có hero, tin nổi bật, 4 role cards
- [x] FR-PUB02: Danh sách BĐS công khai + filter
- [x] FR-PUB03: Tìm kiếm BĐS trên bản đồ
- [x] FR-PUB04: Chi tiết BĐS cho Guest (gallery, POI, mô tả)
- [x] FR-PUB05: So sánh BĐS (tối đa 3, lưu localStorage)
- [x] FR-PUB06: Blog (danh sách + chi tiết + chuyên mục)
- [x] FR-PUB07: Trang Giới thiệu
- [x] FR-PUB08: Trang Liên hệ (form + thông tin)
- [x] FR-PUB09: Header & Footer public với đầy đủ nav
- [x] FR-PUB10: LoginRequiredModal khi Guest click thao tác cần auth
- [x] FR-B01-03: Blog CRUD + admin management
- [x] FR-CT01-02: Contact form + admin xử lý
- [x] Phân biệt 4 role (guest / user / host / admin) trong code & UI
- [x] Tài liệu docs cập nhật với phụ lục v3.0

---

## 📊 Thống kê

- **Backend:**
  - 2 module mới (Blog, Public)
  - 5 entity mới (BlogCategory, BlogPost, GlobalPoi, ContactMessage, SiteStat)
  - 12+ endpoint mới
- **Frontend:**
  - 9 trang public mới
  - 3 services mới
  - 1 layout + 2 header/footer
  - 2 components public mới
- **Database:**
  - 5 bảng mới
  - 6 chuyên mục + 6 bài blog
  - 17 POI toàn TP.HCM
- **Docs:**
  - Phụ lục v3.0 (~500 dòng) bổ sung vào PHAN-TICH-NGHIEP-VU.md

---

## 🚀 Sprint tiếp theo

- **Sprint 2:** User Portal hoàn chỉnh (đặt lịch, chat, đặt cọc)
- **Sprint 3:** Host Portal (CRM, đăng tin wizard)
- **Sprint 4:** Admin Portal (kiểm duyệt, quản lý user, blog, contact)
- **Sprint 5:** Chat real-time + Push Notification
- **Sprint 6:** Payment + Escrow
- **Sprint 7:** AI Chatbot + Analytics Dashboard

Xem chi tiết trong `docs/PHAN-TICH-NGHIEP-VU.md` §21.

---

*Đề tài KLTN Nhóm 101 Hùng Bảo · 04/09/2026*