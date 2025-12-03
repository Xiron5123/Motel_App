# 🏠 Motel App

> **Ứng dụng tìm trọ và kết nối người thuê toàn diện**  
> Version 0.5.0 | NestJS + PostgreSQL + React Native + Expo

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo)](https://expo.dev/)

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

## 📄 License

MIT License - see LICENSE file for details

---

## 👤 Author

**Xiron5123**  
Email: <tmanh15112003@gmail.com>  
Facebook: [Xiron513](https://www.facebook.com/xiron513/)  
GitHub: [@Xiron5123](https://github.com/Xiron5123)  
Repository: [Motel_App](https://github.com/Xiron5123/Motel_App)

---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

Made with ❤️ using NestJS & React Native

</div>
