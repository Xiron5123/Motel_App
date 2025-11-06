# DAY 4 SUMMARY: Favorites, Bookings & Notifications

**Ngày hoàn thành:** 04/11/2025  
**Timeline:** Tuần 1 - Backend Core

---

## 🎯 ĐÃ HOÀN THÀNH

### 1. **Favorites Module** ✅
Cho phép users lưu và quản lý listings yêu thích.

#### API Endpoints:
- `POST /favorites` - Lưu listing vào favorites
- `DELETE /favorites/:listingId` - Xóa khỏi favorites
- `GET /favorites` - Lấy danh sách đã lưu
- `GET /favorites/check/:listingId` - Kiểm tra đã lưu chưa

#### Features:
- Kiểm tra listing tồn tại trước khi thêm
- Không cho duplicate favorites
- Trả về full listing info với photos và landlord
- Sort theo thời gian thêm (mới nhất trước)

---

### 2. **Bookings Module** ✅
Quản lý booking requests với state machine và authorization.

#### API Endpoints:
- `POST /bookings` - Tạo booking request (RENTER only)
- `GET /bookings` - Lấy danh sách (filter theo role)
- `GET /bookings/:id` - Chi tiết booking
- `PATCH /bookings/:id/status` - Cập nhật status

#### State Machine:
```
PENDING → ACCEPTED (landlord only)
        → REJECTED (landlord only)
        → CANCELLED (renter only)

ACCEPTED/REJECTED/CANCELLED → (final states, không thể thay đổi)
```

#### Business Rules:
- Renter không thể book listing của chính mình
- Không cho phép duplicate booking PENDING
- Chỉ book được listings AVAILABLE
- Landlord chỉ xem bookings cho listings của mình
- Renter chỉ xem bookings mình đã tạo

---

### 3. **Notifications Module** ✅
Lưu trữ và quản lý notifications trong database.

#### API Endpoints:
- `GET /notifications` - Lấy danh sách (50 mới nhất)
- `GET /notifications/unread-count` - Số lượng chưa đọc
- `PATCH /notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /notifications/read-all` - Đánh dấu tất cả đã đọc

#### Notification Types:
- `booking_created` - Renter tạo booking → gửi cho Landlord
- `booking_accepted` - Landlord accept → gửi cho Renter
- `booking_rejected` - Landlord reject → gửi cho Renter
- `booking_cancelled` - Renter cancel → gửi cho Landlord

#### Data Structure:
```typescript
{
  id: string;
  userId: string;
  type: NotificationType;
  data: {
    bookingId?: string;
    listingId?: string;
    listingTitle?: string;
    message?: string;
  };
  readAt: Date | null;
  createdAt: Date;
}
```

---

### 4. **Socket.IO Gateway** ✅
Realtime notifications qua WebSocket.

#### Features:
- Auto-connect/disconnect tracking
- User registration với socket ID
- Send notification to specific user
- Send notification to multiple users
- Broadcast to all clients

#### Events:
- `booking_created` - Realtime khi tạo booking
- `booking_accepted` - Realtime khi accept
- `booking_rejected` - Realtime khi reject
- `booking_cancelled` - Realtime khi cancel

#### Connection Flow:
```
1. Client connect → Socket.IO server
2. Client emit 'register' với userId (từ JWT)
3. Server lưu mapping userId → socketId
4. Server gửi events cho specific user
5. Client nhận events realtime
```

---

## 📁 CẤU TRÚC CODE

```
src/
├── favorites/
│   ├── dto/
│   │   └── add-favorite.dto.ts
│   ├── favorites.controller.ts    (4 endpoints)
│   ├── favorites.service.ts       (CRUD logic)
│   └── favorites.module.ts
├── bookings/
│   ├── dto/
│   │   ├── create-booking.dto.ts
│   │   └── update-booking-status.dto.ts
│   ├── bookings.controller.ts     (4 endpoints)
│   ├── bookings.service.ts        (CRUD + state machine)
│   └── bookings.module.ts
├── notifications/
│   ├── notifications.controller.ts (4 endpoints)
│   ├── notifications.service.ts    (CRUD + helpers)
│   └── notifications.module.ts
└── events/
    └── events.gateway.ts           (Socket.IO gateway)
```

---

## 🧪 TESTING

### 1. Chạy Server
```powershell
cd D:\BaoCaoThucTap\Motel\backend
npm run start:dev
```

### 2. Test REST APIs
```powershell
.\test-day4.ps1
```

Test script sẽ kiểm tra:
- ✅ Favorites CRUD
- ✅ Bookings CRUD
- ✅ State machine transitions
- ✅ Notifications records
- ✅ Role-based authorization

### 3. Test Socket.IO (Manual)
Cần dùng Socket.IO client (web hoặc Postman Socket.IO):

```javascript
const socket = io('http://localhost:3000', {
  transports: ['websocket']
});

// Register user
socket.emit('register', { userId: 'user_id_from_jwt' });

// Listen for events
socket.on('booking_created', (data) => {
  console.log('New booking:', data);
});

socket.on('booking_accepted', (data) => {
  console.log('Booking accepted:', data);
});
```

---

## 🔄 INTEGRATION FLOW

### Example: Booking Flow
```
1. RENTER tạo booking
   └─> BookingsService.createBooking()
       ├─> Lưu vào database (status: PENDING)
       ├─> NotificationsService.createNotification() → landlord
       └─> EventsGateway.sendNotificationToUser() → landlord (realtime)

2. LANDLORD nhận notification
   ├─> REST: GET /notifications → thấy booking mới
   └─> Socket.IO: event 'booking_created' → realtime popup

3. LANDLORD accept booking
   └─> BookingsService.updateBookingStatus()
       ├─> Validate state transition
       ├─> Update database (status: ACCEPTED)
       ├─> NotificationsService.createNotification() → renter
       └─> EventsGateway.sendNotificationToUser() → renter (realtime)

4. RENTER nhận notification
   ├─> REST: GET /notifications → thấy booking accepted
   └─> Socket.IO: event 'booking_accepted' → realtime popup
```

---

## 📊 DATABASE CHANGES

Không có migrations mới - tất cả models đã có sẵn từ Day 1:
- ✅ `Favorite` (userId, listingId)
- ✅ `BookingRequest` (id, listingId, renterId, status, note)
- ✅ `Notification` (id, userId, type, data, readAt)

---

## 🎓 KEY LEARNINGS

### 1. State Machine Pattern
```typescript
// Validate transitions
const validTransitions = {
  PENDING: [ACCEPTED, REJECTED, CANCELLED],
  ACCEPTED: [], // final state
  REJECTED: [], // final state
  CANCELLED: [], // final state
};
```

### 2. Role-based Data Filtering
```typescript
// Landlord xem bookings cho listings của mình
// Renter xem bookings mình đã tạo
const where = userRole === 'LANDLORD'
  ? { listing: { landlordId: userId } }
  : { renterId: userId };
```

### 3. Realtime + REST Hybrid
- REST APIs: CRUD operations, historical data
- Socket.IO: Instant notifications, live updates
- Notifications table: Persistent storage, offline support

---

## ✅ CHECKLIST

- [x] Favorites API (save/remove/list)
- [x] BookingRequest CRUD
- [x] State machine (PENDING → ACCEPTED/REJECTED/CANCELLED)
- [x] Notifications records
- [x] Realtime notification (socket.io)
- [x] Status UI states (pending, accepted, rejected)
- [x] Role-based authorization
- [x] Test scripts
- [x] Documentation

---

## 🚀 NEXT STEPS (Day 5)

### Chat Backend
- [ ] Conversation + Message REST API
- [ ] Socket.IO gateway enhancements
- [ ] Realtime events (join, send, typing, read)
- [ ] Typing indicator & seen status
- [ ] Auto-scroll & last message preview

---

## 📚 API DOCUMENTATION

Swagger UI: http://localhost:3000/api/docs

Sections:
- **Favorites**: 4 endpoints
- **Bookings**: 4 endpoints  
- **Notifications**: 4 endpoints

---

**Status:** ✅ Hoàn thành  
**Thời gian:** ~4 giờ  
**Lines of code:** ~800 lines

---

Last Updated: 04/11/2025
