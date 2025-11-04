# TECHNICAL DOCUMENTATION

## 🛠️ TECH STACK

### Backend
- **Framework:** NestJS 11.x (Node.js + TypeScript)
- **Database:** PostgreSQL 15
- **ORM:** Prisma 6.x
- **Authentication:** JWT + Refresh Token
- **Realtime:** Socket.IO 4.x
- **Validation:** class-validator + class-transformer
- **Documentation:** Swagger/OpenAPI
- **Security:** bcrypt, CORS, Guards, Rate limiting

### Mobile
- **Framework:** React Native + Expo SDK 50+
- **State Management:** React Query (TanStack Query)
- **Navigation:** Expo Router
- **UI Library:** React Native Paper
- **Notifications:** Expo Notifications
- **Storage:** expo-secure-store
- **Image Upload:** Cloudinary

### Development Tools
- **Package Manager:** pnpm (monorepo workspace)
- **Version Control:** Git + GitHub
- **Database UI:** pgAdmin 4
- **Local DB:** Docker Compose
- **API Testing:** Swagger UI, PowerShell scripts

---

## 📊 DATABASE SCHEMA

### Models (10 tables)

**User**
- id, role (RENTER/LANDLORD), name, email, phone, password, avatar, pushToken
- Relations: listings, bookingRequests, favorites, messages, participants, notifications

**Listing**
- id, landlordId, title, description, price, deposit, area, address, lat, lng, amenities[], status
- Relations: photos, bookingRequests, favorites, landlord

**Photo**
- id, listingId, url, order
- Relations: listing

**BookingRequest**
- id, listingId, renterId, status (PENDING/ACCEPTED/REJECTED/CANCELLED), note
- Relations: listing, renter

**Conversation**
- id, createdAt, updatedAt
- Relations: participants, messages

**ConversationParticipant**
- conversationId, userId, joinedAt
- Relations: conversation, user

**Message**
- id, conversationId, senderId, content, imageUrl, readAt
- Relations: conversation, sender

**Favorite**
- userId, listingId, createdAt
- Relations: user, listing

**Notification**
- id, userId, type, data (JSON), readAt
- Relations: user

**RefreshToken**
- id, userId, token, expiresAt
- Relations: user

---

## 🔌 API ENDPOINTS

### Authentication
```
POST   /auth/register        - Đăng ký (default RENTER)
POST   /auth/login           - Đăng nhập
POST   /auth/refresh         - Refresh access token
POST   /auth/logout          - Đăng xuất
```

### Users
```
GET    /users/me             - Lấy profile
PATCH  /users/me             - Cập nhật profile
POST   /users/become-landlord - Upgrade RENTER → LANDLORD
```

### Listings
```
GET    /listings             - Danh sách (có filters)
GET    /listings/my          - Listings của landlord
GET    /listings/:id         - Chi tiết
POST   /listings             - Tạo (LANDLORD only)
PATCH  /listings/:id         - Cập nhật (owner only)
DELETE /listings/:id         - Xóa (owner only)
POST   /listings/:id/photos  - Thêm ảnh
DELETE /listings/photos/:id  - Xóa ảnh
```

### Favorites (Day 4)
```
POST   /favorites            - Lưu listing
DELETE /favorites/:listingId - Bỏ lưu
GET    /favorites            - Danh sách đã lưu
```

### Booking Requests (Day 4)
```
POST   /bookings             - Tạo request (RENTER)
GET    /bookings             - Danh sách (filter by role)
GET    /bookings/:id         - Chi tiết
PATCH  /bookings/:id/status  - Cập nhật status
```

### Chat (Day 5)
```
GET    /conversations        - Danh sách conversations
GET    /conversations/:id    - Chi tiết + messages
POST   /conversations        - Tạo conversation
POST   /messages             - Gửi message (REST fallback)
PATCH  /messages/:id/read    - Đánh dấu đã đọc
```

### WebSocket Events (Day 5)
```
connection                    - Kết nối Socket.IO
join_conversation             - Join room
send_message                  - Gửi tin nhắn realtime
typing                        - Đang gõ
read_message                  - Đã đọc
```

### Notifications (Day 12)
```
GET    /notifications        - Danh sách thông báo
PATCH  /notifications/:id/read - Đánh dấu đã đọc
PATCH  /notifications/read-all - Đánh dấu tất cả
```

---

## 🔐 SECURITY

### Authentication
- JWT access token: 15 minutes
- Refresh token: 7 days (stored in DB)
- Password hashing: bcrypt (10 rounds)
- Token storage: HttpOnly cookies (web) / SecureStore (mobile)

### Authorization
- JwtAuthGuard: Verify JWT token
- RolesGuard: Check user role (RENTER/LANDLORD)
- Ownership checks: User can only modify their own resources

### Rate Limiting
- Login: 5 requests/minute
- API calls: 100 requests/minute
- Upload: 10 requests/hour

### Input Validation
- DTO validation with class-validator
- Whitelist properties
- Transform types automatically
- Forbid non-whitelisted properties

---

## 🌐 ENVIRONMENT VARIABLES

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Cloudinary (Day 10)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🚀 DEPLOYMENT

### Backend (Day 14)
**Platform:** Railway / Render / Fly.io
- PostgreSQL managed database
- Environment variables config
- Auto-deploy from GitHub main branch
- Health check endpoint: GET /

### Mobile (Day 14)
**Platform:** EAS Build (Expo)
- Development build: Internal testing
- Production build: TestFlight (iOS) / Google Play Internal (Android)
- Environment: production API URL

---

## 📦 PROJECT STRUCTURE

```
Motel/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── listings/          # Listings CRUD
│   │   ├── favorites/         # (Day 4)
│   │   ├── bookings/          # (Day 4)
│   │   ├── chat/              # (Day 5)
│   │   ├── notifications/     # (Day 4)
│   │   ├── prisma/            # Prisma service
│   │   └── main.ts
│   ├── test/
│   ├── docker-compose.yml
│   └── package.json
├── mobile/                     # (Day 7-12)
│   ├── app/                   # Expo Router
│   ├── components/
│   ├── services/              # API client
│   ├── hooks/
│   └── package.json
├── ROADMAP.md                 # Kế hoạch 14 ngày
├── TECHNICAL.md               # File này
└── README.md
```

---

## 🧪 TESTING

### Backend Tests (Day 6)
- Unit tests: Services logic
- Integration tests: API endpoints
- E2E tests: Complete user flows
- Coverage target: >80%

### Mobile Tests (Day 13)
- Component tests: React Testing Library
- Navigation tests: Expo Router
- API integration tests: Mock responses

---

## 📚 DOCUMENTATION

- **API Docs:** http://localhost:3000/api/docs (Swagger)
- **Database Schema:** Prisma Studio (http://localhost:5555)
- **Postman Collection:** `backend/test-api.http`
- **README:** Setup instructions, development guide

---

Last Updated: 04/11/2025
