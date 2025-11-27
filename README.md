# 🏠 Motel App - Ứng Dụng Tìm Trọ & Kết Nối Người Thuê

> **Version:** 0.5.0  
> **Tech Stack:** NestJS + PostgreSQL + Prisma + React Native + Expo

Một ứng dụng di động toàn diện cho phép người dùng tìm kiếm phòng trọ, kết nối với chủ trọ, và tìm kiếm bạn cùng phòng tương thích. Hệ thống bao gồm backend API mạnh mẽ và ứng dụng mobile với giao diện hiện đại.

---

## 📑 Mục Lục

- [Tính Năng Chính](#-tính-năng-chính)
- [Kiến Trúc Hệ Thống](#️-kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt & Chạy Dự Án](#-cài-đặt--chạy-dự-án)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [API Documentation](#-api-documentation)
- [Cơ Sở Dữ Liệu](#️-cơ-sở-dữ-liệu)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Đóng Góp](#-đóng-góp)
- [License](#-license)

---

## ✨ Tính Năng Chính

### 👤 Người Dùng (Renter)

- ✅ Đăng ký/Đăng nhập với JWT Authentication
- ✅ Xem và tìm kiếm phòng trọ theo nhiều tiêu chí
- ✅ Lọc theo giá, diện tích, tiện nghi
- ✅ Tìm kiếm theo khoảng cách địa lý
- ✅ Lưu danh sách yêu thích
- ✅ Gửi yêu cầu đặt phòng
- ✅ Chat realtime với chủ trọ
- ✅ Tạo hồ sơ tìm bạn cùng phòng
- ✅ Nhận thông báo realtime

### 🏘️ Chủ Trọ (Landlord)

- ✅ Nâng cấp từ tài khoản Renter
- ✅ Đăng tin cho thuê phòng trọ
- ✅ Quản lý danh sách phòng trọ
- ✅ Upload và quản lý hình ảnh
- ✅ Quản lý yêu cầu đặt phòng
- ✅ Chat với người thuê
- ✅ Cập nhật trạng thái phòng

### 🤝 Tìm Bạn Cùng Phòng

- ✅ Tạo hồ sơ cá nhân
- ✅ Tìm kiếm theo ngân sách, khu vực
- ✅ Lọc theo nghề nghiệp, sở thích
- ✅ Kết nối và chat trực tiếp

---

## 🏗️ Kiến Trúc Hệ Thống

```mermaid
graph TB
    subgraph "Mobile App"
        A[React Native + Expo]
        B[React Query]
        C[Socket.IO Client]
    end
    
    subgraph "Backend API"
        D[NestJS Server]
        E[REST API]
        F[WebSocket Gateway]
    end
    
    subgraph "Database"
        G[(PostgreSQL)]
        H[Prisma ORM]
    end
    
    A -->|HTTP Requests| E
    A -->|WebSocket| F
    B -->|State Management| A
    C -->|Real-time Chat| F
    E -->|Query/Mutation| H
    F -->|Query/Mutation| H
    H -->|SQL| G
```

**Monorepo Structure:**

- `backend/` - NestJS API với Prisma ORM
- `mobile/` - React Native/Expo mobile app

---

## 🛠 Công Nghệ Sử Dụng

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 11.x | Framework backend TypeScript |
| **PostgreSQL** | 15 | Main database |
| **Prisma** | 6.x | ORM và database migrations |
| **Socket.IO** | 4.x | Real-time communication |
| **JWT** | - | Authentication & authorization |
| **Bcrypt** | 6.x | Password hashing |
| **Swagger** | 11.x | API documentation |
| **class-validator** | 0.14.x | DTO validation |

### Mobile

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.x | Mobile framework |
| **Expo** | ~54.0 | Development platform |
| **Expo Router** | ~6.0 | File-based routing |
| **React Query** | 5.x | Server state management |
| **Zustand** | 5.x | Client state management |
| **Socket.IO Client** | 4.x | Real-time messaging |
| **Axios** | 1.x | HTTP client |
| **React Hook Form** | 7.x | Form management |
| **Zod** | 4.x | Schema validation |

### DevOps & Tools

- **pnpm** - Monorepo package manager
- **Docker Compose** - Local PostgreSQL setup
- **Git** - Version control
- **ESLint + Prettier** - Code quality

---

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống

- **Node.js** >= 18.x
- **pnpm** >= 8.x
- **Docker** & **Docker Compose** (cho database)
- **Expo Go** app (cho mobile testing)

### 1. Clone Repository

```bash
git clone https://github.com/Xiron5123/Motel_App.git
cd Motel_App
```

### 2. Cài Đặt Dependencies

```bash
pnpm install
```

### 3. Setup Backend

#### a. Khởi động PostgreSQL với Docker

```bash
cd backend
docker-compose up -d
```

#### b. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/motel_db"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Email (Optional - cho forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@motelapp.com
```

#### c. Chạy Migrations

```bash
npx prisma migrate dev
npx prisma db seed  # Tạo dữ liệu mẫu (optional)
```

#### d. Khởi động Backend Server

```bash
pnpm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`  
Swagger API Docs: `http://localhost:3000/api/docs`

### 4. Setup Mobile App

#### a. Cấu hình API URL

Cập nhật file `mobile/src/config/api.config.ts`:

```typescript
// Đối với development trên thiết bị thật
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';
// Ví dụ: 'http://192.168.1.100:3000'
```

#### b. Khởi động Expo Dev Server

```bash
cd mobile
pnpm start
```

#### c. Chạy trên Thiết Bị

- Cài **Expo Go** từ App Store/Play Store
- Quét QR code từ terminal
- Hoặc nhấn `a` cho Android emulator, `i` cho iOS simulator

---

## 📁 Cấu Trúc Thư Mục

```
Motel/
├── backend/                    # NestJS Backend API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts           # Seed data
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # User management
│   │   ├── listings/         # Listing CRUD
│   │   ├── favorites/        # Favorites management
│   │   ├── bookings/         # Booking requests
│   │   ├── chat/             # Chat & messaging
│   │   ├── roommates/        # Roommate profiles
│   │   ├── notifications/    # Push notifications
│   │   ├── upload/           # File upload
│   │   ├── events/           # WebSocket events
│   │   ├── common/           # Guards, filters, decorators
│   │   ├── prisma/           # Prisma service
│   │   └── main.ts           # Application entry
│   ├── docker-compose.yml    # PostgreSQL setup
│   ├── .env.example          # Environment template
│   └── package.json
│
├── mobile/                    # React Native/Expo App
│   ├── app/                  # Expo Router (file-based routing)
│   │   ├── (auth)/          # Auth screens
│   │   ├── (tabs)/          # Main tab screens
│   │   └── _layout.tsx      # Root layout
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API client services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # Zustand stores
│   │   ├── config/          # App configuration
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── assets/              # Images, fonts
│   ├── app.json            # Expo configuration
│   └── package.json
│
├── pnpm-workspace.yaml     # Monorepo configuration
├── .gitignore
└── README.md               # This file
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication Endpoints

```http
POST   /auth/register              # Đăng ký tài khoản
POST   /auth/login                 # Đăng nhập
POST   /auth/refresh               # Refresh access token
POST   /auth/logout                # Đăng xuất
POST   /auth/forgot-password       # Quên mật khẩu
POST   /auth/reset-password        # Đặt lại mật khẩu
POST   /auth/verify-email/send     # Gửi OTP verify email
POST   /auth/verify-email/verify   # Xác thực email
```

### User Endpoints

```http
GET    /users/me                   # Lấy thông tin profile
PATCH  /users/me                   # Cập nhật profile
POST   /users/become-landlord      # Nâng cấp lên Landlord
```

### Listings Endpoints

```http
GET    /listings                   # Danh sách phòng trọ (có filter)
GET    /listings/:id               # Chi tiết phòng trọ
GET    /listings/my                # Danh sách phòng của tôi
POST   /listings                   # Tạo tin đăng (Landlord)
PATCH  /listings/:id               # Cập nhật tin đăng
DELETE /listings/:id               # Xóa tin đăng
POST   /listings/:id/photos        # Upload ảnh
DELETE /listings/photos/:photoId   # Xóa ảnh
```

### Favorites Endpoints

```http
POST   /favorites                  # Lưu phòng yêu thích
DELETE /favorites/:listingId       # Bỏ lưu
GET    /favorites                  # Danh sách yêu thích
```

### Bookings Endpoints

```http
POST   /bookings                   # Tạo yêu cầu đặt phòng
GET    /bookings                   # Danh sách yêu cầu
GET    /bookings/:id               # Chi tiết yêu cầu
PATCH  /bookings/:id/status        # Cập nhật trạng thái
```

### Chat Endpoints

```http
POST   /chat/conversations                    # Tạo/lấy conversation
GET    /chat/conversations                    # Danh sách conversations
GET    /chat/conversations/:id               # Chi tiết conversation
GET    /chat/conversations/:id/messages      # Lấy messages
POST   /chat/conversations/:id/messages      # Gửi message
PATCH  /chat/conversations/:id/read          # Đánh dấu đã đọc
```

### Roommate Endpoints

```http
POST   /roommates/profile          # Tạo hồ sơ tìm bạn
GET    /roommates/profile/me       # Lấy hồ sơ của tôi
PATCH  /roommates/profile          # Cập nhật hồ sơ
GET    /roommates                  # Tìm kiếm bạn cùng phòng
```

### WebSocket Events (Namespace: `/chat`)

```javascript
// Client → Server
register              // Đăng ký user với socket
join_conversation     // Join vào conversation
send_message         // Gửi tin nhắn
typing_start         // Bắt đầu typing
typing_stop          // Dừng typing
mark_read            // Đánh dấu đã đọc

// Server → Client
new_message          // Nhận tin nhắn mới
typing_status        // Trạng thái typing
message_read         // Thông báo đã đọc
```

### Swagger UI

Truy cập: **<http://localhost:3000/api/docs>** để xem tài liệu API đầy đủ với Swagger.

---

## 🗄️ Cơ Sở Dữ Liệu

### Database Schema (11 Models)

```mermaid
erDiagram
    User ||--o{ Listing : "landlord"
    User ||--o{ BookingRequest : "renter"
    User ||--o{ Favorite : "saves"
    User ||--o{ Message : "sends"
    User ||--o{ ConversationParticipant : "participates"
    User ||--o| RoommateProfile : "has"
    
    Listing ||--o{ Photo : "has"
    Listing ||--o{ BookingRequest : "receives"
    Listing ||--o{ Favorite : "favorited"
    
    Conversation ||--o{ Message : "contains"
    Conversation ||--o{ ConversationParticipant : "has"
    
    User {
        string id PK
        enum role
        string name
        string email
        string password
        string avatar
    }
    
    Listing {
        string id PK
        string landlordId FK
        string title
        float price
        float area
        string address
        enum status
    }
    
    RoommateProfile {
        string id PK
        string userId FK
        int age
        enum gender
        float budgetMin
        float budgetMax
    }
```

### Key Features

- **User roles:** RENTER, LANDLORD
- **Listing statuses:** AVAILABLE, RENTED, UNAVAILABLE
- **Booking statuses:** PENDING, ACCEPTED, REJECTED, CANCELLED
- **Cascade deletes** cho data integrity
- **Indexed fields** cho performance

---

## 📱 Screenshots

> _Screenshots sẽ được cập nhật sau khi hoàn thiện giao diện_

**Planned screens:**

- Login/Register
- Home - Danh sách phòng trọ
- Listing Detail với Image Carousel
- Favorites List
- Chat Interface
- Roommate Profiles
- My Bookings
- Landlord Dashboard

---

## 🗺️ Roadmap

### ✅ Version 0.5.0 (Current)

- ✅ Backend API hoàn chỉnh
- ✅ Authentication & Authorization
- ✅ Listings CRUD với search/filter
- ✅ Favorites & Booking system
- ✅ Real-time chat với Socket.IO
- ✅ Roommate profile matching
- ✅ Mobile app với UI cơ bản
- ✅ File upload cho listings
- ✅ Push notifications

### 🔜 Version 0.6.0 (Next)

- [ ] Polish mobile UI/UX
- [ ] Image optimization
- [ ] Offline support
- [ ] Deep linking
- [ ] Performance optimization

### 📅 Version 1.0.0 (Future)

- [ ] Payment integration (VNPay/Stripe)
- [ ] Reviews & Ratings
- [ ] Google Maps integration
- [ ] Advanced search filters
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Analytics & reporting

### 🌐 Post 1.0

- [ ] Web frontend (Next.js)
- [ ] AI-powered recommendations
- [ ] Virtual tours (360° photos)
- [ ] Contract management
- [ ] KYC/Verification system

---

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Development Guidelines

- Tuân thủ ESLint và Prettier rules
- Viết tests cho features mới
- Update documentation khi cần
- Sử dụng conventional commits

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

**Developer:** Xiron5123  
**Repository:** [github.com/Xiron5123/Motel_App](https://github.com/Xiron5123/Motel_App)

---

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/Xiron5123/Motel_App/issues)
- **Email:** <support@motelapp.com>
- **Documentation:** [API Docs](http://localhost:3000/api/docs)

---

<div align="center">

**⭐ Nếu dự án hữu ích, hãy cho một star! ⭐**

Made with ❤️ using NestJS & React Native

</div>
