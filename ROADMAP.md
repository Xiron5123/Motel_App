# ROADMAP - Ứng Dụng Cho Thuê Trọ (Backend + Mobile)
## MVP Timeline: 10-12 ngày
## Cập nhật: 04/11/2025

---

## 📊 TIẾN ĐỘ HIỆN TẠI

**Phase:** Backend Development  
**Tiến độ:** Day 3/12 (25%)  
**Commit:** `Day 1-3: Initial setup + Auth + Users + Listings CRUD`  
**Repository:** [github.com/Xiron5123/Motel_App](https://github.com/Xiron5123/Motel_App)

### ✅ Hoàn thành:
- Day 1: Project setup + Database schema
- Day 2: Auth + Users + Become Landlord flow
- Day 3: Listings CRUD + Search & Filter

### ⏳ Tiếp theo:
- Day 4: Favorites + BookingRequest
- Day 5: Chat realtime (Socket.IO)
- Day 6-7: Mobile app (React Native + Expo)

---

## 🎯 MỤC TIÊU & PHẠM VI MVP

### Người dùng (User → Renter):
- ✅ Đăng ký/Đăng nhập (mặc định role = RENTER)
- ✅ Xem danh sách trọ (tìm kiếm, lọc theo giá/tiện ích/khoảng cách)
- ✅ Xem chi tiết phòng trọ (ảnh, mô tả, giá, tiện ích)
- ⏳ Lưu tin yêu thích
- ⏳ Gửi yêu cầu thuê
- ⏳ Chat realtime với chủ trọ

### Nâng cấp lên Chủ trọ (Landlord):
- ✅ **POST /users/become-landlord** (upgrade role)
- ✅ Đăng tin cho thuê (ảnh, giá, địa chỉ, mô tả, tiện ích)
- ✅ Chỉnh sửa/Xóa tin đăng
- ⏳ Quản lý yêu cầu thuê (chấp nhận/từ chối)
- ⏳ Chat realtime với người thuê

### Tính năng chung:
- ⏳ Chat realtime 1-1 (Socket.IO)
- ⏳ Upload ảnh (Cloudinary integration)
- ⏳ Thông báo push (booking, message)
- ✅ Phân quyền động (RENTER → LANDLORD)

### ❌ Ngoài phạm vi MVP (để backlog):
- Thanh toán online (Stripe/VNPay)
- Review/Rating
- KYC/Verification
- Map tích hợp Google Maps (chỉ có lat/lng)
- Analytics dashboard
- Admin CMS riêng
- Web Frontend

---

## 🛠️ TECH STACK

### Backend:
- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL (local)
- **ORM:** Prisma
- **Auth:** JWT + Refresh Token (HttpOnly cookies)
- **Realtime:** Socket.IO (chưa implement)
- **Upload:** Cloudinary signed URL (chưa implement)
- **Validation:** class-validator + class-transformer
- **API Docs:** Swagger/OpenAPI
- **Security:** bcrypt, CORS, Guards

### Mobile (Chưa bắt đầu):
- **Framework:** React Native + Expo
- **State:** React Query (TanStack Query)
- **Navigation:** Expo Router
- **UI:** React Native Paper
- **Notifications:** Expo Notifications
- **Storage:** expo-secure-store (tokens)
- **Chat:** Socket.IO client

### DevOps:
- **Version Control:** Git + GitHub
- **Package Manager:** pnpm (monorepo)
- **Local DB:** Docker Compose (PostgreSQL + pgAdmin)
- **Backend Deploy:** Railway / Render (chưa deploy)
- **Mobile Build:** EAS Build (chưa cấu hình)

---

## 📊 MÔ HÌNH DỮ LIỆU

```prisma
model User {
  id        String   @id @default(cuid())
  role      Role     @default(RENTER)
  name      String
  email     String   @unique
  phone     String?  @unique
  password  String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  listings         Listing[]
  bookingRequests  BookingRequest[]
  favorites        Favorite[]
  messages         Message[]
  participants     ConversationParticipant[]
  notifications    Notification[]
  refreshTokens    RefreshToken[]
}

enum Role {
  RENTER
  LANDLORD
}

model Listing {
  id          String   @id @default(cuid())
  landlordId  String
  landlord    User     @relation(fields: [landlordId], references: [id], onDelete: Cascade)
  
  title       String
  description String
  price       Float
  deposit     Float?
  area        Float    // m2
  address     String
  lat         Float?
  lng         Float?
  amenities   String[] // ["wifi", "parking", "kitchen"]
  status      ListingStatus @default(AVAILABLE)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  photos          Photo[]
  bookingRequests BookingRequest[]
  favorites       Favorite[]
  
  @@index([landlordId])
  @@index([status])
  @@index([price])
}

enum ListingStatus {
  AVAILABLE
  RENTED
  UNAVAILABLE
}

model Photo {
  id        String  @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  order     Int     @default(0)
  
  @@index([listingId])
}

model BookingRequest {
  id        String   @id @default(cuid())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  renterId  String
  renter    User     @relation(fields: [renterId], references: [id], onDelete: Cascade)
  
  status    BookingStatus @default(PENDING)
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([listingId])
  @@index([renterId])
  @@index([status])
}

enum BookingStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}

model Conversation {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt       DateTime     @default(now())
  
  @@id([conversationId, userId])
  @@index([userId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  content        String?
  imageUrl       String?
  createdAt      DateTime     @default(now())
  readAt         DateTime?
  
  @@index([conversationId])
  @@index([senderId])
}

model Favorite {
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@id([userId, listingId])
  @@index([userId])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // "BOOKING_CREATED", "BOOKING_ACCEPTED", "NEW_MESSAGE"
  data      Json     // {listingId, bookingId, etc}
  readAt    DateTime?
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([readAt])
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([token])
}
```

---

## 🔌 API ENDPOINTS (High-Level)

### Auth
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất

### User
- `GET /me` - Lấy thông tin user hiện tại
- `PATCH /me` - Cập nhật profile
- `PATCH /me/avatar` - Upload avatar

### Listings
- `GET /listings` - Danh sách (query: q, priceMin, priceMax, amenities, lat, lng, radius, page, limit)
- `GET /listings/:id` - Chi tiết
- `POST /listings` - Tạo (landlord only)
- `PATCH /listings/:id` - Cập nhật (landlord only)
- `DELETE /listings/:id` - Xóa (landlord only)

### Photos
- `POST /uploads/sign` - Lấy signed URL từ Cloudinary
- `POST /listings/:id/photos` - Thêm ảnh vào listing
- `DELETE /photos/:id` - Xóa ảnh

### Booking Requests
- `POST /bookings` - Tạo yêu cầu (renter)
- `GET /bookings` - Danh sách (query: role=renter|landlord, status)
- `GET /bookings/:id` - Chi tiết
- `PATCH /bookings/:id/status` - Cập nhật trạng thái (landlord: accept/reject, renter: cancel)

### Chat
- `GET /conversations` - Danh sách cuộc trò chuyện
- `GET /conversations/:id` - Chi tiết + messages
- `POST /conversations` - Tạo conversation với user
- `POST /messages` - Gửi message (REST fallback)
- `PATCH /messages/:id/read` - Đánh dấu đã đọc

### WebSocket (Socket.IO)
- `connection` - Kết nối
- `join_conversation` - Join room
- `send_message` - Gửi tin nhắn realtime
- `typing` - Đang gõ
- `read_message` - Đã đọc

### Favorites
- `POST /favorites` - Lưu tin
- `DELETE /favorites/:listingId` - Bỏ lưu
- `GET /favorites` - Danh sách tin đã lưu

### Notifications
- `GET /notifications` - Danh sách thông báo
- `PATCH /notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /notifications/read-all` - Đánh dấu tất cả

---

## 📅 CHI TIẾT TIMELINE

### **✅ TUẦN 1: Backend Core (HOÀN THÀNH)**

#### **✅ Day 1: Project Setup & Database**
**Backend:**
- ✅ Khởi tạo monorepo (pnpm workspace: `backend/`, `mobile/`)
- ✅ Setup NestJS project (TypeScript, ESLint, Prettier)
- ✅ Cấu hình Prisma + PostgreSQL schema (10 models)
- ✅ Migration đầu tiên
- ✅ Docker Compose (Postgres, pgAdmin)
- ✅ Seed data mẫu

**Deliverables:** 
- ✅ Monorepo structure
- ✅ Database running locally
- ✅ Git + GitHub setup

---

#### **✅ Day 2: Auth & User Management**
**Backend:**
- ✅ Module Auth: Register, Login, Refresh, Logout
- ✅ JWT strategy (access token 15min, refresh token 7 days)
- ✅ Password hashing (bcrypt)
- ✅ Guards: JwtAuthGuard, RolesGuard
- ✅ **Module Users** (mới):
  - ✅ GET /users/me
  - ✅ PATCH /users/me
  - ✅ **POST /users/become-landlord** (upgrade role)
- ✅ Global validation pipe
- ✅ Swagger setup

**Testing:**
- ✅ PowerShell scripts test flow

**Deliverables:**
- ✅ Auth API hoàn chỉnh
- ✅ **User role upgrade flow**
- ✅ Swagger docs: http://localhost:3000/api/docs

---

#### **✅ Day 3: Listings CRUD & Search**
**Backend:**
- ✅ Module Listings: CRUD endpoints
- ✅ Ownership validation (LANDLORD only)
- ✅ Photos management (Add/Remove)
- ✅ Search & Filter:
  - ✅ Text search (title, description, address)
  - ✅ Price range (priceMin, priceMax)
  - ✅ Amenities filter
  - ✅ Geo-distance (Haversine formula)
  - ✅ Pagination
- ✅ GET /listings/my (landlord's listings)

**Testing:**
- ✅ Seed 2 listings
- ✅ Test GET /listings with filters

**Deliverables:**
- ✅ Listings API hoàn chỉnh
- ✅ Search & filter working
- ❌ Cloudinary (chỉ có URL, chưa tích hợp upload)

---

#### **Day 4: Advanced Search & Favorites**
**Backend:**
- [ ] Search filter: amenities (array filter)
- [ ] Geo search: haversine distance (lat, lng, radius)
- [ ] Pagination (cursor-based hoặc offset)
- [ ] Module Favorites: Add/Remove/List
- [ ] Database indexes: listings(status, price), photos(listingId)

**Testing:**
- [ ] Test search với nhiều filters

**Deliverables:**
- Search API hoàn chỉnh
- Favorites API

---

#### **Day 5: Booking Requests**
**Backend:**
- [ ] Module BookingRequest: CRUD
- [ ] State machine: PENDING → ACCEPTED/REJECTED/CANCELLED
- [ ] Business rules:
  - Renter tạo booking
  - Landlord accept/reject
  - Renter cancel (chỉ khi PENDING)
- [ ] Notification record khi status thay đổi
- [ ] Module Notifications: List, MarkRead

**Testing:**
- [ ] Flow: Renter gửi → Landlord accept → Notification

**Deliverables:**
- BookingRequest API
- Notification system (record only, chưa push)

---

#### **Day 6: Chat REST API & Socket.IO**
**Backend:**
- [ ] Module Conversation: Create, List, GetMessages
- [ ] Module Message: Send (REST)
- [ ] Gateway Socket.IO:
  - Authentication middleware (JWT)
  - Events: `join_conversation`, `send_message`, `typing`, `read_message`
  - Rooms per conversation
- [ ] Persist messages vào DB
- [ ] Mark messages as read

**Testing:**
- [ ] Postman + Socket.IO client (Postman/web debug)

**Deliverables:**
- Chat REST + WebSocket working
- 2 users có thể chat realtime

---

#### **Day 7: Mobile App Scaffold**
**Mobile:**
- [ ] Init Expo project (`npx create-expo-app mobile`)
- [ ] Expo Router setup
- [ ] UI library: React Native Paper / NativeBase
- [ ] Auth screens: Login, Register
- [ ] API client (Axios + React Query)
- [ ] Secure token storage (expo-secure-store)
- [ ] Auth context/provider
- [ ] Navigation guards (protected routes)

**Testing:**
- [ ] Login → Store token → Navigate to home

**Deliverables:**
- Mobile app có Auth flow hoàn chỉnh

---

### **TUẦN 2: Mobile Features + Polish**

#### **Day 8: Mobile Listings Catalog & Detail**
**Mobile:**
- [ ] Home screen: Listings list (FlatList)
- [ ] Search bar + Filters modal (price, amenities)
- [ ] Listing card component (ảnh, giá, địa chỉ)
- [ ] Detail screen: Image carousel, mô tả, tiện ích
- [ ] Pull-to-refresh
- [ ] Infinite scroll pagination

**Testing:**
- [ ] Browse listings, filter, xem detail

**Deliverables:**
- Renter có thể xem danh sách trọ

---

#### **Day 9: Mobile Favorites & Booking**
**Mobile:**
- [ ] Favorite button (heart icon) trên card + detail
- [ ] Favorites screen: Danh sách tin đã lưu
- [ ] Booking request form (textarea note)
- [ ] Submit booking → Success toast
- [ ] My Bookings screen (list requests + status badge)

**Testing:**
- [ ] Renter: Lưu tin → Gửi booking → Xem status

**Deliverables:**
- Renter có thể lưu tin và gửi yêu cầu

---

#### **Day 10: Mobile Chat UI**
**Mobile:**
- [ ] Socket.IO client setup
- [ ] Conversations list screen
- [ ] Chat screen: GiftedChat / custom FlatList
- [ ] Send message (text)
- [ ] Realtime receive messages
- [ ] Typing indicator
- [ ] Read receipts (đã xem)

**Testing:**
- [ ] 2 users chat realtime trên 2 thiết bị

**Deliverables:**
- Chat realtime hoạt động

---

#### **Day 11: Landlord Features (Mobile)**
**Mobile:**
- [ ] Landlord home: My Listings tab
- [ ] Create Listing screen (form + multi-image picker)
- [ ] Upload ảnh → Cloudinary
- [ ] Edit/Delete listing
- [ ] Booking Requests screen: Accept/Reject buttons
- [ ] State management (React Query mutations)

**Testing:**
- [ ] Landlord: Tạo tin → Upload ảnh → Quản lý booking

**Deliverables:**
- Landlord có thể đăng tin và quản lý yêu cầu

---

#### **Day 12: Push Notifications**
**Mobile:**
- [ ] Setup Expo Notifications
- [ ] Request permissions
- [ ] Get push token → Send to backend
- [ ] Backend: Store push tokens in User table
- [ ] Backend: Send push khi:
  - Booking created (→ landlord)
  - Booking accepted/rejected (→ renter)
  - New message (→ recipient)
- [ ] Mobile: Handle notification tap → Deep link

**Testing:**
- [ ] Tạo booking → Landlord nhận push
- [ ] Gửi message → Recipient nhận push

**Deliverables:**
- Push notifications working

---

#### **Day 13: Validation, Error Handling & QA**
**Backend:**
- [ ] Rate limiting (ThrottlerModule)
- [ ] Input validation (Zod/class-validator)
- [ ] Error messages chuẩn hóa
- [ ] CORS config
- [ ] Environment variables (.env.example)
- [ ] Helmet (security headers)

**Mobile:**
- [ ] Error boundary
- [ ] Network error handling (offline state)
- [ ] Loading states (skeletons)
- [ ] Empty states (no data)
- [ ] Form validation feedback

**QA:**
- [ ] Test all flows end-to-end
- [ ] Fix P0/P1 bugs

**Deliverables:**
- App stable, validation rõ ràng

---

#### **Day 14: Deploy & Documentation**
**Backend:**
- [ ] Dockerfile
- [ ] Deploy to Railway/Render
- [ ] Database migration on production
- [ ] Environment variables config
- [ ] Health check endpoint

**Mobile:**
- [ ] EAS Build config
- [ ] Build development APK/IPA
- [ ] Internal testing (TestFlight/Google Play Internal)

**Docs:**
- [ ] README.md (setup instructions)
- [ ] API documentation (Swagger export)
- [ ] .env.example files
- [ ] Architecture diagram

**Demo:**
- [ ] Video demo các flows chính
- [ ] Backlog v2 (thanh toán, reviews, map, admin)

**Deliverables:**
- App deployed và có thể demo
- Documentation đầy đủ

---

## 🎯 TIÊU CHÍ CHẤT LƯỢNG (NFR)

### Hiệu năng:
- API response time P95 < 300ms
- Chat message latency < 200ms
- Mobile app FPS > 50 (smooth scrolling)

### Bảo mật:
- JWT HttpOnly (web) / secure-store (mobile)
- Password hashing (bcrypt, salt rounds: 10)
- Rate limiting: 100 req/min per IP
- Input validation: Zod schemas
- Signed upload URLs (Cloudinary)

### Khả dụng:
- Database backups (automated)
- Error logging (Sentry)
- Health check endpoint

### Khả năng mở rộng:
- Stateless backend (horizontal scaling)
- Redis cho Socket.IO adapter (multi-instance) - Phase 2

---

## 📦 BACKLOG (Post-MVP)

### Phase 2 (Tuần 3-4):
- [ ] Thanh toán online (Stripe/VNPay)
- [ ] Review & Rating listings
- [ ] Google Maps integration
- [ ] Advanced filters (district, ward)
- [ ] User verification (KYC)

### Phase 3 (Tháng 2):
- [ ] Admin CMS (quản lý users, listings, reports)
- [ ] Analytics dashboard (landlord)
- [ ] Email notifications (Resend/SendGrid)
- [ ] Report listing (spam, fraud)
- [ ] Multi-language (i18n)

---

## 🚀 GETTING STARTED

### Prerequisites:
- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose
- PostgreSQL 15
- Expo CLI
- iOS Simulator / Android Emulator

### Installation:
```bash
# Clone repo
git clone <repo-url>
cd Motel

# Install dependencies
pnpm install

# Setup database
cd backend
docker-compose up -d
pnpm prisma migrate dev
pnpm prisma db seed

# Run backend
pnpm dev

# Run mobile
cd ../mobile
pnpm start
```

---

## 📞 CONTACTS & SUPPORT

- **Documentation:** `/docs`
- **API Docs:** `http://localhost:3000/api/docs`
- **Issues:** GitHub Issues
- **Slack:** #motel-app

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-03
