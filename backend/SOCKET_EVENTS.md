# Socket.IO Events - Chat Module

## Connection
**Namespace:** `/chat`  
**URL:** `ws://localhost:3000/chat`

## Client → Server Events

### 1. `register`
Đăng ký user với socket connection
```json
{
  "userId": "clxxx123"
}
```
**Response:**
```json
{
  "status": "registered",
  "userId": "clxxx123"
}
```

### 2. `join_conversation`
Join vào một conversation room
```json
{
  "conversationId": "conv123"
}
```
**Response:**
```json
{
  "status": "joined",
  "conversationId": "conv123"
}
```

### 3. `leave_conversation`
Rời khỏi conversation room
```json
{
  "conversationId": "conv123"
}
```

### 4. `send_message`
Gửi message (alternative to REST API)
```json
{
  "conversationId": "conv123",
  "userId": "user123",
  "content": "Hello world"
}
```
**Response:**
```json
{
  "status": "sent",
  "message": { /* message object */ }
}
```

### 5. `typing_start`
Bắt đầu typing
```json
{
  "conversationId": "conv123",
  "userId": "user123"
}
```

### 6. `typing_stop`
Dừng typing
```json
{
  "conversationId": "conv123",
  "userId": "user123"
}
```

### 7. `mark_read`
Đánh dấu đã đọc messages
```json
{
  "conversationId": "conv123",
  "userId": "user123"
}
```

---

## Server → Client Events

### 1. `new_message`
Nhận message mới
```json
{
  "id": "msg123",
  "conversationId": "conv123",
  "senderId": "user456",
  "content": "Hello",
  "sentAt": "2025-11-06T10:00:00.000Z",
  "sender": {
    "id": "user456",
    "name": "John Doe",
    "avatar": null
  }
}
```

### 2. `typing_status`
Trạng thái typing của users trong conversation
```json
{
  "conversationId": "conv123",
  "typingUsers": ["user456", "user789"]
}
```

### 3. `message_read`
Thông báo message đã được đọc
```json
{
  "conversationId": "conv123",
  "userId": "user456",
  "readAt": "2025-11-06T10:05:00.000Z"
}
```

---

## REST API Endpoints

### Conversations
- `POST /chat/conversations` - Tạo/lấy conversation với user khác
- `GET /chat/conversations` - Danh sách conversations
- `GET /chat/conversations/:id` - Chi tiết conversation
- `PATCH /chat/conversations/:id/read` - Đánh dấu đã đọc

### Messages
- `GET /chat/conversations/:id/messages` - Lấy messages (pagination)
- `POST /chat/conversations/:id/messages` - Gửi message

---

## Client Example (JavaScript)

```javascript
import io from 'socket.io-client';

// Connect
const socket = io('http://localhost:3000/chat', {
  transports: ['websocket'],
});

// Register user
socket.emit('register', { userId: 'user123' });

// Join conversation
socket.emit('join_conversation', { conversationId: 'conv123' });

// Send message
socket.emit('send_message', {
  conversationId: 'conv123',
  userId: 'user123',
  content: 'Hello!'
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Typing indicator
socket.emit('typing_start', { conversationId: 'conv123', userId: 'user123' });
setTimeout(() => {
  socket.emit('typing_stop', { conversationId: 'conv123', userId: 'user123' });
}, 3000);

// Listen for typing status
socket.on('typing_status', (data) => {
  console.log('Typing users:', data.typingUsers);
});
```

---

## Features Implemented
✅ Real-time messaging  
✅ Typing indicators  
✅ Read receipts  
✅ Auto-join user's conversations on register  
✅ Message history via REST API  
✅ Pagination support
