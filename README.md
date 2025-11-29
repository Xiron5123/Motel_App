# 🏠 Motel App

> **Ứng dụng tìm trọ và kết nối người thuê toàn diện**  
> Version 0.5.0 | NestJS + PostgreSQL + React Native + Expo

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo)](https://expo.dev/)

---

## 📋 Tính Năng Chính

### 🔐 Xác Thực & Người Dùng

- Đăng ký/Đăng nhập với JWT + Refresh Token
- Phân quyền: Renter & Landlord
- Quản lý profile & avatar

### 🏘️ Quản Lý Phòng Trọ

- Đăng tin & quản lý listings (Landlord)
- Tìm kiếm, lọc theo giá, diện tích, tiện nghi
- Upload nhiều ảnh cho mỗi phòng
- Lưu danh sách yêu thích
- Yêu cầu đặt phòng

### 💬 Chat Realtime

- Nhắn tin 1-1 với Socket.IO
- Gửi template tin nhắn khi đặt phòng
- Hiển thị listing card trong chat
- Typing indicator & message status
- Thông báo realtime

### 🤝 Tìm Bạn Cùng Phòng

- Tạo hồ sơ tìm bạn
- Lọc theo ngân sách, khu vực, sở thích
- Kết nối trực tiếp qua chat

---

## 🛠 Tech Stack

**Backend:**

- NestJS 11.x | PostgreSQL 15 | Prisma ORM 6.x
- Socket.IO 4.x | JWT Authentication | Bcrypt
- Swagger API Documentation

**Mobile:**

- React Native 0.81 | Expo ~54.0 | Expo Router ~6.0
- React Query 5.x | Zustand 5.x | Socket.IO Client
- React Hook Form + Zod Validation

**DevOps:**

- pnpm Workspace (Monorepo) | Docker Compose | Git

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- pnpm >= 8.x
- Docker & Docker Compose
- Expo Go app (mobile testing)

### 1. Clone & Install

```bash
git clone https://github.com/Xiron5123/Motel_App.git
cd Motel_App
pnpm install
```

### 2. Backend Setup

```bash
cd backend

# Start PostgreSQL
docker-compose up -d

# Configure .env
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, etc.

# Run migrations
npx prisma migrate dev
npx prisma db seed  # Optional: seed data

# Start server
pnpm run start:dev
```

✅ Backend: `http://localhost:3000`  
📚 Swagger: `http://localhost:3000/api/docs`

### 3. Mobile Setup

```bash
cd mobile

# Configure API URL in src/services/api.ts
# Update to your local IP: http://192.168.x.x:3000

# Start Expo
pnpm start
```

Scan QR code with **Expo Go** app or press `a`/`i` for emulator.

---

## 📁 Project Structure

```
Motel/
├── backend/              # NestJS API
│   ├── prisma/          # Schema & migrations
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── listings/    # Listings CRUD
│   │   ├── chat/        # Real-time chat
│   │   ├── roommates/   # Roommate matching
│   │   └── ...
│   └── docker-compose.yml
│
├── mobile/              # React Native App
│   ├── app/            # Expo Router (file-based)
│   │   ├── (auth)/     # Login, Register
│   │   ├── (tabs)/     # Main tabs
│   │   └── chat/       # Chat screens
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── services/   # API client
│   │   ├── stores/     # Zustand state
│   │   └── ...
│   └── app.json
│
└── pnpm-workspace.yaml
```

---

## 🔌 Core API Endpoints

### Authentication

```
POST /auth/register          # Register
POST /auth/login             # Login
POST /auth/refresh           # Refresh token
POST /auth/logout            # Logout
```

### Listings

```
GET    /listings             # List all (with filters)
GET    /listings/:id         # Get details
POST   /listings             # Create (Landlord)
PATCH  /listings/:id         # Update
DELETE /listings/:id         # Delete
```

### Chat

```
POST   /chat/conversations                   # Create/get conversation
GET    /chat/conversations                   # List conversations
GET    /chat/conversations/:id/messages     # Get messages
POST   /chat/conversations/:id/messages     # Send message
```

### WebSocket (Namespace: `/chat`)

```javascript
// Client → Server
register, join_conversation, send_message, typing_start

// Server → Client
new_message, typing_status, message_read
```

📖 **Full API Docs:** `http://localhost:3000/api/docs`

---

## 🗄 Database Schema

11 Models: `User`, `Listing`, `Photo`, `Favorite`, `BookingRequest`, `Conversation`, `ConversationParticipant`, `Message`, `Notification`, `RoommateProfile`, `VerificationToken`

**Key Relations:**

- User → Listings (1:N, Landlord)
- User → Favorites (1:N)
- User → Messages (1:N)
- Listing → Photos (1:N)
- Conversation → Messages (1:N)

View full schema: `backend/prisma/schema.prisma`

---

## 🗺️ Roadmap

### ✅ v0.5.0 (Current)

- Complete backend API with authentication
- Real-time chat & notifications
- Mobile app with core features
- Roommate profile matching

### 🔜 v0.6.0 (Next)

- UI/UX polish & animations
- Image optimization
- Offline support
- Performance improvements

### 📅 v1.0.0 (Future)

- Payment integration (VNPay/Stripe)
- Reviews & ratings system
- Google Maps integration
- Admin dashboard

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/FeatureName`
3. Commit changes: `git commit -m 'Add FeatureName'`
4. Push: `git push origin feature/FeatureName`
5. Open Pull Request

**Guidelines:**

- Follow ESLint/Prettier rules
- Use conventional commits
- Update documentation

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👤 Author

**Xiron5123**  
GitHub: [@Xiron5123](https://github.com/Xiron5123)  
Repository: [Motel_App](https://github.com/Xiron5123/Motel_App)

---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

Made with ❤️ using NestJS & React Native

</div>
